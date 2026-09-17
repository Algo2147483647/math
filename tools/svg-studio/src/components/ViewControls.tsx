import { useEffect, useRef, useState } from 'react';
import { useEditor } from '../model/context';
import { MAX_ZOOM, MIN_ZOOM, requestZoom, stepZoom } from '../model/zoom';
import { Icon } from './Icon';
import { WorkspaceSettings } from './WorkspaceSettings';
export function ViewControls() {
  const { store, view } = useEditor(),
    [value, setValue] = useState(String(Math.round(view.zoom * 100))),
    [focused, setFocused] = useState(false);
  const cancelled = useRef(false);
  useEffect(() => {
    if (!focused) setValue(String(Math.round(view.zoom * 1000) / 10));
  }, [view.zoom, focused]);
  const apply = () => {
    const n = Number(value.replace('%', ''));
    if (!cancelled.current && Number.isFinite(n) && n >= MIN_ZOOM * 100 && n <= MAX_ZOOM * 100)
      requestZoom(n / 100);
    else setValue(String(Math.round(view.zoom * 1000) / 10));
    setFocused(false);
  };
  return (
    <div className="view-controls" role="group" aria-label="Canvas controls">
      <button
        className={`icon-button ${view.workspaceOpen ? 'active-subtle' : ''}`}
        aria-label="Workspace settings"
        title="Grid, snapping and selection settings"
        aria-expanded={view.workspaceOpen}
        onClick={() => store.setView({ workspaceOpen: !view.workspaceOpen })}
      >
        <Icon name="settings" size={17} />
      </button>
      <button
        className={`icon-button ${view.grid ? 'active-subtle' : ''}`}
        title="Toggle grid"
        aria-label="Toggle grid"
        aria-pressed={view.grid}
        onClick={() => store.setView({ grid: !view.grid })}
      >
        <Icon name="grid" size={17} />
      </button>
      <button
        className={`icon-button ${view.snap ? 'active-subtle' : ''}`}
        title="Snap to grid"
        aria-label="Snap to grid"
        aria-pressed={view.snap}
        onClick={() => store.setView({ snap: !view.snap })}
      >
        <Icon name="snap" size={17} />
      </button>
      <button
        className={`icon-button ${view.snapElements ? 'active-subtle' : ''}`}
        title="Snap to element key points"
        aria-label="Snap to elements"
        aria-pressed={view.snapElements}
        onClick={() => store.setView({ snapElements: !view.snapElements })}
      >
        <Icon name="anchorSnap" size={17} />
      </button>
      <span className="divider" />
      <button
        className="icon-button"
        aria-label="Zoom out"
        title="Zoom out 5%"
        onClick={() => requestZoom(stepZoom(view.zoom, -1))}
      >
        <Icon name="minus" size={16} />
      </button>
      <label className="zoom-field">
        <input
          aria-label="Zoom percentage"
          inputMode="decimal"
          value={value}
          onFocus={() => {
            cancelled.current = false;
            setFocused(true);
          }}
          onChange={(e) => setValue(e.target.value)}
          onBlur={apply}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              cancelled.current = true;
              e.currentTarget.blur();
            }
          }}
        />
        <span>%</span>
      </label>
      <button
        className="icon-button"
        aria-label="Zoom in"
        title="Zoom in 5%"
        onClick={() => requestZoom(stepZoom(view.zoom, 1))}
      >
        <Icon name="plus" size={16} />
      </button>
      <button
        className="icon-button"
        aria-label="Fit artboard"
        title="Fit artboard (1)"
        onClick={() => window.dispatchEvent(new Event('vectora:fit'))}
      >
        <Icon name="fit" size={17} />
      </button>
      <WorkspaceSettings />
    </div>
  );
}
