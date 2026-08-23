import { useEffect } from "react";

interface KeyboardShortcutHandlers {
  onEscape: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function useKeyboardShortcuts({ onEscape, onUndo, onRedo }: KeyboardShortcutHandlers): void {
  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && !event.altKey) {
        const key = event.key.toLowerCase();
        if (key === "s") {
          event.preventDefault();
          return;
        }
        if (isEditableTarget(event.target)) {
          return;
        }
        if (key === "z") {
          event.preventDefault();
          if (event.shiftKey) {
            onRedo();
          } else {
            onUndo();
          }
          return;
        }
        if (key === "y") {
          event.preventDefault();
          onRedo();
          return;
        }
      }
      if (event.key === "Escape") {
        onEscape();
      }
    }

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [onEscape, onRedo, onUndo]);
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}
