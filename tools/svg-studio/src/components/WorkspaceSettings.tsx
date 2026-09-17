import { useEditor } from '../model/context';
import { NumberField, SelectField } from './Fields';
import { Icon } from './Icon';
export function WorkspaceControls() {
  const { store, view } = useEditor();
  return (
    <div className="workspace-controls">
      <label className="toggle-row">
        <span>Show grid</span>
        <input
          type="checkbox"
          role="switch"
          checked={view.grid}
          onChange={(e) => store.setView({ grid: e.target.checked })}
        />
      </label>
      <label className="toggle-row">
        <span>Snap to grid</span>
        <input
          type="checkbox"
          role="switch"
          checked={view.snap}
          onChange={(e) => store.setView({ snap: e.target.checked })}
        />
      </label>
      <div className="field-grid">
        <NumberField
          label="Grid size"
          value={view.gridSize}
          min={2}
          max={256}
          unit="px"
          onChange={(gridSize) => store.setView({ gridSize })}
        />
        <SelectField
          label="Grid style"
          value={view.gridStyle}
          options={['dots', 'lines']}
          onChange={(gridStyle) => store.setView({ gridStyle: gridStyle as 'dots' | 'lines' })}
        />
      </div>
      <SelectField
        label="Marquee selection"
        value={view.marqueeMode}
        options={[
          ['touch', 'Touch to select'],
          ['contain', 'Fully enclosed only'],
        ]}
        onChange={(marqueeMode) =>
          store.setView({ marqueeMode: marqueeMode as 'touch' | 'contain' })
        }
      />
      <p className="field-help">
        {view.marqueeMode === 'touch'
          ? 'Objects intersecting the selection box are selected.'
          : 'Only objects entirely inside the selection box are selected.'}{' '}
        Hold Shift to add to a selection.
      </p>
    </div>
  );
}
export function WorkspaceSettings() {
  const { store, view } = useEditor();
  if (!view.workspaceOpen) return null;
  return (
    <section className="workspace-popover glass" aria-label="Workspace settings">
      <div className="section-title">
        <h3>Workspace settings</h3>
        <button
          className="icon-button"
          aria-label="Close workspace settings"
          onClick={() => store.setView({ workspaceOpen: false })}
        >
          <Icon name="close" size={16} />
        </button>
      </div>
      <WorkspaceControls />
    </section>
  );
}
