import { useRef, useState } from 'react';
import { useEditor } from '../model/context';
import { palettes, typeNames } from '../model/elements';
import { templates } from '../model/templates';
import { blankDocument } from '../model/storage';
import { clone } from '../model/utils';
import type { ElementType } from '../model/types';
import { Icon } from './Icon';
const shapes: ElementType[] = [
  'rect',
  'circle',
  'ellipse',
  'triangle',
  'diamond',
  'polygon',
  'star',
  'line',
  'arrow',
  'arc',
  'polyline',
  'bezier',
  'text',
  'image',
];
export function Library() {
  const { store, view } = useEditor(),
    [query, setQuery] = useState(''),
    [palette, setPalette] = useState(0),
    file = useRef<HTMLInputElement>(null);
  return (
    <aside
      className={`library panel glass ${!view.leftPanel ? 'collapsed' : ''}`}
      aria-label="Library"
      inert={!view.leftPanel}
    >
      <div className="panel-header">
        <div>
          <span className="eyebrow">YOUR TOOLBOX</span>
          <h2>Library</h2>
        </div>
        <button
          className="icon-button"
          title="New blank document"
          aria-label="New blank document"
          onClick={() => {
            store.newDocument();
            store.notify('New document created · Undo to restore');
          }}
        >
          <Icon name="plus" />
        </button>
      </div>
      <nav className="segmented" aria-label="Library tabs">
        {(['shapes', 'templates'] as const).map((tab) => (
          <button
            key={tab}
            className={view.assetTab === tab ? 'active' : ''}
            onClick={() => store.setView({ assetTab: tab })}
          >
            {tab === 'shapes' ? 'Elements' : 'Templates'}
          </button>
        ))}
      </nav>
      <div className="panel-scroll">
        {view.assetTab === 'shapes' ? (
          <>
            <label className="search-field">
              <Icon name="search" size={17} />
              <input
                aria-label="Search elements"
                placeholder="Search elements…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button onClick={() => setQuery('')} aria-label="Clear search">
                  <Icon name="close" size={14} />
                </button>
              )}
            </label>
            <div className="section-title">
              <h3>Shapes & paths</h3>
              <span>{shapes.length}</span>
            </div>
            <div className="shape-grid">
              {shapes
                .filter((type) => typeNames[type][0].toLowerCase().includes(query.toLowerCase()))
                .map((type) => (
                  <button
                    key={type}
                    className="shape-card"
                    onClick={() => (type === 'image' ? file.current?.click() : store.add(type))}
                    title={`Add ${typeNames[type][0]}`}
                    aria-label={`Add ${typeNames[type][0]}`}
                  >
                    <Icon name={type} size={28} />
                    <span>
                      {type === 'rect'
                        ? 'Rectangle'
                        : type === 'bezier'
                          ? 'Bézier'
                          : typeNames[type][0]}
                    </span>
                  </button>
                ))}
            </div>
            {!shapes.some((type) =>
              typeNames[type][0].toLowerCase().includes(query.toLowerCase()),
            ) && <p className="muted">No matching shapes.</p>}
            <div className="section-title">
              <h3>Symbols</h3>
              <span>06</span>
            </div>
            <div className="symbol-grid">
              {['heart', 'bolt', 'sparkle', 'leaf', 'wave', 'arrow']
                .filter((name) => name.includes(query.toLowerCase()))
                .map((name) => (
                  <button
                    key={name}
                    aria-label={`Add ${name} symbol`}
                    title={name}
                    onClick={() =>
                      store.add('icon', {
                        icon: name,
                        name: `${name[0].toUpperCase() + name.slice(1)} symbol`,
                      })
                    }
                  >
                    <Icon name={name} />
                  </button>
                ))}
            </div>
            <div className="section-title">
              <h3>Color stories</h3>
              <button
                className="text-button"
                onClick={() => setPalette((palette + 1) % palettes.length)}
              >
                Shuffle
              </button>
            </div>
            <div className="palettes">
              {[0, 1, 2].map((offset) => (
                <div className="palette" key={offset}>
                  {palettes[(palette + offset) % palettes.length].map((color) => (
                    <button
                      key={color}
                      style={{ background: color }}
                      title={`Apply ${color}`}
                      aria-label={`Apply ${color}`}
                      onClick={() => {
                        if (store.selected.length) store.update({ fill: color });
                        else
                          store.change((d) => {
                            d.canvas.background = color;
                          });
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="templates">
            <p className="muted">
              A starting point for your next idea. Every layer is yours to edit.
            </p>
            {Object.entries(templates).map(([name, t]) => (
              <button
                className={`template-card ${name}`}
                key={name}
                onClick={() => {
                  store.setDocument({
                    ...blankDocument(),
                    title:
                      name === 'social'
                        ? 'Social launch'
                        : name === 'poster'
                          ? 'Edition 04'
                          : 'Vectora mark',
                    canvas: { width: t.width, height: t.height, background: 'transparent' },
                    elements: clone(t.elements),
                  });
                  store.notify('Template applied · Undo to restore');
                }}
              >
                <div className="template-art">
                  <span>
                    {name === 'social' ? (
                      <>
                        Build
                        <br />
                        beautiful.
                      </>
                    ) : name === 'poster' ? (
                      <>
                        NO.
                        <br />
                        04
                      </>
                    ) : (
                      'V'
                    )}
                  </span>
                  <i />
                </div>
                <strong>
                  {name === 'social'
                    ? 'Social card'
                    : name === 'poster'
                      ? 'Art poster'
                      : 'Brand mark'}
                </strong>
                <small>
                  {t.width} × {t.height}
                </small>
              </button>
            ))}
          </div>
        )}
      </div>
      <button className="help-footer" onClick={() => store.setView({ modal: 'shortcuts' })}>
        <span className="help-circle">?</span>
        <span>
          Keyboard shortcuts<small>A little less clicking.</small>
        </span>
        <kbd>?</kbd>
      </button>
      <input
        ref={file}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              const s = Math.min(1, 420 / Math.max(img.width, img.height));
              store.add('image', {
                name: f.name,
                href: String(reader.result),
                width: img.width * s,
                height: img.height * s,
              });
            };
            img.onerror = () => store.notify('Unable to read image');
            img.src = String(reader.result);
          };
          reader.readAsDataURL(f);
        }}
      />
    </aside>
  );
}
