import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EditorStore } from '../src/model/store';
import { makeElement } from '../src/model/elements';
import { blankDocument } from '../src/model/storage';
import {
  apply,
  cubicAt,
  elementMatrix,
  multiply,
  normalizePoints,
  scale,
  splitCubic,
} from '../src/model/geometry';
import type { Point, StudioElement } from '../src/model/types';
import { marqueeHit } from '../src/model/hitTest';
import { defaultGradient, stopAt, withAngle } from '../src/model/paint';
import { convertPath } from '../src/model/nodes';
const near = (a: Point, b: Point) => {
  assert.ok(Math.abs(a[0] - b[0]) < 1e-7, `${a} != ${b}`);
  assert.ok(Math.abs(a[1] - b[1]) < 1e-7, `${a} != ${b}`);
};
const editor = (elements: StudioElement[] = []) =>
  new EditorStore({ ...blankDocument(), elements }, () => {});

test('group, nonuniform scale, rotation and ungroup preserve exact child transforms', () => {
  const a = makeElement('rect', { x: 10, y: 30, width: 100, height: 80, rotation: 34 }),
    b = makeElement('bezier', { x: 240, y: 130 });
  const s = editor([a, b]);
  s.select([a.id, b.id]);
  s.group();
  const id = s.active!.id;
  s.update({ width: 480, height: 145, rotation: 27 });
  const group = s.active!,
    m = multiply(
      elementMatrix(group),
      scale(group.width / group.sourceWidth!, group.height / group.sourceHeight!),
    );
  const expected = group.children!.map((c) => multiply(m, elementMatrix(c)));
  s.ungroup();
  assert.equal(s.document.elements.length, 2);
  s.document.elements.forEach((e, i) => {
    for (const p of [
      [0, 0],
      [20, 10],
      [e.width, e.height],
    ] as Point[])
      near(apply(elementMatrix(e), p), apply(expected[i], p));
  });
  s.undo();
  assert.equal(s.document.elements[0].id, id);
  assert.equal(s.document.elements.length, 1);
  s.redo();
  assert.equal(s.document.elements.length, 2);
  s.dispose();
});
test('node rebasing preserves all world positions on a rotated affine curve', () => {
  const e = makeElement('polyline', {
    rotation: 63,
    affine: [1, 0.2, 0.5, 1, 0, 0],
    points: [
      [-80, -20],
      [60, 150],
      [230, 25],
    ],
  });
  const before = e.points!.map((p) => apply(elementMatrix(e), p));
  normalizePoints(e);
  e.points!.forEach((p, i) => near(apply(elementMatrix(e), p), before[i]));
  assert.equal(e.width, 310);
});
test('splitting a cubic preserves the entire curve, not only its midpoint', () => {
  const p: Point[] = [
      [2, 3],
      [10, -50],
      [70, 100],
      [150, 20],
    ],
    split = splitCubic(p, 0.37);
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    near(
      cubicAt(p, t),
      t <= 0.37 ? cubicAt(split.slice(0, 4), t / 0.37) : cubicAt(split.slice(3), (t - 0.37) / 0.63),
    );
  }
});
test('node gestures move adjacent controls, allow negative coordinates and undo in one step', () => {
  const e = makeElement('bezier'),
    s = editor([e]);
  s.select([e.id]);
  s.moveNode(e.id, 0, [-100, -50], e);
  s.preview((d) => normalizePoints(d.elements[0]));
  s.commit();
  assert.ok(s.active!.width > e.width);
  s.undo();
  assert.deepEqual(s.document.elements[0].points, e.points);
  s.redo();
  assert.notDeepEqual(s.document.elements[0].points, e.points);
  s.dispose();
});
test('insert and delete cubic anchors keep valid segment structure', () => {
  const e = makeElement('bezier'),
    s = editor([e]);
  s.select([e.id]);
  s.insertNode();
  assert.equal(s.active!.points!.length, 7);
  assert.equal(s.view.nodeIndex, 3);
  s.removeNode();
  assert.equal(s.active!.points!.length, 4);
  s.removeNode();
  assert.equal(s.active!.points!.length, 4);
  s.dispose();
});
test('property resizing scales polyline nodes and undo restores them', () => {
  const e = makeElement('polyline'),
    s = editor([e]);
  s.select([e.id]);
  s.update({ width: e.width * 2, height: e.height * 3 });
  near(s.active!.points![1], [e.points![1][0] * 2, e.points![1][1] * 3]);
  s.undo();
  assert.deepEqual(s.active!.points, e.points);
  s.dispose();
});
test('locked layers cannot be changed, reordered, grouped, cut or deleted', () => {
  const locked = makeElement('rect', { locked: true }),
    open = makeElement('circle'),
    s = editor([locked, open]);
  s.select([locked.id]);
  s.update({ x: 0, fill: 'red' });
  s.reorder('front');
  s.group();
  s.copy(true);
  s.remove();
  assert.deepEqual(s.document.elements[0], locked);
  s.dispose();
});
test('multi-layer reorder preserves relative order and duplicate regenerates child IDs', () => {
  const a = makeElement('rect'),
    b = makeElement('circle'),
    c = makeElement('star'),
    s = editor([a, b, c]);
  s.select([a.id, b.id]);
  s.reorder('front');
  assert.deepEqual(
    s.document.elements.map((e) => e.id),
    [c.id, a.id, b.id],
  );
  s.group();
  const original = s.active!;
  s.duplicate();
  assert.notEqual(s.active!.id, original.id);
  assert.notEqual(s.active!.children![0].id, original.children![0].id);
  s.dispose();
});
test('new document and import-style replacement are undoable', () => {
  const s = editor([makeElement('text')]);
  s.newDocument();
  assert.equal(s.document.elements.length, 0);
  s.undo();
  assert.equal(s.document.elements.length, 1);
  s.dispose();
});

