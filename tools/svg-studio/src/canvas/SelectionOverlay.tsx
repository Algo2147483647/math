import { elementTransform, isNodeEditable, localBounds, selectionBounds } from '../model/geometry';
import type { Bounds, EditorView, Point, StudioElement } from '../model/types';

const handles: Record<string, Point> = {
  nw: [0, 0],
  n: [0.5, 0],
  ne: [1, 0],
  e: [1, 0.5],
  se: [1, 1],
  s: [0.5, 1],
  sw: [0, 1],
  w: [0, 0.5],
};
export function SelectionOverlay({
  elements,
  view,
  marquee,
}: {
  elements: StudioElement[];
  view: EditorView;
  marquee: Bounds | null;
}) {
  const size = 8 / view.zoom;
  return (
    <g id="selectionLayer">
      {elements
        .filter((e) => !e.hidden)
        .map((e) => (
          <g key={e.id} transform={elementTransform(e)}>
            <rect
              {...localBounds(e)}
              className={`selection-outline ${elements.length > 1 ? 'secondary' : ''}`}
            />
            {elements.length === 1 &&
              !e.locked &&
              (view.tool === 'node' && isNodeEditable(e) ? (
                <>
                  {e.type === 'bezier' &&
                    e.points?.map((p, i) =>
                      i % 3 === 0 ? null : (
                        <line
                          key={`guide-${i}`}
                          x1={p[0]}
                          y1={p[1]}
                          x2={e.points![i % 3 === 1 ? i - 1 : i + 1][0]}
                          y2={e.points![i % 3 === 1 ? i - 1 : i + 1][1]}
                          className="node-guide"
                        />
                      ),
                    )}
                  {e.points?.map(([x, y], i) =>
                    e.type === 'bezier' && i % 3 !== 0 ? (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={5 / view.zoom}
                        data-node-index={i}
                        className={`node-handle control ${view.nodeIndex === i ? 'selected' : ''}`}
                      />
                    ) : (
                      <rect
                        key={i}
                        x={x - size / 2}
                        y={y - size / 2}
                        width={size}
                        height={size}
                        rx={1.5 / view.zoom}
                        data-node-index={i}
                        className={`node-handle ${view.nodeIndex === i ? 'selected' : ''}`}
                      />
                    ),
                  )}
                </>
              ) : (
                Object.entries(handles).map(([name, [x, y]]) => (
                  <rect
                    key={name}
                    data-handle={name}
                    x={x * e.width - size / 2}
                    y={y * e.height - size / 2}
                    width={size}
                    height={size}
                    rx={1 / view.zoom}
                    className="resize-handle"
                  />
                ))
              ))}
          </g>
        ))}
      {elements.length > 1 && (
        <rect {...selectionBounds(elements)} className="selection-outline collective" />
      )}
      {marquee && <rect {...marquee} className="marquee" />}
    </g>
  );
}
