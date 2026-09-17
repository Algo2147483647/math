import type { ArrowHeadStyle, Bounds, Point, StudioElement } from './types';
export interface ArrowPart {
  d: string;
  points: Point[];
  closed: boolean;
  head: boolean;
}
export function arrowEndpoints(e: StudioElement): [Point, Point] {
  return e.points?.length === 2
    ? [e.points[0], e.points[1]]
    : [
        [0, e.height / 2],
        [e.width, e.height / 2],
      ];
}
const path = (points: Point[], closed = false) =>
  `M ${points.map((p) => p.join(' ')).join(' L ')}${closed ? ' Z' : ''}`;
export function arrowGeometry(e: StudioElement): { parts: ArrowPart[]; bounds: Bounds } {
  const [start, end] = arrowEndpoints(e),
    dx = end[0] - start[0],
    dy = end[1] - start[1],
    length = Math.hypot(dx, dy),
    angle = Math.atan2(dy, dx);
  const startStyle = e.arrowStart || 'none',
    endStyle = e.arrowEnd || 'arrow';
  const size = Math.min(
      Math.max(2, e.arrowSize ?? 24),
      Math.max(0.01, length * (startStyle !== 'none' && endStyle !== 'none' ? 0.45 : 0.8)),
    ),
    half = size * Math.tan((Math.max(10, Math.min(150, e.arrowAngle ?? 66)) * Math.PI) / 360);
  const heads: ArrowPart[] = [];
  const head = (tip: Point, rotation: number, style: ArrowHeadStyle): number => {
    if (style === 'none' || length < 0.001) return 0;
    const c = Math.cos(rotation),
      s = Math.sin(rotation),
      p = (x: number, y: number): Point => [tip[0] + c * x - s * y, tip[1] + s * x + c * y];
    let points: Point[],
      closed = true,
      d = '',
      inset = 0;
    if (style === 'circle') {
      const r = size / 2;
      points = Array.from({ length: 48 }, (_, i) =>
        p(Math.cos((i * Math.PI) / 24) * r, Math.sin((i * Math.PI) / 24) * r),
      );
      d = `M ${tip[0] - r} ${tip[1]} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
      inset = r;
    } else if (style === 'square') {
      points = [
        p(-size / 2, -size / 2),
        p(size / 2, -size / 2),
        p(size / 2, size / 2),
        p(-size / 2, size / 2),
      ];
      inset = size / 2;
    } else if (style === 'diamond') {
      points = [p(0, 0), p(-size / 2, -size / 2), p(-size, 0), p(-size / 2, size / 2)];
      inset = size;
    } else if (style === 'bar') {
      points = [p(0, -size / 2), p(0, size / 2)];
      closed = false;
    } else {
      points = [p(-size, -half), p(0, 0), p(-size, half)];
      closed = style === 'triangle';
      inset = closed ? size : 0;
    }
    heads.push({ d: d || path(points, closed), points, closed, head: true });
    return inset;
  };
  const a = head(start, angle + Math.PI, startStyle),
    b = head(end, angle, endStyle),
    ux = length ? dx / length : 1,
    uy = length ? dy / length : 0;
  const points: Point[] = [
    [start[0] + ux * a, start[1] + uy * a],
    [end[0] - ux * b, end[1] - uy * b],
  ];
  const parts: ArrowPart[] = [{ d: path(points), points, closed: false, head: false }, ...heads];
  const all = [...parts.flatMap((p) => p.points), start, end],
    xs = all.map((p) => p[0]),
    ys = all.map((p) => p[1]),
    x = Math.min(...xs),
    y = Math.min(...ys);
  return { parts, bounds: { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y } };
}
