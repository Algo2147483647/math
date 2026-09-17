import { useRef } from 'react';
import { useEditor } from '../model/context';
import { parseSvg } from '../svg/import';
import { Icon } from './Icon';
import { ViewControls } from './ViewControls';
export function Topbar() {
  const { store, document: doc, view, canUndo, canRedo } = useEditor(),
    file = useRef<HTMLInputElement>(null);
  return (
    <header className="topbar glass">
      <a
        className="brand"
        href="#"
        onClick={(e) => e.preventDefault()}
        aria-label="Vectora SVG Studio"
      >
        <span className="brand-mark">
          <svg viewBox="0 0 32 32">
            <path d="m6 7 10 20L26 7h-7l-3 8-3-8Z" fill="currentColor" />
          </svg>
        </span>
        <span>
          vectora<span className="brand-caption">SVG STUDIO</span>
        </span>
      </a>
      <span className="divider" />
      <div className="document-heading">
        <input
          aria-label="Document title"
          value={doc.title}
          onChange={(e) =>
            store.preview((d) => {
              d.title = e.target.value;
            })
          }
          onBlur={() => store.commit()}
        />
        <span className={`save-status ${view.saveStatus}`}>
          <i />
          {view.saveStatus === 'saved'
            ? 'Saved locally'
            : view.saveStatus === 'saving'
              ? 'Saving…'
              : 'Storage full · export a copy'}
        </span>
      </div>
      <ViewControls />
      <div className="history-actions">
        <button
          className="icon-button"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
          disabled={!canUndo}
          onClick={() => store.undo()}
        >
          <Icon name="undo" />
        </button>
        <button
          className="icon-button"
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
          disabled={!canRedo}
          onClick={() => store.redo()}
        >
          <Icon name="redo" />
        </button>
      </div>
      <span className="divider" />
      <div className="top-actions">
        <button
          className={`icon-button ${view.leftPanel ? 'active-subtle' : ''}`}
          title="Toggle library"
          aria-label="Toggle library"
          aria-pressed={view.leftPanel}
          onClick={() => store.setView({ leftPanel: !view.leftPanel })}
        >
          <Icon name="leftPanel" />
        </button>
        <button
          className={`icon-button ${view.rightPanel ? 'active-subtle' : ''}`}
          title="Toggle inspector"
          aria-label="Toggle inspector"
          aria-pressed={view.rightPanel}
          onClick={() => store.setView({ rightPanel: !view.rightPanel })}
        >
          <Icon name="rightPanel" />
        </button>
        <button className="button quiet" onClick={() => file.current?.click()}>
          <Icon name="import" size={17} />
          <span>Import</span>
        </button>
        <button className="button primary" onClick={() => store.setView({ modal: 'export' })}>
          <Icon name="export" size={17} />
          <span>Export</span>
        </button>
      </div>
      <input
        ref={file}
        type="file"
        accept=".svg,image/svg+xml"
        hidden
        onChange={async (e) => {
          const input = e.currentTarget,
            f = input.files?.[0];
          input.value = '';
          if (!f) return;
          try {
            store.setDocument(await parseSvg(await f.text(), f.name.replace(/\.svg$/i, '')));
            store.notify('SVG imported as editable layers');
          } catch (error) {
            store.notify(error instanceof Error ? error.message : 'Unable to import SVG');
          }
        }}
      />
    </header>
  );
}
