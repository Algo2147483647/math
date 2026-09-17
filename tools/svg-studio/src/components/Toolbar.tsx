import { useEditor } from '../model/context';
import { clamp } from '../model/geometry';
import type { Tool } from '../model/types';
import { Icon } from './Icon';
export const tools: { id: Tool; label: string; key: string }[] = [
  { id: 'select', label: 'Select', key: 'V' },
  { id: 'node', label: 'Edit nodes', key: 'N' },
  { id: 'rect', label: 'Rectangle', key: 'R' },
  { id: 'ellipse', label: 'Ellipse', key: 'O' },
  { id: 'line', label: 'Line', key: 'L' },
  { id: 'polyline', label: 'Polyline', key: 'P' },
  { id: 'bezier', label: 'Bézier', key: 'B' },
  { id: 'text', label: 'Text', key: 'T' },
  { id: 'hand', label: 'Hand', key: 'H' },
];
export function Toolbar() {
  const { store, view } = useEditor();
  return (
    <>
      <div className="tool-dock glass" role="toolbar" aria-label="Drawing tools">
        {tools.map((t, i) => (
          <button
            key={t.id}
            className={`tool-button ${view.tool === t.id ? 'active' : ''} ${i === 2 || i === 8 ? 'tool-separated' : ''}`}
            title={`${t.label} (${t.key})`}
            aria-label={t.label}
            aria-pressed={view.tool === t.id}
            onClick={() => store.setView({ tool: t.id, nodeIndex: null })}
          >
            <Icon name={t.id} size={21} />
            <span className="tool-tooltip">
              {t.label}
              <kbd>{t.key}</kbd>
            </span>
          </button>
        ))}
      </div>
      <div className="view-controls glass">
        <button
          className="icon-button"
          aria-label="Workspace settings"
          title="Grid and selection settings"
          aria-expanded={view.workspaceOpen}
          onClick={() => store.setView({ workspaceOpen: !view.workspaceOpen })}
        >
          <Icon name="settings" size={16} />
        </button>
        <button
          className={`icon-button ${view.grid ? 'active-subtle' : ''}`}
          title="Toggle grid"
          aria-label="Toggle grid"
          aria-pressed={view.grid}
          onClick={() => store.setView({ grid: !view.grid })}
        >
          <Icon name="grid" size={16} />
        </button>
        <button
          className={`icon-button ${view.snap ? 'active-subtle' : ''}`}
          title="Snap to grid"
          aria-label="Snap to grid"
          aria-pressed={view.snap}
          onClick={() => store.setView({ snap: !view.snap })}
        >
          <Icon name="snap" size={16} />
        </button>
        <span className="divider" />
        <button
          className="icon-button"
          aria-label="Zoom out"
          onClick={() => store.setView({ zoom: clamp(view.zoom / 1.2, 0.08, 8) })}
        >
          <Icon name="minus" size={16} />
        </button>
        <button
          className="zoom-value"
          title="Fit artboard (1)"
          onClick={() => window.dispatchEvent(new Event('vectora:fit'))}
        >
          {Math.round(view.zoom * 100)}%
        </button>
        <button
          className="icon-button"
          aria-label="Zoom in"
          onClick={() => store.setView({ zoom: clamp(view.zoom * 1.2, 0.08, 8) })}
        >
          <Icon name="plus" size={16} />
        </button>
        <button
          className="icon-button"
          aria-label="Fit artboard"
          onClick={() => window.dispatchEvent(new Event('vectora:fit'))}
        >
          <Icon name="fit" size={16} />
        </button>
      </div>
    </>
  );
}
