import type { ChangeEvent, FocusEvent } from "react";

interface ZoomInputProps {
  value: number;
  disabled: boolean;
  onCommit: (percent: number) => void;
}

export default function ZoomInput({ value, disabled, onCommit }: ZoomInputProps) {
  const digits = String(Math.max(0, Math.trunc(Math.abs(value || 0)))).length;
  const inputWidth = `${Math.max(2, digits) + 0.35}ch`;

  const handleCommit = (event: FocusEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement>) => {
    onCommit(Number(event.currentTarget.value));
  };

  return (
    <label className="zoom-pill zoom-input-pill" htmlFor="zoom-value-input">
      <input
        id="zoom-value-input"
        className="zoom-value-input"
        type="number"
        min={0.0001}
        step={1}
        value={value}
        disabled={disabled}
        style={{ width: inputWidth, minWidth: inputWidth }}
        aria-label="Zoom percentage"
        onChange={handleCommit}
        onBlur={handleCommit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onCommit(Number(event.currentTarget.value));
            event.currentTarget.blur();
          }
        }}
      />
      <span className="zoom-unit">%</span>
    </label>
  );
}
