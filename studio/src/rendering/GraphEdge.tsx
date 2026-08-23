import { memo } from "react";
import type { StageEdge } from "../layout/types";

interface GraphEdgeProps {
  edge: StageEdge;
  showLabel: boolean;
}

const GraphEdge = memo(function GraphEdge({ edge, showLabel }: GraphEdgeProps) {
  return (
    <g
      className="dag-edge"
      data-source={edge.source}
      data-target={edge.target}
      data-weight={String(edge.weight ?? "")}
      data-label={edge.label}
      data-active="false"
    >
      <path className="dag-edge__path" d={edge.path} markerEnd="url(#arrowhead)" />
      {showLabel && edge.label ? <EdgeLabel label={edge.label} x={edge.labelPosition.x} y={edge.labelPosition.y} /> : null}
    </g>
  );
}, areEqualGraphEdgeProps);

export default GraphEdge;

function areEqualGraphEdgeProps(previous: GraphEdgeProps, next: GraphEdgeProps): boolean {
  return previous.edge === next.edge && previous.showLabel === next.showLabel;
}

function EdgeLabel({ label, x, y }: { label: string; x: number; y: number }) {
  const labelWidth = Math.max(18, label.length * 7 + 10);

  return (
    <>
      <rect className="dag-edge__label-bg" x={x - labelWidth / 2} y={y - 10} width={labelWidth} height={16} rx={8} ry={8} />
      <text className="dag-edge__label-text" x={x} y={y + 1} textAnchor="middle">
        {label}
      </text>
    </>
  );
}
