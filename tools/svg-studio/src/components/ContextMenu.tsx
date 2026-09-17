import { useLayoutEffect, useRef } from 'react';
import { useEditor } from '../model/context';
import { isNodeEditable } from '../model/geometry';
import { Icon } from './Icon';

export function ContextMenu() {
  const { store, view, selected, active, canUndo, canRedo } = useEditor(),
    ref = useRef<HTMLDivElement>(null);
  const point = view.contextMenu;
  useLayoutEffect(() => {
    if (!point || !ref.current) return;
    const menu = ref.current,
      r = menu.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(point[0], window.innerWidth - r.width - 8))}px`;
    menu.style.top = `${Math.max(8, Math.min(point[1], window.innerHeight - r.height - 8))}px`;
    menu.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
  }, [point]);
  if (!point) return null;
  const movable = selected.filter((e) => !e.locked),
    has = selected.length > 0;
  const sections = [
    [
      { label: 'Undo', icon: 'undo', key: 'Ctrl Z', enabled: canUndo, run: () => store.undo() },
      { label: 'Redo', icon: 'redo', key: 'Ctrl ⇧ Z', enabled: canRedo, run: () => store.redo() },
    ],
    [
      {
        label: 'Cut',
        icon: 'delete',
        key: 'Ctrl X',
        enabled: !!movable.length,
        run: () => store.copy(true),
      },
      { label: 'Copy', icon: 'copy', key: 'Ctrl C', enabled: has, run: () => store.copy() },
      {
        label: 'Paste',
        icon: 'copy',
        key: 'Ctrl V',
        enabled: store.hasClipboard,
        run: () => store.paste(),
      },
      {
        label: 'Duplicate',
        icon: 'copy',
        key: 'Ctrl D',
        enabled: has,
        run: () => store.duplicate(),
      },
    ],
    [
      {
        label: 'Edit nodes',
        icon: 'node',
        key: 'Enter',
        enabled: selected.length === 1 && isNodeEditable(active) && !active?.locked,
        run: () => store.enterNodes(),
      },
      {
        label: 'Group selection',
        icon: 'group',
        key: 'Ctrl G',
        enabled: movable.length >= 2,
        run: () => store.group(),
      },
      {
        label: 'Ungroup',
        icon: 'ungroup',
        key: 'Ctrl ⇧ G',
        enabled: movable.some((e) => e.type === 'group'),
        run: () => store.ungroup(),
      },
    ],
    [
      {
        label: 'Bring to front',
        icon: 'front',
        key: ']',
        enabled: !!movable.length,
        run: () => store.reorder('front'),
      },
      {
        label: 'Send to back',
        icon: 'back',
        key: '[',
        enabled: !!movable.length,
        run: () => store.reorder('back'),
      },
      {
        label: movable.length ? 'Lock selection' : 'Unlock selection',
        icon: movable.length ? 'lock' : 'unlock',
        key: '',
        enabled: has,
        run: () => store.toggleLock(),
      },
    ],
    [
      {
        label: 'Select all',
        icon: 'select',
        key: 'Ctrl A',
        enabled: true,
        run: () => store.selectAll(),
      },
      {
        label: 'Delete',
        icon: 'delete',
        key: '⌫',
        enabled: !!movable.length,
        run: () => store.remove(),
      },
    ],
  ];
  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Canvas context menu"
      className="context-menu glass"
      style={{ left: point[0], top: point[1] }}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(event) => {
        const buttons = [
            ...ref.current!.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
          ],
          i = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          const n =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? buttons.length - 1
                : (i + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
          buttons[n]?.focus();
        }
        if (event.key === 'Escape' || event.key === 'Tab') {
          event.preventDefault();
          event.stopPropagation();
          store.setView({ contextMenu: null });
          document.querySelector<HTMLElement>('.canvas-workspace')?.focus();
        }
      }}
    >
      {sections.map((section, i) => (
        <div className="menu-section" key={i}>
          {section.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              disabled={!item.enabled}
              className={item.label === 'Delete' ? 'danger' : ''}
              onClick={() => {
                store.setView({ contextMenu: null });
                item.run();
                document.querySelector<HTMLElement>('.canvas-workspace')?.focus();
              }}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
              <kbd>{item.key}</kbd>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
