import type { CSSProperties } from "react";

export interface GraphAppearance {
  version: 1;
  layout: GraphLayoutAppearance;
  display: GraphDisplayAppearance;
  cssVars: Record<string, string>;
  css: string;
}

export interface GraphDisplayAppearance {
  showEdgeLabels: boolean;
}

export interface GraphLayoutAppearance {
  stagePaddingX: number;
  stagePaddingY: number;
  columnGap: number;
  rowGap: number;
  edgeLaneGap: number;
  nodeHeight: number;
  minNodeWidth: number;
  maxNodeWidth: number;
  stageMinWidth: number;
  stageMinHeight: number;
}

export const DEFAULT_GRAPH_CSS = `
.dag-graph,
.dag-backdrop {
  fill: none;
}

.dag-graph[data-density="dense"] .dag-edge__path,
.dag-graph[data-density="dense"] .dag-node,
.dag-graph[data-density="dense"] .dag-node__glow,
.dag-graph[data-density="dense"] .dag-node__shape,
.dag-graph[data-density="dense"] .dag-node__affordance {
  transition: none;
}

.dag-stage__halo {
  fill: rgba(255, 255, 255, 0.8);
  pointer-events: none;
}

.dag-stage__lane {
  stroke: rgba(89, 107, 139, 0.12);
  stroke-width: 1;
  stroke-dasharray: 2 12;
  pointer-events: none;
}

.dag-stage__lane-label {
  fill: rgba(102, 117, 144, 0.58);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  pointer-events: none;
}

.dag-edge {
  pointer-events: none;
}

.dag-edge__path {
  fill: none;
  stroke: var(--dag-edge);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.65;
  transition: stroke 0.18s ease, stroke-width 0.18s ease, opacity 0.18s ease;
}

.dag-edge[data-active="true"] .dag-edge__path {
  stroke: var(--dag-edge-active);
  stroke-width: 2.35;
  opacity: 1;
}

.dag-edge__label-text {
  fill: var(--dag-text-soft);
  font-size: 10px;
  font-weight: 700;
}

.dag-edge__label-bg {
  fill: rgba(255, 255, 255, 0.84);
  stroke: rgba(99, 118, 148, 0.12);
  stroke-width: 1;
}

.dag-node {
  cursor: pointer;
  outline: none;
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.dag-node__glow {
  fill: var(--dag-node-glow, rgba(44, 83, 166, 0.08));
  opacity: 0;
  transition: opacity 0.18s ease;
}

.dag-node__shape {
  fill: var(--dag-node-fill);
  stroke: var(--dag-node-border);
  stroke-width: 1.25;
  filter: drop-shadow(0 10px 18px rgba(24, 39, 64, 0.06));
  transition: fill 0.18s ease, stroke 0.18s ease, transform 0.18s ease, filter 0.18s ease;
}

.dag-node__pin {
  fill: var(--dag-node-pin-fill, rgba(40, 95, 223, 0.14));
  stroke: var(--dag-node-pin-stroke, rgba(40, 95, 223, 0.24));
  stroke-width: 1;
}

.dag-node__pin-core {
  fill: var(--dag-node-pin-core, rgba(40, 95, 223, 0.78));
}

.dag-node__title {
  fill: var(--dag-text-strong);
  font-family: var(--dag-title-font-family);
  font-size: var(--dag-title-font-size);
  font-style: var(--dag-title-font-style);
  font-weight: var(--dag-title-font-weight);
  letter-spacing: 0;
}

.dag-node__affordance {
  opacity: 0;
  transform: translateY(4px);
  transform-origin: center;
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.dag-node__affordance-bg {
  fill: var(--dag-node-affordance-bg, rgba(235, 241, 251, 0.94));
  stroke: rgba(70, 96, 148, 0.16);
  stroke-width: 1;
}

.dag-node__affordance-text {
  fill: var(--dag-node-affordance-text, rgba(46, 82, 152, 0.76));
  font-size: 8px;
  font-weight: 700;
}

.dag-node[data-root="true"] .dag-node__shape {
  stroke: var(--dag-node-border-strong);
  stroke-width: 1.7;
  fill: var(--dag-node-root-fill, var(--dag-node-fill));
}

.dag-node[data-root="true"] .dag-node__glow {
  opacity: 1;
}

.dag-node:hover .dag-node__shape,
.dag-node[data-hovered="true"] .dag-node__shape,
.dag-node[data-focused="true"] .dag-node__shape,
.dag-node[data-selected="true"] .dag-node__shape {
  stroke: var(--dag-node-active-border, rgba(39, 79, 152, 0.48));
  fill: var(--dag-node-active-fill, var(--dag-node-fill));
  filter: drop-shadow(0 14px 26px rgba(29, 52, 97, 0.1));
}

.dag-node:hover .dag-node__glow,
.dag-node[data-hovered="true"] .dag-node__glow,
.dag-node[data-focused="true"] .dag-node__glow {
  opacity: 1;
}

.dag-node:hover .dag-node__affordance,
.dag-node[data-hovered="true"] .dag-node__affordance,
.dag-node[data-focused="true"] .dag-node__affordance {
  opacity: 1;
  transform: translateY(0);
}

.dag-node:hover .dag-node__pin,
.dag-node[data-selected="true"] .dag-node__pin,
.dag-node[data-hovered="true"] .dag-node__pin,
.dag-node[data-focused="true"] .dag-node__pin {
  fill: var(--dag-node-pin-fill, rgba(40, 95, 223, 0.18));
}

.dag-graph[data-has-interactive-node="true"] .dag-edge__path {
  opacity: 0.3;
}

.dag-graph[data-has-interactive-node="true"] .dag-edge[data-active="true"] .dag-edge__path {
  opacity: 1;
}

.dag-graph[data-has-interactive-node="true"] .dag-node {
  opacity: 0.48;
}

.dag-graph[data-has-interactive-node="true"] .dag-node[data-connected="true"],
.dag-graph[data-has-interactive-node="true"] .dag-node[data-hovered="true"],
.dag-graph[data-has-interactive-node="true"] .dag-node[data-focused="true"] {
  opacity: 1;
}

.dag-graph[data-borderless="true"] .dag-node__shape {
  stroke: transparent;
}

.dag-graph[data-density="dense"] .dag-node__shape,
.dag-graph[data-density="dense"] .dag-node:hover .dag-node__shape,
.dag-graph[data-density="dense"] .dag-node[data-hovered="true"] .dag-node__shape,
.dag-graph[data-density="dense"] .dag-node[data-focused="true"] .dag-node__shape,
.dag-graph[data-density="dense"] .dag-node[data-selected="true"] .dag-node__shape {
  filter: none;
}
`.trim();

