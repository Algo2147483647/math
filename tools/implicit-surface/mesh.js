/* Marching tetrahedra on a regular grid, with refined zero crossings. */
(function (root) {
  "use strict";
  function createMesher(math) {
    const tetrahedra = [
      [0, 5, 1, 6],
      [0, 1, 2, 6],
      [0, 2, 3, 6],
      [0, 3, 7, 6],
      [0, 7, 4, 6],
      [0, 4, 5, 6],
    ];
    async function build(
      { expression, domain, resolution },
      progress = () => {},
      cancelled = () => false,
    ) {
      if (![32, 52, 76].includes(resolution))
        throw new Error("Choose Draft, Balanced, or Fine detail.");
      const { center, scale } = math.validateDomain(domain, resolution);
      const evaluate = math.compile(expression);
      const n = resolution,
        side = n + 1,
        plane = side * side;
      const values = new Float64Array(side * plane);
      const coords = domain.map(([a, b]) =>
        Float64Array.from({ length: side }, (_, i) => a + ((b - a) * i) / n),
      );
      const steps = domain.map(([a, b]) => (b - a) / n);
      let finite = 0,
        nonzero = 0;
      const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
      for (let z = 0; z <= n; z++) {
        if (cancelled()) return null;
        for (let y = 0; y <= n; y++)
          for (let x = 0; x <= n; x++) {
            const v = evaluate(coords[0][x], coords[1][y], coords[2][z]);
            values[x + side * y + plane * z] = v;
            if (Number.isFinite(v)) {
              finite++;
              if (v !== 0) nonzero++;
            }
          }
        if (z % 5 === 0) {
          progress(Math.round((z / n) * 32));
          await pause();
        }
      }
      if (!finite)
        return {
          data: new Float32Array(),
          triangles: 0,
          reason: "undefined",
          invalid: values.length,
          domain,
        };
      if (!nonzero && finite === values.length)
        return {
          data: new Float32Array(),
          triangles: 0,
          reason: "volume",
          invalid: 0,
          domain,
        };
      const vertices = [],
        edgeCache = new Map(),
        gradientCache = new Map();
      let rejected = 0;
      function point(id) {
        return [
          coords[0][id % side],
          coords[1][Math.floor(id / side) % side],
          coords[2][Math.floor(id / plane)],
        ];
      }
      function gradient(id) {
        if (gradientCache.has(id)) return gradientCache.get(id);
        const indices = [
          id % side,
          Math.floor(id / side) % side,
          Math.floor(id / plane),
        ];
        const strides = [1, side, plane];
        const g = strides.map((stride, axis) => {
          const before = indices[axis] > 0 ? values[id - stride] : NaN;
          const after = indices[axis] < n ? values[id + stride] : NaN;
          if (Number.isFinite(before) && Number.isFinite(after))
            return (after - before) / (2 * steps[axis]);
          if (Number.isFinite(after)) return (after - values[id]) / steps[axis];
          if (Number.isFinite(before))
            return (values[id] - before) / steps[axis];
          return 0;
        });
        gradientCache.set(id, g);
        return g;
      }
      function crossing(a, b) {
        const key = a < b ? a * values.length + b : b * values.length + a;
        if (edgeCache.has(key)) return edgeCache.get(key);
        const pa = point(a),
          pb = point(b),
          va = values[a],
          vb = values[b];
        let t = 0,
          valid = true;
        if (va === 0) t = 0;
        else if (vb === 0) t = 1;
        else {
          // A sign change alone could be a pole. Require a small residual too.
          const magnitude = Math.max(Math.abs(va), Math.abs(vb));
          let lo = 0,
            hi = 1,
            flo = va / magnitude,
            fhi = vb / magnitude,
            residual = Infinity;
          for (let k = 0; k < 16; k++) {
            const fraction = Math.max(0.05, Math.min(0.95, -flo / (fhi - flo)));
            t = lo + (hi - lo) * fraction;
            const v = evaluate(...pa.map((v, axis) => v + (pb[axis] - v) * t));
            if (!Number.isFinite(v)) {
              valid = false;
              break;
            }
            const f = v / magnitude;
            residual = Math.abs(f);
            if (residual < 1e-7) break;
            if (f < 0 === flo < 0) {
              lo = t;
              flo = f;
            } else {
              hi = t;
              fhi = f;
            }
          }
          if (residual > 0.002) valid = false;
        }
        if (!valid) {
          rejected++;
          edgeCache.set(key, null);
          return null;
        }
        const ga = gradient(a),
          gb = gradient(b);
        let normal = ga.map((v, axis) => v * (1 - t) + gb[axis] * t);
        // Scale first to keep very large or small equation coefficients harmless.
        const max = Math.max(...normal.map(Math.abs));
        normal =
          max > 0 && Number.isFinite(max)
            ? normal.map((v) => v / max)
            : [0, 0, 0];
        const length = Math.hypot(...normal) || 1;
        const result = {
          p: pa.map(
            (v, axis) => (v - center[axis] + (pb[axis] - v) * t) / scale,
          ),
          normal: normal.map((v) => v / length),
        };
        edgeCache.set(key, result);
        return result;
      }
      function triangle(a, b, c) {
        if (!a || !b || !c) return;
        const u = b.p.map((v, i) => v - a.p[i]),
          v = c.p.map((v, i) => v - a.p[i]);
        const cross = [
          u[1] * v[2] - u[2] * v[1],
          u[2] * v[0] - u[0] * v[2],
          u[0] * v[1] - u[1] * v[0],
        ];
        const length = Math.hypot(...cross);
        if (length < 1e-16) return;
        const normal = cross.map((v) => v / length);
        for (const vertex of [a, b, c])
          vertices.push(
            ...vertex.p,
            ...(Math.hypot(...vertex.normal) > 0.1 ? vertex.normal : normal),
          );
        if (vertices.length > 420000 * 18)
          throw new Error(
            "This surface is too complex at this detail. Choose Draft or narrow the domain.",
          );
      }
      for (let z = 0; z < n; z++) {
        if (cancelled()) return null;
        // Only neighboring z slices can share edges; bound the cache size.
        if (z % 4 === 0) {
          edgeCache.clear();
          gradientCache.clear();
        }
        for (let y = 0; y < n; y++)
          for (let x = 0; x < n; x++) {
            const a = x + side * y + plane * z;
            const cube = [
              a,
              a + 1,
              a + side + 1,
              a + side,
              a + plane,
              a + plane + 1,
              a + plane + side + 1,
              a + plane + side,
            ];
            for (const tet of tetrahedra) {
              const ids = tet.map((i) => cube[i]);
              if (ids.some((i) => !Number.isFinite(values[i]))) continue;
              const inside = ids.filter((i) => values[i] < 0),
                outside = ids.filter((i) => values[i] >= 0);
              if (!inside.length || !outside.length) continue;
              if (inside.length === 1 || outside.length === 1) {
                const one = inside.length === 1 ? inside : outside,
                  three = inside.length === 1 ? outside : inside;
                triangle(...three.map((id) => crossing(one[0], id)));
              } else {
                const ac = crossing(inside[0], outside[0]),
                  ad = crossing(inside[0], outside[1]);
                const bc = crossing(inside[1], outside[0]),
                  bd = crossing(inside[1], outside[1]);
                triangle(ac, ad, bc);
                triangle(ad, bd, bc);
              }
            }
          }
        if (z % 3 === 0) {
          progress(Math.round(32 + ((z + 1) / n) * 68));
          await pause();
        }
      }
      return {
        data: new Float32Array(vertices),
        triangles: vertices.length / 18,
        reason: vertices.length ? "surface" : "empty",
        invalid: values.length - finite,
        rejected,
        domain,
      };
    }
    return { build };
  }
  root.SurfaceMesher = { createMesher };
  if (typeof module !== "undefined" && module.exports)
    module.exports = root.SurfaceMesher;
})(typeof globalThis !== "undefined" ? globalThis : this);
