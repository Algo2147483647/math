import type { StudioElement } from '../model/types';
import { gradientPoint, sortedStops } from '../model/paint';
export function GradientOverlay({
  element: e,
  kind,
  zoom,
}: {
  element: StudioElement;
  kind: 'fill' | 'stroke';
  zoom: number;
}) {
  const g = e[`${kind}Gradient`];
  if (!g) return null;
  const [x1, y1] = [g.start[0] * e.width, g.start[1] * e.height],
    [x2, y2] = [g.end[0] * e.width, g.end[1] * e.height];
  return (
    <g className="gradient-overlay">
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="gradient-guide" />
      {sortedStops(g).map((s) => {
        const p = gradientPoint(g, s.offset);
        return (
          <circle
            key={s.id}
            cx={p[0] * e.width}
            cy={p[1] * e.height}
            r={5 / zoom}
            data-gradient-stop={s.id}
            className="gradient-stop-handle"
            fill={s.color}
          >
            <title>Drag color stop</title>
          </circle>
        );
      })}
      <rect
        x={x1 - 5 / zoom}
        y={y1 - 5 / zoom}
        width={10 / zoom}
        height={10 / zoom}
        data-gradient-handle="start"
        className="gradient-endpoint"
      >
        <title>Gradient start / center</title>
      </rect>
      <circle cx={x2} cy={y2} r={6 / zoom} data-gradient-handle="end" className="gradient-endpoint">
        <title>Gradient end / radius</title>
      </circle>
    </g>
  );
}
