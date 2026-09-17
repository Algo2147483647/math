import type { GradientPaint, GradientStop, Point } from './types';
import { uid } from './utils';
import { clamp, lerp } from './geometry';

export const defaultGradient = (type: GradientPaint['type'] = 'linear'): GradientPaint => ({
  type,
  start: type === 'linear' ? [0, 0.5] : [0.5, 0.5],
  end: type === 'linear' ? [1, 0.5] : [1, 0.5],
  spread: 'pad',
  stops: [
    { id: uid(), offset: 0, color: '#1670ef', opacity: 1 },
    { id: uid(), offset: 1, color: '#d86cf1', opacity: 1 },
  ],
});
export const sortedStops = (g: GradientPaint) => [...g.stops].sort((a, b) => a.offset - b.offset);
export function gradientCss(g: GradientPaint): string {
  const stops = sortedStops(g)
    .map(
      (s) =>
        `${s.color}${Math.round(s.opacity * 255)
          .toString(16)
          .padStart(2, '0')} ${s.offset * 100}%`,
    )
    .join(',');
  return g.type === 'radial'
    ? `radial-gradient(circle at ${g.start[0] * 100}% ${g.start[1] * 100}%,${stops})`
    : `linear-gradient(${(Math.atan2(g.end[1] - g.start[1], g.end[0] - g.start[0]) * 180) / Math.PI + 90}deg,${stops})`;
}
export function gradientAngle(g: GradientPaint): number {
  return (Math.atan2(g.end[1] - g.start[1], g.end[0] - g.start[0]) * 180) / Math.PI;
}
export function withAngle(g: GradientPaint, angle: number): GradientPaint {
  const a = (angle * Math.PI) / 180,
    dx = Math.cos(a) * 0.5,
    dy = Math.sin(a) * 0.5;
  return { ...g, start: [0.5 - dx, 0.5 - dy], end: [0.5 + dx, 0.5 + dy] };
}
export function stopAt(g: GradientPaint, offset: number): GradientStop {
  const list = sortedStops(g),
    t = clamp(offset, 0, 1),
    left = [...list].reverse().find((s) => s.offset <= t) || list[0],
    right = list.find((s) => s.offset >= t) || list.at(-1)!;
  const u = right.offset === left.offset ? 0 : (t - left.offset) / (right.offset - left.offset);
  const rgb = (hex: string) => [1, 3, 5].map((n) => parseInt(hex.slice(n, n + 2), 16));
  const a = rgb(left.color),
    b = rgb(right.color),
    color =
      '#' +
      a
        .map((v, i) =>
          Math.round(v + (b[i] - v) * u)
            .toString(16)
            .padStart(2, '0'),
        )
        .join('');
  return {
    id: uid(),
    offset: t,
    color,
    opacity: left.opacity + (right.opacity - left.opacity) * u,
  };
}
export const gradientPoint = (g: GradientPaint, t: number): Point => lerp(g.start, g.end, t);