test('marquee modes distinguish partial contact, enclosed objects, and empty corners of paths', () => {
  const rect = makeElement('rect', { x: 100, y: 100, width: 100, height: 100, stroke: 'none' });
  const partial = { x: 80, y: 80, width: 50, height: 50 };
  assert.equal(marqueeHit(partial, rect, 'touch'), true);
  assert.equal(marqueeHit(partial, rect, 'contain'), false);
  assert.equal(marqueeHit({ x: 90, y: 90, width: 120, height: 120 }, rect, 'contain'), true);
  const line = makeElement('line', {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    points: [
      [0, 0],
      [100, 100],
    ],
    strokeWidth: 2,
    fill: 'none',
  });
  assert.equal(marqueeHit({ x: 0, y: 70, width: 20, height: 20 }, line, 'touch'), false);
  assert.equal(marqueeHit({ x: 45, y: 45, width: 10, height: 10 }, line, 'touch'), true);
  const hollow = makeElement('ellipse', {
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    fill: 'none',
    stroke: '#123456',
    strokeWidth: 2,
  });
  assert.equal(marqueeHit({ x: 80, y: 80, width: 40, height: 40 }, hollow, 'touch'), false);
  const curve = makeElement('bezier', {
    x: 0,
    y: 0,
    points: [
      [0, 0],
      [0, 100],
      [100, 100],
      [100, 0],
    ],
    fill: 'none',
    strokeWidth: 2,
  });
  assert.equal(marqueeHit({ x: 40, y: 90, width: 20, height: 10 }, curve, 'touch'), false);
  assert.equal(marqueeHit({ x: 45, y: 70, width: 10, height: 10 }, curve, 'touch'), true);
});

test('marquee respects affine group transforms and excludes a partially enclosed group', () => {
  const s = editor([
    makeElement('rect', { x: 50, y: 50, width: 100, height: 100, stroke: 'none' }),
    makeElement('circle', { x: 250, y: 50, width: 100, height: 100, stroke: 'none' }),
  ]);
  s.selectAll();
  s.group();
  s.update({ rotation: 30 });
  assert.equal(
    marqueeHit({ x: -100, y: -100, width: 600, height: 500 }, s.active!, 'contain'),
    true,
  );
  const m = elementMatrix(s.active!),
    p = apply(m, [20, 30]);
  const partial = { x: p[0] - 5, y: p[1] - 5, width: 10, height: 10 };
  assert.equal(marqueeHit(partial, s.active!, 'touch'), true);
  assert.equal(marqueeHit(partial, s.active!, 'contain'), false);
  s.dispose();
});

