import { useState } from 'react';
import { useEditor } from '../model/context';
import { gradientAngle, gradientCss, sortedStops, stopAt, withAngle } from '../model/paint';
import { uid } from '../model/utils';
import type { GradientPaint } from '../model/types';
import { NumberField, SelectField } from './Fields';
import { Icon } from './Icon';
const palettes = [
  ['#1670ef', '#d86cf1'],
  ['#f97316', '#facc15', '#ec4899'],
  ['#0f766e', '#67e8f9'],
  ['#111827', '#94a3b8', '#ffffff'],
];
export function GradientEditor({
  kind,
  gradient,
}: {
  kind: 'fill' | 'stroke';
  gradient: GradientPaint;
}) {
  const { store, view } = useEditor(),
    [selectedId, setSelectedId] = useState(gradient.stops[0].id);
  const selected = gradient.stops.find((s) => s.id === selectedId) || gradient.stops[0],
    key = `${kind}Gradient` as const;
  const update = (g: GradientPaint, commit = true) => store.update({ [key]: g }, commit);
  const changeStop = (patch: Partial<typeof selected>, commit = false) =>
    update(
      {
        ...gradient,
        stops: gradient.stops.map((s) => (s.id === selected.id ? { ...s, ...patch } : s)),
      },
      commit,
    );
  const add = (offset = 0.5) => {
    const stop = stopAt(gradient, offset);
    update({ ...gradient, stops: [...gradient.stops, stop] });
    setSelectedId(stop.id);
  };
  return (
    <div className="gradient-editor">
      <div
        className="gradient-ramp"
        style={{
          background: gradientCss({ ...gradient, type: 'linear', start: [0, 0.5], end: [1, 0.5] }),
        }}
        aria-label={`${kind} gradient ramp`}
        onDoubleClick={(event) => {
          const r = event.currentTarget.getBoundingClientRect();
          add((event.clientX - r.left) / r.width);
        }}
      >
        {sortedStops(gradient).map((stop) => (
          <button
            key={stop.id}
            className={`gradient-stop ${selected.id === stop.id ? 'active' : ''}`}
            style={{ left: `${stop.offset * 100}%`, backgroundColor: stop.color }}
            aria-label={`${kind} stop ${Math.round(stop.offset * 100)}%`}
            title="Select stop; double-click the ramp to add"
            onClick={() => setSelectedId(stop.id)}
          />
        ))}
      </div>
      <div className="stop-heading">
        <span>Color stop · {gradient.stops.length}</span>
        <div>
          <button
            className="icon-button"
            aria-label={`Add ${kind} gradient stop`}
            title="Add color stop"
            onClick={() => add()}
          >
            <Icon name="plus" size={14} />
          </button>
          <button
            className="icon-button"
            aria-label={`Remove ${kind} gradient stop`}
            disabled={gradient.stops.length <= 2}
            title="Remove color stop"
            onClick={() =>
              update({ ...gradient, stops: gradient.stops.filter((s) => s.id !== selected.id) })
            }
          >
            <Icon name="minus" size={14} />
          </button>
        </div>
      </div>
      <div className="stop-color-row">
        <input
          type="color"
          aria-label={`${kind} stop color`}
          value={selected.color}
          onChange={(e) => changeStop({ color: e.target.value })}
          onBlur={() => store.commit()}
        />
        <input
          aria-label={`${kind} stop hex`}
          key={selected.id + selected.color}
          defaultValue={selected.color}
          onBlur={(e) => {
            const hex = e.target.value;
            if (/^#[0-9a-f]{6}$/i.test(hex)) changeStop({ color: hex }, true);
            else e.target.value = selected.color;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
        />
        <button
          className="text-button"
          onClick={() =>
            update({
              ...gradient,
              stops: gradient.stops.map((s) => ({ ...s, offset: 1 - s.offset })),
            })
          }
        >
          Reverse
        </button>
      </div>
      <div className="field-grid">
        <NumberField
          label={`${kind} stop position`}
          value={Math.round(selected.offset * 100)}
          min={0}
          max={100}
          unit="%"
          onChange={(v) => changeStop({ offset: v / 100 })}
          onCommit={() => store.commit()}
        />
        <NumberField
          label={`${kind} stop opacity`}
          value={Math.round(selected.opacity * 100)}
          min={0}
          max={100}
          unit="%"
          onChange={(v) => changeStop({ opacity: v / 100 })}
          onCommit={() => store.commit()}
        />
        {gradient.type === 'linear' ? (
          <NumberField
            label={`${kind} gradient angle`}
            value={Math.round(gradientAngle(gradient))}
            unit="°"
            onChange={(angle) => update(withAngle(gradient, angle), false)}
            onCommit={() => store.commit()}
          />
        ) : (
          <NumberField
            label={`${kind} gradient radius`}
            value={Math.round(
              Math.hypot(gradient.end[0] - gradient.start[0], gradient.end[1] - gradient.start[1]) *
                100,
            )}
            min={1}
            max={200}
            unit="%"
            onChange={(radius) =>
              update(
                { ...gradient, end: [gradient.start[0] + radius / 100, gradient.start[1]] },
                false,
              )
            }
            onCommit={() => store.commit()}
          />
        )}
        <SelectField
          label={`${kind} gradient spread`}
          value={gradient.spread}
          options={[
            ['pad', 'Pad'],
            ['reflect', 'Reflect'],
            ['repeat', 'Repeat'],
          ]}
          onChange={(spread) => update({ ...gradient, spread: spread as GradientPaint['spread'] })}
        />
      </div>
      <div className="gradient-presets">
        {palettes.map((colors, i) => (
          <button
            key={i}
            title={`Gradient preset ${i + 1}`}
            aria-label={`${kind} gradient preset ${i + 1}`}
            style={{ background: `linear-gradient(90deg,${colors.join(',')})` }}
            onClick={() =>
              update({
                ...gradient,
                stops: colors.map((color, n) => ({
                  id: uid(),
                  offset: n / (colors.length - 1),
                  color,
                  opacity: 1,
                })),
              })
            }
          />
        ))}
      </div>
      <button
        className={`button full ${view.gradientEdit === kind ? 'primary' : 'secondary'}`}
        onClick={() => store.setView({ gradientEdit: view.gradientEdit === kind ? null : kind })}
      >
        <Icon name="line" size={16} />
        {view.gradientEdit === kind ? 'Finish gradient editing' : 'Edit gradient on canvas'}
      </button>
    </div>
  );
}
