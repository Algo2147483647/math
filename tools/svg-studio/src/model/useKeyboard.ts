import { useEffect } from 'react';
import { apply, elementMatrix, inverse, normalizePoints } from './geometry';
import { requestZoom, stepZoom } from './zoom';
import { clone } from './utils';
import type { EditorStore } from './store';
import type { Tool } from './types';

export function useKeyboard(store: EditorStore) {
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (store.view.modal) {
        if (event.key === 'Escape') {
          event.preventDefault();
          store.setView({ modal: null });
        }
        return;
      }
      if (
        (event.target as Element).closest('input,textarea,select,[contenteditable=true]') ||
        store.view.contextMenu
      )
        return;
      const key = event.key.toLowerCase(),
        mod = event.ctrlKey || event.metaKey;
      if (mod) {
        const actions: Record<string, () => void> = {
          z: () => (event.shiftKey ? store.redo() : store.undo()),
          y: () => store.redo(),
          a: () => store.selectAll(),
          c: () => store.copy(),
          x: () => store.copy(true),
          v: () => store.paste(),
          d: () => store.duplicate(),
          g: () => (event.shiftKey ? store.ungroup() : store.group()),
          s: () => store.setView({ modal: 'export' }),
          '/': () => store.setView({ modal: 'shortcuts' }),
        };
        if (actions[key]) {
          event.preventDefault();
          actions[key]();
        }
        return;
      }
      if (event.key === 'Escape') {
        if (store.view.workspaceOpen) {
          store.setView({ workspaceOpen: false });
          return;
        }
        if (store.view.gradientEdit) {
          store.setView({ gradientEdit: null });
          return;
        }
        if (store.view.nodeIndex !== null) {
          store.setView({ nodeIndex: null });
          return;
        }
        if (store.view.tool === 'node') store.setView({ tool: 'select', nodeIndex: null });
        else {
          store.select([]);
          store.setView({ tool: 'select' });
        }
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        store.enterNodes();
        return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        if (store.view.nodeIndex !== null) {
          store.removeNode();
        } else store.remove();
        return;
      }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        const n = event.shiftKey ? 10 : 1,
          dx = key === 'arrowleft' ? -n : key === 'arrowright' ? n : 0,
          dy = key === 'arrowup' ? -n : key === 'arrowdown' ? n : 0;
        const active = store.active,
          index = store.view.nodeIndex;
        if (active?.points && index !== null) {
          const matrix = elementMatrix(active),
            world = apply(matrix, active.points[index]);
          store.moveNode(
            active.id,
            index,
            apply(inverse(matrix), [world[0] + dx, world[1] + dy]),
            clone(active),
            event.altKey,
          );
        } else {
          const ids = new Set(store.view.selectedIds);
          store.preview((d) =>
            d.elements.forEach((e) => {
              if (ids.has(e.id) && !e.locked) {
                e.x += dx;
                e.y += dy;
              }
            }),
          );
        }
        return;
      }
      const keys: Record<string, Tool> = {
        v: 'select',
        n: 'node',
        r: 'rect',
        o: 'ellipse',
        l: 'line',
        a: 'arrow',
        p: 'polyline',
        b: 'bezier',
        t: 'text',
        h: 'hand',
      };
      if (keys[key]) store.setView({ tool: keys[key], nodeIndex: null });
      if (key === '1') window.dispatchEvent(new Event('vectora:fit'));
      if (key === '+' || key === '=') requestZoom(stepZoom(store.view.zoom, 1));
      if (key === '-') requestZoom(stepZoom(store.view.zoom, -1));
      if (key === '[') store.reorder('back');
      if (key === ']') store.reorder('front');
      if (key === '?') store.setView({ modal: 'shortcuts' });
    };
    const up = (e: KeyboardEvent) => {
      if (e.key.startsWith('Arrow') && !(e.target as Element).closest('input,textarea,select')) {
        if (store.view.nodeIndex !== null && store.active && !store.active.locked) {
          const id = store.active.id;
          store.preview((d) => normalizePoints(d.elements.find((e) => e.id === id)!));
        }
        store.commit();
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [store]);
}
