import { useEffect, useRef, useState } from 'react';

export function NumberField({
  label,
  value,
  onChange,
  onCommit,
  min,
  max,
  step = 1,
  unit,
  disabled = false,
}: {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  onCommit?: () => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(String(value)),
    focus = useRef(false);
  useEffect(() => {
    if (!focus.current)
      setDraft(typeof value === 'number' ? String(Math.round(value * 100) / 100) : value);
  }, [value]);
  return (
    <label className="number-field">
      <span>{label}</span>
      <span className="field-input">
        <input
          aria-label={label}
          type="number"
          value={draft}
          min={min}
          max={max}
          step={step}
          placeholder="Mixed"
          disabled={disabled}
          onFocus={() => {
            focus.current = true;
          }}
          onChange={(e) => {
            setDraft(e.target.value);
            const n = Number(e.target.value);
            if (
              e.target.value !== '' &&
              Number.isFinite(n) &&
              n >= (min ?? -Infinity) &&
              n <= (max ?? Infinity)
            )
              onChange(n);
          }}
          onBlur={() => {
            focus.current = false;
            setDraft(String(value));
            onCommit?.();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
        />
        {unit && <small>{unit}</small>}
      </span>
    </label>
  );
}
export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | [string, string])[];
}) {
  return (
    <label className="select-field">
      <span>{label}</span>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        {value === '' && (
          <option value="" disabled>
            Mixed
          </option>
        )}
        {options.map((o) => {
          const [v, text] = typeof o === 'string' ? [o, o] : o;
          return (
            <option key={v} value={v}>
              {text}
            </option>
          );
        })}
      </select>
    </label>
  );
}
