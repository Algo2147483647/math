import { useEditor } from '../model/context';
import type { Tool } from '../model/types';
import { Icon } from './Icon';
export const tools: { id: Tool; label: string; key: string }[] = [
  { id: 'select', label: 'Select', key: 'V' },
  { id: 'node', label: 'Edit nodes', key: 'N' },
  { id: 'rect', label: 'Rectangle', key: 'R' },
  { id: 'ellipse', label: 'Ellipse', key: 'O' },
  { id: 'line', label: 'Line', key: 'L' },
  { id: 'arrow', label: 'Arrow', key: 'A' },
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
            className={`tool-button ${view.tool === t.id ? 'active' : ''} ${i === 2 || i === 9 ? 'tool-separated' : ''}`}
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
    </>
  );
}
