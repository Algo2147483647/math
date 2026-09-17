import { elementTransform, isNodeEditable, localBounds, selectionBounds } from '../model/geometry';
import { ShapeHandles } from './ShapeHandles';
import { GradientOverlay } from './GradientOverlay';
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
              (isNodeEditable(e) && !view.gradientEdit ? (
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
                  {e.type === 'bezier' &&
                    e.points?.map(([x, y], i) =>
                      i % 3 !== 0 ? (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r={5 / view.zoom}
                          data-node-index={i}
                          className={`node-handle control ${view.nodeIndex === i ? 'selected' : ''}`}
                        />
                      ) : null,
                    )}
                  {/* Anchors stay above coincident control handles on sharp corners. */}
                  {e.points?.map(([x, y], i) =>
                    e.type !== 'bezier' || i % 3 === 0 ? (
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
                    ) : null,
                  )}
                </>
              ) : null)}
            {elements.length === 1 && !e.locked && (
              <>
                <ShapeHandles element={e} zoom={view.zoom} />
                <line
                  x1={e.width / 2}
                  y1={-14 / view.zoom}
                  x2={e.width / 2}
                  y2={-34 / view.zoom}
                  className="rotation-guide"
                />
                <circle
                  cx={e.width / 2}
                  cy={-34 / view.zoom}
                  r={6 / view.zoom}
                  className="rotation-handle"
                  data-rotate="true"
                >
                  <title>Drag to rotate · Shift snaps to 15°</title>
                </circle>
                {Object.entries(handles).map(([name, [x, y]]) => {
                  const pad = isNodeEditable(e) ? 14 / view.zoom : 0;
                  return (
                    <rect
                      key={name}
                      data-handle={name}
                      x={-pad + x * (e.width + 2 * pad) - size / 2}
                      y={-pad + y * (e.height + 2 * pad) - size / 2}
                      width={size}
                      height={size}
                      rx={1 / view.zoom}
                      className="resize-handle"
                    />
                  );
                })}
                {view.gradientEdit && (
                  <GradientOverlay element={e} kind={view.gradientEdit} zoom={view.zoom} />
                )}
              </>
            )}
          </g>
        ))}
      {elements.length > 1 && (
        <g>
          <rect {...selectionBounds(elements)} className="selection-outline collective" />
          {Object.entries(handles)
            .filter(([name]) => name.length === 2)
            .map(([name, [x, y]]) => {
              const b = selectionBounds(elements);
              return (
                <rect
                  key={name}
                  x={b.x + x * b.width - size / 2}
                  y={b.y + y * b.height - size / 2}
                  width={size}
                  height={size}
                  data-multi-handle={name}
                  className="resize-handle"
                />
              );
            })}
        </g>
      )}
      {marquee && <rect {...marquee} className="marquee" />}
    </g>
  );
}
