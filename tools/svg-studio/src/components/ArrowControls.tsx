import { useEditor } from '../model/context';
import { apply, elementMatrix, inverse, normalizePoints } from '../model/geometry';
import type { ArrowHeadStyle, Point } from '../model/types';
import { NumberField, SelectField } from './Fields';
const styles: [string, string][] = [
  ['none', 'None'],
  ['arrow', 'Open arrow'],
  ['triangle', 'Triangle'],
  ['circle', 'Circle'],
  ['square', 'Square'],
  ['diamond', 'Diamond'],
  ['bar', 'Bar'],
];
export function ArrowControls() {
  const { store, active } = useEditor();
  if (!active?.points) return null;
  const hasFill = [active.arrowStart, active.arrowEnd].some(
    (s) => s && ['triangle', 'circle', 'square', 'diamond'].includes(s),
  );
  return (
    <div className="arrow-controls">
      <p className="field-help">
        Drag either endpoint directly on the canvas. Turn on Snap to elements to align with shape
        key points.
      </p>
      <div className="field-grid">
        {active.points.map((p, i) => {
          const world = apply(elementMatrix(active), p);
          return (['X', 'Y'] as const).map((axis, n) => (
            <NumberField
              key={`${i}-${axis}`}
              label={`${i === 0 ? 'Start' : 'End'} ${axis}`}
              value={world[n]}
              unit="px"
              onChange={(v) => {
                const next: Point = [...world];
                next[n] = v;
                store.moveNode(active.id, i, apply(inverse(elementMatrix(active)), next), active);
              }}
              onCommit={() => {
                store.preview((d) => normalizePoints(d.elements.find((e) => e.id === active.id)!));
                store.commit();
              }}
            />
          ));
        })}
      </div>
      <div className="field-grid">
        <SelectField
          label="Start head"
          value={active.arrowStart || 'none'}
          options={styles}
          onChange={(v) => store.update({ arrowStart: v as ArrowHeadStyle })}
        />
        <SelectField
          label="End head"
          value={active.arrowEnd || 'arrow'}
          options={styles}
          onChange={(v) => store.update({ arrowEnd: v as ArrowHeadStyle })}
        />
        <NumberField
          label="Head size"
          value={active.arrowSize ?? 24}
          min={2}
          max={200}
          unit="px"
          onChange={(v) => store.update({ arrowSize: v }, false)}
          onCommit={() => store.commit()}
        />
        <NumberField
          label="Head opening"
          value={active.arrowAngle ?? 66}
          min={10}
          max={150}
          unit="°"
          onChange={(v) => store.update({ arrowAngle: v }, false)}
          onCommit={() => store.commit()}
        />
        <NumberField
          label="Head fill"
          value={Math.round((active.arrowFill ?? 1) * 100)}
          min={0}
          max={100}
          unit="%"
          disabled={!hasFill}
          onChange={(v) => store.update({ arrowFill: v / 100 }, false)}
          onCommit={() => store.commit()}
        />
      </div>
      <p className="field-help">
        Opening sets the angle between arrow wings. Shape heads can be hollow (0%), solid (100%), or
        partially filled. Head color follows the stroke.
      </p>
      <button
        className="button secondary full"
        onClick={() =>
          store.update({
            points: [...active.points!].reverse(),
          })
        }
      >
        Reverse direction
      </button>
    </div>
  );
}
