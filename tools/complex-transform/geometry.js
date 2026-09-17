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
        ? distance(pm, { re: (pa.re + pb.re) / 2, im: (pa.im + pb.im) / 2 }) *
          pixelsPerUnit
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
    const valid = points
      .filter(finite)
      .filter((p) => Math.abs(p.re) < 1e12 && Math.abs(p.im) < 1e12);
    if (!valid.length) return null;
    const xs = valid.map((p) => p.re).sort((a, b) => a - b);
    const ys = valid.map((p) => p.im).sort((a, b) => a - b);
    function bounds(values) {
      const lo = values[Math.floor((values.length - 1) * 0.05)];
      const hi = values[Math.ceil((values.length - 1) * 0.95)];
      const full = values[values.length - 1] - values[0];
      const trimmed = full > 6 * Math.max(hi - lo, 1e-8);
      return {
        low: trimmed ? lo : values[0],
        high: trimmed ? hi : values[values.length - 1],
        trimmed,
      };
    }
    const x = bounds(xs),
      y = bounds(ys);
    return {
      re: (x.low + x.high) / 2,
      im: (y.low + y.high) / 2,
      span: Math.max(0.75, (x.high - x.low) / 2, (y.high - y.low) / 2) * 1.15,
      trimmed: x.trimmed || y.trimmed,
    };
  }
  const api = { sampleCurve, fitBounds };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ComplexGeometry = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
