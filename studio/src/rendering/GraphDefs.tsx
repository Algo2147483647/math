const ARROW_MARKER_WIDTH = 10;
const ARROW_MARKER_HEIGHT = 8;

interface GraphDefsProps {
  appearanceCss: string;
}

export default function GraphDefs({ appearanceCss }: GraphDefsProps) {
  return (
    <defs>
      <style>{appearanceCss}</style>
      <marker
        id="arrowhead"
        viewBox={`0 0 ${ARROW_MARKER_WIDTH} ${ARROW_MARKER_HEIGHT}`}
        orient="auto"
        markerUnits="userSpaceOnUse"
        markerWidth={ARROW_MARKER_WIDTH}
        markerHeight={ARROW_MARKER_HEIGHT}
        refX={ARROW_MARKER_WIDTH - 0.4}
        refY={ARROW_MARKER_HEIGHT / 2}
      >
        <path d={`M 0 0 L ${ARROW_MARKER_WIDTH} ${ARROW_MARKER_HEIGHT / 2} L 0 ${ARROW_MARKER_HEIGHT} z`} fill="context-stroke" />
      </marker>
      <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" />
      </filter>
    </defs>
  );
}
