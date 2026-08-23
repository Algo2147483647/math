export type NodeKey = string;

export type RelationValue = string | number | boolean | null;

export type RelationField = NodeKey[] | Record<NodeKey, RelationValue>;

export interface RawGraphNode {
  key?: NodeKey;
  [field: string]: unknown;
}

export type RawGraphInput =
  | Record<NodeKey, RawGraphNode>
  | RawGraphNode[]
  | { nodes: RawGraphNode[] };

export interface DagNode extends RawGraphNode {
  key: NodeKey;
}

export type NormalizedDag = Record<NodeKey, DagNode>;

export type GraphSelection =
  | { type: "node"; key: NodeKey }
  | { type: "full" }
  | { type: "forest"; keys: NodeKey[]; label: string };

export type GraphLayoutMode = "level" | "sugiyama" | "dagre";

export function getGraphLayoutLabel(mode: GraphLayoutMode): string {
  switch (mode) {
    case "sugiyama":
      return "Sugiyama layered";
    case "dagre":
      return "Dagre layered";
    default:
      return "Level layout";
  }
}

export const GRAPH_TITLE_FONT_OPTIONS = [
  { label: "Georgia", value: "\"Georgia\", serif" },
  { label: "Times", value: "\"Times New Roman\", serif" },
  { label: "Sans", value: "\"IBM Plex Sans\", \"Segoe UI\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif" },
  { label: "Display", value: "\"Cormorant Garamond\", \"Georgia\", serif" },
  { label: "Mono", value: "\"IBM Plex Mono\", \"SFMono-Regular\", Consolas, monospace" },
] as const;

export type GraphTitleFontFamily = typeof GRAPH_TITLE_FONT_OPTIONS[number]["value"];

export const DEFAULT_RELATION_VALUE: RelationValue = "related_to";
