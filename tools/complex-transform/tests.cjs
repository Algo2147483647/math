// Run with: node tools/complex-transform/tests.cjs
const assert = require("node:assert/strict");
const { compile, C, finite } = require("./math.js");
const {
  sampleCurve,
  fitBounds,
  viewBounds,
  createGrid,
  createFiniteGrid,
  ticks,
} = require("./geometry.js");
let checks = 0;
function close(expression, input, expected, tolerance = 1e-10) {
  const actual = compile(expression)(input);
  assert.ok(
    Math.hypot(actual.re - expected.re, actual.im - expected.im) < tolerance,
    `${expression}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`,
  );
  checks++;
}
close("z^2", C(1, 1), C(0, 2));
close("1/z", C(1, 1), C(0.5, -0.5));
close("exp(i*pi)", C(0), C(-1));
close("log(-1)", C(0), C(0, Math.PI));
close("sqrt(-4)", C(0), C(0, 2));
close("(-1)^0.5", C(0), C(0, 1));
close("conj(z)", C(2, 3), C(2, -3));
close("abs(z)", C(3, 4), C(5));
close("arg(i)", C(0), C(Math.PI / 2));
close("re(z) + i*im(z)", C(2, -3), C(2, -3));
close("complex(2, -3)", C(0), C(2, -3));
close("2z + iz", C(1, 2), C(0, 5));
close("(z+1)(z-1)", C(1, 2), C(-4, 4));
close("2sin(pi/2) + 3e-2", C(0), C(2.03));
close("2^3^2", C(0), C(512));
close("-z^2", C(2), C(-4));
close("(-z)^2", C(2), C(4));
close("2^-2", C(0), C(0.25));
close("2^--2", C(0), C(4));
close("pow(z, -3)", C(0, 1), C(0, 1));
close("0^0", C(0), C(1));
close("0^0.5", C(0), C(0));
close("exp(iπ) + 2×3 − 4÷2", C(0), C(3));
close("z**2", C(2), C(4));
close("1/(1e200 + 1e200i)", C(0), C(5e-201, -5e-201), 1e-210);
for (const z of [C(0.2, 0.4), C(-2, 0.3), C(1, -2), C(-1, -1)]) {
  close("sqrt(z)^2", z, z);
  close("exp(log(z))", z, z);
  close("sin(z)^2 + cos(z)^2", z, C(1));
  close("cosh(z)^2 - sinh(z)^2", z, C(1));
  close("sin(asin(z))", z, z);
  close("cos(acos(z))", z, z);
  close("tan(atan(z))", z, z);
}
for (const expression of ["1/z", "log(z)", "arg(z)", "z^-1", "0^i"]) {
  assert.equal(finite(compile(expression)(C(0))), false, expression);
  checks++;
}
for (const expression of [
  "",
  "z +",
  "sin z",
  "z)",
  "(z",
  "pow(z)",
  "sin(z,2)",
  "foo(z)",
  "z.real",
  "window.alert(1)",
  "constructor(z)",
  "z;alert(1)",
  "1e999",
  "(".repeat(60) + "z" + ")".repeat(60),
  "z".repeat(513),
]) {
  assert.throws(() => compile(expression), undefined, expression);
  checks++;
}
// A pole between sample points must not be connected across the real axis.
const reciprocal = sampleCurve(
  (t) => C(-1 + 2 * t),
  compile("1/(z-0.12345)"),
  80,
);
for (let i = 1; i < reciprocal.length; i++) {
  if (reciprocal[i] && reciprocal[i - 1])
    assert.equal(Math.sign(reciprocal[i].re), Math.sign(reciprocal[i - 1].re));
}
assert.ok(reciprocal.includes(null));
checks++;
// The principal logarithm's cut must remain disconnected.
const branch = sampleCurve((t) => C(-1, -1 + 2 * t), compile("log(z)"), 80);
assert.ok(branch.includes(null));
for (let i = 1; i < branch.length; i++) {
  if (branch[i] && branch[i - 1])
    assert.ok(Math.abs(branch[i].im - branch[i - 1].im) < Math.PI);
}
checks++;
const smooth = sampleCurve((t) => C(-1 + 2 * t, 1), compile("z^2"), 80);
assert.ok(smooth.every((p) => p && finite(p)));
checks++;
assert.equal(fitBounds([C(NaN), C(Infinity)]), null);
checks++;
const fit = fitBounds([C(-2, -4), C(2, 4)]);
assert.equal(fit.re, 0);
assert.equal(fit.im, 0);
assert.ok(fit.span > 4);
checks++;
const outliers = Array.from({ length: 100 }, (_, i) => C(i / 100, i / 100));
outliers.push(C(1e8, 1e8));
assert.ok(fitBounds(outliers).trimmed);
checks++;
// The grid must cover the full viewport at every scale, not a fixed [-2, 2] box.
for (const view of [
  { re: 0, im: 0, span: 20 },
  { re: 0, im: 0, span: 1e-12 },
  { re: 0, im: 0, span: 1e100 },
  { re: 1e12, im: -3e11, span: 2 },
]) {
  const bounds = viewBounds(view, 500, 800);
  assert.ok(bounds, JSON.stringify(view));
  for (const type of ["cartesian", "polar"]) {
    const grid = createGrid(view, 500, 800, 12, type, true);
    assert.ok(
      grid.length > 0 && grid.length < 520,
      `${type} grid has bounded work`,
    );
    for (const line of grid)
      for (const t of [0, 0.25, 0.5, 0.75, 1]) assert.ok(finite(line.curve(t)));
    if (type === "cartesian") {
      const horizontal = grid.find((line) => line.color === "teal");
      const vertical = grid.find((line) => line.color === "rose");
      assert.ok(
        horizontal.curve(0).re <= bounds.left &&
          horizontal.curve(1).re >= bounds.right,
      );
      assert.ok(
        vertical.curve(0).im <= bounds.bottom &&
          vertical.curve(1).im >= bounds.top,
      );
    }
    checks++;
  }
  checks++;
}
const smallFit = fitBounds([C(-1e-20, -2e-20), C(1e-20, 2e-20)]);
assert.ok(smallFit.span > 2e-20 && smallFit.span < 3e-20);
checks++;
const largeFit = fitBounds([C(-1e100), C(1e100)]);
assert.ok(largeFit.span > 1e100 && largeFit.span < 2e100);
checks++;
for (const span of [0, -1, NaN, Infinity]) {
  assert.equal(viewBounds({ re: 0, im: 0, span }, 500, 800), null);
  checks++;
}
assert.equal(viewBounds({ re: 1e20, im: 0, span: 1 }, 500, 800), null);
checks++;
assert.ok(ticks(-1e100, 1e100, 1).length <= 256);
checks++;
assert.equal(
  createGrid(
    { re: 0, im: 0, span: 1e-5 },
    500,
    800,
    12,
    "cartesian",
    true,
  ).some((line) => line.circle),
  false,
);
checks++;
// Moving far beyond the original domain must produce lines near the new center.
const farGrid = createGrid(
  { re: 10000, im: -20000, span: 10 },
  500,
  800,
  12,
  "cartesian",
  false,
);
assert.ok(farGrid.some((line) => Math.abs(line.curve(0.5).re - 10000) < 1));
checks++;
// Finite grids retain their boundary at arbitrary domain sizes. The polar grid
// stays inside its disk and the Cartesian grid reaches all four square edges.
for (const extent of [1e-12, 2, 20, 1e100]) {
  for (const type of ["cartesian", "polar"]) {
    const grid = createFiniteGrid(extent, 12, type, true);
    assert.ok(grid.length > 0 && grid.length < 100);
    assert.equal(
      grid.some((line) => line.circle),
      extent >= 1,
    );
    let boundaryReached = false;
    for (const line of grid) {
      for (let i = 0; i <= 128; i++) {
        const point = line.curve(i / 128);
        assert.ok(finite(point));
        const radius =
          type === "cartesian"
            ? Math.max(Math.abs(point.re / extent), Math.abs(point.im / extent))
            : Math.hypot(point.re / extent, point.im / extent);
        assert.ok(radius <= 1 + 1e-14, `${type} respects its finite domain`);
        boundaryReached ||= Math.abs(radius - 1) < 1e-14;
      }
    }
    assert.ok(boundaryReached);
    if (type === "cartesian") {
      for (const color of ["teal", "rose"]) {
        const axis = color === "teal" ? "re" : "im";
        const lines = grid.filter((line) => line.color === color);
        assert.ok(lines.every((line) => line.curve(0)[axis] === -extent));
        assert.ok(lines.every((line) => line.curve(1)[axis] === extent));
      }
    }
    checks++;
  }
}
for (const extent of [0, -1, NaN, Infinity]) {
  assert.deepEqual(createFiniteGrid(extent, 12, "cartesian", true), []);
  checks++;
}
// Every library card must produce a usable map at representative regular points.
const presets = require("./presets.js").flatMap((group) => group.presets);
for (const preset of presets) {
  const evaluate = compile(preset.expression);
  for (const z of [C(0.7, 0.5), C(-1.3, 0.8), C(2.4, -1.2)]) {
    assert.ok(finite(evaluate(z)), `${preset.name}: ${preset.expression}`);
    checks++;
  }
}
console.log(
  `Passed ${checks} checks: complex arithmetic, parser, principal values, invalid inputs, curve discontinuities, finite and viewport grids, view fitting, and ${presets.length} presets.`,
);
