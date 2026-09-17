import { useState } from 'react';
import { useEditor } from '../model/context';
import { Icon } from './Icon';

export function Layers() {
  const { store, document: doc, view } = useEditor(),
    [renaming, setRenaming] = useState<string | null>(null),
    [dragged, setDragged] = useState<string | null>(null);
  return (
    <div className="layers">
      <div className="layers-caption">
        <span>Front to back</span>
        <button className="text-button" onClick={() => store.selectAll()}>
          Select all
        </button>
      </div>
      {doc.elements.length === 0 && <p className="muted">Your layers will appear here.</p>}
      {[...doc.elements].reverse().map((e) => (
        <div
          key={e.id}
          data-layer-id={e.id}
          className={`layer-row ${view.selectedIds.includes(e.id) ? 'selected' : ''} ${e.hidden ? 'dimmed' : ''}`}
          draggable={!renaming}
          onDragStart={() => setDragged(e.id)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (!dragged || dragged === e.id) return;
            store.change((d) => {
              const from = d.elements.findIndex((x) => x.id === dragged),
                to = d.elements.findIndex((x) => x.id === e.id);
              const [item] = d.elements.splice(from, 1);
              d.elements.splice(to, 0, item);
            });
            setDragged(null);
          }}
          onClick={(event) => {
            if (!(event.target as Element).closest('button,input'))
              event.shiftKey ? store.toggleSelection(e.id) : store.select([e.id]);
          }}
        >
          <span className="layer-icon">
            <Icon name={e.type} size={18} />
          </span>
          {renaming === e.id ? (
            <input
              aria-label="Layer name"
              autoFocus
              defaultValue={e.name}
              onBlur={(event) => {
                const name = event.currentTarget.value.trim();
                if (name)
                  store.change((d) => {
                    d.elements.find((x) => x.id === e.id)!.name = name;
                  });
                setRenaming(null);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.currentTarget.blur();
              }}
            />
          ) : (
            <button
              className="layer-name"
              onClick={(event) => {
                event.shiftKey ? store.toggleSelection(e.id) : store.select([e.id]);
              }}
              onDoubleClick={() => setRenaming(e.id)}
              title="Double-click to rename"
            >
              {e.name}
              {e.type === 'group' && <small>{e.children?.length} layers</small>}
            </button>
          )}
          <button
            className="icon-button"
            title={e.hidden ? 'Show layer' : 'Hide layer'}
            aria-label={`${e.hidden ? 'Show' : 'Hide'} ${e.name}`}
            onClick={() =>
              store.change((d) => {
                d.elements.find((x) => x.id === e.id)!.hidden = !e.hidden;
              })
            }
          >
            <Icon name={e.hidden ? 'hidden' : 'eye'} size={15} />
          </button>
          <button
            className={`icon-button layer-lock ${e.locked ? 'is-locked' : ''}`}
            title={e.locked ? 'Unlock layer' : 'Lock layer'}
            aria-label={`${e.locked ? 'Unlock' : 'Lock'} ${e.name}`}
            onClick={() =>
              store.change((d) => {
                d.elements.find((x) => x.id === e.id)!.locked = !e.locked;
              })
            }
          >
            <Icon name={e.locked ? 'lock' : 'unlock'} size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
