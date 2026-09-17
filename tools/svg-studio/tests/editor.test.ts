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
