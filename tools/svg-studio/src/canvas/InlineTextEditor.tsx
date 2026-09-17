import { useEffect, useRef } from 'react';
import { useEditor } from '../model/context';
import { elementMatrix } from '../model/geometry';
export function InlineTextEditor() {
  const { store, view, active } = useEditor(),
    input = useRef<HTMLTextAreaElement>(null),
    original = useRef(active?.text || ''),
    cancelled = useRef(false);
  useEffect(() => {
    input.current?.focus();
    input.current?.select();
  }, []);
  if (!active || view.editingTextId !== active.id) return null;
  const m = elementMatrix(active),
    z = view.zoom;
  return (
    <textarea
      ref={input}
      className="inline-text-editor"
      aria-label="Edit text on canvas"
      wrap="off"
      value={active.text || ''}
      style={{
        width: Math.max(180, active.width) * z,
        height:
          Math.max(
            active.height,
            (active.text?.split('\n').length || 1) *
              (active.fontSize || 36) *
              (active.lineHeight || 1.2) +
              12,
          ) * z,
        transform: `matrix(${m[0]},${m[1]},${m[2]},${m[3]},${m[4] * z},${m[5] * z})`,
        fontFamily: active.fontFamily,
        fontSize: (active.fontSize || 36) * z,
        fontWeight: active.fontWeight,
        lineHeight: active.lineHeight || 1.2,
        letterSpacing: (active.letterSpacing || 0) * z,
        textAlign:
          active.textAlign === 'middle' ? 'center' : active.textAlign === 'end' ? 'right' : 'left',
        color: active.fill === 'none' ? '#222' : active.fill,
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onChange={(e) => store.update({ text: e.target.value }, false)}
      onBlur={() => {
        if (!cancelled.current) store.commit();
        store.setView({ editingTextId: null });
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape') {
          cancelled.current = true;
          store.update({ text: original.current }, false);
          store.commit();
          store.setView({ editingTextId: null });
        }
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) e.currentTarget.blur();
      }}
    />
  );
}
