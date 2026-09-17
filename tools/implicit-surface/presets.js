(function (root) {
  "use strict";
  const presets = [
    {
      id: "sphere",
      name: "Sphere",
      type: "A familiar starting point",
      expression: "x^2 + y^2 + z^2 = 4",
      span: 3,
    },
    {
      id: "torus",
      name: "Torus",
      type: "A ring with a little room inside",
      expression: "(x^2+y^2+z^2+1.5^2-0.55^2)^2 = 9(x^2+y^2)",
      span: 2.6,
    },
    {
      id: "saddle",
      name: "Saddle",
      type: "Curving in opposite directions",
      expression: "z = (x^2 - y^2)/2",
      span: 2.5,
    },
    {
      id: "gyroid",
      name: "Gyroid",
      type: "An endlessly connected labyrinth",
      expression: "sin(x)cos(y) + sin(y)cos(z) + sin(z)cos(x) = 0",
      span: Math.PI,
    },
    {
      id: "ellipsoid",
      name: "Ellipsoid",
      type: "Three axes, three different radii",
      expression: "x^2/4 + y^2/2 + z^2 = 1",
      span: 2.6,
    },
    {
      id: "hyperboloid",
      name: "Hyperboloid",
      type: "One continuous, open surface",
      expression: "x^2 + y^2 - z^2 = 1",
      span: 2.5,
    },
    {
      id: "cone",
      name: "Double cone",
      type: "Two halves meeting at a point",
      expression: "x^2 + y^2 = z^2",
      span: 2.5,
    },
    {
      id: "wave",
      name: "Wave",
      type: "A landscape of peaks and valleys",
      expression: "z = sin(x)cos(y)",
      span: Math.PI,
    },
    {
      id: "heart",
      name: "Heart",
      type: "A little algebra, a lot of heart",
      expression: "(x^2+2.25y^2+z^2-1)^3 - x^2*z^3 - 0.1125y^2*z^3 = 0",
      span: 1.6,
    },
    {
      id: "schwarz",
      name: "Schwarz P",
      type: "A periodic world of tunnels",
      expression: "cos(x) + cos(y) + cos(z) = 0",
      span: Math.PI,
    },
    {
      id: "two-spheres",
      name: "Two spheres",
      type: "Disconnected parts of one equation",
      expression: "((x-1.2)^2+y^2+z^2-0.7^2)((x+1.2)^2+y^2+z^2-0.7^2) = 0",
      span: 2.5,
    },
    {
      id: "superellipsoid",
      name: "Superellipsoid",
      type: "Somewhere between sphere and cube",
      expression: "x^4 + y^4 + z^4 = 1",
      span: 1.6,
    },
  ];
  root.SurfacePresets = presets;
  if (typeof module !== "undefined" && module.exports) module.exports = presets;
})(typeof globalThis !== "undefined" ? globalThis : this);
