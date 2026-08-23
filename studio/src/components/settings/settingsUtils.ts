export function clampNumberInput(value: string, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

export function clampFloatInput(value: string, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
}

export function parseCssPixelValue(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
