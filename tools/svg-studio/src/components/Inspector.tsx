import { useEditor } from '../model/context';
import { isNodeEditable, selectionBounds } from '../model/geometry';
import type { StudioElement } from '../model/types';
import { NumberField, SelectField } from './Fields';
import { Icon } from './Icon';
import { FontPicker } from './FontPicker';
import { PathControls } from './PathControls';
import { Layers } from './Layers';
import { Paint } from './PaintControl';
import { Section } from './InspectorSection';
import { CanvasSettings } from './CanvasSettings';
import { readImportedText, writeImportedText } from '../svg/text';

export function Inspector() {
  const { store, view, document: doc, selected, active } = useEditor();
  const single = selected.length === 1,
    locked = selected.length > 0 && selected.every((e) => e.locked);
  const common = (key: keyof StudioElement, fallback: number | string = ''): number | string => {
    const first = selected[0]?.[key] ?? fallback;
    return selected.every((e) => (e[key] ?? fallback) === first) ? (first as number | string) : '';
  };
  const number = (
    label: string,
    key: keyof StudioElement,
    min?: number,
    max?: number,
    unit?: string,
  ) => (
    <NumberField
      label={label}
      value={common(key, 0)}
      min={min}
      max={max}
      unit={unit}
      onChange={(n) => store.update({ [key]: n }, false)}
      onCommit={() => store.commit()}
    />
  );
  const selector = (
    label: string,
    key: keyof StudioElement,
    options: (string | [string, string])[],
    fallback = '',
  ) => (
    <SelectField
      label={label}
      value={String(common(key, fallback))}
      options={options}
      onChange={(v) => store.update({ [key]: v })}
    />
  );
  return (
    <aside
      className={`inspector panel glass ${!view.rightPanel ? 'collapsed' : ''}`}
      aria-label="Inspector"
      inert={!view.rightPanel}
    >
      <div className="panel-header">
        <div>
          <span className="eyebrow">MAKE IT YOURS</span>
          <h2>Inspector</h2>
        </div>
        <span className="count-badge">{doc.elements.length}</span>
      </div>
      <nav className="segmented" aria-label="Inspector tabs">
        <button
          className={view.inspectorTab === 'design' ? 'active' : ''}
          onClick={() => store.setView({ inspectorTab: 'design' })}
        >
          Design
        </button>
        <button
          className={view.inspectorTab === 'layers' ? 'active' : ''}
          onClick={() => store.setView({ inspectorTab: 'layers' })}
        >
          Layers <span>{doc.elements.length}</span>
        </button>
      </nav>
      <div className="panel-scroll inspector-scroll">
        {view.inspectorTab === 'layers' ? (
          <Layers />
        ) : !active ? (
          <CanvasSettings />
        ) : (
          <>
            <div className="selection-heading">
              <span className="selected-icon">
                <Icon name={single ? active.type : 'group'} />
              </span>
              <div>
                <strong>{single ? active.name : `${selected.length} layers selected`}</strong>
                <small>
                  {single
                    ? active.type === 'bezier'
                      ? 'BÉZIER CURVE'
                      : active.type.toUpperCase()
                    : 'MULTIPLE SELECTION'}
                </small>
              </div>
              <button
                className="icon-button"
                aria-label={locked ? 'Unlock selection' : 'Lock selection'}
                title={locked ? 'Unlock selection' : 'Lock selection'}
                onClick={() => store.toggleLock()}
              >
                <Icon name={locked ? 'lock' : 'unlock'} size={17} />
              </button>
            </div>
            {locked && (
              <div className="locked-notice">This layer is locked. Unlock it to edit.</div>
            )}
            <fieldset disabled={locked} className="properties-fieldset">
              {single && active.type === 'raw' && active.rawTag === 'text' && (
                <Section title="Imported text">
                  <label className="text-field">
                    <span>Content</span>
                    <textarea
                      aria-label="Imported text content"
                      value={readImportedText(active.raw || '')}
                      onChange={(e) =>
                        store.update(
                          { raw: writeImportedText(active.raw || '', e.target.value) },
                          false,
                        )
                      }
                      onBlur={() => store.commit()}
                    />
                  </label>
                </Section>
              )}
              {single ? (
                <Section
                  title="Transform"
                  extra={
                    <button className="text-button" onClick={() => store.update({ rotation: 0 })}>
                      Reset angle
                    </button>
                  }
                >
                  <div className="field-grid">
                    {number('Position X', 'x', undefined, undefined, 'px')}
                    {number('Position Y', 'y', undefined, undefined, 'px')}
                    {number('Width', 'width', 1, undefined, 'px')}
                    {number('Height', 'height', 1, undefined, 'px')}
                    {number('Rotation', 'rotation', undefined, undefined, '°')}
                    <NumberField
                      label="Opacity"
                      value={
                        common('opacity') === '' ? '' : Math.round(Number(common('opacity')) * 100)
                      }
                      min={0}
                      max={100}
                      unit="%"
                      onChange={(n) => store.update({ opacity: n / 100 }, false)}
                      onCommit={() => store.commit()}
                    />
                  </div>
                  <label className="toggle-row">
                    <span>Keep aspect ratio</span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={view.keepRatio}
                      onChange={(e) => store.setView({ keepRatio: e.target.checked })}
                    />
                  </label>
                  <div className="button-pair">
                    <button className="button secondary" onClick={() => store.flip('horizontal')}>
                      Flip horizontal
                    </button>
                    <button className="button secondary" onClick={() => store.flip('vertical')}>
                      Flip vertical
                    </button>
                  </div>
                </Section>
              ) : (
                <Section title="Selection">
                  <div className="selection-size">
                    {Math.round(selectionBounds(selected).width)} ×{' '}
                    {Math.round(selectionBounds(selected).height)} px
                  </div>
                  <div className="button-pair">
                    <button
                      className="button secondary"
                      onClick={() => store.group()}
                      disabled={selected.filter((e) => !e.locked).length < 2}
                    >
                      <Icon name="group" size={16} />
                      Group
                    </button>
                    <button
                      className="button secondary"
                      onClick={() => store.ungroup()}
                      disabled={!selected.some((e) => e.type === 'group' && !e.locked)}
                    >
                      Ungroup
                    </button>
                  </div>
                  <div className="alignment-buttons">
                    {(['left', 'center', 'right', 'top', 'middle', 'bottom'] as const).map(
                      (a, i) => (
                        <button
                          key={a}
                          title={`Align ${a}`}
                          aria-label={`Align ${a}`}
                          onClick={() => store.align(a)}
                        >
                          <span className={`align-icon align-${i}`}>☰</span>
                        </button>
                      ),
                    )}
                  </div>
                </Section>
              )}
              {single && active.type === 'group' && (
                <Section title="Group">
                  <div className="button-pair">
                    <span className="muted">{active.children?.length} child layers</span>
                    <button className="button secondary" onClick={() => store.ungroup()}>
                      Ungroup
                    </button>
                  </div>
                </Section>
              )}
              {single && isNodeEditable(active) && (
                <Section
                  title="Path editing"
                  extra={
                    <span className="micro-badge">
                      {active.type === 'bezier'
                        ? Math.floor((active.points!.length - 1) / 3) + 1
                        : active.points!.length}{' '}
                      nodes
                    </span>
                  }
                >
                  <PathControls />
                </Section>
              )}
              {single && active.type === 'rect' && (
                <Section title="Corners">
                  {number('Corner radius', 'radius', 0, undefined, 'px')}
                </Section>
              )}
              {single && ['polygon', 'star', 'arc'].includes(active.type) && (
                <Section title="Geometry">
                  <div className="field-grid">
                    {active.type === 'polygon' && number('Sides', 'sides', 3, 24)}
                    {active.type === 'star' && (
                      <>
                        {number('Points', 'pointsCount', 3, 24)}
                        <NumberField
                          label="Inner radius"
                          value={Math.round((active.innerRatio || 0.43) * 100)}
                          min={5}
                          max={95}
                          unit="%"
                          onChange={(n) => store.update({ innerRatio: n / 100 }, false)}
                          onCommit={() => store.commit()}
                        />
                      </>
                    )}
                    {active.type === 'arc' && (
                      <>
                        {number('Start angle', 'arcStart', undefined, undefined, '°')}
                        {number('End angle', 'arcEnd', undefined, undefined, '°')}
                      </>
                    )}
                  </div>
                </Section>
              )}
              {single && active.type === 'text' && (
                <Section title="Typography">
                  <label className="text-field">
                    <span>Content</span>
                    <textarea
                      aria-label="Text content"
                      value={active.text || ''}
                      onChange={(e) => store.update({ text: e.target.value }, false)}
                      onBlur={() => store.commit()}
                    />
                  </label>
                  <FontPicker />
                  <div className="field-grid">
                    {number('Font size', 'fontSize', 1, undefined, 'px')}
                    {selector('Weight', 'fontWeight', [
                      ['400', 'Regular'],
                      ['500', 'Medium'],
                      ['600', 'Semibold'],
                      ['700', 'Bold'],
                      ['800', 'Extra bold'],
                    ])}
                    {number('Letter spacing', 'letterSpacing', undefined, undefined, 'px')}
                    {selector('Alignment', 'textAlign', [
                      ['start', 'Left'],
                      ['middle', 'Center'],
                      ['end', 'Right'],
                    ])}
                  </div>
                </Section>
              )}
              {(!single || active.type !== 'image') && (
                <>
                  <Section title="Fill">
                    <Paint key={`fill-${view.selectedIds.join()}`} kind="fill" />
                  </Section>
                  <Section title="Stroke">
                    <Paint key={`stroke-${view.selectedIds.join()}`} kind="stroke" />
                    <div className="field-grid stroke-options">
                      {number('Stroke width', 'strokeWidth', 0, undefined, 'px')}
                      {selector(
                        'Line cap',
                        'strokeLinecap',
                        [
                          ['butt', 'Butt'],
                          ['round', 'Round'],
                          ['square', 'Square'],
                        ],
                        'round',
                      )}
                      {selector(
                        'Line join',
                        'strokeLinejoin',
                        [
                          ['miter', 'Miter'],
                          ['round', 'Round'],
                          ['bevel', 'Bevel'],
                        ],
                        'round',
                      )}
                      {selector('Dash pattern', 'strokeDasharray', [
                        ['', 'Solid'],
                        ['8 6', 'Dashed'],
                        ['1 6', 'Dotted'],
                        ['12 5 2 5', 'Dash dot'],
                      ])}
                    </div>
                  </Section>
                </>
              )}
              <Section title="Appearance">
                {selector(
                  'Blend mode',
                  'blendMode',
                  [
                    ['normal', 'Normal'],
                    ['multiply', 'Multiply'],
                    ['screen', 'Screen'],
                    ['overlay', 'Overlay'],
                    ['darken', 'Darken'],
                    ['lighten', 'Lighten'],
                  ],
                  'normal',
                )}
              </Section>
              <Section title="Arrange">
                <div className="button-pair">
                  <button className="button secondary" onClick={() => store.reorder('front')}>
                    <Icon name="front" size={17} />
                    To front
                  </button>
                  <button className="button secondary" onClick={() => store.reorder('back')}>
                    <Icon name="back" size={17} />
                    To back
                  </button>
                </div>
              </Section>
            </fieldset>
          </>
        )}
      </div>
      {selected.length > 0 && view.inspectorTab === 'design' && (
        <div className="inspector-footer">
          <button className="button quiet" onClick={() => store.duplicate()}>
            <Icon name="copy" size={17} />
            Duplicate
          </button>
          <button
            className="icon-button danger"
            disabled={locked}
            title="Delete selection"
            aria-label="Delete selection"
            onClick={() => store.remove()}
          >
            <Icon name="delete" size={18} />
          </button>
        </div>
      )}
    </aside>
  );
}
