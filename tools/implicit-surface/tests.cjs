"use strict";
const assert = require("node:assert/strict");
const math = require("./math.js");
const mesher = require("./mesh.js").createMesher(math);
const presets = require("./presets.js");
const colors = require("./colors.js");
const close = (actual, expected, tolerance = 1e-10) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} != ${expected}`,
  );
const evaluate = (text, x = 0, y = 0, z = 0) => math.compile(text)(x, y, z);
async function main() {
  assert.deepEqual(colors.rgb("#ff8000"), [1, 128 / 255, 0]);
  assert.equal(colors.midpoint("#000000", "#ffffff"), "#808080");
  const colorSettings = {
    ...colors.fromPalette("glacier"),
    start: "#000000",
    end: "#ffffff",
    middle: "#ff0000",
    direction: "x",
  };
  const twoStop = colors.material(colorSettings);
  assert.deepEqual(twoStop.middle, [0.5, 0.5, 0.5]);
  assert.deepEqual(twoStop.axis, [1, 0, 0]);
  assert.deepEqual(
    colors.material({ ...colorSettings, useMiddle: true }).middle,
    [1, 0, 0],
  );
  assert.equal(
    colors.material({ ...colorSettings, direction: "radius" }).radial,
    1,
  );
  const solid = colors.material({ ...colorSettings, mode: "solid" });
  assert.deepEqual(solid.low, solid.middle);
  assert.deepEqual(solid.low, solid.high);
  assert.equal(colors.preview({ ...colorSettings, mode: "solid" }), "#000000");
  assert.equal(
    colors.preview({ ...colorSettings, useMiddle: true }),
    "linear-gradient(90deg, #000000, #ff0000, #ffffff)",
  );
  const reversed = colors.material({
    ...colorSettings,
    start: colorSettings.end,
    end: colorSettings.start,
    useMiddle: true,
  });
  assert.deepEqual(reversed.low, [1, 1, 1]);
  assert.deepEqual(reversed.high, [0, 0, 0]);
  assert.deepEqual(reversed.middle, [1, 0, 0]);
  for (const id of Object.keys(colors.palettes)) {
    const material = colors.material(colors.fromPalette(id));
    assert.ok(
      [...material.low, ...material.middle, ...material.high].every(
        (v) => v >= 0 && v <= 1,
      ),
    );
  }
  assert.throws(() => colors.rgb("#xyzxyz"));
  assert.throws(() => colors.fromPalette("constructor"));
  assert.throws(() =>
    colors.material({ ...colorSettings, direction: "unknown" }),
  );
  console.log(
    "PASS: solid colors, two/three-stop gradients, radial/axis modes, reversal, and all palettes",
  );
  close(evaluate("x^2 + y^2 + z^2 = 4", 2), 0);
  close(evaluate("z = sin(pi/2)cos(0)", 0, 0, 1), 0);
  close(evaluate("2xy + 3z", 2, 4, 5), 31);
  close(evaluate("-x^2", 3), -9);
  close(evaluate("2^3^2"), 512);
  close(evaluate("2^-2"), 0.25);
  close(evaluate("8/2x", 3), 12);
  close(evaluate("(x+1)(x-1)", 3), 8);
  close(evaluate("1.5e-3x + 2e", 2), 0.003 + 2 * Math.E);
  close(evaluate("sin(π/2) + x² − z³", 2, 0, 2), -3);
  close(evaluate("pow(2,3)+max(x,y)-min(y,z)", 1, 5, 3), 10);
  close(evaluate("atan2(1,0)"), Math.PI / 2);
  close(evaluate("cbrt(-8)+log(exp(2))"), 0);
  for (const bad of [
    "",
    "x =",
    "=1",
    "x=y=z",
    "sin x",
    "foo(x)",
    "x;alert(1)",
    "x.constructor",
    "sin(x,y)",
    "pow(x)",
    "(x+1",
    "1e999",
    "__proto__",
    "constructor(1)",
    "x<1",
  ])
    assert.throws(() => math.compile(bad), bad);
  assert.throws(() => math.compile("(".repeat(60) + "x" + ")".repeat(60)));
  math.validateDomain([
    [-3, 3],
    [-2, 4],
    [1, 6],
  ]);
  math.validateDomain([
    [1e10, 1e10 + 100],
    [0, 100],
    [-100, 100],
  ]);
  for (const domain of [
    [
      [1, 1],
      [-1, 1],
      [-1, 1],
    ],
    [
      [0, NaN],
      [-1, 1],
      [-1, 1],
    ],
    [
      [2, 1],
      [-1, 1],
      [-1, 1],
    ],
    [
      [-1e308, 1e308],
      [-1, 1],
      [-1, 1],
    ],
    [
      [1e20, 1e20 + 32768],
      [-1, 1],
      [-1, 1],
    ],
    [
      [0, 1e-12],
      [-1, 1],
      [-1, 1],
    ],
  ])
    assert.throws(() => math.validateDomain(domain));
  console.log(
    "PASS: expression syntax, precedence, functions, rejection, and domain validation",
  );
  const domain = [
    [-3, 3],
    [-3, 3],
    [-3, 3],
  ];
  const build = (expression, customDomain = domain) =>
    mesher.build({ expression, domain: customDomain, resolution: 32 });
  const sphere = await build("x^2+y^2+z^2=4");
  assert.ok(sphere.triangles > 1000);
  for (let i = 0; i < sphere.data.length; i += 6) {
    const p = Array.from(sphere.data.slice(i, i + 3)),
      normal = Array.from(sphere.data.slice(i + 3, i + 6));
    close(Math.hypot(...p) * 3, 2, 2e-5);
    close(Math.hypot(...normal), 1, 1e-5);
    assert.ok(p.reduce((sum, v, axis) => sum + v * normal[axis], 0) > 0.65);
  }
  const plane = await build("x=0.371");
  assert.ok(plane.triangles > 0);
  for (let i = 0; i < plane.data.length; i += 6)
    close(plane.data[i] * 3, 0.371, 1e-6);
  const translated = await build("(x-10)^2+(y+4)^2+(z-2)^2=1", [
    [8, 12],
    [-6, -2],
    [0, 4],
  ]);
  assert.ok(translated.triangles > 1000);
  for (let i = 0; i < translated.data.length; i += 6)
    close(Math.hypot(...translated.data.slice(i, i + 3)) * 2, 1, 2e-5);
  const shiftedPlane = await build("z=0.4", [
    [-2, 4],
    [-1, 2],
    [0, 1],
  ]);
  assert.ok(shiftedPlane.triangles > 0);
  for (let i = 0; i < shiftedPlane.data.length; i += 6)
    close(shiftedPlane.data[i + 2] * 3 + 0.5, 0.4, 1e-6);
  const torus = await build("(x^2+y^2+z^2+1.5^2-0.55^2)^2=9(x^2+y^2)");
  assert.ok(torus.triangles > 1000);
  for (let i = 0; i < torus.data.length; i += 6) {
    const [x, y, z] = Array.from(torus.data.slice(i, i + 3), (v) => v * 3);
    close((Math.hypot(x, y) - 1.5) ** 2 + z * z, 0.55 ** 2, 2e-4);
  }
  console.log(
    "PASS: sphere normals and roots, torus geometry, arbitrary planes, translated/asymmetric domains",
  );
  for (const expression of ["1/x=0", "1/(x-0.137)=0", "tan(x)=0.5"]) {
    const result = await build(expression);
    if (expression.startsWith("1/")) assert.equal(result.triangles, 0);
    else
      for (let i = 0; i < result.data.length; i += 6)
        close(Math.tan(result.data[i] * 3), 0.5, 2e-4);
  }
  assert.equal((await build("x^2+y^2+z^2=-1")).reason, "empty");
  assert.equal((await build("sqrt(-1)=x")).reason, "undefined");
  assert.equal((await build("x=x")).reason, "volume");
  assert.equal(
    (await build("1e-100*(x^2+y^2+z^2-4)")).triangles,
    sphere.triangles,
  );
  const partial = await build("z=log(x)");
  assert.ok(partial.invalid > 0 && partial.triangles > 0);
  const gyroid = await build("sin(x)cos(y)+sin(y)cos(z)+sin(z)cos(x)");
  assert.ok(gyroid.triangles > 0);
  assert.ok(gyroid.data.every(Number.isFinite));
  assert.equal(
    await mesher.build(
      { expression: "x", domain, resolution: 32 },
      () => {},
      () => true,
    ),
    null,
  );
  console.log(
    "PASS: poles, empty/undefined/volume fields, coefficient scaling, partial domains, gyroid, cancellation",
  );
  assert.equal(new Set(presets.map((p) => p.id)).size, presets.length);
  assert.equal(new Set(presets.map((p) => p.group)).size, 5);
  for (const preset of presets) {
    const presetDomain =
      preset.domain ||
      Array.from({ length: 3 }, () => [-preset.span, preset.span]);
    math.validateDomain(presetDomain);
    const result = await build(preset.expression, presetDomain);
    assert.ok(result.triangles > 0, preset.name);
    assert.ok(result.data.every(Number.isFinite), preset.name);
  }
  console.log(
    `PASS: all ${presets.length} built-in surface presets produce finite geometry`,
  );
  console.log("All implicit surface checks passed.");
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
