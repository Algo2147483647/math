import type { SnapGuide } from '../model/snapping';
export function SnapOverlay({ guides, zoom }: { guides: SnapGuide[]; zoom: number }) {
  return (
    <g className="snap-guides" pointerEvents="none">
      {guides.map((g, i) => (
        <g key={i} data-snap-guide={g.axis}>
          {g.axis !== 'point' && (
            <line
              x1={g.axis === 'x' ? g.to[0] : g.from[0]}
              y1={g.axis === 'y' ? g.to[1] : g.from[1]}
              x2={g.to[0]}
              y2={g.to[1]}
            />
          )}
          <circle cx={g.to[0]} cy={g.to[1]} r={5 / zoom} />
          <path
            d={`M ${g.to[0] - 8 / zoom} ${g.to[1]} H ${g.to[0] + 8 / zoom} M ${g.to[0]} ${g.to[1] - 8 / zoom} V ${g.to[1] + 8 / zoom}`}
          />
          <text x={g.to[0] + 10 / zoom} y={g.to[1] - 10 / zoom} fontSize={10 / zoom}>
            {g.target.label}
          </text>
        </g>
      ))}
    </g>
  );
}
