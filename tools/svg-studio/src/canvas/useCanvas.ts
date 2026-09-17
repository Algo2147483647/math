import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
  type DragEvent as ReactDragEvent,
} from 'react';
import { useEditor } from '../model/context';
import {
  apply,
  clamp,
  elementMatrix,
  inverse,
  isNodeEditable,
  marqueeBounds,
  nearestSegment,
  normalizePoints,
  resizeElement,
  round,
} from '../model/geometry';
import { marqueeHit } from '../model/hitTest';
import { startManipulation, moveManipulation, type Manipulation } from './manipulation';
import { makeElement } from '../model/elements';
import { clone } from '../model/utils';
import type { Bounds, Point, StudioDocument, StudioElement } from '../model/types';
import { buildSvgElement, bezierPath } from '../svg/render';
import { parseSvg } from '../svg/import';
import { wheelZoom, zoomAround } from '../model/zoom';
import { collectSnapTargets, snapPoint, snapTranslation, type SnapGuide } from '../model/snapping';

interface Anchor {
  p: Point;
  incoming: Point;
  outgoing: Point;
}
type Gesture =
  | Manipulation
  | { type: 'pan'; start: Point; pan: Point }
  | { type: 'marquee'; start: Point; current: Point; initial: string[] }
  | { type: 'move'; start: Point; elements: StudioElement[]; before: StudioDocument }
  | { type: 'node'; id: string; index: number; element: StudioElement; before: StudioDocument }
  | {
      type: 'resize';
      id: string;
      handle: string;
      start: Point;
      element: StudioElement;
      before: StudioDocument;
    }
  | { type: 'shape'; start: Point; id: string; before: StudioDocument }
  | { type: 'anchor'; index: number };

function anchorPoints(anchors: Anchor[]): Point[] {
  if (!anchors.length) return [];
  return [
    anchors[0].p,
    ...anchors.slice(1).flatMap((a, i) => [anchors[i].outgoing, a.incoming, a.p]),
  ];
}

