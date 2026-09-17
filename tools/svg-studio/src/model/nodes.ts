import type { AnchorMode, Point, StudioElement } from './types';
import { lerp } from './geometry';
export const anchorIndex = (i: number) => (i % 3 === 0 ? i : i % 3 === 1 ? i - 1 : i + 1);
/** Convert the legacy quadratic smoothing to cubic segments without changing its shape. */
export function smoothCubics(points: Point[]): Point[] {
  if (points.length < 3) return [];
  const result: Point[] = [points[0]];
  const add = (control: Point, end: Point) => {
    const start = result.at(-1)!;
    result.push(lerp(start, control, 2 / 3), lerp(end, control, 2 / 3), end);
  };
  for (let i = 0; i < points.length - 1; i++) add(points[i], lerp(points[i], points[i + 1]));
  add(points.at(-1)!, points.at(-1)!);
  return result;
}
export function setAnchorMode(e: StudioElement, index: number, mode: AnchorMode) {
  if (e.type !== 'bezier' || !e.points) return;
  const i = anchorIndex(index),
    pts = e.points,
    a = pts[i];
  if (!a) return;
  e.anchorModes = { ...e.anchorModes, [i]: mode };
  if (mode === 'corner') return;
  const from = pts[i - 3] || a,
    to = pts[i + 3] || a;
  let dx = (pts[i + 1]?.[0] ?? a[0]) - a[0],
    dy = (pts[i + 1]?.[1] ?? a[1]) - a[1];
  if (Math.hypot(dx, dy) < 0.001) {
    dx = to[0] - from[0];
    dy = to[1] - from[1];
  }
  const norm = Math.hypot(dx, dy) || 1;
  dx /= norm;
  dy /= norm;
  let incoming = pts[i - 1]
    ? Math.hypot(pts[i - 1][0] - a[0], pts[i - 1][1] - a[1]) ||
      Math.hypot(a[0] - from[0], a[1] - from[1]) / 3
    : 0;
  let outgoing = pts[i + 1]
    ? Math.hypot(pts[i + 1][0] - a[0], pts[i + 1][1] - a[1]) ||
      Math.hypot(to[0] - a[0], to[1] - a[1]) / 3
    : 0;
  if (mode === 'symmetric')
    incoming = outgoing = (incoming + outgoing) / (incoming && outgoing ? 2 : 1);
  if (pts[i - 1]) pts[i - 1] = [a[0] - dx * incoming, a[1] - dy * incoming];
  if (pts[i + 1]) pts[i + 1] = [a[0] + dx * outgoing, a[1] + dy * outgoing];
}
export function convertPath(e: StudioElement) {
  const pts = e.points;
  if (!pts?.length) return;
  if (e.type === 'bezier') {
    e.points = pts.filter((_, i) => i % 3 === 0);
    e.type = 'polyline';
    e.anchorModes = undefined;
  } else {
    const smooth = e.type === 'path' && e.smooth && pts.length > 2;
    const result: Point[] = smooth ? smoothCubics(pts) : [pts[0]];
    for (let i = 1; !smooth && i < pts.length; i++)
      result.push(lerp(pts[i - 1], pts[i], 1 / 3), lerp(pts[i - 1], pts[i], 2 / 3), pts[i]);
    e.points = result;
    e.type = 'bezier';
    e.smooth = false;
    e.anchorModes = Object.fromEntries(
      result.filter((_, i) => i % 3 === 0).map((_, i) => [i * 3, smooth ? 'smooth' : 'corner']),
    );
  }
}
export function shiftAnchorModes(e: StudioElement, at: number, delta: number) {
  if (!e.anchorModes) return;
  e.anchorModes = Object.fromEntries(
    Object.entries(e.anchorModes).flatMap(([k, v]) => {
      const i = Number(k);
      if (delta < 0 && i === at) return [];
      return [[i > at ? i + delta : i, v]];
    }),
  );
}
