import { useRef, useState } from 'react';
import { useEditor } from '../model/context';
import { fontFamilies, loadFont } from '../model/fonts';
import { uid } from '../model/utils';
import { SelectField } from './Fields';
import type { EmbeddedFont } from '../model/types';
export function FontPicker() {
  const { store, active, document: doc } = useEditor(),
    [category, setCategory] = useState('All fonts'),
    [query, setQuery] = useState(''),
    file = useRef<HTMLInputElement>(null);
  const system = Object.entries(fontFamilies)
    .filter(([name]) => category === 'All fonts' || category === name)
    .flatMap(([, names]) => names.map((name) => ({ name, family: `"${name}"` })));
  const options = [...(doc.fonts || []), ...system].filter((font) =>
    font.name.toLowerCase().includes(query.toLowerCase()),
  );
  if (!active) return null;
  return (
    <div className="font-picker">
      <div className="field-grid">
        <SelectField
          label="Font category"
          value={category}
          options={['All fonts', ...Object.keys(fontFamilies)]}
          onChange={setCategory}
        />
        <label className="text-field">
          <span>Find a font</span>
          <input
            aria-label="Search fonts"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <label className="select-field">
        <span>Font family</span>
        <select
          aria-label="Font family"
          style={{ fontFamily: active.fontFamily }}
          value={active.fontFamily}
          onChange={(e) => store.update({ fontFamily: e.target.value })}
        >
          {!options.some((f) => f.family === active.fontFamily) && (
            <option value={active.fontFamily}>
              {doc.fonts?.find((f) => f.family === active.fontFamily)?.name ||
                active.fontFamily?.split(',')[0].replaceAll('"', '')}
            </option>
          )}
          {options.map((f) => (
            <option key={f.family} value={f.family} style={{ fontFamily: f.family }}>
              {f.name}
            </option>
          ))}
        </select>
      </label>
      <div className="font-preview" style={{ fontFamily: active.fontFamily }}>
        Aa Bb Cc &amp; 0123
      </div>
      <label className="text-field">
        <span>Custom font family</span>
        <input
          aria-label="Custom font family"
          key={active.id + active.fontFamily}
          defaultValue={active.fontFamily}
          onBlur={(e) => {
            if (e.target.value.trim() && e.target.value !== active.fontFamily)
              store.update({ fontFamily: e.target.value.trim() });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
        />
      </label>
      <button className="button secondary full" onClick={() => file.current?.click()}>
        Import font file
      </button>
      <p className="field-help">
        System fonts use your installed typefaces. Import a TTF, OTF, WOFF or WOFF2 to save and
        embed it with this document.
      </p>
      <input
        ref={file}
        type="file"
        aria-label="Import font file"
        accept=".ttf,.otf,.woff,.woff2"
        hidden
        onChange={async (event) => {
          const f = event.target.files?.[0];
          event.target.value = '';
          if (!f) return;
          if (!/\.(ttf|otf|woff2?)$/i.test(f.name)) {
            store.notify('Choose a TTF, OTF, WOFF or WOFF2 font');
            return;
          }
          if (f.size > 8_000_000) {
            store.notify('Choose a font smaller than 8 MB');
            return;
          }
          const id = uid(),
            font: EmbeddedFont = {
              id,
              name: f.name.replace(/\.[^.]+$/, ''),
              family: `Vectora_${id}`,
              data: '',
            };
          try {
            font.data = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () => reject(new Error('Font file could not be read'));
              reader.readAsDataURL(f);
            });
            await loadFont(font);
            store.change((d) => {
              d.fonts = [...(d.fonts || []), font];
              const e = d.elements.find((e) => e.id === active.id);
              if (e && !e.locked) e.fontFamily = font.family;
            });
            store.notify('Font imported and saved with this document');
          } catch {
            store.notify('This font could not be loaded');
          }
        }}
      />
    </div>
  );
}