export function useCanvas() {
  const { store, document: doc, view, selected, active } = useEditor();
  const viewport = useRef<HTMLDivElement>(null),
    svg = useRef<SVGSVGElement>(null),
    artwork = useRef<SVGGElement>(null);
  const gesture = useRef<Gesture | null>(null),
    space = useRef(false),
    draft = useRef<Anchor[]>([]);
  const [marquee, setMarquee] = useState<Bounds | null>(null),
    [anchors, setAnchors] = useState<Anchor[]>([]),
    [hover, setHover] = useState<Point | null>(null),
    [panning, setPanning] = useState(false);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const updateAnchors = (value: Anchor[]) => {
    draft.current = value;
    setAnchors(value);
  };
  const snap = (p: Point, exclude: string[] = [], elements = true): Point => {
    const v = store.view,
      result = snapPoint(
        p,
        v.snapElements && elements ? collectSnapTargets(store.document.elements, exclude) : [],
        v.zoom,
        v.snap ? v.gridSize : undefined,
      );
    setSnapGuides(result.guides);
    return result.point;
  };
  const toWorld = (clientX: number, clientY: number): Point => {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return [0, 0];
    const p = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
    return [p.x, p.y];
  };
  const fit = useCallback(() => {
    const rect = viewport.current?.getBoundingClientRect();
    if (!rect) return;
    const leftPanel = document.querySelector('.library')?.getBoundingClientRect(),
      rightPanel = document.querySelector('.inspector')?.getBoundingClientRect();
    const left = store.view.leftPanel ? (leftPanel?.width || 254) + 24 : 24,
      right = store.view.rightPanel ? (rightPanel?.width || 306) + 24 : 24;
    const zoom = clamp(
      Math.min(
        (rect.width - left - right - 56) / store.document.canvas.width,
        (rect.height - 210) / store.document.canvas.height,
      ),
      0.08,
      1.4,
    );
    store.setView({ zoom, pan: [(left - right) / 2, 18] });
  }, [store]);
  const setZoom = useCallback(
    (next: number, client?: Point) => {
      const r = viewport.current?.getBoundingClientRect();
      if (!r) return;
      const left = store.view.leftPanel
          ? document.querySelector('.library')?.getBoundingClientRect().width || 0
          : 0,
        right = store.view.rightPanel
          ? document.querySelector('.inspector')?.getBoundingClientRect().width || 0
          : 0;
      const anchor: Point = client
        ? [client[0] - r.left - r.width / 2, client[1] - r.top - r.height / 2]
        : [(left - right) / 2, 18];
      store.setView(zoomAround(store.view.zoom, store.view.pan, next, anchor));
    },
    [store],
  );
  useEffect(() => {
    fit();
  }, [fit, doc.canvas.width, doc.canvas.height, view.leftPanel, view.rightPanel]);
  useEffect(() => {
    window.addEventListener('resize', fit);
    window.addEventListener('vectora:fit', fit);
    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('vectora:fit', fit);
    };
  }, [fit]);
  useEffect(() => {
    const change = (event: Event) => {
      const value = (event as CustomEvent<number>).detail;
      if (Number.isFinite(value) && value > 0) setZoom(value);
    };
    window.addEventListener('vectora:zoom', change);
    return () => window.removeEventListener('vectora:zoom', change);
  }, [setZoom]);
  useLayoutEffect(() => {
    if (!artwork.current) return;
    artwork.current.replaceChildren();
    doc.elements.forEach((e) => {
      const node = buildSvgElement(e);
      if (node) artwork.current!.append(node);
    });
  }, [doc]);

  const finishPath = useCallback(() => {
    const points = draft.current;
    if (points.length >= 2) {
      const curve = store.view.tool === 'bezier';
      const e = makeElement(curve ? 'bezier' : 'polyline', {
        x: 0,
        y: 0,
        points: curve ? anchorPoints(points) : points.map((a) => a.p),
        name: curve ? 'Bézier curve' : 'Polyline',
      });
      normalizePoints(e);
      store.change((d) => d.elements.push(e));
      store.select([e.id]);
      store.setView({ tool: 'node', nodeIndex: null });
    }
    draft.current = [];
    setAnchors([]);
    setHover(null);
  }, [store]);
  useEffect(() => {
    if (!['bezier', 'polyline'].includes(view.tool)) {
      draft.current = [];
      setAnchors([]);
      setHover(null);
    }
  }, [view.tool]);
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (
        (event.target as Element).closest('input,textarea,select,[contenteditable=true]') ||
        store.view.modal
      )
        return;
      if (event.code === 'Space') {
        event.preventDefault();
        space.current = true;
        setPanning(true);
      }
      if (event.key === 'Enter' && draft.current.length) {
        event.preventDefault();
        event.stopImmediatePropagation();
        finishPath();
      }
      if (event.key === 'Escape' && (draft.current.length || gesture.current)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const g = gesture.current;
        if (g && 'before' in g) {
          store.document = g.before;
          store.commit();
          store.emit();
        }
        gesture.current = null;
        draft.current = [];
        setAnchors([]);
        setHover(null);
        setMarquee(null);
        setSnapGuides([]);
        setPanning(false);
      }
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        space.current = false;
        setPanning(false);
      }
    };
    const blur = () => {
      space.current = false;
      setPanning(false);
    };
    window.addEventListener('keydown', down, true);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down, true);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [store, finishPath]);
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const v = store.view;
      if (event.ctrlKey || event.metaKey) {
        setZoom(wheelZoom(v.zoom, event.deltaY, event.deltaMode), [event.clientX, event.clientY]);
      } else store.setView({ pan: [v.pan[0] - event.deltaX, v.pan[1] - event.deltaY] });
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, [store, setZoom]);

  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.button !== 1) return;
    event.preventDefault();
    event.currentTarget.focus();
    store.setView({ contextMenu: null });
    const p = toWorld(event.clientX, event.clientY),
      target = event.target as Element,
      tool = store.view.tool;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (space.current || tool === 'hand' || event.button === 1) {
      gesture.current = { type: 'pan', start: [event.clientX, event.clientY], pan: store.view.pan };
      setPanning(true);
      return;
    }
    const editing = tool === 'select' || tool === 'node';
    const direct = editing ? startManipulation(target, p, store) : null;
    if (direct) {
      gesture.current = direct;
      return;
    }
    const node = target.closest('[data-node-index]'),
      handle = target.closest('[data-handle]');
    if (editing && node && active && !active.locked) {
      const index = Number(node.getAttribute('data-node-index'));
      store.setView({ nodeIndex: index });
      gesture.current = {
        type: 'node',
        id: active.id,
        index,
        element: clone(active),
        before: clone(doc),
      };
      return;
    }
    if (editing && handle && active && !active.locked) {
      gesture.current = {
        type: 'resize',
        id: active.id,
        handle: handle.getAttribute('data-handle')!,
        start: p,
        element: clone(active),
        before: clone(doc),
      };
      return;
    }
    if (tool === 'select' || tool === 'node') {
      const id = target.closest('[data-element-id]')?.getAttribute('data-element-id');
      const element = doc.elements.find((e) => e.id === id);
      if (element && !element.locked) {
        if (event.shiftKey) {
          store.toggleSelection(element.id);
          if (!store.view.selectedIds.includes(element.id)) return;
        } else if (!store.view.selectedIds.includes(element.id)) store.select([element.id]);
        store.setView({ nodeIndex: null });
        gesture.current = {
          type: 'move',
          start: p,
          elements: clone(store.selected.filter((e) => !e.locked)),
          before: clone(doc),
        };
      } else {
        gesture.current = {
          type: 'marquee',
          start: p,
          current: p,
          initial: event.shiftKey ? [...store.view.selectedIds] : [],
        };
        setMarquee(marqueeBounds(p, p));
      }
      return;
    }
    if (tool === 'bezier' || tool === 'polyline') {
      const point = snap(p),
        last = draft.current.at(-1);
      if (last && Math.hypot(last.p[0] - point[0], last.p[1] - point[1]) * view.zoom < 3) return;
      const values = [...draft.current, { p: point, incoming: point, outgoing: point }];
      updateAnchors(values);
      setHover(null);
      gesture.current = { type: 'anchor', index: values.length - 1 };
      return;
    }
    if (tool === 'text') {
      const id = store.add('text', {
        x: snap(p)[0],
        y: snap(p)[1],
        text: 'Your text',
        name: 'Text',
      });
      store.setView({ editingTextId: id });
      return;
    }
    if (tool === 'rect' || tool === 'ellipse' || tool === 'line' || tool === 'arrow') {
      const before = clone(doc),
        point = snap(p),
        e = makeElement(tool, {
          x: point[0],
          y: point[1],
          width: 1,
          height: 1,
          ...(tool === 'line' || tool === 'arrow'
            ? {
                points: [
                  [0, 0],
                  [1, 1],
                ] as Point[],
              }
            : {}),
        });
      store.preview((d) => d.elements.push(e));
      store.select([e.id]);
      gesture.current = { type: 'shape', start: point, id: e.id, before };
    }
  };
  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const p = toWorld(event.clientX, event.clientY),
      g = gesture.current;
    if (!g) {
      if (draft.current.length) setHover(snap(p));
      return;
    }
    if (g.type === 'manipulate') {
      moveManipulation(g, p, event.shiftKey, store);
      return;
    }
    if (g.type === 'pan') {
      store.setView({
        pan: [g.pan[0] + event.clientX - g.start[0], g.pan[1] + event.clientY - g.start[1]],
      });
      return;
    }
    if (g.type === 'anchor') {
      if (store.view.tool === 'bezier') {
        const values = clone(draft.current),
          a = values[g.index],
          point = snap(p);
        a.outgoing = point;
        a.incoming = [2 * a.p[0] - point[0], 2 * a.p[1] - point[1]];
        updateAnchors(values);
      }
      return;
    }
    if (g.type === 'marquee') {
      g.current = p;
      const b = marqueeBounds(g.start, p);
      setMarquee(b);
      store.select([
        ...new Set([
          ...g.initial,
          ...store.document.elements
            .filter((e) => !e.hidden && !e.locked && marqueeHit(b, e, store.view.marqueeMode))
            .map((e) => e.id),
        ]),
      ]);
      return;
    }
    if (g.type === 'move') {
      const v = store.view,
        result = snapTranslation(
          g.elements,
          [p[0] - g.start[0], p[1] - g.start[1]],
          v.snapElements
            ? collectSnapTargets(
                store.document.elements,
                g.elements.map((e) => e.id),
              )
            : [],
          v.zoom,
          v.snap ? v.gridSize : undefined,
        );
      const delta = result.point;
      setSnapGuides(result.guides);
      store.preview((d) =>
        g.elements.forEach((before) => {
          const e = d.elements.find((e) => e.id === before.id)!;
          e.x = before.x + delta[0];
          e.y = before.y + delta[1];
        }),
      );
      return;
    }
    if (g.type === 'node') {
      store.moveNode(
        g.id,
        g.index,
        apply(inverse(elementMatrix(g.element)), snap(p, [g.id])),
        g.element,
        event.altKey,
      );
      return;
    }
    if (g.type === 'shape') {
      let end = snap(p, [g.id], !event.shiftKey);
      if (event.shiftKey) {
        const dx = end[0] - g.start[0],
          dy = end[1] - g.start[1];
        const n = Math.max(Math.abs(dx), Math.abs(dy));
        end = [g.start[0] + Math.sign(dx || 1) * n, g.start[1] + Math.sign(dy || 1) * n];
      }
      const b = marqueeBounds(g.start, end);
      store.preview((d) => {
        const e = d.elements.find((e) => e.id === g.id)!;
        Object.assign(e, { ...b, width: Math.max(1, b.width), height: Math.max(1, b.height) });
        if (e.type === 'line' || e.type === 'arrow')
          e.points = [
            [g.start[0] - b.x, g.start[1] - b.y],
            [end[0] - b.x, end[1] - b.y],
          ];
      });
      return;
    }
    if (g.type === 'resize') {
      const before = g.element,
        m = elementMatrix(before),
        start = apply(inverse(m), g.start),
        local = apply(
          inverse(m),
          snap(p, [g.id], !event.shiftKey && !store.view.keepRatio && before.type !== 'circle'),
        ),
        dx = local[0] - start[0],
        dy = local[1] - start[1];
      let width = before.width,
        height = before.height,
        x = 0,
        y = 0;
      if (g.handle.includes('e')) width = Math.max(1, before.width + dx);
      if (g.handle.includes('s')) height = Math.max(1, before.height + dy);
      if (g.handle.includes('w')) width = Math.max(1, before.width - dx);
      if (g.handle.includes('n')) height = Math.max(1, before.height - dy);
      if (
        (event.shiftKey || store.view.keepRatio || before.type === 'circle') &&
        g.handle.length === 2
      ) {
        const ratio = before.width / before.height;
        if (width / height > ratio) height = width / ratio;
        else width = height * ratio;
      }
      // The dragged position is already snapped in world space. Rounding local dimensions
      // again would move the corner away from a key point (especially on rotated objects).
      const snapped = store.view.snap || store.view.snapElements;
      width = Math.max(1, snapped ? width : round(width, 0.1));
      height = Math.max(1, snapped ? height : round(height, 0.1));
      if (g.handle.includes('w')) x = before.width - width;
      if (g.handle.includes('n')) y = before.height - height;
      store.preview((d) => {
        const e = d.elements.find((e) => e.id === g.id)!,
          next = clone(before);
        resizeElement(next, width, height);
        const desired = apply(m, [x, y]),
          origin = apply(elementMatrix(next), [0, 0]);
        next.x += desired[0] - origin[0];
        next.y += desired[1] - origin[1];
        Object.assign(e, next);
      });
    }
  };
  const pointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    gesture.current = null;
    setPanning(false);
    setMarquee(null);
    setSnapGuides([]);
    if (g?.type === 'node')
      store.preview((d) => normalizePoints(d.elements.find((e) => e.id === g.id)!));
    if (g?.type === 'shape') {
      const e = store.document.elements.find((e) => e.id === g.id)!;
      if (e.width < 3 && e.height < 3)
        store.preview((d) => {
          const item = d.elements.find((e) => e.id === g.id)!;
          resizeElement(item, 120, item.type === 'line' || item.type === 'arrow' ? 1 : 100);
        });
      store.setView({ tool: 'select' });
    }
    if (g && ['node', 'move', 'shape', 'resize', 'manipulate'].includes(g.type)) store.commit();
    if (
      g?.type === 'marquee' &&
      Math.hypot(g.current[0] - g.start[0], g.current[1] - g.start[1]) * view.zoom < 3
    )
      store.select(g.initial);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const cancel = () => {
    const g = gesture.current;
    if (g && 'before' in g) {
      store.document = g.before;
      store.commit();
      store.emit();
    }
    gesture.current = null;
    setMarquee(null);
    setSnapGuides([]);
    setPanning(false);
  };
  const previewAnchors =
    hover && anchors.length
      ? [...anchors, { p: hover, incoming: hover, outgoing: hover }]
      : anchors;
  const previewD =
    view.tool === 'bezier'
      ? bezierPath(anchorPoints(previewAnchors))
      : `M ${previewAnchors.map((a) => a.p.join(' ')).join(' L ')}`;
  const handleSize = 8 / view.zoom;
  const doubleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (draft.current.length) {
      finishPath();
      return;
    }
    // Pointer capture retargets the synthesized click to the workspace in Chromium.
    // Resolve the actual SVG under the pointer after the drag capture has ended.
    const target =
        document.elementFromPoint(event.clientX, event.clientY) || (event.target as Element),
      id = target.closest('[data-element-id]')?.getAttribute('data-element-id'),
      e = doc.elements.find((x) => x.id === id);
    if (!e || e.locked) return;
    if (e.type === 'arrow') {
      store.select([e.id]);
      return;
    }
    if (isNodeEditable(e)) {
      store.select([e.id]);
      if (!target.closest('[data-node-index]')) {
        const local = apply(inverse(elementMatrix(e)), toWorld(event.clientX, event.clientY)),
          near = nearestSegment(e, local);
        store.insertNode(near.index, near.t);
      } else store.setView({ tool: 'node' });
    } else if (e.type === 'text') {
      store.select([e.id]);
      store.setView({ inspectorTab: 'design', editingTextId: e.id });
    }
  };
  const drop = async (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = [...e.dataTransfer.files].find((f) => f.name.toLowerCase().endsWith('.svg'));
    if (!f) return;
    try {
      const imported = await parseSvg(await f.text(), f.name.replace(/\.svg$/i, ''));
      const ratio = Math.min(
        1,
        (doc.canvas.width * 0.8) / imported.canvas.width,
        (doc.canvas.height * 0.8) / imported.canvas.height,
      );
      imported.elements.forEach((x) => {
        x.x = x.x * ratio + (doc.canvas.width - imported.canvas.width * ratio) / 2;
        x.y = x.y * ratio + (doc.canvas.height - imported.canvas.height * ratio) / 2;
        resizeElement(x, x.width * ratio, x.height * ratio);
      });
      store.change((d) => {
        d.sharedDefs += imported.sharedDefs;
        d.elements.push(...imported.elements);
      });
      store.select(imported.elements.map((e) => e.id));
    } catch (error) {
      store.notify(error instanceof Error ? error.message : 'Import failed');
    }
  };
  return {
    viewport,
    svg,
    artwork,
    doc,
    view,
    selected,
    active,
    marquee,
    snapGuides,
    anchors,
    panning,
    previewD,
    handleSize,
    pointerDown,
    pointerMove,
    pointerUp,
    cancel,
    doubleClick,
    drop,
  };
}
