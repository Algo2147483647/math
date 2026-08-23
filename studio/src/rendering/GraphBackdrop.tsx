import type { StageData } from "../layout/types";

interface GraphBackdropProps {
  stage: StageData;
}

export default function GraphBackdrop({ stage }: GraphBackdropProps) {
  return (
    <g className="dag-backdrop">
      <rect className="dag-stage__halo" x={24} y={24} width={stage.stageWidth - 48} height={stage.stageHeight - 48} rx={28} ry={28} />
      {stage.lanes.map((lane) => (
        <g key={lane.layer} className="dag-lane" data-layer={lane.layer} data-label={lane.label}>
          <line className="dag-stage__lane" x1={lane.x} y1={54} x2={lane.x} y2={stage.stageHeight - 54} />
          <text className="dag-stage__lane-label" x={lane.x} y={42} textAnchor="middle">
            {lane.label}
          </text>
        </g>
      ))}
    </g>
  );
}
