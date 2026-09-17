import { useEditor } from '../model/context';
import { normalizeColor } from '../model/utils';
import { NumberField } from './Fields';
import { Icon } from './Icon';
import { Section } from './InspectorSection';
import { WorkspaceControls } from './WorkspaceSettings';

export function CanvasSettings() {
  const { store, document: doc } = useEditor();
  return (
    <>
      <div className="canvas-intro">
        <span className="canvas-icon">
          <Icon name="fit" size={28} />
        </span>
        <h3>A space for your ideas.</h3>
        <p>Select a layer to fine-tune it, or drag across the canvas to select several.</p>
      </div>
      <Section title="Artboard">
        <div className="field-grid">
          <NumberField
            label="Canvas width"
            value={doc.canvas.width}
            min={16}
            max={16000}
            unit="px"
            onChange={(n) =>
              store.preview((d) => {
                d.canvas.width = n;
              })
            }
            onCommit={() => store.commit()}
          />
          <NumberField
            label="Canvas height"
            value={doc.canvas.height}
            min={16}
            max={16000}
            unit="px"
            onChange={(n) =>
              store.preview((d) => {
                d.canvas.height = n;
              })
            }
            onCommit={() => store.commit()}
          />
        </div>
      </Section>
      <Section title="Background">
        <label className="toggle-row">
          <span>Transparent</span>
          <input
            type="checkbox"
            role="switch"
            checked={doc.canvas.background === 'transparent'}
            onChange={(e) =>
              store.change((d) => {
                d.canvas.background = e.target.checked ? 'transparent' : '#ffffff';
              })
            }
          />
        </label>
        {doc.canvas.background !== 'transparent' && (
          <label className="background-color">
            <input
              type="color"
              aria-label="Canvas background"
              value={normalizeColor(doc.canvas.background) || '#ffffff'}
              onChange={(e) =>
                store.change((d) => {
                  d.canvas.background = e.target.value;
                })
              }
            />
            <span>{doc.canvas.background.toUpperCase()}</span>
          </label>
        )}
      </Section>
      <Section title="Workspace">
        <WorkspaceControls />
      </Section>
      <div className="inspector-tip">
        <Icon name="select" size={16} />
        <span>
          Hold <kbd>Shift</kbd> to add to your selection.
        </span>
      </div>
    </>
  );
}
