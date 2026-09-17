import { useEffect, useRef, useState } from 'react';
import { useEditor } from '../model/context';
import { exportDocument, serializeSvg } from '../svg/export';
import { Icon } from './Icon';
export function Dialogs() {
  const { store, view, document: doc } = useEditor(),
    [format, setFormat] = useState<'svg' | 'png'>('svg'),
    [scale, setScale] = useState(2),
    [busy, setBusy] = useState(false),
    ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!view.modal) return;
    const previous = document.activeElement as HTMLElement;
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => previous?.focus();
  }, [view.modal]);
  if (!view.modal) return null;
  return (
    <div
      className="modal-backdrop"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) store.setView({ modal: null });
      }}
    >
      <div
        ref={ref}
        className="dialog glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            store.setView({ modal: null });
          }
          if (e.key === 'Tab') {
            const fields = [
                ...ref.current!.querySelectorAll<HTMLElement>(
                  'button:not(:disabled),select,a,input',
                ),
              ],
              i = fields.indexOf(document.activeElement as HTMLElement);
            if ((e.shiftKey && i === 0) || (!e.shiftKey && i === fields.length - 1)) {
              e.preventDefault();
              fields[e.shiftKey ? fields.length - 1 : 0]?.focus();
            }
          }
        }}
      >
        <div className="dialog-header">
          <div>
            <span className="eyebrow">
              {view.modal === 'export' ? 'READY WHEN YOU ARE' : 'A FASTER FLOW'}
            </span>
            <h2 id="dialog-title">
              {view.modal === 'export' ? 'Export your artwork' : 'Keyboard shortcuts'}
            </h2>
          </div>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={() => store.setView({ modal: null })}
          >
            <Icon name="close" />
          </button>
        </div>
        {view.modal === 'export' ? (
          <>
            <div
              className="export-preview"
              dangerouslySetInnerHTML={{ __html: serializeSvg(doc).replace(/<\?xml[^>]*\?>/, '') }}
            />
            <div className="export-formats">
              {(['svg', 'png'] as const).map((f) => (
                <button
                  key={f}
                  className={format === f ? 'active' : ''}
                  onClick={() => setFormat(f)}
                >
                  <strong>{f.toUpperCase()}</strong>
                  <span>{f === 'svg' ? 'Scalable vector' : 'Raster image'}</span>
                  {format === f && <Icon name="check" size={17} />}
                </button>
              ))}
            </div>
            {format === 'png' && (
              <label className="select-field export-scale">
                <span>Resolution</span>
                <select
                  aria-label="PNG scale"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}× · {doc.canvas.width * n} × {doc.canvas.height * n}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="dialog-actions">
              <button
                className="button secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(serializeSvg(doc));
                    store.notify('SVG copied to clipboard');
                  } catch {
                    store.notify('Clipboard unavailable · download the SVG instead');
                  }
                }}
              >
                Copy SVG code
              </button>
              <button
                className="button primary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await exportDocument(doc, format, scale);
                    store.notify(`${format.toUpperCase()} download started`);
                  } catch (e) {
                    store.notify(e instanceof Error ? e.message : 'Export failed');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Icon name="export" size={16} />
                {busy ? 'Rendering…' : `Download ${format.toUpperCase()}`}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="muted">Use Command instead of Ctrl on macOS.</p>
            <div className="shortcuts-list">
              {[
                ['Select / Edit nodes', 'V / N'],
                ['Rectangle / Ellipse / Line', 'R / O / L'],
                ['Polyline / Bézier / Text', 'P / B / T'],
                ['Pan', 'Space + drag'],
                ['Add to selection', 'Shift + click / drag'],
                ['Finish path / Edit nodes', 'Enter'],
                ['Cancel / Exit node editing', 'Esc'],
                ['Insert a node', 'Double-click segment'],
                ['Delete selected node', 'Delete in node mode'],
                ['Independent curve handle', 'Alt + drag'],
                ['Group / Ungroup', 'Ctrl G / Ctrl Shift G'],
                ['Undo / Redo', 'Ctrl Z / Ctrl Shift Z'],
                ['Duplicate', 'Ctrl D'],
                ['Copy / Cut / Paste', 'Ctrl C / X / V'],
                ['Nudge / Large nudge', 'Arrow / Shift Arrow'],
                ['Fit artboard', '1'],
                ['Export', 'Ctrl S'],
              ].map(([label, key]) => (
                <div key={label}>
                  <span>{label}</span>
                  <kbd>{key}</kbd>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