test('corner, smooth and symmetric handles preserve their respective constraints; Alt unlinks', () => {
  const e = makeElement('bezier', {
    points: [
      [0, 100],
      [30, 0],
      [70, 60],
      [100, 100],
      [160, 100],
      [180, 0],
      [220, 100],
    ],
  });
  for (const mode of ['corner', 'smooth', 'symmetric'] as const) {
    const s = editor([e]);
    s.select([e.id]);
    s.setView({ nodeIndex: 3 });
    s.setNodeMode(mode);
    const before = structuredClone(s.active!),
      a = before.points![3],
      opposite = before.points![2];
    s.moveNode(e.id, 4, [a[0] + 40, a[1] + 30], before);
    const result = s.active!.points![2];
    if (mode === 'corner') near(result, opposite);
    else {
      const length = mode === 'symmetric' ? 50 : Math.hypot(opposite[0] - a[0], opposite[1] - a[1]);
      near(result, [a[0] - (40 / 50) * length, a[1] - (30 / 50) * length]);
    }
    s.moveNode(e.id, 4, [a[0] + 80, a[1] + 70], before, true);
    near(s.active!.points![2], before.points![2]);
    assert.equal(s.active!.anchorModes![3], 'corner');
    s.dispose();
  }
});

test('converting a polyline to cubic segments retains the path and remaps anchor modes after insertion', () => {
  const e = makeElement('polyline', {
    points: [
      [0, 0],
      [100, 50],
      [200, 0],
    ],
  });
  convertPath(e);
  assert.equal(e.type, 'bezier');
  assert.equal(e.points!.length, 7);
  near(cubicAt(e.points!.slice(0, 4), 0.3), [30, 15]);
  const s = editor([e]);
  s.select([e.id]);
  s.setView({ nodeIndex: 3 });
  s.setNodeMode('symmetric');
  s.insertNode(0);
  assert.equal(s.active!.anchorModes![6], 'symmetric');
  s.removeNode();
  assert.equal(s.active!.anchorModes![3], 'symmetric');
  s.dispose();
});

test('gradient stops interpolate color and opacity and group paint changes are undoable', () => {
  const g = defaultGradient();
  g.stops[0].color = '#000000';
  g.stops[0].opacity = 0;
  g.stops[1].color = '#ffffff';
  assert.equal(stopAt(g, 0.5).color, '#808080');
  assert.equal(stopAt(g, 0.5).opacity, 0.5);
  const vertical = withAngle(g, 90);
  near(vertical.start, [0.5, 0]);
  near(vertical.end, [0.5, 1]);
  const s = editor([makeElement('rect'), makeElement('circle')]);
  s.selectAll();
  s.group();
  s.update({ fillGradient: g });
  assert.equal(
    s.active!.children!.every((e) => e.fillGradient?.stops.length === 2),
    true,
  );
  s.update({ fill: '#ff0000' });
  assert.equal(
    s.active!.children!.some((e) => e.fillGradient),
    false,
  );
  s.undo();
  assert.equal(
    s.active!.children!.every((e) => e.fillGradient?.stops[0].color === '#000000'),
    true,
  );
  s.dispose();
});

test('two flips restore exact affine geometry and aspect-locked text resize scales typography', () => {
  const e = makeElement('bezier', { rotation: 37, affine: [1, 0.2, 0.3, 1, 0, 0] }),
    s = editor([e]);
  s.select([e.id]);
  const original = elementMatrix(e);
  s.flip('horizontal');
  s.flip('horizontal');
  for (const p of e.points!) near(apply(elementMatrix(s.active!), p), apply(original, p));
  s.dispose();
  const text = makeElement('text', { width: 200, height: 60, fontSize: 40 }),
    t = editor([text]);
  t.select([text.id]);
  t.setView({ keepRatio: true });
  t.update({ width: 400 });
  assert.equal(t.active!.height, 120);
  assert.equal(t.active!.fontSize, 80);
  t.undo();
  assert.equal(t.active!.fontSize, 40);
  t.dispose();
});
