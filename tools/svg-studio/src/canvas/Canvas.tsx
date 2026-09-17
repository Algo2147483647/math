import { InlineTextEditor } from './InlineTextEditor';
import { useCanvas } from './useCanvas';
import { SelectionOverlay } from './SelectionOverlay';
import { SnapOverlay } from './SnapOverlay';

export function Canvas() {
  const {
    viewport,
    svg,
    artwork,
    doc,
    view,
    selected,
    marquee,
    snapGuides,
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
  const gridStep = view.gridSize * Math.max(1, Math.ceil(5 / (view.gridSize * view.zoom)));
  return (
    <div
      ref={viewport}
      className={`canvas-workspace ${view.grid ? 'with-grid' : ''} tool-${view.tool} ${panning ? 'panning' : ''}`}
      style={
        view.grid
          ? {
              backgroundSize: `${view.gridSize * view.zoom * Math.max(1, Math.ceil(5 / (view.gridSize * view.zoom)))}px ${view.gridSize * view.zoom * Math.max(1, Math.ceil(5 / (view.gridSize * view.zoom)))}px`,
              backgroundPosition: `calc(50% + ${view.pan[0] - (doc.canvas.width * view.zoom) / 2}px) calc(50% + ${view.pan[1] - (doc.canvas.height * view.zoom) / 2}px)`,
              backgroundImage:
                view.gridStyle === 'dots'
                  ? 'radial-gradient(circle at 0 0, #849ab85c 1px, transparent 1.5px)'
                  : 'linear-gradient(to right,#849ab827 1px,transparent 1px),linear-gradient(to bottom,#849ab827 1px,transparent 1px)',
            }
          : undefined
      }
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
            background: doc.canvas.background === 'transparent' ? '#ffffff' : doc.canvas.background,
          }}
        >
          <defs dangerouslySetInnerHTML={{ __html: doc.sharedDefs }} />
          {view.grid && (
            <>
              <defs>
                <pattern
                  id="workspace-grid"
                  width={gridStep}
                  height={gridStep}
                  patternUnits="userSpaceOnUse"
                >
                  {view.gridStyle === 'dots' ? (
                    <circle cx={0} cy={0} r={0.65 / view.zoom} fill="#93a4bb" opacity=".32" />
                  ) : (
                    <path
                      d={`M ${gridStep} 0 H 0 V ${gridStep}`}
                      fill="none"
                      stroke="#93a4bb"
                      strokeWidth={0.6 / view.zoom}
                      opacity=".25"
                    />
                  )}
                </pattern>
              </defs>
              <rect
                width={doc.canvas.width}
                height={doc.canvas.height}
                fill="url(#workspace-grid)"
                pointerEvents="none"
              />
            </>
          )}
          <g ref={artwork} id="artworkLayer" />
          <SelectionOverlay elements={selected} view={view} marquee={marquee} />
          <SnapOverlay guides={snapGuides} zoom={view.zoom} />
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
        {view.editingTextId && <InlineTextEditor key={view.editingTextId} />}
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
                ? `Drag to select (${view.marqueeMode === 'touch' ? 'touch' : 'fully enclosed'}) · Space to pan`
                : view.tool === 'hand'
                  ? 'Drag to pan · Ctrl + scroll to zoom'
                  : 'Drag to draw · Hold Shift to constrain'}
      </div>
    </div>
  );
}
