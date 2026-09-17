import { useState } from 'react';
import { useEditor } from '../model/context';
import { normalizeColor } from '../model/utils';
import { NumberField } from './Fields';
import { Icon } from './Icon';

export function Paint({ kind }: { kind: 'fill' | 'stroke' }) {
  const { store, selected } = useEditor();
  const first = selected[0],
    mixed = selected.some((e) => e[kind] !== first[kind]),
    value = mixed ? '' : first[kind];
  const label = kind === 'fill' ? 'Fill' : 'Stroke',
    color = normalizeColor(value) || '#1670ef',
    opacity = kind === 'fill' ? 'fillOpacity' : 'strokeOpacity';
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="paint-control">
      <div className="paint-row">
        <label
          className={`color-chip ${value === 'none' ? 'no-paint' : ''}`}
          style={{ backgroundColor: color }}
        >
          <input
            type="color"
            aria-label={`${label} color`}
            value={color}
            onChange={(e) =>
              store.update(
                {
                  [kind]: e.target.value,
                  ...(kind === 'stroke' && !first.strokeWidth ? { strokeWidth: 2 } : {}),
                },
                false,
              )
            }
            onBlur={() => store.commit()}
          />
        </label>
        <input
          className="hex-input"
          aria-label={`${label} value`}
          placeholder={mixed ? 'Mixed' : 'None'}
          value={draft ?? (value === 'none' ? 'None' : value.toUpperCase())}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (draft !== null) {
              const parsed =
                draft.toLowerCase() === 'none'
                  ? 'none'
                  : normalizeColor(draft.startsWith('#') ? draft : `#${draft}`);
              if (parsed)
                store.update({
                  [kind]: parsed,
                  ...(kind === 'stroke' && !first.strokeWidth ? { strokeWidth: 2 } : {}),
                });
              setDraft(null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
        />
        <button
          className={`icon-button ${value === 'none' ? 'active-subtle' : ''}`}
          title={`Remove ${kind}`}
          aria-label={`Remove ${kind}`}
          onClick={() => store.update({ [kind]: 'none' })}
        >
          <Icon name="minus" size={16} />
        </button>
      </div>
      <NumberField
        label={`${label} opacity`}
        value={
          selected.every((e) => e[opacity] === first[opacity])
            ? Math.round(first[opacity] * 100)
            : ''
        }
        min={0}
        max={100}
        unit="%"
        onChange={(n) => store.update({ [opacity]: n / 100 }, false)}
        onCommit={() => store.commit()}
      />
    </div>
  );
}
