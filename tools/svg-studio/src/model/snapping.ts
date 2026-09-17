import {
  apply,
  corners,
  cubicAt,
  elementMatrix,
  identity,
  lerp,
  localBounds,
  multiply,
  round,
  scale,
} from './geometry';
import { arrowEndpoints } from './arrows';
import type { Matrix, Point, StudioElement } from './types';
export interface SnapTarget {
  point: Point;
  label: string;
  elementId: string;
}
export interface SnapGuide {
  from: Point;
  to: Point;
  target: SnapTarget;
  axis: 'x' | 'y' | 'point';
}
export interface SnapResult {
  point: Point;
  guides: SnapGuide[];
}
export function elementSnapTargets(e: StudioElement, parent: Matrix = identity()): SnapTarget[] {
  if (e.hidden) return [];
  const m = multiply(parent, elementMatrix(e)),
    targets: SnapTarget[] = [];
  const add = (p: Point, label: string) =>
    targets.push({ point: apply(m, p), label, elementId: e.id });
  if (e.type === 'arrow' || e.points?.length) {
    const points = e.type === 'arrow' ? arrowEndpoints(e) : e.points!;
    const anchors = points.filter((_, i) => e.type !== 'bezier' || i % 3 === 0);
    anchors.forEach((p) => add(p, 'Anchor'));
    for (let i = 0; i < anchors.length - 1; i++)
      add(
        e.type === 'bezier'
          ? cubicAt(points.slice(i * 3, i * 3 + 4), 0.5)
          : lerp(anchors[i], anchors[i + 1]),
        'Midpoint',
      );
  } else {
    const b = localBounds(e),
      c = corners(b);
    let vertices: Point[] | undefined;
    if (e.type === 'triangle')
      vertices = [
        [e.width / 2, 0],
        [e.width, e.height],
        [0, e.height],
      ];
    if (e.type === 'diamond')
      vertices = [
        [e.width / 2, 0],
        [e.width, e.height / 2],
        [e.width / 2, e.height],
        [0, e.height / 2],
      ];
    if (e.type === 'polygon' || e.type === 'star') {
      const star = e.type === 'star',
        count = star ? (e.pointsCount || 5) * 2 : e.sides || 6;
      vertices = Array.from({ length: count }, (_, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count,
          r = star ? (i % 2 ? (e.innerRatio ?? 0.43) : 1) : 1;
        return [
          e.width / 2 + (Math.cos(angle) * (star ? Math.min(e.width, e.height) : e.width) * r) / 2,
          e.height / 2 +
            (Math.sin(angle) * (star ? Math.min(e.width, e.height) : e.height) * r) / 2,
        ];
      });
    }
    if (e.type === 'arc') {
      for (const angle of [e.arcStart ?? 200, e.arcEnd ?? 340])
        add(
          [
            e.width / 2 + (Math.cos(((angle - 90) * Math.PI) / 180) * e.width) / 2,
            e.height / 2 + (Math.sin(((angle - 90) * Math.PI) / 180) * e.height) / 2,
          ],
          'Arc endpoint',
        );
    } else if (vertices) {
      vertices.forEach((p, i) => {
        add(p, 'Corner');
        add(lerp(p, vertices![(i + 1) % vertices!.length]), 'Edge midpoint');
      });
    } else {
      if (!['circle', 'ellipse'].includes(e.type)) c.forEach((p) => add(p, 'Corner'));
      c.forEach((p, i) => add(lerp(p, c[(i + 1) % 4]), 'Edge midpoint'));
    }
    add([b.x + b.width / 2, b.y + b.height / 2], 'Center');
  }
  if (e.type === 'group') {
    const childMatrix = multiply(
      m,
      scale(e.width / (e.sourceWidth || e.width), e.height / (e.sourceHeight || e.height)),
    );
    e.children?.forEach((child) => targets.push(...elementSnapTargets(child, childMatrix)));
  }
  return targets;
}
export const collectSnapTargets = (elements: StudioElement[], exclude: string[] = []) =>
  elements.filter((e) => !exclude.includes(e.id)).flatMap((e) => elementSnapTargets(e));

/** Thresholds use screen pixels, so snapping has the same feel at every zoom. */
export function snapPoint(
  point: Point,
  targets: SnapTarget[],
  zoom: number,
  grid?: number,
): SnapResult {
  const result: Point = point.map((n) => (grid ? round(n, grid) : n)) as Point,
    guides: SnapGuide[] = [];
  const limit = 8 / zoom;
  let nearest: SnapTarget | undefined,
    best = limit;
  for (const t of targets) {
    const distance = Math.hypot(t.point[0] - point[0], t.point[1] - point[1]);
    if (distance < best) {
      best = distance;
      nearest = t;
    }
  }
  if (nearest)
    return {
      point: [...nearest.point],
      guides: [{ from: point, to: nearest.point, target: nearest, axis: 'point' }],
    };
  for (const axis of [0, 1] as const) {
    let target: SnapTarget | undefined,
      distance = 6 / zoom;
    for (const t of targets) {
      const d = Math.abs(t.point[axis] - point[axis]);
      if (d < distance && Math.abs(t.point[1 - axis] - point[1 - axis]) < 600 / zoom) {
        distance = d;
        target = t;
      }
    }
    if (target) {
      result[axis] = target.point[axis];
      guides.push({ from: result, to: target.point, target, axis: axis === 0 ? 'x' : 'y' });
    }
  }
  return { point: result, guides };
}
export function snapTranslation(
  elements: StudioElement[],
  delta: Point,
  targets: SnapTarget[],
  zoom: number,
  grid?: number,
): SnapResult {
  const moving = elements.flatMap((e) => elementSnapTargets(e)),
    guides: SnapGuide[] = [];
  let result: Point = [...delta];
  if (grid && moving.length)
    result = [
      round(moving[0].point[0] + delta[0], grid) - moving[0].point[0],
      round(moving[0].point[1] + delta[1], grid) - moving[0].point[1],
    ];
  let pointMatch: { source: Point; target: SnapTarget } | undefined,
    best = 8 / zoom;
  for (const source of moving)
    for (const target of targets) {
      const p: Point = [source.point[0] + delta[0], source.point[1] + delta[1]],
        distance = Math.hypot(target.point[0] - p[0], target.point[1] - p[1]);
      if (distance < best) {
        best = distance;
        pointMatch = { source: source.point, target };
      }
    }
  if (pointMatch) {
    const { source, target } = pointMatch;
    return {
      point: [target.point[0] - source[0], target.point[1] - source[1]],
      guides: [{ from: target.point, to: target.point, target, axis: 'point' }],
    };
  }
  for (const axis of [0, 1] as const) {
    let match: { source: Point; target: SnapTarget } | undefined,
      distance = 6 / zoom;
    for (const source of moving)
      for (const target of targets) {
        const d = Math.abs(source.point[axis] + delta[axis] - target.point[axis]);
        if (
          d < distance &&
          Math.abs(source.point[1 - axis] + delta[1 - axis] - target.point[1 - axis]) < 600 / zoom
        ) {
          distance = d;
          match = { source: source.point, target };
        }
      }
    if (match) {
      result[axis] = match.target.point[axis] - match.source[axis];
      guides.push({
        from: [match.source[0] + result[0], match.source[1] + result[1]],
        to: match.target.point,
        target: match.target,
        axis: axis === 0 ? 'x' : 'y',
      });
    }
  }
  return { point: result, guides };
}