export const DEFAULT_GRAPH_APPEARANCE: GraphAppearance = {
  version: 1,
  layout: {
    stagePaddingX: 108,
    stagePaddingY: 88,
    columnGap: 116,
    rowGap: 22,
    edgeLaneGap: 28,
    nodeHeight: 74,
    minNodeWidth: 188,
    maxNodeWidth: 280,
    stageMinWidth: 980,
    stageMinHeight: 600,
  },
  display: {
    showEdgeLabels: true,
  },
  cssVars: {
    "--dag-text-strong": "#162033",
    "--dag-text-soft": "#8792a2",
    "--dag-edge": "rgba(76, 96, 132, 0.24)",
    "--dag-edge-active": "rgba(41, 92, 207, 0.72)",
    "--dag-node-fill": "rgba(252, 253, 255, 0.88)",
    "--dag-node-border": "rgba(91, 109, 142, 0.17)",
    "--dag-node-border-strong": "rgba(50, 79, 132, 0.35)",
    "--dag-title-font-family": "\"Georgia\", serif",
    "--dag-title-font-size": "15px",
    "--dag-title-font-style": "italic",
    "--dag-title-font-weight": "400",
  },
  css: DEFAULT_GRAPH_CSS,
};

export function sanitizeGraphAppearance(input: unknown): GraphAppearance {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return DEFAULT_GRAPH_APPEARANCE;
  }

  const record = input as Record<string, unknown>;
  const defaultLayout = DEFAULT_GRAPH_APPEARANCE.layout;
  const layoutInput = record.layout && typeof record.layout === "object" && !Array.isArray(record.layout)
    ? record.layout as Record<string, unknown>
    : {};
  const displayInput = record.display && typeof record.display === "object" && !Array.isArray(record.display)
    ? record.display as Record<string, unknown>
    : {};
  const minNodeWidth = clampNumeric(layoutInput.minNodeWidth, defaultLayout.minNodeWidth, 140, 260);
  const maxNodeWidth = clampNumeric(layoutInput.maxNodeWidth, defaultLayout.maxNodeWidth, minNodeWidth, 480);

  return {
    version: 1,
    layout: {
      stagePaddingX: clampNumeric(layoutInput.stagePaddingX, defaultLayout.stagePaddingX, 24, 260),
      stagePaddingY: clampNumeric(layoutInput.stagePaddingY, defaultLayout.stagePaddingY, 24, 220),
      columnGap: clampNumeric(layoutInput.columnGap, defaultLayout.columnGap, 48, 260),
      rowGap: clampNumeric(layoutInput.rowGap, defaultLayout.rowGap, 4, 140),
      edgeLaneGap: clampNumeric(layoutInput.edgeLaneGap, defaultLayout.edgeLaneGap, 4, 96),
      nodeHeight: clampNumeric(layoutInput.nodeHeight, defaultLayout.nodeHeight, 44, 160),
      minNodeWidth,
      maxNodeWidth,
      stageMinWidth: clampNumeric(layoutInput.stageMinWidth, defaultLayout.stageMinWidth, 320, 4000),
      stageMinHeight: clampNumeric(layoutInput.stageMinHeight, defaultLayout.stageMinHeight, 240, 3000),
    },
    display: {
      showEdgeLabels: displayInput.showEdgeLabels === undefined ? DEFAULT_GRAPH_APPEARANCE.display.showEdgeLabels : displayInput.showEdgeLabels === true,
    },
    cssVars: sanitizeCssVars(record.cssVars),
    css: sanitizeCss(record.css),
  };
}

export function appearanceToStageStyle(appearance: GraphAppearance): CSSProperties {
  return { ...appearance.cssVars } as CSSProperties;
}

function sanitizeCss(css: unknown): string {
  if (typeof css !== "string") {
    return DEFAULT_GRAPH_CSS;
  }
  return css.slice(0, 50_000).replace(/@import\s+[^;]+;/gi, "");
}

function sanitizeCssVars(input: unknown): Record<string, string> {
  const defaults = DEFAULT_GRAPH_APPEARANCE.cssVars;
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ...defaults };
  }

  const vars: Record<string, string> = { ...defaults };
  Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
    if (!key.startsWith("--dag-") || typeof value !== "string") {
      return;
    }
    vars[key] = value.slice(0, 500);
  });
  return vars;
}

function clampNumeric(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Math.round(value)));
}
