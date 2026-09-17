(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const presets = SurfacePresets;
  const normalize = (text) => text.replace(/\s/g, "").toLowerCase();
  let renderer,
    worker = null,
    generation = 0,
    lastStatus = "Preparing surface…",
    busy = false,
    workerURL = null;
  let activeExpression = $("expression").value;
  const axisInputs = ["x", "y", "z"].map((axis) => [
    $(`${axis}-min`),
    $(`${axis}-max`),
  ]);
  function setError(id, message) {
    const el = $(id);
    el.textContent = message;
    el.hidden = !message;
  }
  function message(title, body) {
    const el = $("message");
    el.replaceChildren();
    if (title) {
      const heading = document.createElement("strong");
      heading.textContent = title;
      el.append(heading, document.createTextNode(body));
    }
    el.hidden = !title;
  }
  function setBusy(value) {
    busy = value;
    $("status-dot").classList.toggle("busy", value);
    $("surface").setAttribute("aria-busy", String(value));
  }
  function reportFatal(error) {
    renderer = null;
    message("The 3D view is unavailable", error);
    setBusy(false);
    $("mesh-status").textContent = "Renderer unavailable";
  }
  try {
    renderer = SurfaceRenderer.createRenderer(
      $("surface"),
      $("labels"),
      (value) => $("auto-rotate").setAttribute("aria-pressed", String(value)),
    );
  } catch (error) {
    reportFatal(error.message);
  }
  $("surface").addEventListener("renderer-error", (event) => {
    ++generation;
    worker?.terminate();
    reportFatal(event.detail);
  });
  function updatePresetState(expression) {
    const selected = presets.find(
      (p) => normalize(p.expression) === normalize(expression),
    );
    $("surface-name").textContent = selected ? selected.name : "Custom surface";
    document
      .querySelectorAll("[data-preset]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.preset === selected?.id),
        ),
      );
    return selected;
  }
  function workerSource() {
    return `"use strict";
      const math=(${SurfaceMath.createMath.toString()})();
      const mesher=(${SurfaceMesher.createMesher.toString()})(math);
      self.onmessage=async ({data})=>{
        try { const result=await mesher.build(data,p=>self.postMessage({type:"progress",value:p}));
          self.postMessage({type:"result",result},[result.data.buffer]);
        } catch(error){ self.postMessage({type:"error",message:error.message}); }
      };`;
  }
  async function render() {
    if (!renderer) return;
    const expression = $("expression").value.trim(),
      resolution = Number($("quality").value);
    setError("expression-error", "");
    setError("domain-error", "");
    $("expression").removeAttribute("aria-invalid");
    axisInputs.flat().forEach((input) => input.removeAttribute("aria-invalid"));
    try {
      SurfaceMath.compile(expression);
    } catch (error) {
      setError("expression-error", error.message);
      $("expression").setAttribute("aria-invalid", "true");
      return;
    }
    const domain = axisInputs.map((pair) =>
      pair.map((input) =>
        input.value.trim() === "" ? NaN : Number(input.value),
      ),
    );
    try {
      SurfaceMath.validateDomain(domain, resolution);
    } catch (error) {
      setError("domain-error", error.message);
      const axis = "XYZ".indexOf(error.message[0]);
      (axis >= 0 ? axisInputs[axis] : axisInputs.flat()).forEach((input) =>
        input.setAttribute("aria-invalid", "true"),
      );
      $("config-body").hidden = false;
      $("config-toggle").setAttribute("aria-expanded", "true");
      return;
    }
    const job = ++generation;
    worker?.terminate();
    worker = null;
    setBusy(true);
    message("", "");
    $("mesh-status").textContent = "Sampling field…";
    function progress(value) {
      if (job === generation)
        $("mesh-status").textContent = `Building surface · ${value}%`;
    }
    function failure(error) {
      if (job !== generation) return;
      setBusy(false);
      $("mesh-status").textContent = lastStatus;
      setError("expression-error", error);
      worker?.terminate();
      worker = null;
    }
    function finish(result) {
      if (job !== generation || !result) return;
      try {
        renderer.setMesh(result);
      } catch (error) {
        failure(error.message);
        return;
      }
      setBusy(false);
      activeExpression = expression;
      updatePresetState(expression);
      const description = expression.includes("=")
        ? expression
        : `${expression} = 0`;
      $("surface").setAttribute(
        "aria-label",
        `3D surface: ${description}. Drag or use arrow keys to orbit; Shift-drag to pan; scroll or press plus and minus to zoom; 0 to fit.`,
      );
      lastStatus = result.triangles
        ? `${result.triangles.toLocaleString()} triangles${result.invalid ? " · partial domain" : ""}`
        : "No surface";
      $("mesh-status").textContent = lastStatus;
      $("mesh-status").title = result.invalid
        ? `${result.invalid.toLocaleString()} grid samples were outside the equation's real-valued domain.`
        : "Numerical approximation within the configured domain.";
      if (result.reason === "undefined")
        message(
          "No real values here",
          "The equation is undefined throughout this domain. Check divisions, roots, and logarithms, or change the range.",
        );
      else if (result.reason === "volume")
        message(
          "This equation fills the region",
          "Every sampled point satisfies the equation. Use an equation that defines a boundary, such as x² + y² + z² = 4.",
        );
      else if (!result.triangles)
        message(
          "No surface found in this region",
          "Try a different domain or more detail. Features smaller than a grid cell and zeros that only touch zero may not be detected.",
        );
      else message("", "");
      worker?.terminate();
      worker = null;
    }
    const options = { expression, domain, resolution };
    // Blob workers also run when index.html is opened directly from the filesystem.
    // A chunked main-thread path keeps the app usable if workers are unavailable.
    async function fallback() {
      try {
        finish(
          await SurfaceMesher.createMesher(SurfaceMath).build(
            options,
            progress,
            () => job !== generation,
          ),
        );
      } catch (error) {
        failure(error.message);
      }
    }
    try {
      if (!workerURL)
        workerURL = URL.createObjectURL(
          new Blob([workerSource()], { type: "text/javascript" }),
        );
      worker = new Worker(workerURL);
      worker.onmessage = ({ data }) => {
        if (job !== generation) return;
        if (data.type === "progress") progress(data.value);
        else if (data.type === "result") finish(data.result);
        else failure(data.message);
      };
      worker.onerror = (event) => {
        event.preventDefault();
        if (job !== generation) return;
        worker?.terminate();
        worker = null;
        fallback();
      };
      worker.postMessage(options);
    } catch {
      worker?.terminate();
      worker = null;
      await fallback();
    }
  }
  for (const id of ["equation-form", "domain-form"])
    $(id).addEventListener("submit", (event) => {
      event.preventDefault();
      render();
    });
  $("quality").addEventListener("change", render);
  $("config-toggle").addEventListener("click", () => {
    const expanded =
      $("config-toggle").getAttribute("aria-expanded") === "true";
    $("config-toggle").setAttribute("aria-expanded", String(!expanded));
    $("config-body").hidden = expanded;
  });
  if (matchMedia("(max-width: 700px), (max-height: 550px)").matches) {
    $("config-toggle").setAttribute("aria-expanded", "false");
    $("config-body").hidden = true;
  }
  for (const [id, method] of [
    ["wireframe", "setMeshVisible"],
    ["show-grid", "setGuides"],
    ["show-box", "setBox"],
  ])
    $(id).addEventListener("change", () => renderer?.[method]($(id).checked));
  document.querySelectorAll("[data-color]").forEach((button) =>
    button.addEventListener("click", () => {
      document
        .querySelectorAll("[data-color]")
        .forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
      renderer?.setColor(button.dataset.color);
    }),
  );
  $("zoom-in").addEventListener("click", () => renderer?.zoom(1 / 1.2));
  $("zoom-out").addEventListener("click", () => renderer?.zoom(1.2));
  $("reset-view").addEventListener("click", () => renderer?.reset());
  $("auto-rotate").addEventListener("click", () =>
    renderer?.setRotation(
      $("auto-rotate").getAttribute("aria-pressed") !== "true",
    ),
  );
  function openDialog(id) {
    $(id).showModal();
  }
  $("presets-toggle").addEventListener("click", () =>
    openDialog("preset-dialog"),
  );
  $("all-presets").addEventListener("click", () => openDialog("preset-dialog"));
  $("help-toggle").addEventListener("click", () => openDialog("help-dialog"));
  document
    .querySelectorAll("[data-close]")
    .forEach((button) =>
      button.addEventListener("click", () => $(button.dataset.close).close()),
    );
  document.querySelectorAll("dialog").forEach((dialog) =>
    dialog.addEventListener("click", (event) => {
      const rect = dialog.getBoundingClientRect();
      if (
        event.target === dialog &&
        (event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom)
      )
        dialog.close();
    }),
  );
  function choosePreset(id) {
    const preset = presets.find((p) => p.id === id);
    if (!preset) return;
    $("expression").value = preset.expression;
    axisInputs.forEach((pair) => {
      pair[0].value = -preset.span;
      pair[1].value = preset.span;
    });
    $("preset-dialog").close();
    renderer?.reset();
    render();
  }
  for (const preset of presets) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preset-card";
    button.dataset.preset = preset.id;
    const title = document.createElement("strong"),
      subtitle = document.createElement("span"),
      equation = document.createElement("code");
    title.textContent = preset.name;
    subtitle.textContent = preset.type;
    equation.textContent = preset.expression;
    button.append(title, subtitle, equation);
    $("preset-list").append(button);
  }
  document
    .querySelectorAll("[data-preset]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        choosePreset(button.dataset.preset),
      ),
    );
  window.addEventListener("pagehide", () => {
    generation++;
    worker?.terminate();
    if (workerURL) URL.revokeObjectURL(workerURL);
    workerURL = null;
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && busy) {
      $("expression").value = activeExpression;
      render();
    }
  });
  updatePresetState(activeExpression);
  render();
})();
