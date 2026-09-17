import type { Bounds, Matrix, Point, StudioElement } from './types';

export const identity = (): Matrix => [1, 0, 0, 1, 0, 0];
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
export const round = (n: number, step = 1) => Math.round(n / step) * step;
export const translate = (x: number, y: number): Matrix => [1, 0, 0, 1, x, y];
export const scale = (x: number, y: number): Matrix => [x, 0, 0, y, 0, 0];
export function multiply(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}
export function apply(m: Matrix, [x, y]: Point): Point {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}
export function inverse(m: Matrix): Matrix {
  const d = m[0] * m[3] - m[1] * m[2];
  if (Math.abs(d) < 1e-10) return identity();
  return [
    m[3] / d,
    -m[1] / d,
    -m[2] / d,
    m[0] / d,
    (m[2] * m[5] - m[3] * m[4]) / d,
    (m[1] * m[4] - m[0] * m[5]) / d,
  ];
}
export function elementMatrix(e: StudioElement): Matrix {
  const a = (e.rotation * Math.PI) / 180,
    c = Math.cos(a),
    s = Math.sin(a);
  const rotation: Matrix = [
    c,
    s,
    -s,
    c,
    (e.width / 2) * (1 - c) + (e.height / 2) * s,
    (e.height / 2) * (1 - c) - (e.width / 2) * s,
  ];
  return multiply(translate(e.x, e.y), multiply(e.affine || identity(), rotation));
}
export const elementTransform = (e: StudioElement) => `matrix(${elementMatrix(e).join(' ')})`;
export function pointBounds(points: Point[]): Bounds {
  if (!points.length) return { x: 0, y: 0, width: 1, height: 1 };
  const xs = points.map((p) => p[0]),
    ys = points.map((p) => p[1]);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}
export function localBounds(e: StudioElement): Bounds {
  return e.points?.length
    ? pointBounds(e.points)
    : { x: 0, y: 0, width: e.width, height: e.height };
}
export function corners(b: Bounds): Point[] {
  return [
    [b.x, b.y],
    [b.x + b.width, b.y],
    [b.x + b.width, b.y + b.height],
    [b.x, b.y + b.height],
  ];
}
export function elementBounds(e: StudioElement): Bounds {
  return pointBounds(corners(localBounds(e)).map((p) => apply(elementMatrix(e), p)));
}
export function selectionBounds(elements: StudioElement[]): Bounds {
  return pointBounds(elements.flatMap((e) => corners(elementBounds(e))));
}
export function marqueeBounds(a: Point, b: Point): Bounds {
  return pointBounds([a, b]);
}
export function intersects(a: Bounds, b: Bounds): boolean {
  return (
    a.x <= b.x + b.width && a.x + a.width >= b.x && a.y <= b.y + b.height && a.y + a.height >= b.y
  );
}
export function contains(a: Bounds, b: Bounds): boolean {
  const epsilon = 0.00001;
  return (
    b.x >= a.x - epsilon &&
    b.y >= a.y - epsilon &&
    b.x + b.width <= a.x + a.width + epsilon &&
    b.y + b.height <= a.y + a.height + epsilon
  );
}
/** Keep the complete affine transform when applying an operation in world coordinates. */
export function transformElement(e: StudioElement, matrix: Matrix): void {
  const m = multiply(matrix, elementMatrix(e));
  e.x = m[4];
  e.y = m[5];
  e.rotation = 0;
  e.affine = [m[0], m[1], m[2], m[3], 0, 0];
}
export const isNodeEditable = (e?: StudioElement): boolean =>
  !!e && ['polyline', 'path', 'bezier', 'line'].includes(e.type) && !!e.points?.length;
export function resizeElement(e: StudioElement, width: number, height: number): void {
  const sx = width / Math.max(0.001, e.width),
    sy = height / Math.max(0.001, e.height);
  if (e.points) e.points = e.points.map(([x, y]) => [x * sx, y * sy]);
  if (e.type === 'text') {
    e.fontSize = (e.fontSize || 36) * sy;
    e.letterSpacing = (e.letterSpacing || 0) * sx;
  }
  e.width = width;
  e.height = height;
}
/** Rebase node coordinates without moving artwork, including rotated/affine paths. */
export function normalizePoints(e: StudioElement): void {
  if (!e.points?.length) return;
  const b = pointBounds(e.points),
    origin = apply(elementMatrix(e), [b.x, b.y]);
  e.points = e.points.map(([x, y]) => [x - b.x, y - b.y]);
  e.width = Math.max(1, b.width);
  e.height = Math.max(1, b.height);
  const next = apply(elementMatrix(e), [0, 0]);
  e.x += origin[0] - next[0];
  e.y += origin[1] - next[1];
}
export const lerp = (a: Point, b: Point, t = 0.5): Point => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];
export function splitCubic(p: Point[], t = 0.5): Point[] {
  const a = lerp(p[0], p[1], t),
    b = lerp(p[1], p[2], t),
    c = lerp(p[2], p[3], t),
    d = lerp(a, b, t),
    e = lerp(b, c, t);
  return [p[0], a, d, lerp(d, e, t), e, c, p[3]];
}
export function cubicAt(p: Point[], t: number): Point {
  return splitCubic(p, t)[3];
}
export function nearestSegment(e: StudioElement, point: Point): { index: number; t: number } {
  const pts = e.points || [];
  let best = Infinity,
    index = 0,
    t = 0.5;
  const stride = e.type === 'bezier' ? 3 : 1;
  for (let i = 0; i < pts.length - stride; i += stride) {
    for (let n = 1; n < 40; n++) {
      const u = n / 40,
        p = stride === 3 ? cubicAt(pts.slice(i, i + 4), u) : lerp(pts[i], pts[i + 1], u);
      const d = (p[0] - point[0]) ** 2 + (p[1] - point[1]) ** 2;
      if (d < best) {
        best = d;
        index = i;
        t = u;
      }
    }
  }
  return { index, t };
}
