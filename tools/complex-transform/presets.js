(function (root) {
  "use strict";
  const groups = [
    {
      name: "Linear · Rotation",
      presets: [
        { name: "Identity", formula: "z", expression: "z" },
        { name: "Translation", formula: "z + 1", expression: "z + 1" },
        { name: "Scale", formula: "2z", expression: "2z" },
        { name: "Rotate 90°", formula: "iz", expression: "i*z" },
        {
          name: "Rotate 45°",
          formula: "exp(iπ/4) · z",
          expression: "exp(i*pi/4)*z",
        },
        {
          name: "Rotate & translate",
          formula: "(1+i)z + 1",
          expression: "(1+i)*z + 1",
        },
      ],
    },
    {
      name: "Powers · Roots",
      presets: [
        { name: "Square", formula: "z²", expression: "z^2" },
        { name: "Cube", formula: "z³", expression: "z^3" },
        { name: "Fourth power", formula: "z⁴", expression: "z^4" },
        { name: "Square root", formula: "√z", expression: "sqrt(z)" },
        { name: "Cube root", formula: "z¹⁄³", expression: "z^(1/3)" },
        { name: "Cubic polynomial", formula: "z³ − z", expression: "z^3 - z" },
      ],
    },
    {
      name: "Exponential · Logarithmic",
      presets: [
        { name: "Exponential", formula: "eᶻ", expression: "exp(z)" },
        { name: "Complex exponential", formula: "eⁱᶻ", expression: "exp(i*z)" },
        { name: "Natural logarithm", formula: "log z", expression: "log(z)" },
        {
          name: "Shifted exponential",
          formula: "eᶻ − 1",
          expression: "exp(z) - 1",
        },
      ],
    },
    {
      name: "Trigonometric · Hyperbolic",
      presets: [
        { name: "Sine", formula: "sin z", expression: "sin(z)" },
        { name: "Cosine", formula: "cos z", expression: "cos(z)" },
        { name: "Tangent", formula: "tan z", expression: "tan(z)" },
        { name: "Hyperbolic sine", formula: "sinh z", expression: "sinh(z)" },
        { name: "Hyperbolic cosine", formula: "cosh z", expression: "cosh(z)" },
        {
          name: "Hyperbolic tangent",
          formula: "tanh z",
          expression: "tanh(z)",
        },
      ],
    },
    {
      name: "Rational · Möbius",
      presets: [
        { name: "Reciprocal", formula: "1/z", expression: "1/z" },
        { name: "Inverse square", formula: "1/z²", expression: "1/z^2" },
        {
          name: "Möbius map",
          formula: "(z−1)/(z+1)",
          expression: "(z-1)/(z+1)",
        },
        {
          name: "Cayley map",
          formula: "(z−i)/(z+i)",
          expression: "(z-i)/(z+i)",
        },
        { name: "Joukowski map", formula: "z + 1/z", expression: "z + 1/z" },
        {
          name: "Two poles",
          formula: "(z²+1)/(z²−1)",
          expression: "(z^2+1)/(z^2-1)",
        },
      ],
    },
    {
      name: "Conjugation · Projection",
      presets: [
        { name: "Conjugate", formula: "conj z", expression: "conj(z)" },
        { name: "Magnitude", formula: "|z|", expression: "abs(z)" },
        { name: "Real projection", formula: "Re z", expression: "re(z)" },
        {
          name: "Unit circle projection",
          formula: "z/|z|",
          expression: "z/abs(z)",
        },
      ],
    },
  ];
  if (typeof module !== "undefined" && module.exports) module.exports = groups;
  else root.ComplexPresets = groups;
})(typeof globalThis !== "undefined" ? globalThis : this);
