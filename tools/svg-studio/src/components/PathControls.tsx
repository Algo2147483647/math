import { useEditor } from '../model/context';
import { anchorIndex } from '../model/nodes';
import type { AnchorMode } from '../model/types';
import { NumberField } from './Fields';
export function PathControls() {
  const { store, active, view } = useEditor();
  if (!active?.points) return null;
  const index = view.nodeIndex,
    anchor = index === null ? null : anchorIndex(index),
    point = index === null ? null : active.points[index];
  return (
    <div className="path-controls">
      <p className="field-help">
        Nodes are always editable when selected. Drag an anchor or handle; double-click a segment to
        add a node. Alt-drag breaks the handle link.
      </p>
      {point && (
        <div className="field-grid">
          {(['X', 'Y'] as const).map((axis, i) => (
            <NumberField
              key={axis}
              label={`Node ${axis}`}
              value={point[i]}
              unit="px"
              onChange={(v) => {
                const next: [number, number] = [...point];
                next[i] = v;
                store.moveNode(active.id, index!, next, active);
              }}
              onCommit={() => store.commit()}
            />
          ))}
        </div>
      )}
      {active.type === 'bezier' && (
        <div className="node-modes" role="group" aria-label="Anchor type">
          {(['corner', 'smooth', 'symmetric'] as AnchorMode[]).map((mode) => (
            <button
              key={mode}
              className={
                anchor !== null && (active.anchorModes?.[anchor] || 'smooth') === mode
                  ? 'active'
                  : ''
              }
              disabled={index === null}
              onClick={() => store.setNodeMode(mode)}
            >
              {mode[0].toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      )}
      <div className="button-pair">
        <button className="button secondary" onClick={() => store.insertNode()}>
          Add node
        </button>
        <button
          className="button secondary"
          onClick={() => store.removeNode()}
          disabled={
            index === null ||
            (active.type === 'bezier'
              ? active.points.length <= 4 || index % 3 !== 0
              : active.points.length <= 2)
          }
        >
          Delete node
        </button>
      </div>
      <button className="button secondary full" onClick={() => store.convertSelectedPath()}>
        {active.type === 'bezier' ? 'Convert to polyline' : 'Convert to Bézier'}
      </button>
    </div>
  );
}
