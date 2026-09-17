export const SVG_NS = 'http://www.w3.org/2000/svg';
export const uid = () => `el_${globalThis.crypto.randomUUID()}`;
export const clone = <T>(value: T): T => structuredClone(value);
export const safeFilename = (name: string) =>
  name
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .slice(0, 80) || 'Untitled artwork';
export function normalizeColor(value: string): string | null {
  if (!value || value === 'none' || !CSS.supports('color', value)) return null;
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.fillStyle = value;
  if (ctx.fillStyle.startsWith('#')) return ctx.fillStyle;
  const rgb = ctx.fillStyle.match(/[\d.]+/g);
  return rgb?.length
    ? '#' +
        rgb
          .slice(0, 3)
          .map((n) => Number(n).toString(16).padStart(2, '0'))
          .join('')
    : null;
}
