import { useEffect } from "react";

export function useResizeObserver(targetRef: React.RefObject<Element>, onResize: () => void): void {
  useEffect(() => {
    const target = targetRef.current;
    if (!target || typeof ResizeObserver !== "function") {
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const observer = new ResizeObserver(onResize);
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef, onResize]);
}
