import type { StudioElement } from '../model/types';
import { sortedStops } from '../model/paint';
import { SVG_NS } from '../model/utils';

export const paintId = (e: StudioElement, kind: 'fill' | 'stroke') => `paint-${e.id}-${kind}`;
export const paintValue = (e: StudioElement, kind: 'fill' | 'stroke') =>
  e[`${kind}Gradient`] ? `url(#${paintId(e, kind)})` : e[kind] || 'none';
export function paintDefinitions(e: StudioElement): SVGDefsElement | null {
  const defs = document.createElementNS(SVG_NS, 'defs');
  for (const kind of ['fill', 'stroke'] as const) {
    const paint = e[`${kind}Gradient`];
    if (!paint) continue;
    const gradient = document.createElementNS(
      SVG_NS,
      paint.type === 'linear' ? 'linearGradient' : 'radialGradient',
    );
    gradient.id = paintId(e, kind);
    // A horizontal or vertical line has an empty SVG object bounding box.
    // Native shapes use normalized user space so their gradient strokes remain visible.
    const native = e.type !== 'raw' && e.type !== 'icon';
    gradient.setAttribute('gradientUnits', native ? 'userSpaceOnUse' : 'objectBoundingBox');
    if (native)
      gradient.setAttribute(
        'gradientTransform',
        `scale(${Math.max(1, e.width)} ${Math.max(1, e.height)})`,
      );
    gradient.setAttribute('spreadMethod', paint.spread);
    const attrs =
      paint.type === 'linear'
        ? { x1: paint.start[0], y1: paint.start[1], x2: paint.end[0], y2: paint.end[1] }
        : {
            cx: paint.start[0],
            cy: paint.start[1],
            r: Math.max(
              0.001,
              Math.hypot(paint.end[0] - paint.start[0], paint.end[1] - paint.start[1]),
            ),
          };
    Object.entries(attrs).forEach(([k, v]) => gradient.setAttribute(k, String(v)));
    sortedStops(paint).forEach((s) => {
      const stop = document.createElementNS(SVG_NS, 'stop');
      stop.setAttribute('offset', String(s.offset));
      stop.setAttribute('stop-color', s.color);
      stop.setAttribute('stop-opacity', String(s.opacity));
      gradient.append(stop);
    });
    defs.append(gradient);
  }
  return defs.children.length ? defs : null;
}
