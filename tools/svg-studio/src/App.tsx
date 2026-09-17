import { useEffect } from 'react';
import { useEditor } from './model/context';
import { useKeyboard } from './model/useKeyboard';
import { Topbar } from './components/Topbar';
import { Library } from './components/Library';
import { Inspector } from './components/Inspector';
import { Toolbar } from './components/Toolbar';
import { ContextMenu } from './components/ContextMenu';
import { Dialogs } from './components/Dialogs';
import { Canvas } from './canvas/Canvas';
import { Icon } from './components/Icon';
export function App() {
  const { store, view } = useEditor();
  useKeyboard(store);
  useEffect(() => {
    const persist = () => store.flush();
    window.addEventListener('beforeunload', persist);
    return () => window.removeEventListener('beforeunload', persist);
  }, [store]);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (store.view.contextMenu && !(e.target as Element).closest('.context-menu'))
        store.setView({ contextMenu: null });
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [store]);
  return (
    <main
      className="app-shell"
      onContextMenu={(e) => {
        if ((e.target as Element).closest('input,textarea,select')) return;
        e.preventDefault();
        const target = e.target as Element,
          id =
            target.closest('[data-element-id]')?.getAttribute('data-element-id') ||
            target.closest('[data-layer-id]')?.getAttribute('data-layer-id');
        if (id && !store.view.selectedIds.includes(id)) store.select([id]);
        store.setView({ contextMenu: [e.clientX, e.clientY] });
      }}
    >
      <Canvas />
      <Topbar />
      <Library />
      <Inspector />
      <Toolbar />
      <ContextMenu />
      <Dialogs />
      <div className={`toast ${view.toast ? 'visible' : ''}`} role="status" aria-live="polite">
        <Icon name="check" size={16} />
        {view.toast}
      </div>
    </main>
  );
}
