# Complex — Transformation Lab

A full-screen, offline HTML tool for exploring complex transformations. Open
[`index.html`](./index.html) directly in a modern browser. No build, server,
installation, or network connection is required.

## Explore

- The two canvases fill the viewport in equal left and right halves. The glass
  toolbar and side panels float over the plots, without reserving canvas space.
- Enter an expression in the top **f(z)** field and press **Enter** or the arrow button.
- Open **Functions** for 32 searchable presets across linear maps, powers, roots,
  exponential/logarithmic, trigonometric/hyperbolic, rational, and projection maps.
- Use the left panel for domain, grid, unit-circle, coordinate guides, and probe
  settings. Use the right panel for mapped values, animation, zoom, fitting, and
  quick presets. Each panel folds by clicking its header. Narrow screens start
  with both panels folded and allow one expanded panel at a time.
- Compare the original and transformed Cartesian or polar grids. Matching colors
  identify corresponding curves; the dashed amber curve is the unit circle.
- In **Probe** mode, click or drag on the input plane to move a point, or enter
  its real and imaginary coordinates. Points are not clamped to a fixed region.
  The inspector reports the full `f(z)` and both magnitudes.
- Enter any positive finite **Domain half-span**, including scientific notation,
  and press Enter, click the arrow, or leave the field to apply it. There is no
  fixed minimum or maximum range. Invalid or unrepresentable values preserve the
  previous view and show an inline error.
- Choose **Pan**, Shift-drag, or middle-drag to move the input view. Scroll to zoom
  around the pointer. The displayed center follows the input view.
- Choose **Infinite** or **Finite** under **Grid extent** in the left panel.
  Infinite is the default. Finite uses a fixed square `[-R, R]²` for Cartesian
  grids or a disk of radius `R` for polar grids, centered at zero. Here `R` is the
  entered domain half-span. Panning and zooming only change the camera in Finite
  mode; editing the domain recenters the view and updates the mapped region.
  The unit-circle overlay is shown when it fits within the finite domain.
- In Infinite mode, grids continue across the entire visible input region and
  regenerate as you pan, zoom, or resize. Density adapts to the scale so distant
  views do not create unbounded amounts of work. The output maps this sampled
  input region; it does not claim to render all preimages of an arbitrary function
  on the whole infinite plane.
- Drag the output to pan; scroll to zoom around the pointer. **Fit** (or
  double-click the output) fits sampled finite values. Extreme tails near poles
  are excluded when they would dwarf the rest of the image.
- Scrub the transformation slider or press play to show `(1-t)z + t f(z)`.
  Animation is started explicitly and pauses when the page is hidden.
- **Reset view** restores the domain to ±2, the complete transformation, and the
  fitted output. The expression, selected grid, extent mode, and probe remain available.

Keyboard: focus the input canvas and use the arrow keys to move the point or pan,
depending on the selected tool (Shift for larger steps). Both canvases accept
`+` / `-` to zoom; `0` resets the input view or fits the output. Output arrows pan.
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
- `geometry.js`: finite and viewport grids, numerical view validation, adaptive curve sampling,
  and fitting across small and large scales.
- `app.js`: canvas rendering, point inspection, and interactions.
- `presets.js`: grouped function presets, shared with the numerical checks.
- `icon.svg`: the original glass-orbit app icon; no remote assets are required.

Run the numerical and parser checks using Node.js (no packages needed):

```sh
node tools/complex-transform/tests.cjs
```
