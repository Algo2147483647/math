import { useCanvas } from './useCanvas';
import { SelectionOverlay } from './SelectionOverlay';

export function Canvas() {
  const {
    viewport,
    svg,
    artwork,
    doc,
    view,
    selected,
    marquee,
    anchors,
    panning,
    previewD,
    pointerDown,
    pointerMove,
    pointerUp,
    cancel,
    doubleClick,
    drop,
  } = useCanvas();
  return (
    <div
      ref={viewport}
      className={`canvas-workspace ${view.grid ? 'with-grid' : ''} tool-${view.tool} ${panning ? 'panning' : ''}`}
      tabIndex={0}
      aria-label="Canvas workspace"
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={cancel}
      onDoubleClick={doubleClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={drop}
    >
      <div
        className="artboard-stage"
        style={{
          width: doc.canvas.width * view.zoom,
          height: doc.canvas.height * view.zoom,
          transform: `translate(-50%,-50%) translate(${view.pan[0]}px,${view.pan[1]}px)`,
        }}
      >
        <div className="artboard-caption">
          <span>ARTBOARD 01</span>
          <span>
            {doc.canvas.width} × {doc.canvas.height}
          </span>
        </div>
        <svg
          id="artboard"
          ref={svg}
          width="100%"
          height="100%"
          viewBox={`0 0 ${doc.canvas.width} ${doc.canvas.height}`}
          aria-label="SVG canvas"
          style={{
            background: doc.canvas.background === 'transparent' ? undefined : doc.canvas.background,
          }}
        >
          <defs dangerouslySetInnerHTML={{ __html: doc.sharedDefs }} />
          <g ref={artwork} id="artworkLayer" />
          <SelectionOverlay elements={selected} view={view} marquee={marquee} />
          {anchors.length > 0 && (
            <g className="path-draft">
              <path d={previewD} />
              {anchors.map((a, i) => (
                <g key={i}>
                  {view.tool === 'bezier' && (
                    <>
                      <line
                        x1={a.incoming[0]}
                        y1={a.incoming[1]}
                        x2={a.outgoing[0]}
                        y2={a.outgoing[1]}
                      />
                      <circle cx={a.outgoing[0]} cy={a.outgoing[1]} r={4 / view.zoom} />
                    </>
                  )}
                  <circle cx={a.p[0]} cy={a.p[1]} r={4 / view.zoom} />
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>
      <div className="canvas-hint">
        <span className="hint-dot" />
        {view.tool === 'bezier'
          ? 'Click-drag anchors to shape a curve · Enter to finish'
          : view.tool === 'polyline'
            ? 'Click to add points · Enter or double-click to finish'
            : view.tool === 'node'
              ? 'Drag nodes or handles · Double-click a segment to add a node'
              : view.tool === 'select'
                ? 'Drag to select · Space to pan'
                : view.tool === 'hand'
                  ? 'Drag to pan · Ctrl + scroll to zoom'
                  : 'Drag to draw · Hold Shift to constrain'}
      </div>
    </div>
  );
}
