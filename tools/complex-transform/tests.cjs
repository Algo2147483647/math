// Run with: node tools/complex-transform/tests.cjs
const assert = require("node:assert/strict");
const { compile, C, finite } = require("./math.js");
const { sampleCurve, fitBounds } = require("./geometry.js");
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
console.log(
  `Passed ${checks} checks: complex arithmetic, parser, principal values, invalid inputs, curve discontinuities, and view fitting.`,
);
