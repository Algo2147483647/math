/* Standalone canvas UI; classic scripts also work directly over file://. */
(() => {
  "use strict";
  const { compile, C, finite } = window.ComplexMath;
  const { sampleCurve, fitBounds } = window.ComplexGeometry;
  const $ = (id) => document.getElementById(id);
  const colors = {
    teal: "#368f8b",
    rose: "#b76b88",
    circle: "#ba9151",
    ink: "#284c3c",
  };
  const state = {
    expression: "z^2",
    fn: compile("z^2"),
    extent: 2,
    divisions: 12,
    grid: "cartesian",
    circle: true,
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
    if (Math.abs(n) < 1e-10) return "0";
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
    const e = state.extent,
      n = state.divisions;
    const curves = [];
    if (state.grid === "cartesian") {
      for (let j = 0; j <= n; j++) {
        const value = -e + (2 * e * j) / n;
        curves.push({
          curve: (t) => C(-e + 2 * e * t, value),
          color: colors.teal,
        });
        curves.push({
          curve: (t) => C(value, -e + 2 * e * t),
          color: colors.rose,
        });
      }
    } else {
      for (let j = 1; j <= n / 2; j++) {
        const radius = (2 * e * j) / n;
        curves.push({
          curve: (t) =>
            C(
              radius * Math.cos(t * 2 * Math.PI),
              radius * Math.sin(t * 2 * Math.PI),
            ),
          color: colors.teal,
        });
      }
      for (let j = 0; j < n * 2; j++) {
        const angle = (j * Math.PI) / n;
        curves.push({
          curve: (t) => C(e * t * Math.cos(angle), e * t * Math.sin(angle)),
          color: colors.rose,
        });
      }
    }
    if (state.circle)
      curves.push({
        curve: (t) => C(Math.cos(t * Math.PI * 2), Math.sin(t * Math.PI * 2)),
        color: colors.circle,
        circle: true,
      });
    state.curves = curves;
    gridGeneration++;
    requestDraw(true);
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
    }
    plot.width = rect.width;
    plot.height = rect.height;
    plot.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    plot.view =
      plot === source ? { re: 0, im: 0, span: state.extent * 1.2 } : state.view;
    plot.scale = Math.min(plot.width, plot.height) / (2 * plot.view.span);
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
    const ideal = 65 / scale,
      power = 10 ** Math.floor(Math.log10(ideal));
    return [1, 2, 5, 10].find((n) => n * power >= ideal) * power;
  }
  function background(plot) {
    const { ctx, width, height, scale } = plot;
    ctx.clearRect(0, 0, width, height);
    const step = tickStep(scale),
      origin = pixel(plot, C(0));
    const min = world(plot, 0, height),
      max = world(plot, width, 0);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = "#e9ede5";
    ctx.font = "10px Consolas, monospace";
    ctx.fillStyle = "#a0a99a";
    for (
      let n = Math.ceil(min.re / step);
      n <= Math.floor(max.re / step);
      n++
    ) {
      const x = pixel(plot, C(n * step)).x;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      if (n !== 0 && x > 16 && x < width - 20) {
        ctx.textAlign = "center";
        ctx.fillText(
          format(n * step, 2),
          x,
          Math.max(16, Math.min(height - 30, origin.y + 15)),
        );
      }
    }
    for (
      let n = Math.ceil(min.im / step);
      n <= Math.floor(max.im / step);
      n++
    ) {
      const y = pixel(plot, C(0, n * step)).y;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      if (n !== 0 && y > 17 && y < height - 23) {
        ctx.textAlign = "left";
        ctx.fillText(
          format(n * step, 2),
          Math.max(8, Math.min(width - 42, origin.x + 8)),
          y - 5,
        );
      }
    }
    ctx.strokeStyle = "#bbc7b8";
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
      ctx.fillStyle = "#9da897";
      ctx.fillText("0", origin.x + 6, origin.y + 14);
    }
  }
  function drawCurve(plot, points, style) {
    const ctx = plot.ctx;
    ctx.beginPath();
    ctx.strokeStyle = style.color;
    ctx.globalAlpha = style.circle ? 0.95 : plot === source ? 0.52 : 0.73;
    ctx.lineWidth = style.circle ? 1.6 : 1.05;
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
    ctx.fillStyle = "#28645118";
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
    if (sourceGeneration !== gridGeneration) {
      sourceGeometry = state.curves.map((line) =>
        Array.from({ length: 129 }, (_, i) => line.curve(i / 128)),
      );
      sourceGeneration = gridGeneration;
    }
    if (state.geometryDirty) {
      geometry = state.curves.map((line) =>
        sampleCurve(line.curve, mapped, target.scale),
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
      ? "No finite values in this domain"
      : !finite(w)
        ? "The function is undefined at this point"
        : !onScreen
          ? "Mapped point is outside the view"
          : state.fitMessage;
    $("output-message").textContent = message;
    $("output-message").hidden = !message;
    $("view-scale").textContent = `${format(state.view.span)} / half-height`;
  }
  function fitView() {
    const points = state.curves.flatMap((line) =>
      Array.from({ length: 129 }, (_, i) => mapped(line.curve(i / 128))),
    );
    const fit = fitBounds(points);
    if (fit) {
      state.view = { re: fit.re, im: fit.im, span: fit.span };
      state.fitMessage = fit.trimmed ? "Extreme tails omitted from fit" : "";
    } else {
      state.view = { re: 0, im: 0, span: state.extent * 1.2 };
      state.fitMessage = "";
    }
    requestDraw(true);
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
  document.querySelectorAll("[data-expression]").forEach((button) =>
    button.addEventListener("click", () => {
      $("expression").value = button.dataset.expression;
      applyExpression();
    }),
  );
  for (const type of ["cartesian", "polar"])
    $(type).addEventListener("click", () => {
      state.grid = type;
      $("cartesian").setAttribute("aria-pressed", String(type === "cartesian"));
      $("polar").setAttribute("aria-pressed", String(type === "polar"));
      $("legend-first").textContent =
        type === "cartesian" ? "Horizontal lines" : "Circles";
      $("legend-second").textContent =
        type === "cartesian" ? "Vertical lines" : "Rays";
      buildCurves();
      fitView();
    });
  $("unit-circle").addEventListener("change", () => {
    state.circle = $("unit-circle").checked;
    buildCurves();
  });
  $("density").addEventListener("change", () => {
    state.divisions = Number($("density").value);
    buildCurves();
  });
  function setDomain(value) {
    state.extent = Math.max(0.5, Math.min(5, Math.round(value * 10) / 10));
    $("domain").value = state.extent;
    $("domain-value").textContent = format(state.extent, 1);
    buildCurves();
    fitView();
  }
  $("domain").addEventListener("input", () =>
    setDomain(Number($("domain").value)),
  );
  $("fit").addEventListener("click", fitView);
  $("reset").addEventListener("click", () => {
    stopAnimation();
    setMorph(1);
    setDomain(2);
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
  let probePointer = null;
  function moveProbe(event) {
    const p = localPoint(event, source),
      z = world(source, p.x, p.y);
    state.probe = C(
      Math.max(-state.extent, Math.min(state.extent, z.re)),
      Math.max(-state.extent, Math.min(state.extent, z.im)),
    );
    updateProbe();
  }
  source.canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    probePointer = event.pointerId;
    source.canvas.setPointerCapture(event.pointerId);
    source.canvas.focus({ preventScroll: true });
    moveProbe(event);
  });
  source.canvas.addEventListener("pointermove", (event) => {
    if (probePointer === event.pointerId) moveProbe(event);
  });
  source.canvas.addEventListener("lostpointercapture", () => {
    probePointer = null;
  });
  source.canvas.addEventListener("pointerup", () => {
    probePointer = null;
  });
  source.canvas.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      setDomain(state.extent + Math.sign(event.deltaY) * 0.2);
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
    if (!moves[event.key]) return;
    event.preventDefault();
    const [x, y] = moves[event.key],
      step = state.extent * (event.shiftKey ? 0.1 : 0.02);
    state.probe = C(
      Math.max(
        -state.extent,
        Math.min(state.extent, state.probe.re + x * step),
      ),
      Math.max(
        -state.extent,
        Math.min(state.extent, state.probe.im + y * step),
      ),
    );
    updateProbe();
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
    state.view.re = pan.re - (event.clientX - pan.x) / target.scale;
    state.view.im = pan.im + (event.clientY - pan.y) / target.scale;
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
    const before = world(target, position.x, position.y),
      oldSpan = state.view.span;
    state.view.span = Math.max(1e-6, Math.min(1e12, oldSpan * factor));
    const ratio = state.view.span / oldSpan;
    state.view.re = before.re + (state.view.re - before.re) * ratio;
    state.view.im = before.im + (state.view.im - before.im) * ratio;
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
      state.view.re += x * state.view.span * 0.1;
      state.view.im += y * state.view.span * 0.1;
      requestDraw();
    } else if (["+", "=", "-", "0"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "0") fitView();
      else zoom(event.key === "-" ? 1.2 : 1 / 1.2);
    }
  });
  const observer = new ResizeObserver(() => requestDraw(true));
  observer.observe(source.canvas);
  observer.observe(target.canvas);
  window.addEventListener("resize", () => requestDraw(true));
  buildCurves();
  fitView();
  updateProbe();
})();
