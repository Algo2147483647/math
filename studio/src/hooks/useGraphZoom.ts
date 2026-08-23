import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { StageData } from "../layout/types";

const MIN_ZOOM_FLOOR = 0.05;
const ZOOM_STEP_FACTOR = 1.15;
const WHEEL_ZOOM_SENSITIVITY = Math.log(ZOOM_STEP_FACTOR) / 120;
const TRACKPAD_PIXEL_DELTA_THRESHOLD = 60;
const TRACKPAD_PIXEL_ZOOM_MULTIPLIER = 6;
const MAX_WHEEL_DELTA = 360;

interface ZoomAnchor {
  clientX: number;
  clientY: number;
}

interface UseGraphZoomInput {
  containerRef: React.RefObject<HTMLElement>;
  svgRef: React.RefObject<SVGSVGElement>;
  topbarRef: React.RefObject<HTMLElement>;
  stage: StageData | null;
  scale: number;
  minScale: number;
  maxScale: number;
  onZoomChange: (scale: number, minScale?: number) => void;
}

export function useGraphZoom({ containerRef, svgRef, topbarRef, stage, scale, minScale, maxScale, onZoomChange }: UseGraphZoomInput) {
  const zoomStateRef = useRef({ scale, minScale, maxScale });
  const wheelZoomRef = useRef<{ frame: number; deltaY: number; anchor: ZoomAnchor | null }>({ frame: 0, deltaY: 0, anchor: null });

  useEffect(() => {
    zoomStateRef.current = { scale, minScale, maxScale };
  }, [maxScale, minScale, scale]);

  const apply = useCallback((nextScale: number, preserveCenter: boolean, nextMinScale?: number, anchor?: ZoomAnchor) => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg || !stage) {
      return;
    }
    const currentZoom = zoomStateRef.current;
    const resolvedMinScale = nextMinScale ?? currentZoom.minScale;
    const clampedScale = clamp(nextScale, resolvedMinScale, currentZoom.maxScale);
    applyGraphZoom(container, svg, topbarRef.current, stage, clampedScale, preserveCenter, anchor);
    zoomStateRef.current = { ...currentZoom, scale: clampedScale, minScale: resolvedMinScale };
    if (Math.abs(currentZoom.scale - clampedScale) > 0.0001 || Math.abs(currentZoom.minScale - resolvedMinScale) > 0.0001) {
      onZoomChange(clampedScale, resolvedMinScale);
    }
  }, [containerRef, onZoomChange, stage, svgRef, topbarRef]);

  const zoomBy = useCallback((factor: number, anchor?: ZoomAnchor) => {
    if (!Number.isFinite(factor) || factor <= 0) {
      return;
    }
    const currentZoom = zoomStateRef.current;
    const currentScale = getAppliedZoomScale(svgRef.current, currentZoom.scale);
    apply(currentScale * factor, !anchor, currentZoom.minScale, anchor);
  }, [apply, svgRef]);

  const refresh = useCallback((preserveCenter: boolean) => {
    const container = containerRef.current;
    if (!container || !stage) {
      return;
    }
    const currentZoom = zoomStateRef.current;
    const nextMinScale = getFitZoomScale(container, topbarRef.current, stage);
    const nextScale = Math.abs(currentZoom.scale - currentZoom.minScale) < 0.001
      ? nextMinScale
      : clamp(currentZoom.scale, nextMinScale, currentZoom.maxScale);
    apply(nextScale, preserveCenter, nextMinScale);
  }, [apply, containerRef, stage, topbarRef]);

  useLayoutEffect(() => {
    refresh(false);
  }, [stage]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !stage) {
      return;
    }

    function handleWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }
      event.preventDefault();
      wheelZoomRef.current.deltaY += clamp(getWheelZoomDelta(event), -MAX_WHEEL_DELTA, MAX_WHEEL_DELTA);
      wheelZoomRef.current.anchor = { clientX: event.clientX, clientY: event.clientY };
      if (wheelZoomRef.current.frame) {
        return;
      }
      wheelZoomRef.current.frame = window.requestAnimationFrame(() => {
        const { deltaY, anchor } = wheelZoomRef.current;
        wheelZoomRef.current = { frame: 0, deltaY: 0, anchor: null };
        if (!anchor || Math.abs(deltaY) < 0.01) {
          return;
        }
        const factor = Math.exp(-deltaY * WHEEL_ZOOM_SENSITIVITY);
        zoomBy(factor, anchor);
      });
    }

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
      if (wheelZoomRef.current.frame) {
        window.cancelAnimationFrame(wheelZoomRef.current.frame);
        wheelZoomRef.current = { frame: 0, deltaY: 0, anchor: null };
      }
    };
  }, [containerRef, stage, zoomBy]);

  return useMemo(() => ({
    zoomIn: () => zoomBy(ZOOM_STEP_FACTOR),
    zoomOut: () => zoomBy(1 / ZOOM_STEP_FACTOR),
    zoomFit: () => apply(minScale, false),
    setZoomPercent: (percent: number) => {
      if (!Number.isFinite(percent) || percent <= 0) {
        return false;
      }
      apply(percent / 100, true);
      return true;
    },
    refresh,
  }), [apply, minScale, refresh, zoomBy]);
}

