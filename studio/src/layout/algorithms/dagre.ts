import dagre from "dagre";
import type { FieldMapping } from "../../graph/fieldMapping";
import type { DagNode, NodeKey } from "../../graph/types";
import type { LayoutEdgeRoute, LayoutResult } from "../types";
import { buildVisibleGraph } from "./shared";

const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_NODE_HEIGHT = 74;
const LAYER_EPSILON = 0.5;

export function buildDagreLayout(
  dag: Record<NodeKey, DagNode | undefined>,
  roots: NodeKey[],
  mapping: FieldMapping,
  nodeSizes: Map<NodeKey, { width: number; height: number }>,
): LayoutResult {
  const visible = buildVisibleGraph(dag, roots, mapping);
  const graph = new dagre.graphlib.Graph({ multigraph: false, compound: false });
  graph.setGraph({
    rankdir: "LR",
    ranker: "network-simplex",
    align: "UL",
    nodesep: 40,
    edgesep: 24,
    ranksep: 112,
    marginx: 0,
    marginy: 0,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  visible.nodeKeys.forEach((nodeKey) => {
    const size = nodeSizes.get(nodeKey);
    graph.setNode(nodeKey, {
      width: size?.width ?? DEFAULT_NODE_WIDTH,
      height: size?.height ?? DEFAULT_NODE_HEIGHT,
    });
  });

  visible.nodeKeys.forEach((sourceKey) => {
    visible.outgoing[sourceKey].forEach((targetKey) => {
      graph.setEdge(sourceKey, targetKey, {});
    });
  });

  dagre.layout(graph);

  const layerXs = collectLayerCenters(visible.nodeKeys, graph);
  const nodePositions = new Map<NodeKey, { x: number; y: number }>();
  const coordinates: LayoutResult["coordinates"] = new Map();
  const layerSlotCounts = new Map<number, number>();

  layerXs.forEach((_, layerIndex) => {
    const layerNodes = visible.nodeKeys
      .map((nodeKey) => ({ nodeKey, layoutNode: graph.node(nodeKey) as DagreNodePosition | undefined }))
      .filter((entry) => entry.layoutNode && resolveLayerIndex(layerXs, entry.layoutNode.x) === layerIndex)
      .sort((left, right) => {
        if ((left.layoutNode?.y ?? 0) !== (right.layoutNode?.y ?? 0)) {
          return (left.layoutNode?.y ?? 0) - (right.layoutNode?.y ?? 0);
        }
        return visible.orderByKey[left.nodeKey] - visible.orderByKey[right.nodeKey];
      });

    layerSlotCounts.set(layerIndex, layerNodes.length);
    layerNodes.forEach((entry, order) => {
      if (!entry.layoutNode) {
        return;
      }
      nodePositions.set(entry.nodeKey, { x: entry.layoutNode.x, y: entry.layoutNode.y });
      coordinates.set(entry.nodeKey, [layerIndex, order]);
    });
  });

  const edgeRoutes = new Map<string, LayoutEdgeRoute>();
  visible.nodeKeys.forEach((sourceKey) => {
    visible.outgoing[sourceKey].forEach((targetKey) => {
      const layoutEdge = graph.edge(sourceKey, targetKey) as DagreEdgeRoute | undefined;
      const routePoints = (layoutEdge?.points || []).slice(1, -1).map((point) => ({
        layer: resolveLayerIndex(layerXs, point.x),
        order: 0,
        x: point.x,
        y: point.y,
      }));
      edgeRoutes.set(`${sourceKey}-->${targetKey}`, {
        source: sourceKey,
        target: targetKey,
        points: routePoints,
      });
    });
  });

  return {
    coordinates,
    warnings: [],
    layerSlotCounts,
    edgeRoutes,
    nodePositions,
  };
}

interface DagreNodePosition {
  x: number;
  y: number;
}

interface DagreEdgeRoute {
  points?: Array<{ x: number; y: number }>;
}

function collectLayerCenters(nodeKeys: NodeKey[], graph: dagre.graphlib.Graph): number[] {
  const values = nodeKeys
    .map((nodeKey) => (graph.node(nodeKey) as DagreNodePosition | undefined)?.x)
    .filter((value): value is number => Number.isFinite(value))
    .sort((left, right) => left - right);

  const centers: number[] = [];
  values.forEach((value) => {
    const previous = centers[centers.length - 1];
    if (previous === undefined || Math.abs(previous - value) > LAYER_EPSILON) {
      centers.push(value);
    }
  });
  return centers;
}

function resolveLayerIndex(layerXs: number[], x: number): number {
  if (!layerXs.length) {
    return 0;
  }

  let bestIndex = 0;
  let bestDistance = Math.abs(layerXs[0] - x);
  for (let index = 1; index < layerXs.length; index += 1) {
    const distance = Math.abs(layerXs[index] - x);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }
  return bestIndex;
}
