import { clamp } from './geometry';
import type { Point } from './types';
export const MIN_ZOOM = 0.08,
  MAX_ZOOM = 8,
  ZOOM_STEP = 1.05;
export const stepZoom = (current: number, direction: 1 | -1) =>
  clamp(current * ZOOM_STEP ** direction, MIN_ZOOM, MAX_ZOOM);
export function wheelZoom(current: number, delta: number, mode = 0): number {
  const pixels = delta * (mode === 1 ? 16 : mode === 2 ? 800 : 1);
  return clamp(current * ZOOM_STEP ** clamp(-pixels / 100, -1, 1), MIN_ZOOM, MAX_ZOOM);
}
/** Keep the world point under the requested viewport position stationary. */
export function zoomAround(
  zoom: number,
  pan: Point,
  next: number,
  anchor: Point,
): { zoom: number; pan: Point } {
  const target = clamp(next, MIN_ZOOM, MAX_ZOOM),
    ratio = target / zoom;
  return {
    zoom: target,
    pan: [anchor[0] - (anchor[0] - pan[0]) * ratio, anchor[1] - (anchor[1] - pan[1]) * ratio],
  };
}
export function requestZoom(zoom: number) {
  window.dispatchEvent(new CustomEvent('vectora:zoom', { detail: zoom }));
}
