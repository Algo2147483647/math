import type { LayoutControlDefinition } from "./settingsConfig";

interface LayoutSliderControlProps {
  control: LayoutControlDefinition;
  value: number;
  onChange: (value: number) => void;
}

export default function LayoutSliderControl({ control, value, onChange }: LayoutSliderControlProps) {
  const inputId = `layout-control-${control.key}`;

  const commitValue = (nextValue: number) => {
    if (!Number.isFinite(nextValue)) {
      return;
    }
    const bounded = Math.max(control.min, Math.min(control.max, Math.round(nextValue)));
    onChange(bounded);
  };

  return (
    <div className="layout-slider-control">
      <label htmlFor={inputId} className="layout-slider-label">{control.label}</label>
      <div className="layout-slider-inputs">
        <input
          id={inputId}
          className="layout-slider"
          type="range"
          min={control.min}
          max={control.max}
          step={control.step}
          value={value}
          onChange={(event) => commitValue(Number(event.currentTarget.value))}
        />
        <label className="layout-value-pill" htmlFor={`${inputId}-number`}>
          <input
            id={`${inputId}-number`}
            className="layout-value-input"
            type="number"
            min={control.min}
            max={control.max}
            step={control.step}
            value={value}
            aria-label={`${control.label} value`}
            onChange={(event) => commitValue(Number(event.currentTarget.value))}
            onBlur={(event) => commitValue(Number(event.currentTarget.value))}
          />
          <span className="layout-value-unit">{control.unit || ""}</span>
        </label>
      </div>
    </div>
  );
}
