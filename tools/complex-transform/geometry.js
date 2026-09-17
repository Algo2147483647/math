(function (root) {
  "use strict";
  const finite = (z) => z && Number.isFinite(z.re) && Number.isFinite(z.im);
  const distance = (a, b) => Math.hypot(a.re - b.re, a.im - b.im);

  // Refine curvature in screen space. Never connect an unresolved jump at
  // maximum depth: this is essential for poles and principal-value branch cuts.
  function sampleCurve(curve, map, pixelsPerUnit, options = {}) {
    const segments = options.segments || 64;
    const maxDepth = options.maxDepth ?? 7;
    const points = [];
    let budget = options.budget || 12000;
    const at = (t) => map(curve(t));
    const append = (p) => points.push(finite(p) ? p : null);
    function visit(a, b, pa, pb, depth) {
      if (--budget < 0) {
        points.push(null);
        return;
      }
      const middle = (a + b) / 2,
        pm = at(middle);
      if (!finite(pa) && !finite(pb) && !finite(pm)) {
        points.push(null);
        return;
      }
      const valid = finite(pa) && finite(pb) && finite(pm);
      const error = valid
        ? distance(pm, {
            re: pa.re / 2 + pb.re / 2,
            im: pa.im / 2 + pb.im / 2,
          }) * pixelsPerUnit
        : Infinity;
      const length = valid ? distance(pa, pb) * pixelsPerUnit : Infinity;
      if (!valid || error > 0.65 || length > 30) {
        if (depth < maxDepth) {
          visit(a, middle, pa, pm, depth + 1);
          visit(middle, b, pm, pb, depth + 1);
        } else {
          points.push(null);
          append(pb);
        }
      } else append(pb);
    }
    let pa = at(0);
    append(pa);
    for (let i = 0; i < segments; i++) {
      const pb = at((i + 1) / segments);
      visit(i / segments, (i + 1) / segments, pa, pb, 0);
      pa = pb;
    }
    return points;
  }

  function fitBounds(points) {
    const valid = points.filter(finite);
    if (!valid.length) return null;
    const xs = valid.map((p) => p.re).sort((a, b) => a - b);
    const ys = valid.map((p) => p.im).sort((a, b) => a - b);
    function bounds(values) {
      const lo = values[Math.floor((values.length - 1) * 0.05)];
      const hi = values[Math.ceil((values.length - 1) * 0.95)];
      const full = values[values.length - 1] / 2 - values[0] / 2;
      const trimmed = full > 6 * Math.max(hi / 2 - lo / 2, Number.MIN_VALUE);
      return {
        low: trimmed ? lo : values[0],
        high: trimmed ? hi : values[values.length - 1],
        trimmed,
      };
    }
    const x = bounds(xs),
      y = bounds(ys);
    const re = x.low / 2 + x.high / 2,
      im = y.low / 2 + y.high / 2;
    const spread = Math.max(x.high / 2 - x.low / 2, y.high / 2 - y.low / 2);
    const span =
      (spread || Math.max(Math.abs(re), Math.abs(im)) * 0.1 || 1) * 1.15;
    if (!Number.isFinite(span) || span <= 0) return null;
    return {
      re,
      im,
      span,
      trimmed: x.trimmed || y.trimmed,
    };
  }
  function niceStep(ideal) {
    if (!(ideal > 0) || !Number.isFinite(ideal)) return null;
    const base = 10 ** Math.floor(Math.log10(ideal)) || Number.MIN_VALUE;
    const result = [1, 2, 5, 10]
      .map((n) => n * base)
      .find((n) => n >= ideal && Number.isFinite(n));
    return result || ideal;
  }

  function viewBounds(view, width, height, padding = 0) {
    if (
      !finite(view) ||
      !(view.span > 0) ||
      !Number.isFinite(view.span) ||
      width <= 0 ||
      height <= 0
    )
      return null;
    const shortest = Math.min(width, height);
    const halfWidth = view.span * (width / shortest) * (1 + padding);
    const halfHeight = view.span * (height / shortest) * (1 + padding);
    const bounds = {
      left: view.re - halfWidth,
      right: view.re + halfWidth,
      bottom: view.im - halfHeight,
      top: view.im + halfHeight,
    };
    const scale = shortest / 2 / view.span;
    if (
      !Object.values(bounds).every(Number.isFinite) ||
      !Number.isFinite(scale) ||
      scale <= 0
    )
      return null;
    // Refuse only views that floating point cannot distinguish, not a fixed range.
    if (
      bounds.left >= view.re ||
      bounds.right <= view.re ||
      bounds.bottom >= view.im ||
      bounds.top <= view.im ||
      view.re + view.span / 100 === view.re ||
      view.im + view.span / 100 === view.im
    )
      return null;
    return bounds;
  }

  function ticks(low, high, step, limit = 256) {
    if (!(step > 0) || ![low, high, step].every(Number.isFinite)) return [];
    const first = Math.ceil(low / step),
      last = Math.floor(high / step);
    if (!Number.isFinite(first) || !Number.isFinite(last)) return [];
    const count = Math.max(0, Math.min(limit, Math.floor(last - first + 1)));
    return Array.from({ length: count }, (_, index) => (first + index) * step);
  }

  function createGrid(view, width, height, divisions, type, unitCircle) {
    const bounds = viewBounds(view, width, height, 0.04);
    if (!bounds) return [];
    const halfWidth = bounds.right / 2 - bounds.left / 2;
    const halfHeight = bounds.top / 2 - bounds.bottom / 2;
    const step = niceStep(
      Math.max(
        (view.span / divisions) * 2,
        Math.max(halfWidth, halfHeight) / 100,
      ),
    );
    if (!step) return [];
    const curves = [];
    const interpolate = (a, b, t) => (1 - t) * a + t * b;
    if (type === "cartesian") {
      for (const y of ticks(bounds.bottom, bounds.top, step))
        curves.push({
          color: "teal",
          curve: (t) => ({
            re: interpolate(bounds.left, bounds.right, t),
            im: y,
          }),
        });
      for (const x of ticks(bounds.left, bounds.right, step))
        curves.push({
          color: "rose",
          curve: (t) => ({
            re: x,
            im: interpolate(bounds.bottom, bounds.top, t),
          }),
        });
    }
    // A visible angular sector keeps far-away polar views precise and bounded
    // in cost; sampling entire circles would miss a narrow, distant viewport.
    const radius = Math.hypot(view.re, view.im),
      diagonal = Math.hypot(halfWidth, halfHeight);
    const angle = Math.atan2(view.im, view.re);
    const halfAngle =
      radius <= diagonal ? Math.PI : Math.asin(Math.min(1, diagonal / radius));
    const from = radius <= diagonal ? -Math.PI : angle - halfAngle;
    const to = radius <= diagonal ? Math.PI : angle + halfAngle;
    const nearX = Math.max(bounds.left, Math.min(0, bounds.right));
    const nearY = Math.max(bounds.bottom, Math.min(0, bounds.top));
    const minRadius = Math.hypot(nearX, nearY);
    const maxRadius = Math.hypot(
      Math.max(Math.abs(bounds.left), Math.abs(bounds.right)),
      Math.max(Math.abs(bounds.bottom), Math.abs(bounds.top)),
    );
    const arc = (r) => (t) => {
      const a = interpolate(from, to, t);
      return { re: r * Math.cos(a), im: r * Math.sin(a) };
    };
    if (type === "polar" && Number.isFinite(maxRadius)) {
      for (const r of ticks(minRadius, maxRadius, step))
        if (r > 0) curves.push({ color: "teal", curve: arc(r) });
      const angleStep = Math.min(
        Math.PI / divisions,
        niceStep((to - from) / (2 * divisions)) || Math.PI / divisions,
      );
      for (const a of ticks(from, to, angleStep))
        curves.push({
          color: "rose",
          curve: (t) => {
            const r = interpolate(minRadius, maxRadius, t);
            return { re: r * Math.cos(a), im: r * Math.sin(a) };
          },
        });
    }
    if (unitCircle && minRadius <= 1 && maxRadius >= 1)
      curves.push({ color: "circle", circle: true, curve: arc(1) });
    return curves;
  }
  const api = {
    sampleCurve,
    fitBounds,
    niceStep,
    ticks,
    viewBounds,
    createGrid,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ComplexGeometry = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
