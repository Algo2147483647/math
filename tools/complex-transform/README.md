# Complex — Transformation Lab

A minimalist, offline HTML tool for exploring complex transformations. Open
[`index.html`](./index.html) directly in a modern browser. No build, server,
installation, or network connection is required.

## Explore

- Enter an expression in **f(z)** and press **Enter** or **Transform**.
- Compare the original and transformed Cartesian or polar grids. Matching colors
  identify corresponding curves; the dashed amber curve is the unit circle.
- Click or drag on the input plane to move a point, or enter its real and imaginary
  coordinates. The inspector reports the full `f(z)` and both magnitudes.
- Change the input domain and grid density. Scroll over the input to resize its domain.
- Drag the output to pan; scroll to zoom around the pointer. **Fit to view** (or
  double-click the output) fits sampled finite values. Extreme tails near poles
  are excluded when they would dwarf the rest of the image.
- Scrub the transformation slider or press play to show `(1-t)z + t f(z)`.
  Animation is started explicitly and pauses when the page is hidden.
- **Reset view** restores the domain to ±2, the complete transformation, and the
  fitted output. The expression, selected grid, and probe remain available.

Keyboard: focus the input canvas and use the arrow keys to move the point (Shift
for larger steps). On the output canvas, arrows pan, `+` / `-` zoom, and `0` fits.
All settings and the numerical point inputs are also keyboard accessible.

## Expressions

Supported operators: `+ - * / ^` (`**` also works), unary signs, and parentheses.
Implicit multiplication supports `2z`, `iz`, `2sin(z)`, and `(z+1)(z-1)`.
Multiplication and division have equal precedence, evaluated left to right;
use parentheses to make a denominator explicit. Powers associate right and bind
more tightly than unary signs: `-z^2` is `-(z^2)`.

Constants: `i`, `pi` / `π`, `e`, `tau`. The variable is `z`; names are case-insensitive.
Scientific notation such as `1.2e-3` is supported.

Functions (with parentheses):

`exp log ln sqrt sin cos tan sinh cosh tanh asin acos atan abs arg re im conj`

Two-argument functions: `pow(z, exponent)` and `complex(real, imaginary)`.
`complex` requires real-valued arguments. Trigonometric functions use radians;
`log` and `ln` are the natural logarithm. `abs`, `arg`, `re`, and `im` return real values.

Examples: `z^3 - 2z`, `exp(i*pi*z)`, `z + 0.5/z`, `(z-i)/(z+i)`, `sin(conj(z))`.

Expressions are parsed by a restricted mathematical grammar, never executed as
JavaScript. Invalid expressions display an error and preserve the last valid plot.
Expressions are limited to 512 characters, 256 tokens, and 48 levels of nesting.

## Numerical conventions

Logarithms and noninteger powers use the principal argument (`atan2`); roots use
the principal square root. The origin has undefined `log`, `arg`, and reciprocal.
Positive real powers of zero are zero, and `0^0` is defined as one for evaluation.
Poles, overflow, and detected discontinuities produce gaps. Adaptive sampling
refines curved segments and avoids joining unresolved jumps, but finite sampling
can miss features of very rapidly oscillating functions. This is a visual explorer,
not a symbolic algebra or proof system.

## Files and verification

- `index.html`, `styles.css`: accessible controls and responsive layout.
- `math.js`: complex arithmetic and the expression parser.
- `geometry.js`: adaptive curve sampling and view fitting.
- `app.js`: canvas rendering, point inspection, and interactions.

Run the numerical and parser checks using Node.js (no packages needed):

```sh
node tools/complex-transform/tests.cjs
```
