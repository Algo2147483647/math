import {
  apply,
  clamp,
  elementMatrix,
  inverse,
  multiply,
  round,
  scale,
  selectionBounds,
  transformElement,
  translate,
} from '../model/geometry';
import { clone } from '../model/utils';
import type { EditorStore } from '../model/store';
import type { Bounds, Point, StudioDocument, StudioElement } from '../model/types';
export interface Manipulation {
  type: 'manipulate';
  action: 'rotate' | 'shape' | 'gradient' | 'multi';
  field: string;
  elements: StudioElement[];
  box: Bounds;
  start: Point;
  before: StudioDocument;
}
export function startManipulation(
  target: Element,
  point: Point,
  store: EditorStore,
): Manipulation | null {
  const e = store.active;
  if (!e || e.locked) return null;
  let action: Manipulation['action'] | null = null,
    field = '';
  if (target.closest('[data-rotate]')) action = 'rotate';
  if (target.closest('[data-shape-handle]')) {
    action = 'shape';
    field = target.closest('[data-shape-handle]')!.getAttribute('data-shape-handle')!;
  }
  if (target.closest('[data-gradient-handle],[data-gradient-stop]') && store.view.gradientEdit) {
    action = 'gradient';
    field =
      store.view.gradientEdit +
      ':' +
      (target.getAttribute('data-gradient-handle') || target.getAttribute('data-gradient-stop'));
  }
  if (target.closest('[data-multi-handle]')) {
    action = 'multi';
    field = target.closest('[data-multi-handle]')!.getAttribute('data-multi-handle')!;
  }
  if (!action) return null;
  const elements = action === 'multi' ? store.selected.filter((e) => !e.locked) : [e];
  return {
    type: 'manipulate',
    action,
    field,
    elements: clone(elements),
    box: selectionBounds(elements),
    start: point,
    before: clone(store.document),
  };
}
export function moveManipulation(g: Manipulation, p: Point, shift: boolean, store: EditorStore) {
  const before = g.elements[0],
    local = apply(inverse(elementMatrix(before)), p);
  if (g.action === 'multi') {
    const { box: b, field } = g,
      dx = p[0] - g.start[0],
      dy = p[1] - g.start[1];
    let w = Math.max(1, b.width + (field.includes('e') ? dx : -dx)),
      h = Math.max(1, b.height + (field.includes('s') ? dy : -dy));
    if (shift || store.view.keepRatio) {
      const factor = Math.max(w / b.width, h / b.height);
      w = b.width * factor;
      h = b.height * factor;
    }
    const x = field.includes('w') ? b.x + b.width - w : b.x,
      y = field.includes('n') ? b.y + b.height - h : b.y;
    const m = multiply(
      translate(x, y),
      multiply(scale(w / Math.max(1, b.width), h / Math.max(1, b.height)), translate(-b.x, -b.y)),
    );
    store.preview((d) =>
      g.elements.forEach((source) => {
        const e = clone(source);
        transformElement(e, m);
        Object.assign(
          d.elements.find((x) => x.id === e.id)!,
          e,
        );
      }),
    );
    return;
  }
  store.preview((d) => {
    const e = d.elements.find((x) => x.id === before.id)!;
    if (g.action === 'rotate') {
      const start = apply(inverse(elementMatrix(before)), g.start),
        cx = before.width / 2,
        cy = before.height / 2;
      const angle =
        ((Math.atan2(local[1] - cy, local[0] - cx) - Math.atan2(start[1] - cy, start[0] - cx)) *
          180) /
        Math.PI;
      e.rotation = round(before.rotation + angle, shift ? 15 : 0.1);
    } else if (g.action === 'shape') {
      if (g.field === 'radius')
        e.radius = round(clamp(local[0], 0, Math.min(e.width, e.height) / 2), 0.1);
      else if (g.field === 'innerRatio')
        e.innerRatio = clamp(
          Math.hypot(local[0] - e.width / 2, local[1] - e.height / 2) /
            (Math.min(e.width, e.height) / 2),
          0.05,
          0.95,
        );
      else if (g.field === 'arcStart' || g.field === 'arcEnd') {
        const angle =
          ((Math.atan2(
            (local[1] - e.height / 2) / (e.height / 2),
            (local[0] - e.width / 2) / (e.width / 2),
          ) *
            180) /
            Math.PI +
            90 +
            360) %
          360;
        e[g.field] = round(angle, shift ? 15 : 0.1);
      }
    } else if (g.action === 'gradient') {
      const [kind, part] = g.field.split(':') as ['fill' | 'stroke', string],
        key = `${kind}Gradient` as const,
        gradient = clone(before[key]!);
      const point: Point = [local[0] / e.width, local[1] / e.height];
      if (part === 'start' || part === 'end') {
        if (part === 'start' && gradient.type === 'radial')
          gradient.end = [
            gradient.end[0] + point[0] - gradient.start[0],
            gradient.end[1] + point[1] - gradient.start[1],
          ];
        gradient[part] = point;
      } else {
        const dx = gradient.end[0] - gradient.start[0],
          dy = gradient.end[1] - gradient.start[1],
          stop = gradient.stops.find((s) => s.id === part);
        if (stop)
          stop.offset = clamp(
            ((point[0] - gradient.start[0]) * dx + (point[1] - gradient.start[1]) * dy) /
              Math.max(0.0001, dx * dx + dy * dy),
            0,
            1,
          );
      }
      e[key] = gradient;
    }
  });
}
