import { useEffect } from "react";

export function useOutsideDismiss(enabled: boolean, onDismiss: () => void): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handleDocumentClick() {
      onDismiss();
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onDismiss();
      }
    }

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [enabled, onDismiss]);
}
