import { createContext, useContext, useSyncExternalStore } from 'react';
import { EditorStore } from './store';
export const EditorContext = createContext<EditorStore | null>(null);
export function useEditor() {
  const store = useContext(EditorContext);
  if (!store) throw new Error('Missing editor provider');
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return { ...snapshot, store, selected: store.selected, active: store.active };
}
