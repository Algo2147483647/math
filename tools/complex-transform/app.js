/* Standalone canvas UI; classic scripts also work directly over file://. */
(() => {
  "use strict";
  const { compile, C, finite } = window.ComplexMath;
  const {
    sampleCurve,
    fitBounds,
    niceStep,
    ticks,
    viewBounds,
    createGrid,
    createFiniteGrid,
  } = window.ComplexGeometry;
  const $ = (id) => document.getElementById(id);
  const colors = {
    teal: "#368f8b",
    rose: "#b76b88",
    circle: "#ba9151",
    ink: "#286451",
  };
  const state = {
    expression: "z^2",
    fn: compile("z^2"),
    sourceView: { re: 0, im: 0, span: 2 },
    extentMode: "infinite",
    finiteExtent: 2,
    tool: "probe",
    gridDirty: true,
    fitPending: true,
    divisions: 12,
    grid: "cartesian",
    circle: true,
    axes: true,
    t: 1,
    probe: C(0.7, 0.5),
    view: { re: 0, im: 0, span: 9.2 },
    curves: [],
    geometryDirty: true,
    playing: false,
    animationStart: null,
    fitMessage: "",
  };
  const source = makePlot("source"),
    target = makePlot("target");
  let frame = 0,
    geometry = [],
    gridGeneration = 0;

  function makePlot(id) {
    const canvas = $(id);
    return {
      canvas,
      ctx: canvas.getContext("2d"),
      width: 1,
      height: 1,
      scale: 1,
      view: null,
    };
  }
  function format(n, digits = 3) {
    if (!Number.isFinite(n)) return "undefined";
    if (n === 0) return "0";
    if (Math.abs(n) >= 1e5 || Math.abs(n) < 0.001) return n.toExponential(2);
    return String(Number(n.toFixed(digits)));
  }
  function formatComplex(z) {
    if (!finite(z)) return "undefined";
    const re = format(z.re),
      im = format(Math.abs(z.im));
    if (im === "0") return re;
    if (re === "0") return `${z.im < 0 ? "−" : ""}${im === "1" ? "" : im}i`;
    return `${re} ${z.im < 0 ? "−" : "+"} ${im === "1" ? "" : im}i`;
  }
  function mapped(z, t = state.t) {
    if (t === 0) return z;
    const w = state.fn(z);
    if (t === 1 || !finite(w)) return w;
    return C((1 - t) * z.re + t * w.re, (1 - t) * z.im + t * w.im);
  }
  function buildCurves() {
    state.gridDirty = true;
    requestDraw(true);
  }
  function rebuildGrid() {
    const grid =
      state.extentMode === "finite"
        ? createFiniteGrid(
            state.finiteExtent,
            state.divisions,
            state.grid,
            state.circle,
          )
        : createGrid(
            state.sourceView,
            source.width,
            source.height,
            state.divisions,
            state.grid,
            state.circle,
          );
    state.curves = grid.map((line) => ({ ...line, color: colors[line.color] }));
    gridGeneration++;
    state.gridDirty = false;
    state.geometryDirty = true;
  }
  function resize(plot) {
    const rect = plot.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (plot.canvas.width !== width || plot.canvas.height !== height) {
      plot.canvas.width = width;
      plot.canvas.height = height;
      state.geometryDirty = true;
      if (plot === source) state.gridDirty = true;
    }
    plot.width = rect.width;
    plot.height = rect.height;
    plot.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    plot.view = plot === source ? state.sourceView : state.view;
    plot.scale = Math.min(plot.width, plot.height) / 2 / plot.view.span;
  }
  function pixel(plot, z) {
    return {
      x: plot.width / 2 + (z.re - plot.view.re) * plot.scale,
      y: plot.height / 2 - (z.im - plot.view.im) * plot.scale,
    };
  }
  function world(plot, x, y) {
    return C(
      (x - plot.width / 2) / plot.scale + plot.view.re,
      (plot.height / 2 - y) / plot.scale + plot.view.im,
    );
  }
  function tickStep(scale) {
    return niceStep(65 / scale) || Number.MIN_VALUE;
  }
  function background(plot) {
    const { ctx, width, height, scale } = plot;
    ctx.clearRect(0, 0, width, height);
    if (!state.axes) return;
    const step = tickStep(scale),
      origin = pixel(plot, C(0));
    const min = world(plot, 0, height),
      max = world(plot, width, 0);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = "#b9cbbb3b";
    ctx.font = "10px Consolas, monospace";
    ctx.fillStyle = "#98aa9d";
    for (const value of ticks(min.re, max.re, step)) {
      const x = pixel(plot, C(value)).x;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      if (value !== 0 && x > 16 && x < width - 20) {
        ctx.textAlign = "center";
        ctx.fillText(
          format(value, 2),
          x,
          Math.max(16, Math.min(height - 30, origin.y + 15)),
        );
      }
    }
    for (const value of ticks(min.im, max.im, step)) {
      const y = pixel(plot, C(0, value)).y;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      if (value !== 0 && y > 17 && y < height - 23) {
        ctx.textAlign = "left";
        ctx.fillText(
          format(value, 2),
          Math.max(8, Math.min(width - 42, origin.x + 8)),
          y - 5,
        );
      }
    }
    ctx.strokeStyle = "#a6bdad88";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, height);
    ctx.moveTo(0, origin.y);
    ctx.lineTo(width, origin.y);
    ctx.stroke();
    ctx.fillStyle = "#788b78";
    ctx.font = "italic 12px Georgia, serif";
    ctx.textAlign = "right";
    ctx.fillText(
      "Re",
      width - 10,
      Math.max(16, Math.min(height - 30, origin.y - 8)),
    );
    ctx.textAlign = "left";
    ctx.fillText("Im", Math.max(10, Math.min(width - 30, origin.x + 8)), 17);
    if (
      origin.x > 10 &&
      origin.x < width - 15 &&
      origin.y > 10 &&
      origin.y < height - 25
    ) {
      ctx.font = "10px Consolas, monospace";
      ctx.fillStyle = "#98aa9d";
      ctx.fillText("0", origin.x + 6, origin.y + 14);
    }
  }
  function drawCurve(plot, points, style) {
    const ctx = plot.ctx;
    ctx.beginPath();
    ctx.strokeStyle = style.color;
    ctx.globalAlpha = style.circle ? 0.85 : plot === source ? 0.57 : 0.76;
    ctx.lineWidth = style.circle ? 1.6 : 1.15;
    ctx.setLineDash(style.circle ? [5, 4] : []);
    let pen = false;
    for (const p of points) {
      if (!p || !finite(p)) {
        pen = false;
        continue;
      }
      const { x, y } = pixel(plot, p);
      if (Math.abs(x) > 1e7 || Math.abs(y) > 1e7) {
        pen = false;
        continue;
      }
      if (pen) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
      pen = true;
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }
  function drawProbe(plot, value, label) {
    if (!finite(value)) return false;
    const p = pixel(plot, value),
      ctx = plot.ctx;
    if (p.x < 0 || p.x > plot.width || p.y < 0 || p.y > plot.height)
      return false;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#2864511f";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = colors.ink;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.font = "italic 15px Georgia, serif";
    ctx.fillStyle = colors.ink;
    ctx.textAlign = "left";
    ctx.fillText(
      label,
      Math.min(p.x + 11, plot.width - 40),
      Math.max(18, p.y - 10),
    );
    return true;
  }
  function requestDraw(dirty = false) {
    state.geometryDirty ||= dirty;
    if (!frame) frame = requestAnimationFrame(draw);
  }
  let sourceGeometry = [],
    sourceGeneration = -1;
  function draw() {
    frame = 0;
    resize(source);
    resize(target);
    if (state.gridDirty) rebuildGrid();
    if (state.fitPending) {
      fitOutput();
      resize(target);
    }
    if (sourceGeneration !== gridGeneration) {
      sourceGeometry = state.curves.map((line) =>
        Array.from({ length: 129 }, (_, i) => line.curve(i / 128)),
      );
      sourceGeneration = gridGeneration;
    }
    if (state.geometryDirty) {
      const budget = Math.min(
        8192,
        Math.max(128, Math.floor(60000 / Math.max(1, state.curves.length))),
      );
      geometry = state.curves.map((line) =>
        sampleCurve(line.curve, mapped, target.scale, { budget }),
      );
      state.geometryDirty = false;
    }
    background(source);
    background(target);
    state.curves.forEach((line, index) => {
      drawCurve(source, sourceGeometry[index], line);
      drawCurve(target, geometry[index], line);
    });
    drawProbe(source, state.probe, "z");
    const w = mapped(state.probe),
      onScreen = drawProbe(target, w, state.t === 1 ? "f(z)" : "wₜ");
    const anyFinite = geometry.some((points) =>
      points.some((p) => p && finite(p)),
    );
    const message = !anyFinite
      ? "No finite values in the sampled region"
      : !finite(w)
        ? "The function is undefined at this point"
        : !onScreen
          ? "Mapped point is outside the view"
          : state.fitMessage;
    $("output-message").textContent = message;
    $("output-message").hidden = !message;
    $("view-scale").textContent = `±${format(state.view.span)}`;
    $("view-scale").title = "Half-span along the shorter canvas edge";
  }
  function fitView() {
    state.fitPending = true;
    requestDraw(true);
  }
  function fitOutput() {
    const points = state.curves.flatMap((line) =>
      Array.from({ length: 129 }, (_, i) => mapped(line.curve(i / 128))),
    );
    const fit = fitBounds(points);
    if (fit && viewBounds(fit, target.width, target.height)) {
      state.view = { re: fit.re, im: fit.im, span: fit.span };
      state.fitMessage = fit.trimmed ? "Extreme tails omitted from fit" : "";
    } else {
      state.view = { re: 0, im: 0, span: state.sourceView.span };
      state.fitMessage = "";
    }
    state.fitPending = false;
    state.geometryDirty = true;
  }
  function updateProbe(syncInputs = true) {
    if (syncInputs) {
      $("probe-real").value = format(state.probe.re);
      $("probe-imag").value = format(state.probe.im);
      $("probe-real").removeAttribute("aria-invalid");
      $("probe-imag").removeAttribute("aria-invalid");
    }
    const w = state.fn(state.probe);
    $("probe-output").textContent = formatComplex(w);
    $("probe-detail").textContent =
      `|z| = ${format(Math.hypot(state.probe.re, state.probe.im))} · |f(z)| = ${finite(w) ? format(Math.hypot(w.re, w.im)) : "undefined"}`;
    requestDraw();
  }
  function setMorph(value) {
    state.t = value;
    $("morph").value = value;
    $("morph-value").textContent = `${Math.round(value * 100)}%`;
    $("active-expression").textContent =
      value === 1
        ? state.expression
        : `(1−t)z + t·(${state.expression}), t=${format(value, 2)}`;
    requestDraw(true);
  }
  let animationFrame = 0;
  function stopAnimation() {
    state.playing = false;
    state.animationStart = null;
    cancelAnimationFrame(animationFrame);
    $("play-icon").textContent = "▶";
    $("play").setAttribute("aria-label", "Play transformation");
  }
  function animate(time) {
    if (!state.playing) return;
    if (state.animationStart === null)
      state.animationStart = time - state.t * 3000;
    const t = Math.min(1, (time - state.animationStart) / 3000);
    setMorph(t);
    if (t < 1) animationFrame = requestAnimationFrame(animate);
    else stopAnimation();
  }
  function applyExpression() {
    let fn;
    try {
      fn = compile($("expression").value);
    } catch (error) {
      $("expression-error").textContent =
        `${error.message} Still showing ${state.expression}.`;
      $("expression-error").hidden = false;
      $("expression").setAttribute("aria-invalid", "true");
      return;
    }
    stopAnimation();
    state.fn = fn;
    state.expression = $("expression").value.trim();
    $("expression").removeAttribute("aria-invalid");
    $("expression-error").hidden = true;
    document
      .querySelectorAll("[data-expression]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.expression === state.expression),
        ),
      );
    setMorph(1);
    fitView();
    updateProbe(false);
  }
  $("function-form").addEventListener("submit", (event) => {
    event.preventDefault();
    applyExpression();
  });
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-expression]");
    if (!button) return;
    $("expression").value = button.dataset.expression;
    applyExpression();
    if ($("preset-dialog").open) $("preset-dialog").close();
  });
  for (const type of ["cartesian", "polar"])
    $(type).addEventListener("click", () => {
      state.grid = type;
      $("cartesian").setAttribute("aria-pressed", String(type === "cartesian"));
      $("polar").setAttribute("aria-pressed", String(type === "polar"));
      $("legend-first").textContent =
        type === "cartesian" ? "Horizontal" : "Circles";
      $("legend-second").textContent =
        type === "cartesian" ? "Vertical" : "Rays";
      buildCurves();
      fitView();
    });
  $("unit-circle").addEventListener("change", () => {
    state.circle = $("unit-circle").checked;
    buildCurves();
  });
  $("show-axes").addEventListener("change", () => {
    state.axes = $("show-axes").checked;
    requestDraw();
  });
  $("density").addEventListener("change", () => {
    state.divisions = Number($("density").value);
    buildCurves();
  });
  function domainError(message) {
    $("domain-error").textContent = message;
    $("domain-error").hidden = !message;
    $("domain").setAttribute("aria-invalid", String(Boolean(message)));
  }
  function syncExtentControls() {
    const bounded = state.extentMode === "finite";
    $("infinite-mode").setAttribute("aria-pressed", String(!bounded));
    $("finite-mode").setAttribute("aria-pressed", String(bounded));
    $("extent-badge").textContent = bounded ? "□" : "∞";
    $("extent-badge").title = bounded
      ? "The domain stays fixed while the view moves"
      : "The grid extends with the input view";
    $("extent-hint").textContent = bounded
      ? `Fixed at ±${format(state.finiteExtent)} around 0.`
      : "Extends with the input view.";
    $("domain").value = String(
      bounded ? state.finiteExtent : state.sourceView.span,
    );
    $("domain-center").textContent = formatComplex(
      C(state.sourceView.re, state.sourceView.im),
    );
  }
  function validSourceView(view) {
    resize(source);
    if (!viewBounds(view, source.width, source.height, 0.04)) {
      domainError(
        "This view exceeds numerical precision. Try another span or press 0 on the input canvas to recenter.",
      );
      return false;
    }
    return true;
  }
  function setSourceView(view) {
    if (!validSourceView(view)) return false;
    const changed =
      view.re !== state.sourceView.re ||
      view.im !== state.sourceView.im ||
      view.span !== state.sourceView.span;
    state.sourceView = view;
    syncExtentControls();
    domainError("");
    if (!changed) return true;
    if (state.extentMode === "infinite") {
      buildCurves();
      fitView();
    } else requestDraw();
    return true;
  }
  function setDomain(value) {
    if (!(value > 0) || !Number.isFinite(value)) {
      domainError("Enter a positive finite number, for example 20 or 1e-4.");
      return;
    }
    if (state.extentMode === "infinite") {
      setSourceView({ ...state.sourceView, span: value });
      return;
    }
    // A finite domain is independent of the camera. Editing its size recenters
    // the camera; merely panning or zooming never changes the mapped region.
    if (value === state.finiteExtent) {
      domainError("");
      return;
    }
    const view = { re: 0, im: 0, span: value * 1.2 };
    if (!validSourceView(view)) return;
    state.finiteExtent = value;
    setSourceView(view);
    buildCurves();
    fitView();
  }
  function setExtentMode(mode) {
    if (mode === state.extentMode) return;
    const extent =
      mode === "finite" ? state.sourceView.span : state.finiteExtent;
    const view =
      mode === "finite"
        ? { re: 0, im: 0, span: extent * 1.2 }
        : { ...state.sourceView, span: extent };
    if (!validSourceView(view)) return;
    state.extentMode = mode;
    state.finiteExtent = extent;
    setSourceView(view);
    buildCurves();
    fitView();
  }
  for (const mode of ["infinite", "finite"])
    $(mode + "-mode").addEventListener("click", () => setExtentMode(mode));
  function resetInputView() {
    state.finiteExtent = 2;
    setSourceView({
      re: 0,
      im: 0,
      span: state.extentMode === "finite" ? 2.4 : 2,
    });
    buildCurves();
    fitView();
  }
  $("domain-form").addEventListener("submit", (event) => {
    event.preventDefault();
    setDomain($("domain").valueAsNumber);
  });
  $("domain").addEventListener("change", () =>
    setDomain($("domain").valueAsNumber),
  );
  $("fit").addEventListener("click", fitView);
  $("reset").addEventListener("click", () => {
    stopAnimation();
    setMorph(1);
    resetInputView();
  });
  for (const id of ["probe-real", "probe-imag"])
    $(id).addEventListener("input", () => {
      const real = $("probe-real"),
        imag = $("probe-imag");
      const validReal = Number.isFinite(real.valueAsNumber),
        validImag = Number.isFinite(imag.valueAsNumber);
      real.setAttribute("aria-invalid", String(!validReal));
      imag.setAttribute("aria-invalid", String(!validImag));
      if (!validReal || !validImag) return;
      state.probe = C(real.valueAsNumber, imag.valueAsNumber);
      updateProbe(false);
    });
  $("morph").addEventListener("input", () => {
    stopAnimation();
    setMorph(Number($("morph").value));
  });
  $("play").addEventListener("click", () => {
    if (state.playing) {
      stopAnimation();
      return;
    }
    if (state.t >= 1) setMorph(0);
    state.playing = true;
    state.animationStart = null;
    $("play-icon").textContent = "Ⅱ";
    $("play").setAttribute("aria-label", "Pause transformation");
    animationFrame = requestAnimationFrame(animate);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAnimation();
  });

  function localPoint(event, plot) {
    const rect = plot.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  let probePointer = null,
    sourcePan = null;
  for (const mode of ["probe", "pan"])
    $(mode + "-mode").addEventListener("click", () => {
      state.tool = mode;
      source.canvas.dataset.tool = mode;
      $("probe-mode").setAttribute("aria-pressed", String(mode === "probe"));
      $("pan-mode").setAttribute("aria-pressed", String(mode === "pan"));
    });
  function moveProbe(event) {
    const p = localPoint(event, source),
      z = world(source, p.x, p.y);
    if (!finite(z)) return;
    state.probe = z;
    updateProbe();
  }
  source.canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.button !== 1) return;
    event.preventDefault();
    source.canvas.setPointerCapture(event.pointerId);
    source.canvas.focus({ preventScroll: true });
    if (state.tool === "pan" || event.shiftKey || event.button === 1) {
      sourcePan = {
        pointer: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        view: { ...state.sourceView },
        scale: source.scale,
      };
      source.canvas.classList.add("panning");
    } else {
      probePointer = event.pointerId;
      moveProbe(event);
    }
  });
  source.canvas.addEventListener("pointermove", (event) => {
    if (sourcePan && sourcePan.pointer === event.pointerId) {
      setSourceView({
        ...sourcePan.view,
        re: sourcePan.view.re - (event.clientX - sourcePan.x) / sourcePan.scale,
        im: sourcePan.view.im + (event.clientY - sourcePan.y) / sourcePan.scale,
      });
    } else if (probePointer === event.pointerId) moveProbe(event);
  });
  for (const name of ["lostpointercapture", "pointerup", "pointercancel"])
    source.canvas.addEventListener(name, () => {
      probePointer = null;
      sourcePan = null;
      source.canvas.classList.remove("panning");
    });
  function zoomedView(plot, factor, position) {
    resize(plot);
    const view = plot === source ? state.sourceView : state.view;
    const before = world(plot, position.x, position.y);
    const span = view.span * factor;
    const candidate = {
      re: before.re + (view.re - before.re) * factor,
      im: before.im + (view.im - before.im) * factor,
      span,
    };
    return viewBounds(candidate, plot.width, plot.height, 0.04)
      ? candidate
      : null;
  }
  function zoomSource(
    factor,
    position = { x: source.width / 2, y: source.height / 2 },
  ) {
    const view = zoomedView(source, factor, position);
    if (view) setSourceView(view);
  }
  source.canvas.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      zoomSource(
        Math.exp(Math.max(-200, Math.min(200, event.deltaY)) * 0.0015),
        localPoint(event, source),
      );
    },
    { passive: false },
  );
  source.canvas.addEventListener("keydown", (event) => {
    const moves = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, 1],
      ArrowDown: [0, -1],
    };
    if (moves[event.key]) {
      event.preventDefault();
      const [x, y] = moves[event.key];
      const step = state.sourceView.span * (event.shiftKey ? 0.1 : 0.02);
      if (state.tool === "pan") {
        setSourceView({
          ...state.sourceView,
          re: state.sourceView.re + x * step * 5,
          im: state.sourceView.im + y * step * 5,
        });
      } else {
        const candidate = C(
          state.probe.re + x * step,
          state.probe.im + y * step,
        );
        if (finite(candidate)) {
          state.probe = candidate;
          updateProbe();
        }
      }
    } else if (["+", "=", "-", "0"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "0") resetInputView();
      else zoomSource(event.key === "-" ? 1.25 : 1 / 1.25);
    }
  });
  let pan = null;
  target.canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    target.canvas.setPointerCapture(event.pointerId);
    target.canvas.focus({ preventScroll: true });
    pan = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      re: state.view.re,
      im: state.view.im,
    };
  });
  target.canvas.addEventListener("pointermove", (event) => {
    if (!pan || pan.pointer !== event.pointerId) return;
    const candidate = {
      ...state.view,
      re: pan.re - (event.clientX - pan.x) / target.scale,
      im: pan.im + (event.clientY - pan.y) / target.scale,
    };
    if (!viewBounds(candidate, target.width, target.height)) return;
    state.view = candidate;
    state.fitMessage = "";
    requestDraw();
  });
  target.canvas.addEventListener("lostpointercapture", () => {
    pan = null;
  });
  target.canvas.addEventListener("pointerup", () => {
    pan = null;
  });
  function zoom(
    factor,
    position = { x: target.width / 2, y: target.height / 2 },
  ) {
    const view = zoomedView(target, factor, position);
    if (!view) return;
    state.view = view;
    state.fitMessage = "";
    requestDraw(true);
  }
  target.canvas.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      zoom(
        Math.exp(Math.max(-200, Math.min(200, event.deltaY)) * 0.0015),
        localPoint(event, target),
      );
    },
    { passive: false },
  );
  target.canvas.addEventListener("dblclick", fitView);
  $("zoom-in").addEventListener("click", () => zoom(1 / 1.25));
  $("zoom-out").addEventListener("click", () => zoom(1.25));
  target.canvas.addEventListener("keydown", (event) => {
    const moves = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, 1],
      ArrowDown: [0, -1],
    };
    if (moves[event.key]) {
      event.preventDefault();
      const [x, y] = moves[event.key];
      const candidate = {
        ...state.view,
        re: state.view.re + x * state.view.span * 0.1,
        im: state.view.im + y * state.view.span * 0.1,
      };
      if (!viewBounds(candidate, target.width, target.height)) return;
      state.view = candidate;
      requestDraw();
    } else if (["+", "=", "-", "0"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "0") fitView();
      else zoom(event.key === "-" ? 1.2 : 1 / 1.2);
    }
  });

  // The canvases always occupy two equal viewport halves. Controls only overlay
  // them, and folding a panel must not resize or change the plotted coordinates.
  const compactViewport = window.matchMedia("(max-width: 900px)");
  function setPanelCollapsed(side, collapsed) {
    const panel = $(`${side}-panel`),
      controls = $(`${side}-controls`);
    const toggle = $(`${side}-toggle`);
    if (collapsed && controls.contains(document.activeElement))
      toggle.focus({ preventScroll: true });
    panel.dataset.collapsed = String(collapsed);
    controls.hidden = collapsed;
    toggle.setAttribute("aria-expanded", String(!collapsed));
  }
  for (const side of ["source", "target"]) {
    $(`${side}-toggle`).addEventListener("click", () => {
      const collapsed = $(`${side}-panel`).dataset.collapsed === "true";
      if (compactViewport.matches && collapsed)
        setPanelCollapsed(side === "source" ? "target" : "source", true);
      setPanelCollapsed(side, !collapsed);
    });
  }
  function syncCompactPanels() {
    for (const side of ["source", "target"])
      setPanelCollapsed(side, compactViewport.matches);
  }
  compactViewport.addEventListener("change", syncCompactPanels);
  syncCompactPanels();

  const presetGroups = window.ComplexPresets;
  const normalizeSearch = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "");
  const presetCards = [];
  for (const group of presetGroups) {
    const section = document.createElement("section");
    section.className = "preset-group";
    const heading = document.createElement("h3");
    heading.textContent = group.name;
    const grid = document.createElement("div");
    grid.className = "preset-grid";
    for (const preset of group.presets) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preset-card";
      button.dataset.expression = preset.expression;
      button.title = preset.expression;
      button.setAttribute(
        "aria-pressed",
        String(preset.expression === state.expression),
      );
      const formula = document.createElement("span"),
        name = document.createElement("span");
      formula.className = "preset-formula";
      formula.textContent = preset.formula;
      name.className = "preset-name";
      name.textContent = preset.name;
      button.append(formula, name);
      grid.append(button);
      presetCards.push({
        button,
        section,
        search: normalizeSearch(
          `${group.name} ${preset.name} ${preset.formula} ${preset.expression}`,
        ),
      });
    }
    section.append(heading, grid);
    $("preset-groups").append(section);
  }
  $("preset-count").textContent = presetCards.length;
  function filterPresets() {
    const query = normalizeSearch($("preset-search").value);
    const visibleSections = new Set();
    for (const card of presetCards) {
      card.button.hidden = !card.search.includes(query);
      if (!card.button.hidden) visibleSections.add(card.section);
    }
    for (const section of $("preset-groups").children)
      section.hidden = !visibleSections.has(section);
    $("preset-empty").hidden = visibleSections.size > 0;
  }
  $("preset-search").addEventListener("input", filterPresets);
  function openPresets() {
    stopAnimation();
    $("preset-search").value = "";
    filterPresets();
    $("preset-dialog").showModal();
    $("preset-dialog").scrollTop = 0;
    $("presets-toggle").setAttribute("aria-expanded", "true");
    $("preset-search").focus({ preventScroll: true });
  }
  $("presets-toggle").addEventListener("click", openPresets);
  $("all-presets").addEventListener("click", openPresets);
  $("help-toggle").addEventListener("click", () => {
    stopAnimation();
    $("help-dialog").showModal();
  });
  $("preset-dialog").addEventListener("close", () =>
    $("presets-toggle").setAttribute("aria-expanded", "false"),
  );
  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () =>
      $(button.dataset.closeDialog).close(),
    );
  });
  for (const id of ["preset-dialog", "help-dialog"]) {
    // Search inputs normally consume Escape to clear their value. Close the
    // dialog on the first Escape consistently, even while a search is active.
    $(id).addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        $(id).close();
      }
    });
    $(id).addEventListener("click", (event) => {
      if (event.target !== $(id)) return;
      const box = $(id).getBoundingClientRect();
      if (
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom
      )
        $(id).close();
    });
  }

  const observer = new ResizeObserver(() => requestDraw(true));
  observer.observe(source.canvas);
  observer.observe(target.canvas);
  window.addEventListener("resize", () => requestDraw(true));
  buildCurves();
  fitView();
  updateProbe();
})();
