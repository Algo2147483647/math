import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeElement } from '../src/model/elements';
import { hydrateElement, blankDocument } from '../src/model/storage';
import { arrowEndpoints, arrowGeometry } from '../src/model/arrows';
import { apply, elementMatrix, multiply, normalizePoints, scale } from '../src/model/geometry';
import { EditorStore } from '../src/model/store';
import { marqueeHit } from '../src/model/hitTest';
import {
  collectSnapTargets,
  elementSnapTargets,
  snapPoint,
  snapTranslation,
} from '../src/model/snapping';
import { MAX_ZOOM, MIN_ZOOM, stepZoom, wheelZoom, zoomAround } from '../src/model/zoom';
import type { ArrowHeadStyle, Point } from '../src/model/types';
const near = (a: Point, b: Point) => {
  assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-7, `${a} != ${b}`);
};

test('legacy arrows preserve their endpoints and only two endpoint nodes can be edited', () => {
  const legacy = makeElement('arrow', { x: 150, y: 100, width: 320, height: 90, rotation: 25 });
  delete legacy.points;
  const e = hydrateElement(legacy);
  assert.deepEqual(e.points, [
    [0, 45],
    [320, 45],
  ]);
  const s = new EditorStore({ ...blankDocument(), elements: [e] }, () => {});
  s.select([e.id]);
  s.insertNode();
  assert.equal(s.active!.points!.length, 2);
  const start = apply(elementMatrix(e), e.points![0]);
  s.moveNode(e.id, 1, [-80, 170], e);
  s.preview((d) => normalizePoints(d.elements[0]));
  s.commit();
  near(apply(elementMatrix(s.active!), s.active!.points![0]), start);
  near(apply(elementMatrix(s.active!), s.active!.points![1]), apply(elementMatrix(e), [-80, 170]));
  s.undo();
  assert.deepEqual(s.active!.points, e.points);
  s.dispose();
});
test('arrow heads follow arbitrary directions, stay bounded on short arrows and change their opening', () => {
  const e = makeElement('arrow', {
    width: 100,
    height: 100,
    points: [
      [100, 100],
      [0, 0],
    ],
    arrowEnd: 'triangle',
    arrowSize: 30,
    arrowAngle: 60,
  });
  const a = arrowGeometry(e),
    b = arrowGeometry({ ...e, arrowAngle: 120 });
  near(a.parts[1].points[1], [0, 0]);
  assert.notDeepEqual(a.parts[1].points, b.parts[1].points);
  for (const style of [
    'none',
    'arrow',
    'triangle',
    'circle',
    'square',
    'diamond',
    'bar',
  ] as ArrowHeadStyle[]) {
    const short = arrowGeometry({
      ...e,
      points: [
        [0, 0],
        [1, 0],
      ],
      arrowStart: style,
      arrowEnd: style,
      arrowSize: 200,
    });
    assert.ok(short.parts.every((p) => p.points.every((point) => point.every(Number.isFinite))));
    assert.ok(short.bounds.width < 3);
    assert.ok(short.bounds.height < 4);
  }
  assert.equal(
    arrowGeometry({
      ...e,
      points: [
        [0, 0],
        [0, 0],
      ],
    }).parts.length,
    1,
  );
});
test('marquee includes the arrow head outside the shaft and distinguishes hollow interiors', () => {
  const e = makeElement('arrow', {
    x: 0,
    y: 0,
    width: 200,
    height: 1,
    points: [
      [0, 0],
      [200, 0],
    ],
    arrowEnd: 'square',
    arrowSize: 40,
    arrowFill: 1,
    strokeWidth: 2,
  });
  assert.equal(marqueeHit({ x: 206, y: 6, width: 4, height: 4 }, e, 'touch'), true);
  assert.equal(
    marqueeHit({ x: 206, y: 6, width: 4, height: 4 }, { ...e, arrowFill: 0 }, 'touch'),
    false,
  );
  assert.equal(marqueeHit({ x: -2, y: -2, width: 224, height: 4 }, e, 'contain'), false);
  assert.equal(marqueeHit({ x: -2, y: -22, width: 224, height: 44 }, e, 'contain'), true);
});
test('rotated rectangles expose exact corners, edge midpoints and centers; hidden objects are excluded', () => {
  const e = makeElement('rect', {
      x: 100,
      y: 70,
      width: 200,
      height: 100,
      rotation: 37,
      affine: [1, 0.2, 0.4, 1, 0, 0],
    }),
    targets = elementSnapTargets(e);
  assert.equal(targets.length, 9);
  near(targets[0].point, apply(elementMatrix(e), [0, 0]));
  near(targets[4].point, apply(elementMatrix(e), [100, 0]));
  near(targets[8].point, apply(elementMatrix(e), [100, 50]));
  const hidden = makeElement('rect', { hidden: true }),
    locked = makeElement('rect', { locked: true });
  assert.equal(
    collectSnapTargets([e, hidden, locked], [e.id]).every((t) => t.elementId === locked.id),
    true,
  );
});
test('key points beat grid rounding and the capture radius remains constant in screen pixels', () => {
  const targets = [{ point: [113, 157] as Point, label: 'Corner', elementId: 'target' }];
  for (const zoom of [0.25, 1, 4]) {
    const close = snapPoint([113 + 4 / zoom, 157 + 4 / zoom], targets, zoom, 32);
    near(close.point, [113, 157]);
    assert.equal(close.guides[0].axis, 'point');
    const far: Point = [113 + 10 / zoom, 157 + 10 / zoom];
    near(snapPoint(far, targets, zoom).point, far);
  }
  near(snapPoint([103, 171], [], 1, 32).point, [96, 160]);
  near(snapPoint([103, 171], [], 1).point, [103, 171]);
  const aligned = snapPoint([117, 250], targets, 1);
  near(aligned.point, [113, 250]);
  assert.equal(aligned.guides[0].axis, 'x');
});
test('group key points include transformed child geometry and multi-object snapping uses one translation', () => {
  const a = makeElement('rect', { x: 0, y: 0, width: 50, height: 50 }),
    b = makeElement('rect', { x: 100, y: 50, width: 80, height: 60 });
  const s = new EditorStore({ ...blankDocument(), elements: [a, b] }, () => {});
  s.selectAll();
  s.group();
  s.update({ width: 360, height: 220, rotation: 25 });
  const g = s.active!,
    m = multiply(elementMatrix(g), scale(g.width / g.sourceWidth!, g.height / g.sourceHeight!));
  const child = g.children![0],
    target = elementSnapTargets(g).find((t) => t.elementId === child.id)!;
  near(target.point, apply(multiply(m, elementMatrix(child)), [0, 0]));
  const delta = snapTranslation(
    [a, b],
    [197, 297],
    [{ point: [200, 300], elementId: 'target', label: 'Center' }],
    1,
  );
  near(delta.point, [200, 300]);
  assert.equal(collectSnapTargets([g], [g.id]).length, 0);
  s.dispose();
});
test('all zoom inputs use small reversible steps and keep the chosen viewport point stationary', () => {
  assert.equal(stepZoom(1, 1), 1.05);
  assert.equal(stepZoom(stepZoom(1, 1), -1), 1);
  assert.equal(wheelZoom(1, -100), 1.05);
  assert.equal(wheelZoom(1, -2000), 1.05);
  assert.ok(wheelZoom(1, -2) > 1 && wheelZoom(1, -2) < 1.002);
  assert.equal(stepZoom(MAX_ZOOM, 1), MAX_ZOOM);
  assert.equal(stepZoom(MIN_ZOOM, -1), MIN_ZOOM);
  const pan: Point = [40, -30],
    anchor: Point = [150, 80],
    before: Point = [(anchor[0] - pan[0]) / 0.7, (anchor[1] - pan[1]) / 0.7],
    next = zoomAround(0.7, pan, 1.4, anchor);
  near([(anchor[0] - next.pan[0]) / next.zoom, (anchor[1] - next.pan[1]) / next.zoom], before);
  const e = makeElement('arrow');
  assert.equal(arrowEndpoints(e).length, 2);
});
