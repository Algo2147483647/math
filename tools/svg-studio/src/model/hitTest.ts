import {
  apply,
  contains,
  corners,
  cubicAt,
  elementMatrix,
  identity,
  multiply,
  pointBounds,
  scale,
} from './geometry';
import type { Bounds, Matrix, Point, StudioElement } from './types';
import { smoothCubics } from './nodes';
import { arrowGeometry } from './arrows';
const pointIn = (p: Point, b: Bounds) =>
  p[0] >= b.x && p[0] <= b.x + b.width && p[1] >= b.y && p[1] <= b.y + b.height;
function segmentHits(a: Point, b: Point, r: Bounds): boolean {
  let lo = 0,
    hi = 1;
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  for (const [p, q] of [
    [-dx, a[0] - r.x],
    [dx, r.x + r.width - a[0]],
    [-dy, a[1] - r.y],
    [dy, r.y + r.height - a[1]],
  ]) {
    if (Math.abs(p) < 1e-10) {
      if (q < 0) return false;
      continue;
    }
    const t = q / p;
    if (p < 0) lo = Math.max(lo, t);
    else hi = Math.min(hi, t);
    if (lo > hi) return false;
  }
  return true;
}
function inPolygon(p: Point, points: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i],
      b = points[j];
    if (
      a[1] > p[1] !== b[1] > p[1] &&
      p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
  }
  return inside;
}
export function marqueeHit(
  box: Bounds,
  e: StudioElement,
  mode: 'touch' | 'contain',
  parent: Matrix = identity(),
): boolean {
  const matrix = multiply(parent, elementMatrix(e));
  if (e.type === 'arrow') {
    const parts = arrowGeometry(e).parts;
    const hit = (part: (typeof parts)[number]) =>
      marqueeHit(
        box,
        {
          ...e,
          type: 'polyline',
          points: part.points,
          closed: part.closed,
          fill: part.closed && (e.arrowFill ?? 1) > 0 ? e.stroke : 'none',
          fillGradient: part.closed && (e.arrowFill ?? 1) > 0 ? e.strokeGradient : undefined,
        },
        mode,
        parent,
      );
    return mode === 'touch' ? parts.some(hit) : parts.every(hit);
  }
  if (e.type === 'group') {
    const transform = multiply(
        matrix,
        scale(e.width / (e.sourceWidth || e.width), e.height / (e.sourceHeight || e.height)),
      ),
      children = e.children?.filter((c) => !c.hidden) || [];
    return (
      children.length > 0 &&
      (mode === 'touch'
        ? children.some((c) => marqueeHit(box, c, mode, transform))
        : children.every((c) => marqueeHit(box, c, mode, transform)))
    );
  }
  let points: Point[] = corners({ x: 0, y: 0, width: e.width, height: e.height }),
    closed = true;
  if (e.points?.length) {
    points = e.points;
    closed = !!e.closed;
    const cubics =
      e.type === 'bezier' ? e.points : e.type === 'path' && e.smooth ? smoothCubics(e.points) : [];
    if (cubics.length) {
      points = [];
      for (let i = 0; i + 3 < cubics.length; i += 3)
        for (let n = 0; n <= 48; n++) points.push(cubicAt(cubics.slice(i, i + 4), n / 48));
    }
  } else if (e.type === 'arc') {
    closed = false;
    const start = e.arcStart ?? 200,
      end = e.arcEnd ?? 340,
      sweep = (((end - start) % 360) + 360) % 360 || 359.999;
    points = Array.from({ length: 97 }, (_, i) => {
      const a = ((start - 90 + (sweep * i) / 96) * Math.PI) / 180;
      return [
        e.width / 2 + (Math.cos(a) * e.width) / 2,
        e.height / 2 + (Math.sin(a) * e.height) / 2,
      ];
    });
  } else if (e.type === 'ellipse' || e.type === 'circle')
    points = Array.from({ length: 64 }, (_, i) => [
      e.width / 2 +
        (Math.cos((i * Math.PI) / 32) *
          (e.type === 'circle' ? Math.min(e.width, e.height) : e.width)) /
          2,
      e.height / 2 +
        (Math.sin((i * Math.PI) / 32) *
          (e.type === 'circle' ? Math.min(e.width, e.height) : e.height)) /
          2,
    ]);
  else if (e.type === 'triangle')
    points = [
      [e.width / 2, 0],
      [e.width, e.height],
      [0, e.height],
    ];
  else if (e.type === 'diamond')
    points = [
      [e.width / 2, 0],
      [e.width, e.height / 2],
      [e.width / 2, e.height],
      [0, e.height / 2],
    ];
  else if (e.type === 'polygon' || e.type === 'star') {
    const star = e.type === 'star',
      count = star ? (e.pointsCount || 5) * 2 : e.sides || 6;
    points = Array.from({ length: count }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / count,
        r = star ? (i % 2 ? e.innerRatio || 0.43 : 1) : 1;
      return [
        e.width / 2 + ((Math.cos(a) * (star ? Math.min(e.width, e.height) : e.width)) / 2) * r,
        e.height / 2 + ((Math.sin(a) * (star ? Math.min(e.width, e.height) : e.height)) / 2) * r,
      ];
    });
  }
  points = points.map((p) => apply(matrix, p));
  const stroke =
    e.stroke !== 'none' || e.strokeGradient
      ? ((e.strokeWidth || 0) *
          Math.max(Math.hypot(matrix[0], matrix[1]), Math.hypot(matrix[2], matrix[3]))) /
        2
      : 0;
  if (mode === 'contain') {
    const b = pointBounds(points);
    return contains(box, {
      x: b.x - stroke,
      y: b.y - stroke,
      width: b.width + 2 * stroke,
      height: b.height + 2 * stroke,
    });
  }
  const expanded = {
    x: box.x - stroke,
    y: box.y - stroke,
    width: box.width + 2 * stroke,
    height: box.height + 2 * stroke,
  };
  if (points.some((p) => pointIn(p, expanded))) return true;
  const outline = closed ? [...points, points[0]] : points;
  if (outline.some((p, i) => i > 0 && segmentHits(outline[i - 1], p, expanded))) return true;
  return (e.fill !== 'none' || !!e.fillGradient) && corners(box).some((p) => inPolygon(p, points));
}
