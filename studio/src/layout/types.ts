import type { DagNode, GraphLayoutMode, GraphSelection, NodeKey, RelationValue } from "../graph/types";

export interface StageNodeColorTokens {
  border: string;
  borderStrong: string;
  activeBorder: string;
  pinFill: string;
  pinStroke: string;
  pinCore: string;
  affordanceBg: string;
  affordanceText: string;
}

export interface StageNode {
  key: NodeKey;
  layer: number;
  order: number;
  title: string;
  displayTitle: string;
  typeLabel?: string;
  colorTokens?: StageNodeColorTokens;
  width: number;
  height: number;
  isRoot: boolean;
  x: number;
  y: number;
}

export interface StageEdge {
  id: string;
  source: NodeKey;
  target: NodeKey;
  weight: RelationValue | 1 | undefined;
  label: string;
  points?: StageRoutePoint[];
  path: string;
  labelPosition: { x: number; y: number };
}

export interface StageLane {
  layer: number;
  label: string;
  x: number;
  width: number;
}

export type LayoutCoordinate = [number, number];

export type LayoutCoordinateMap = Map<NodeKey, LayoutCoordinate>;

export interface LayoutRoutePoint {
  layer: number;
  order: number;
  x?: number;
  y?: number;
}

export interface LayoutEdgeRoute {
  source: NodeKey;
  target: NodeKey;
  points: LayoutRoutePoint[];
  reversedForLayout?: boolean;
}

export interface StageRoutePoint extends LayoutRoutePoint {
  x: number;
  y: number;
}

export interface LayoutResult {
  coordinates: LayoutCoordinateMap;
  warnings: string[];
  layerSlotCounts?: Map<number, number>;
  edgeRoutes?: Map<string, LayoutEdgeRoute>;
  nodePositions?: Map<NodeKey, { x: number; y: number }>;
}

export interface ResolvedStageSelection {
  rootKey: NodeKey;
  topLevelKeys: NodeKey[];
  isForest: boolean;
  label: string;
  appSelection: GraphSelection;
}

export interface StageData {
  dag: Record<NodeKey, DagNode & { synthetic?: boolean }>;
  layoutMode: GraphLayoutMode;
  root: NodeKey;
  selection: ResolvedStageSelection;
  topLevelKeys: NodeKey[];
  isForest: boolean;
  nodeMap: Record<NodeKey, StageNode>;
  nodes: StageNode[];
  edges: StageEdge[];
  connectedKeysByNode: Map<NodeKey, ReadonlySet<NodeKey>>;
  lanes: StageLane[];
  stageWidth: number;
  stageHeight: number;
  warnings: string[];
}
