import { makeElement } from './elements';
import {
  clamp,
  elementMatrix,
  isNodeEditable,
  lerp,
  multiply,
  normalizePoints,
  resizeElement,
  scale,
  selectionBounds,
  splitCubic,
  transformElement,
  translate,
} from './geometry';
import { blankDocument, persistDocument } from './storage';
import { clone, uid } from './utils';
import type {
  AnchorMode,
  EditorView,
  ElementType,
  Point,
  StudioDocument,
  StudioElement,
} from './types';
import { loadPreferences, savePreferences } from './preferences';
import { convertPath, setAnchorMode, shiftAnchorModes } from './nodes';

export class EditorStore {
  document: StudioDocument;
  view: EditorView = {
    selectedIds: [],
    tool: 'select',
    nodeIndex: null,
    zoom: 0.7,
    pan: [0, 0],
    grid: true,
    snap: false,
    gridSize: 8,
    gridStyle: 'dots',
    marqueeMode: 'touch',
    workspaceOpen: false,
    keepRatio: false,
    gradientEdit: null,
    editingTextId: null,
    leftPanel: true,
    rightPanel: true,
    inspectorTab: 'design',
    assetTab: 'shapes',
    toast: '',
    saveStatus: 'saved',
    modal: null,
    contextMenu: null,
    revision: 0,
  };
  private listeners = new Set<() => void>();
  private history: string[];
  private historyIndex = 0;
  private clipboard: StudioElement[] = [];
  private timer: ReturnType<typeof setTimeout> | undefined;
  private toastTimer: ReturnType<typeof setTimeout> | undefined;
  private snapshot: {
    document: StudioDocument;
    view: EditorView;
    canUndo: boolean;
    canRedo: boolean;
  };
  constructor(
    doc: StudioDocument,
    private save: (doc: StudioDocument) => void = persistDocument,
  ) {
    this.document = clone(doc);
    this.view = { ...this.view, ...loadPreferences() };
    this.history = [JSON.stringify(doc)];
    this.snapshot = this.getCurrent();
  }
  private getCurrent() {
    return {
      document: this.document,
      view: this.view,
      canUndo: this.historyIndex > 0,
      canRedo: this.historyIndex < this.history.length - 1,
    };
  }
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  getSnapshot = () => this.snapshot;
  emit() {
    this.view = { ...this.view, revision: this.view.revision + 1 };
    this.snapshot = this.getCurrent();
    this.listeners.forEach((fn) => fn());
  }
  setView(changes: Partial<EditorView>) {
    this.view = { ...this.view, ...changes };
    savePreferences(this.view, changes);
    this.emit();
  }
  get selected() {
    return this.document.elements.filter((e) => this.view.selectedIds.includes(e.id));
  }
  get active() {
    return this.document.elements.find((e) => e.id === this.view.selectedIds.at(-1));
  }
  get hasClipboard() {
    return !!this.clipboard.length;
  }
  notify(message: string) {
    clearTimeout(this.toastTimer);
    this.setView({ toast: message });
    this.toastTimer = setTimeout(() => this.setView({ toast: '' }), 2600);
  }
  /** Preview updates are committed once per gesture or field edit. */
  preview(fn: (doc: StudioDocument) => void) {
    this.document = clone(this.document);
    fn(this.document);
    this.setView({ saveStatus: 'saving' });
  }
  commit() {
    const snapshot = JSON.stringify(this.document);
    if (snapshot === this.history[this.historyIndex]) {
      if (this.view.saveStatus === 'saving') this.flush();
      return;
    }
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(snapshot);
    if (this.history.length > 100) this.history.shift();
    this.historyIndex = this.history.length - 1;
    this.setView({ saveStatus: 'saving' });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 350);
  }
  change(fn: (doc: StudioDocument) => void) {
    this.preview(fn);
    this.commit();
  }
  flush = () => {
    clearTimeout(this.timer);
    try {
      this.save(this.document);
      this.setView({ saveStatus: 'saved' });
    } catch {
      this.setView({ saveStatus: 'error' });
    }
  };
  dispose() {
    clearTimeout(this.timer);
    clearTimeout(this.toastTimer);
    this.listeners.clear();
  }
  undo() {
    this.commit();
    if (this.historyIndex > 0) {
      this.document = JSON.parse(this.history[--this.historyIndex]);
      this.reconcileSelection();
      this.flush();
    }
  }
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.document = JSON.parse(this.history[++this.historyIndex]);
      this.reconcileSelection();
      this.flush();
    }
  }
  private reconcileSelection() {
    this.view = {
      ...this.view,
      selectedIds: this.view.selectedIds.filter((id) =>
        this.document.elements.some((e) => e.id === id),
      ),
      nodeIndex: null,
      contextMenu: null,
      gradientEdit: null,
      editingTextId: null,
    };
  }
  select(ids: string[], additive = false) {
    this.setView({
      selectedIds: additive ? [...new Set([...this.view.selectedIds, ...ids])] : ids,
      nodeIndex: null,
      gradientEdit: null,
      editingTextId: null,
    });
  }
  toggleSelection(id: string) {
    this.select(
      this.view.selectedIds.includes(id)
        ? this.view.selectedIds.filter((i) => i !== id)
        : [...this.view.selectedIds, id],
    );
  }
  selectAll() {
    this.select(this.document.elements.filter((e) => !e.hidden && !e.locked).map((e) => e.id));
  }
  add(type: ElementType, overrides: Partial<StudioElement> = {}) {
    const e = makeElement(type, overrides);
    if (overrides.x === undefined) e.x = (this.document.canvas.width - e.width) / 2;
    if (overrides.y === undefined) e.y = (this.document.canvas.height - e.height) / 2;
    this.change((d) => d.elements.push(e));
    this.select([e.id]);
    this.setView({ tool: 'select', inspectorTab: 'design' });
    return e.id;
  }
  update(changes: Partial<StudioElement>, commit = true) {
    const selected = new Set(this.view.selectedIds);
    this.preview((doc) =>
      doc.elements.forEach((e) => {
        if (!selected.has(e.id) || e.locked) return;
        const patch = { ...changes };
        for (const kind of ['fill', 'stroke'] as const)
          if (kind in patch && !(`${kind}Gradient` in patch)) patch[`${kind}Gradient`] = undefined;
        if (patch.width !== undefined || patch.height !== undefined) {
          if (this.view.keepRatio && e.type !== 'circle') {
            if (patch.width !== undefined && patch.height === undefined)
              patch.height = (e.height * patch.width) / e.width;
            else if (patch.height !== undefined && patch.width === undefined)
              patch.width = (e.width * patch.height) / e.height;
          }
          if (e.type === 'circle') {
            patch.width = patch.width ?? patch.height;
            patch.height = patch.width;
          }
          resizeElement(e, patch.width ?? e.width, patch.height ?? e.height);
        }
        this.paint(e, patch);
        Object.assign(e, patch);
      }),
    );
    if (commit) this.commit();
  }
  private paint(e: StudioElement, patch: Partial<StudioElement>) {
    const props = [
      'fill',
      'stroke',
      'fillGradient',
      'strokeGradient',
      'strokeWidth',
      'fillOpacity',
      'strokeOpacity',
      'strokeLinecap',
      'strokeLinejoin',
      'strokeDasharray',
    ] as const;
    const paint = Object.fromEntries(props.filter((k) => k in patch).map((k) => [k, patch[k]]));
    if (e.type === 'raw') {
      if ('fill' in paint || 'fillGradient' in paint) e.overrideFill = true;
      if ('stroke' in paint || 'strokeGradient' in paint) e.overrideStroke = true;
      if ('strokeWidth' in paint) e.overrideStrokeWidth = true;
      if ('fillOpacity' in paint) e.overrideFillOpacity = true;
      if ('strokeOpacity' in paint) e.overrideStrokeOpacity = true;
      if (['strokeLinecap', 'strokeLinejoin', 'strokeDasharray'].some((k) => k in paint))
        e.overrideStrokeStyle = true;
    }
    if (e.children && Object.keys(paint).length)
      e.children.forEach((c) => {
        this.paint(c, paint);
        Object.assign(c, paint);
      });
  }
  remove() {
    const ids = new Set(this.selected.filter((e) => !e.locked).map((e) => e.id));
    if (!ids.size) return;
    this.change((doc) => {
      doc.elements = doc.elements.filter((e) => !ids.has(e.id));
    });
    this.select([]);
  }
  copy(cut = false) {
    this.clipboard = clone(this.selected.filter((e) => !cut || !e.locked));
    if (cut) this.remove();
    this.notify(cut ? 'Selection cut' : 'Selection copied');
  }
  private copyWithIds(e: StudioElement): StudioElement {
    const copy = clone(e);
    copy.id = uid();
    copy.children = copy.children?.map((c) => this.copyWithIds(c));
    return copy;
  }
  paste() {
    if (!this.clipboard.length) return;
    const copies = this.clipboard.map((e) => this.copyWithIds(e));
    copies.forEach((e) => {
      e.x += 24;
      e.y += 24;
      e.locked = false;
    });
    this.change((d) => d.elements.push(...copies));
    this.clipboard = clone(copies);
    this.select(copies.map((e) => e.id));
  }
  duplicate() {
    const copies = this.selected.map((e) => this.copyWithIds(e));
    copies.forEach((e) => {
      e.x += 24;
      e.y += 24;
      e.name += ' copy';
      e.locked = false;
    });
    if (copies.length) {
      this.change((d) => d.elements.push(...copies));
      this.select(copies.map((e) => e.id));
    }
  }
  group() {
    const selected = this.selected.filter((e) => !e.locked);
    if (selected.length < 2) return;
    const bounds = selectionBounds(selected),
      ids = new Set(selected.map((e) => e.id));
    const children = clone(selected);
    children.forEach((e) => {
      e.x -= bounds.x;
      e.y -= bounds.y;
    });
    const group = makeElement('group', {
      ...bounds,
      width: Math.max(1, bounds.width),
      height: Math.max(1, bounds.height),
      sourceWidth: Math.max(1, bounds.width),
      sourceHeight: Math.max(1, bounds.height),
      name: `Group of ${children.length}`,
      children,
    });
    this.change((doc) => {
      const index = doc.elements.findIndex((e) => ids.has(e.id));
      doc.elements = doc.elements.filter((e) => !ids.has(e.id));
      doc.elements.splice(index, 0, group);
    });
    this.select([group.id]);
    this.setView({ tool: 'select' });
  }
  ungroup() {
    const ids = new Set(
      this.selected.filter((e) => e.type === 'group' && !e.locked).map((e) => e.id),
    );
    if (!ids.size) return;
    const selected: string[] = [];
    this.change((doc) => {
      doc.elements = doc.elements.flatMap((group) => {
        if (!ids.has(group.id)) return [group];
        const matrix = multiply(
          elementMatrix(group),
          scale(
            group.width / (group.sourceWidth || group.width),
            group.height / (group.sourceHeight || group.height),
          ),
        );
        return (group.children || []).map((child) => {
          const m = multiply(matrix, elementMatrix(child));
          child.x = m[4];
          child.y = m[5];
          child.rotation = 0;
          child.affine = [m[0], m[1], m[2], m[3], 0, 0];
          child.opacity *= group.opacity;
          child.hidden = child.hidden || group.hidden;
          child.locked = child.locked || group.locked;
          if (group.blendMode !== 'normal') child.blendMode = group.blendMode;
          selected.push(child.id);
          return child;
        });
      });
    });
    this.select(selected);
  }
  reorder(direction: 'front' | 'back' | 'forward' | 'backward') {
    const ids = new Set(this.selected.filter((e) => !e.locked).map((e) => e.id));
    if (!ids.size) return;
    this.change((d) => {
      if (direction === 'front' || direction === 'back') {
        const picked = d.elements.filter((e) => ids.has(e.id)),
          rest = d.elements.filter((e) => !ids.has(e.id));
        d.elements = direction === 'front' ? [...rest, ...picked] : [...picked, ...rest];
      } else {
        const arr = d.elements;
        if (direction === 'forward') {
          for (let i = arr.length - 2; i >= 0; i--)
            if (ids.has(arr[i].id) && !ids.has(arr[i + 1].id))
              [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        } else
          for (let i = 1; i < arr.length; i++)
            if (ids.has(arr[i].id) && !ids.has(arr[i - 1].id))
              [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
      }
    });
  }
  toggleLock() {
    const ids = new Set(this.view.selectedIds),
      lock = this.selected.some((e) => !e.locked);
    this.change((d) =>
      d.elements.forEach((e) => {
        if (ids.has(e.id)) e.locked = lock;
      }),
    );
  }
  align(axis: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
    const movable = this.selected.filter((e) => !e.locked);
    if (movable.length < 2) return;
    const bounds = selectionBounds(movable);
    this.change((d) =>
      d.elements.forEach((e) => {
        if (!movable.some((s) => s.id === e.id)) return;
        const b = selectionBounds([e]);
        if (axis === 'left') e.x += bounds.x - b.x;
        if (axis === 'center') e.x += bounds.x + bounds.width / 2 - b.x - b.width / 2;
        if (axis === 'right') e.x += bounds.x + bounds.width - b.x - b.width;
        if (axis === 'top') e.y += bounds.y - b.y;
        if (axis === 'middle') e.y += bounds.y + bounds.height / 2 - b.y - b.height / 2;
        if (axis === 'bottom') e.y += bounds.y + bounds.height - b.y - b.height;
      }),
    );
  }
  enterNodes() {
    if (this.selected.length === 1 && isNodeEditable(this.active) && !this.active?.locked)
      this.setView({ tool: this.view.tool === 'node' ? 'select' : 'node', nodeIndex: null });
  }
  insertNode(index?: number, t = 0.5) {
    const active = this.active;
    if (!active || !isNodeEditable(active) || active.locked) return;
    let next = 0;
    this.change((d) => {
      const e = d.elements.find((x) => x.id === active.id)!,
        pts = e.points!;
      if (e.type === 'bezier') {
        const i = clamp(index ?? Math.floor((this.view.nodeIndex ?? 0) / 3) * 3, 0, pts.length - 4);
        pts.splice(i, 4, ...splitCubic(pts.slice(i, i + 4), t));
        shiftAnchorModes(e, i, 3);
        next = i + 3;
      } else {
        const i = clamp(index ?? this.view.nodeIndex ?? 0, 0, pts.length - 2);
        pts.splice(i + 1, 0, lerp(pts[i], pts[i + 1], t));
        if (e.type === 'line') e.type = 'polyline';
        next = i + 1;
      }
      normalizePoints(e);
    });
    this.setView({ nodeIndex: next, tool: 'node' });
  }
  removeNode() {
    const active = this.active,
      index = this.view.nodeIndex;
    if (!active || active.locked || index === null || !active.points) return;
    if (active.type === 'bezier' && (index % 3 !== 0 || active.points.length <= 4)) return;
    if (active.type !== 'bezier' && active.points.length <= 2) return;
    this.change((d) => {
      const e = d.elements.find((x) => x.id === active.id)!,
        pts = e.points!;
      if (e.type === 'bezier') {
        shiftAnchorModes(e, index, -3);
        if (index === 0) pts.splice(0, 3);
        else if (index === pts.length - 1) pts.splice(index - 2, 3);
        else pts.splice(index - 1, 3);
      } else pts.splice(index, 1);
      normalizePoints(e);
    });
    this.setView({ nodeIndex: null });
  }
  setDocument(doc: StudioDocument) {
    this.document = clone(doc);
    this.select([]);
    this.commit();
  }
  newDocument() {
    this.setDocument(blankDocument());
  }
  setNodeMode(mode: AnchorMode) {
    const id = this.active?.id,
      index = this.view.nodeIndex;
    if (!id || index === null || this.active?.locked) return;
    this.change((d) => {
      const e = d.elements.find((e) => e.id === id)!;
      setAnchorMode(e, index, mode);
      normalizePoints(e);
    });
  }
  convertSelectedPath() {
    const id = this.active?.id;
    if (!id || this.active?.locked) return;
    this.change((d) => convertPath(d.elements.find((e) => e.id === id)!));
    this.setView({ nodeIndex: null });
  }
  flip(axis: 'horizontal' | 'vertical') {
    const elements = this.selected.filter((e) => !e.locked);
    if (!elements.length) return;
    const b = selectionBounds(elements),
      matrix = multiply(
        translate(b.x + b.width / 2, b.y + b.height / 2),
        multiply(
          scale(axis === 'horizontal' ? -1 : 1, axis === 'vertical' ? -1 : 1),
          translate(-b.x - b.width / 2, -b.y - b.height / 2),
        ),
      );
    this.change((d) =>
      d.elements.forEach((e) => {
        if (elements.some((x) => x.id === e.id)) transformElement(e, matrix);
      }),
    );
  }
  moveNode(id: string, index: number, point: Point, before: StudioElement, breakHandles = false) {
    this.preview((d) => {
      const e = d.elements.find((x) => x.id === id);
      if (!e || e.locked || !before.points) return;
      e.points = clone(before.points);
      const old = e.points[index],
        dx = point[0] - old[0],
        dy = point[1] - old[1];
      e.points[index] = point;
      if (e.type === 'bezier') {
        if (index % 3 === 0) {
          for (const i of [index - 1, index + 1])
            if (e.points[i]) e.points[i] = [e.points[i][0] + dx, e.points[i][1] + dy];
        } else if (breakHandles) {
          const anchor = index % 3 === 1 ? index - 1 : index + 1;
          e.anchorModes = { ...e.anchorModes, [anchor]: 'corner' };
        } else {
          const anchor = index % 3 === 1 ? index - 1 : index + 1,
            opposite = index % 3 === 1 ? index - 2 : index + 2;
          if (e.anchorModes?.[anchor] === 'corner') return;
          if (e.points[opposite]) {
            const a = e.points[anchor],
              dist = Math.hypot(point[0] - a[0], point[1] - a[1]),
              length =
                e.anchorModes?.[anchor] === 'symmetric'
                  ? dist
                  : Math.hypot(e.points[opposite][0] - a[0], e.points[opposite][1] - a[1]);
            if (dist > 0)
              e.points[opposite] = [
                a[0] - ((point[0] - a[0]) * length) / dist,
                a[1] - ((point[1] - a[1]) * length) / dist,
              ];
          }
        }
      }
    });
  }
}
