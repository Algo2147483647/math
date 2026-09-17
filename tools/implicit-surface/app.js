(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const presets = SurfacePresets;
  let appearance = SurfaceColors.fromPalette("glacier");
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
  function updateAppearance() {
    const gradient = appearance.mode === "gradient";
    $("solid-mode").setAttribute("aria-pressed", String(!gradient));
    $("gradient-mode").setAttribute("aria-pressed", String(gradient));
    $("gradient-controls").hidden = !gradient;
    $("color-end-control").hidden = !gradient;
    $("color-middle-control").hidden = !appearance.useMiddle;
    $("color-stops").classList.toggle("single", !gradient);
    $("color-start-label").textContent = gradient ? "From" : "Color";
    $("color-start").setAttribute(
      "aria-label",
      gradient ? "Start color" : "Surface color",
    );
    $("reverse-colors").hidden = !gradient;
    $("use-middle").checked = appearance.useMiddle;
    $("gradient-direction").value = appearance.direction;
    for (const stop of ["start", "middle", "end"]) {
      $(`color-${stop}`).value = appearance[stop];
      $(`color-${stop}-value`).value = appearance[stop].toUpperCase();
    }
    $("color-preview").style.background = SurfaceColors.preview(appearance);
    let selectedName = "Custom";
    document.querySelectorAll("[data-color]").forEach((button) => {
      const palette = SurfaceColors.fromPalette(button.dataset.color);
      const matches =
        palette.start === appearance.start &&
        (!gradient ||
          (palette.end === appearance.end &&
            palette.useMiddle === appearance.useMiddle &&
            (!palette.useMiddle || palette.middle === appearance.middle)));
      button.setAttribute("aria-pressed", String(matches));
      if (matches)
        selectedName = SurfaceColors.palettes[button.dataset.color].name;
    });
    $("palette-name").textContent = selectedName;
    renderer?.setAppearance(appearance);
  }
  for (const [id, palette] of Object.entries(SurfaceColors.palettes)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    button.dataset.color = id;
    button.title = palette.name;
    button.setAttribute("aria-label", `${palette.name} palette`);
    button.style.background = SurfaceColors.preview(
      SurfaceColors.fromPalette(id),
    );
    button.addEventListener("click", () => {
      appearance = {
        ...SurfaceColors.fromPalette(id),
        mode: appearance.mode,
        direction: appearance.direction,
      };
      updateAppearance();
    });
    $("color-palettes").append(button);
  }
  for (const mode of ["solid", "gradient"])
    $(mode + "-mode").addEventListener("click", () => {
      appearance.mode = mode;
      updateAppearance();
    });
  for (const stop of ["start", "middle", "end"])
    $(`color-${stop}`).addEventListener("input", (event) => {
      appearance[stop] = event.target.value;
      updateAppearance();
    });
  $("use-middle").addEventListener("change", (event) => {
    appearance.useMiddle = event.target.checked;
    updateAppearance();
  });
  $("gradient-direction").addEventListener("change", (event) => {
    appearance.direction = event.target.value;
    updateAppearance();
  });
  $("reverse-colors").addEventListener("click", () => {
    [appearance.start, appearance.end] = [appearance.end, appearance.start];
    updateAppearance();
  });
  updateAppearance();
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
    const domain =
      preset.domain ||
      Array.from({ length: 3 }, () => [-preset.span, preset.span]);
    axisInputs.forEach((pair, axis) => {
      pair[0].value = domain[axis][0];
      pair[1].value = domain[axis][1];
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
    button.setAttribute("aria-label", `${preset.name} · ${preset.group}`);
    const title = document.createElement("strong"),
      subtitle = document.createElement("span"),
      equation = document.createElement("code");
    title.textContent = preset.name;
    subtitle.textContent = preset.type;
    equation.textContent = preset.expression;
    button.append(title, subtitle, equation);
    $("preset-list").append(button);
  }
  let selectedGroup = "All";
  const libraryCards = Array.from(
    $("preset-list").querySelectorAll("[data-preset]"),
  );
  const searchText = new Map(
    presets.map((preset) => [
      preset.id,
      normalize(
        `${preset.name} ${preset.type} ${preset.group} ${preset.keywords || ""} ${preset.expression}`,
      ),
    ]),
  );
  const groupById = new Map(presets.map((preset) => [preset.id, preset.group]));
  function filterPresets() {
    const query = normalize($("preset-search").value);
    let count = 0;
    for (const card of libraryCards) {
      const visible =
        (selectedGroup === "All" ||
          selectedGroup === groupById.get(card.dataset.preset)) &&
        searchText.get(card.dataset.preset).includes(query);
      card.hidden = !visible;
      if (visible) count++;
    }
    $("preset-count").textContent =
      count === presets.length
        ? `${count} surfaces · ${new Set(presets.map((p) => p.group)).size} collections`
        : `${count} of ${presets.length} surfaces`;
    $("preset-empty").hidden = count > 0;
    $("preset-filters")
      .querySelectorAll("button")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.group === selectedGroup),
        ),
      );
  }
  for (const group of [
    "All",
    ...new Set(presets.map((preset) => preset.group)),
  ]) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = group;
    button.dataset.group = group;
    button.addEventListener("click", () => {
      selectedGroup = group;
      filterPresets();
    });
    $("preset-filters").append(button);
  }
  $("preset-search").addEventListener("input", filterPresets);
  filterPresets();
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