function getFitZoomScale(container: HTMLElement, topbar: HTMLElement | null, stage: StageData): number {
  const viewportMetrics = getViewportMetrics(container, topbar);
  const availableWidth = Math.max(viewportMetrics.availableWidth, 1);
  const availableHeight = Math.max(viewportMetrics.availableHeight, 1);
  const fitScale = Math.min(availableWidth / stage.stageWidth, availableHeight / stage.stageHeight, 1);
  return Math.max(fitScale, MIN_ZOOM_FLOOR);
}

function applyGraphZoom(container: HTMLElement, svg: SVGSVGElement, topbar: HTMLElement | null, stage: StageData, scale: number, preserveCenter: boolean, anchor?: ZoomAnchor): void {
  const previousScale = Number(svg.dataset.zoomScale || 1);
  const previousMarginLeft = Number(svg.dataset.marginLeft || 0);
  const previousMarginTop = Number(svg.dataset.marginTop || 0);
  const viewportMetrics = getViewportMetrics(container, topbar);
  const containerRect = container.getBoundingClientRect();
  const scaledWidth = stage.stageWidth * scale;
  const scaledHeight = stage.stageHeight * scale;
  const marginLeft = Math.max((viewportMetrics.availableWidth - scaledWidth) / 2, 0);
  const marginTop = viewportMetrics.safeTop + Math.max((viewportMetrics.availableHeight - scaledHeight) / 2, 0);
  const anchorOffsetX = anchor ? anchor.clientX - containerRect.left : container.clientWidth / 2;
  const anchorOffsetY = anchor ? anchor.clientY - containerRect.top : container.clientHeight / 2;
  const zoomOriginX = preserveCenter || anchor ? (container.scrollLeft + anchorOffsetX - previousMarginLeft) / previousScale : stage.stageWidth / 2;
  const zoomOriginY = preserveCenter || anchor ? (container.scrollTop + anchorOffsetY - previousMarginTop) / previousScale : stage.stageHeight / 2;

  svg.style.width = `${scaledWidth}px`;
  svg.style.height = `${scaledHeight}px`;
  svg.style.marginLeft = `${marginLeft}px`;
  svg.style.marginTop = `${marginTop}px`;
  svg.dataset.zoomScale = String(scale);
  svg.dataset.marginLeft = String(marginLeft);
  svg.dataset.marginTop = String(marginTop);

  container.scrollLeft = Math.max(zoomOriginX * scale + marginLeft - anchorOffsetX, 0);
  container.scrollTop = Math.max(zoomOriginY * scale + marginTop - anchorOffsetY, 0);
}

function getAppliedZoomScale(svg: SVGSVGElement | null, fallbackScale: number): number {
  if (!svg) {
    return fallbackScale;
  }
  const appliedScale = Number(svg.dataset.zoomScale);
  return Number.isFinite(appliedScale) && appliedScale > 0 ? appliedScale : fallbackScale;
}

function getWheelZoomDelta(event: WheelEvent): number {
  if (event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL) {
    return event.deltaY;
  }

  const absDeltaY = Math.abs(event.deltaY);
  if (absDeltaY > 0 && absDeltaY < TRACKPAD_PIXEL_DELTA_THRESHOLD) {
    return event.deltaY * TRACKPAD_PIXEL_ZOOM_MULTIPLIER;
  }
  return event.deltaY;
}

function getViewportMetrics(container: HTMLElement, topbar: HTMLElement | null) {
  const containerRect = container.getBoundingClientRect();
  const topbarRect = topbar ? topbar.getBoundingClientRect() : null;
  const safeTop = topbarRect ? Math.max(topbarRect.bottom - containerRect.top + 12, 0) : 0;
  const horizontalInset = 24;
  const bottomInset = 16;
  return {
    safeTop,
    availableWidth: container.clientWidth - horizontalInset * 2,
    availableHeight: container.clientHeight - safeTop - bottomInset,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
