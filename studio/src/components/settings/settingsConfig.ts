import type { GraphLayoutAppearance } from "../../graph/appearance";

export type SettingsChapter = "appearance" | "ai";

export const SETTINGS_CHAPTERS: Array<{ key: SettingsChapter; label: string }> = [
  { key: "appearance", label: "Appearance" },
  { key: "ai", label: "AI" },
];

export type LayoutControlKey = keyof Pick<GraphLayoutAppearance, "columnGap" | "rowGap" | "edgeLaneGap" | "nodeHeight" | "maxNodeWidth">;

export interface LayoutControlDefinition {
  key: LayoutControlKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export const LAYOUT_CONTROLS: LayoutControlDefinition[] = [
  { key: "columnGap", label: "Layer spacing", min: 48, max: 260, step: 2, unit: "px" },
  { key: "rowGap", label: "Node spacing", min: 4, max: 140, step: 2, unit: "px" },
  { key: "edgeLaneGap", label: "Line spacing", min: 4, max: 96, step: 2, unit: "px" },
  { key: "nodeHeight", label: "Node height", min: 44, max: 160, step: 2, unit: "px" },
  { key: "maxNodeWidth", label: "Node max width", min: 188, max: 480, step: 4, unit: "px" },
];

export const APPEARANCE_TOKEN_CONTROLS = [
  { key: "--dag-node-fill", label: "Node Fill" },
  { key: "--dag-node-border", label: "Node Border" },
  { key: "--dag-node-border-strong", label: "Root Border" },
  { key: "--dag-edge", label: "Edge" },
  { key: "--dag-edge-active", label: "Active Edge" },
  { key: "--dag-text-strong", label: "Title Text" },
  { key: "--dag-text-soft", label: "Soft Text" },
  { key: "--dag-title-font-size", label: "Title Size" },
] as const;
