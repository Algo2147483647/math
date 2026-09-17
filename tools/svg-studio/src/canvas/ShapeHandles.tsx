import type { StudioElement } from '../model/types';
export function ShapeHandles({ element: e, zoom }: { element: StudioElement; zoom: number }) {
  const size = 5 / zoom;
  const diamond = (x: number, y: number, id: string, label: string) => (
    <path
      key={id}
      d={`M ${x} ${y - size} l ${size} ${size} ${-size} ${size} ${-size} ${-size} Z`}
      className="shape-handle"
      data-shape-handle={id}
    >
      <title>{label}</title>
    </path>
  );
  if (e.type === 'rect')
    return diamond(
      Math.max(12 / zoom, Math.min(e.radius, e.width / 2)),
      14 / zoom,
      'radius',
      'Drag to change corner radius',
    );
  if (e.type === 'star') {
    const a = -Math.PI / 2 + Math.PI / (e.pointsCount || 5),
      r = (Math.min(e.width, e.height) / 2) * (e.innerRatio || 0.43);
    return diamond(
      e.width / 2 + Math.cos(a) * r,
      e.height / 2 + Math.sin(a) * r,
      'innerRatio',
      'Drag to change the star inner radius',
    );
  }
  if (e.type === 'arc')
    return (
      <>
        {(['arcStart', 'arcEnd'] as const).map((key) => {
          const a = (((e[key] ?? (key === 'arcStart' ? 200 : 340)) - 90) * Math.PI) / 180;
          return diamond(
            e.width / 2 + (Math.cos(a) * e.width) / 2,
            e.height / 2 + (Math.sin(a) * e.height) / 2,
            key,
            `Drag ${key === 'arcStart' ? 'start' : 'end'} angle`,
          );
        })}
      </>
    );
  return null;
}
