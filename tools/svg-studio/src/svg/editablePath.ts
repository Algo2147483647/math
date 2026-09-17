import { makeElement } from '../model/elements';
import { normalizePoints } from '../model/geometry';
import type { ElementType, Matrix, Point, StudioElement } from '../model/types';

/** Promote ordinary SVG paths to native nodes; preserve complex SVGs as raw markup. */
export function editablePath(
  node: SVGGraphicsElement,
  name: string,
  sourceX: number,
  sourceY: number,
): StudioElement | null {
  if (node.closest('[filter],[mask],[clip-path]')) return null;
  const style = getComputedStyle(node);
  if (
    [style.fill, style.stroke].some((p) => p.includes('url(')) ||
    style.filter !== 'none' ||
    style.clipPath !== 'none'
  )
    return null;
  let points: Point[] = [],
    type: ElementType = 'polyline';
  if (node.localName === 'polyline') {
    const list = (node as SVGPolylineElement).points;
    points = Array.from({ length: list.numberOfItems }, (_, i) => {
      const p = list.getItem(i);
      return [p.x, p.y];
    });
  } else if (node.localName === 'line') {
    const line = node as SVGLineElement;
    points = [
      [line.x1.baseVal.value, line.y1.baseVal.value],
      [line.x2.baseVal.value, line.y2.baseVal.value],
    ];
    type = 'line';
  } else if (node.localName === 'path') {
    const d = node.getAttribute('d') || '';
    // The native model supports an open, single subpath of straight or cubic segments.
    if (d.replace(/[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g, '').replace(/[mMlLcC\s,]/g, ''))
      return null;
    const tokens = d.match(/[mMlLcC]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g) || [];
    let i = 0,
      command = '',
      current: Point = [0, 0],
      hasCubic = false,
      hasLine = false;
    while (i < tokens.length) {
      if (/^[mMlLcC]$/.test(tokens[i])) command = tokens[i++];
      if (!command) return null;
      const op = command.toUpperCase(),
        count = op === 'C' ? 6 : 2,
        relative = command !== op;
      if (i + count > tokens.length) return null;
      const values = tokens.slice(i, i + count).map(Number);
      if (!values.every(Number.isFinite)) return null;
      i += count;
      const next: Point[] = [];
      for (let n = 0; n < count; n += 2)
        next.push([
          values[n] + (relative ? current[0] : 0),
          values[n + 1] + (relative ? current[1] : 0),
        ]);
      if (op === 'M') {
        if (points.length) return null;
        points.push(next[0]);
        command = relative ? 'l' : 'L';
      } else {
        if (!points.length) return null;
        points.push(...next);
        if (op === 'C') hasCubic = true;
        else hasLine = true;
      }
      current = next.at(-1)!;
    }
    if (hasCubic && hasLine) return null;
    type = hasCubic ? 'bezier' : 'polyline';
  } else return null;
  if (points.length < 2 || (type === 'bezier' && (points.length - 1) % 3 !== 0)) return null;
  const m = node.ownerSVGElement?.getCTM()?.inverse().multiply(node.getCTM()!);
  if (!m) return null;
  let opacity = 1;
  let ancestor: Element | null = node;
  while (ancestor && ancestor.localName !== 'svg') {
    const computed = getComputedStyle(ancestor);
    if (
      computed.filter !== 'none' ||
      computed.clipPath !== 'none' ||
      computed.mixBlendMode !== 'normal'
    )
      return null;
    opacity *= Number(computed.opacity);
    ancestor = ancestor.parentElement;
  }
  const affine: Matrix = [m.a, m.b, m.c, m.d, 0, 0];
  const e = makeElement(type, {
    name,
    points,
    x: m.e - sourceX,
    y: m.f - sourceY,
    affine,
    opacity,
    fill: style.fill,
    stroke: style.stroke,
    strokeWidth: parseFloat(style.strokeWidth) || 0,
    fillOpacity: Number(style.fillOpacity),
    strokeOpacity: Number(style.strokeOpacity),
    strokeLinecap: style.strokeLinecap,
    strokeLinejoin: style.strokeLinejoin,
    strokeDasharray: style.strokeDasharray === 'none' ? '' : style.strokeDasharray,
    hidden: style.display === 'none' || style.visibility === 'hidden',
  });
  normalizePoints(e);
  return e;
}
