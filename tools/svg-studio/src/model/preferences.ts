import type { EditorView } from './types';
const key = 'vectora-workspace-v1';
const keys = ['grid', 'snap', 'snapElements', 'gridSize', 'gridStyle', 'marqueeMode'] as const;
export function loadPreferences(): Partial<EditorView> {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return {
      grid: typeof value.grid === 'boolean' ? value.grid : false,
      snap: typeof value.snap === 'boolean' ? value.snap : false,
      snapElements: typeof value.snapElements === 'boolean' ? value.snapElements : false,
      gridSize: Number.isFinite(value.gridSize) ? Math.max(2, Math.min(256, value.gridSize)) : 8,
      gridStyle: value.gridStyle === 'lines' ? 'lines' : 'dots',
      marqueeMode: value.marqueeMode === 'contain' ? 'contain' : 'touch',
    };
  } catch {
    return {};
  }
}
export function savePreferences(view: EditorView, changes: Partial<EditorView>) {
  if (!keys.some((k) => k in changes)) return;
  try {
    localStorage.setItem(key, JSON.stringify(Object.fromEntries(keys.map((k) => [k, view[k]]))));
  } catch {
    /* Workspace preferences are optional; document save errors remain visible. */
  }
}
