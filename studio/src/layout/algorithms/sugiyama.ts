import type { FieldMapping } from "../../graph/fieldMapping";
import type { DagNode, NodeKey } from "../../graph/types";
import type { LayoutEdgeRoute, LayoutResult } from "../types";
import { buildVisibleGraph, getExistingRoots, type VisibleGraph } from "./shared";

const CROSSING_REDUCTION_PASSES = 6;

interface LayoutEdge {
  source: NodeKey;
  target: NodeKey;
  originalSource: NodeKey;
  originalTarget: NodeKey;
  reversedForLayout: boolean;
}

interface LayoutItem {
  id: NodeKey;
  layer: number;
  order: number;
  realKey?: NodeKey;
  dummyFor?: string;
}

interface NormalizedRoute {
  edgeId: string;
  source: NodeKey;
  target: NodeKey;
  items: LayoutItem[];
  reversedForLayout: boolean;
}

interface LayerSegment {
  source: NodeKey;
  target: NodeKey;
}

interface CrossingIndex {
  incoming: Record<NodeKey, NodeKey[]>;
  outgoing: Record<NodeKey, NodeKey[]>;
  segmentsByUpperLayer: Map<number, LayerSegment[]>;
  itemById: Record<NodeKey, LayoutItem>;
}

export function buildSugiyamaLayout(dag: Record<NodeKey, DagNode | undefined>, roots: NodeKey[], mapping: FieldMapping): LayoutResult {
  const graph = buildVisibleGraph(dag, roots, mapping);
  const rootSet = new Set(getExistingRoots(dag, roots));
  const stableOrderByKey = buildStableOrderByKey(dag, graph);
  const layoutEdges = buildLayoutEdges(graph);
  const cycleResult = breakCyclesForLayout(graph.nodeKeys, layoutEdges);
  const layerByKey = assignLayers(graph.nodeKeys, cycleResult.edges, rootSet);
  const normalized = normalizeLongEdges(cycleResult.edges, layerByKey);
  const originalOrderById = buildOriginalOrderById(normalized.items, stableOrderByKey);
  const layers = buildLayers(normalized.items, originalOrderById);

  reduceCrossings(layers, normalized.segments, originalOrderById);
  refreshItemOrders(layers);

  const coordinates: LayoutResult["coordinates"] = new Map();
  normalized.items.forEach((item) => {
    if (item.realKey) {
      coordinates.set(item.realKey, [item.layer, item.order]);
    }
  });

  const layerSlotCounts = new Map<number, number>();
  layers.forEach((items, layer) => {
    layerSlotCounts.set(layer, items.length);
  });

  const edgeRoutes = new Map<string, LayoutEdgeRoute>();
  normalized.routes.forEach((route) => {
    edgeRoutes.set(route.edgeId, {
      source: route.source,
      target: route.target,
      points: route.items.map((item) => ({ layer: item.layer, order: item.order })),
      reversedForLayout: route.reversedForLayout,
    });
  });

  return { coordinates, warnings: cycleResult.warnings, layerSlotCounts, edgeRoutes };
}

function buildLayoutEdges(graph: VisibleGraph): LayoutEdge[] {
  const edges: LayoutEdge[] = [];
  graph.nodeKeys.forEach((source) => {
    graph.outgoing[source].forEach((target) => {
      edges.push({ source, target, originalSource: source, originalTarget: target, reversedForLayout: false });
    });
  });
  return edges;
}

function breakCyclesForLayout(nodeKeys: NodeKey[], edges: LayoutEdge[]): { edges: LayoutEdge[]; warnings: string[] } {
  const outgoing = new Map<NodeKey, LayoutEdge[]>();
  nodeKeys.forEach((key) => outgoing.set(key, []));
  edges.forEach((edge) => outgoing.get(edge.source)?.push(edge));

  const visiting = new Set<NodeKey>();
  const visited = new Set<NodeKey>();
  const reversed = new Set<LayoutEdge>();
  const warnings: string[] = [];

  const visit = (nodeKey: NodeKey) => {
    visiting.add(nodeKey);
    for (const edge of outgoing.get(nodeKey) || []) {
      if (visiting.has(edge.target)) {
        reversed.add(edge);
        warnings.push(`Sugiyama layout reversed "${edge.source}" -> "${edge.target}" to break a visible cycle.`);
        continue;
      }
      if (!visited.has(edge.target)) {
        visit(edge.target);
      }
    }
    visiting.delete(nodeKey);
    visited.add(nodeKey);
  };

  nodeKeys.forEach((nodeKey) => {
    if (!visited.has(nodeKey)) {
      visit(nodeKey);
    }
  });

  const nextEdges = edges.map((edge) => {
    if (!reversed.has(edge)) {
      return edge;
    }
    return { ...edge, source: edge.target, target: edge.source, reversedForLayout: true };
  });

  return { edges: nextEdges, warnings };
}

function assignLayers(nodeKeys: NodeKey[], edges: LayoutEdge[], rootSet: Set<NodeKey>): Record<NodeKey, number> {
  const incoming = new Map<NodeKey, LayoutEdge[]>();
  nodeKeys.forEach((nodeKey) => incoming.set(nodeKey, []));
  edges.forEach((edge) => incoming.get(edge.target)?.push(edge));

  const layerByKey: Record<NodeKey, number> = {};
  const visiting = new Set<NodeKey>();

  const rankNode = (nodeKey: NodeKey): number => {
    if (layerByKey[nodeKey] !== undefined) {
      return layerByKey[nodeKey];
    }
    if (rootSet.has(nodeKey)) {
      layerByKey[nodeKey] = 0;
      return 0;
    }
    if (visiting.has(nodeKey)) {
      return 0;
    }

    visiting.add(nodeKey);
    let layer = 0;
    (incoming.get(nodeKey) || []).forEach((edge) => {
      layer = Math.max(layer, rankNode(edge.source) + 1);
    });
    visiting.delete(nodeKey);
    layerByKey[nodeKey] = layer;
    return layer;
  };

  nodeKeys.forEach((nodeKey) => {
    rankNode(nodeKey);
  });

  return layerByKey;
}

function normalizeLongEdges(edges: LayoutEdge[], layerByKey: Record<NodeKey, number>): {
  items: LayoutItem[];
  segments: LayoutEdge[];
  routes: NormalizedRoute[];
} {
  const items: LayoutItem[] = Object.entries(layerByKey).map(([key, layer]) => ({ id: key, realKey: key, layer, order: 0 }));
  const segments: LayoutEdge[] = [];
  const routes: NormalizedRoute[] = [];

  edges.forEach((edge, edgeIndex) => {
    const sourceLayer = layerByKey[edge.source];
    const targetLayer = layerByKey[edge.target];
    const span = targetLayer - sourceLayer;
    const routeItems: LayoutItem[] = [];

    if (span <= 1) {
      segments.push(edge);
      routes.push({
        edgeId: `${edge.originalSource}-->${edge.originalTarget}`,
        source: edge.originalSource,
        target: edge.originalTarget,
        items: routeItems,
        reversedForLayout: edge.reversedForLayout,
      });
      return;
    }

    let previous = edge.source;
    for (let layer = sourceLayer + 1; layer < targetLayer; layer += 1) {
      const dummyId = `__sugiyama_dummy_${edgeIndex}_${layer}__`;
      const dummy: LayoutItem = { id: dummyId, layer, order: 0, dummyFor: `${edge.originalSource}-->${edge.originalTarget}` };
      items.push(dummy);
      routeItems.push(dummy);
      segments.push({ ...edge, source: previous, target: dummyId });
      previous = dummyId;
    }

    segments.push({ ...edge, source: previous, target: edge.target });
    routes.push({
      edgeId: `${edge.originalSource}-->${edge.originalTarget}`,
      source: edge.originalSource,
      target: edge.originalTarget,
      items: routeItems,
      reversedForLayout: edge.reversedForLayout,
    });
  });

  return { items, segments, routes };
}

function buildStableOrderByKey(dag: Record<NodeKey, unknown>, graph: VisibleGraph): Record<NodeKey, number> {
  const orderByKey: Record<NodeKey, number> = {};
  const visibleSet = graph.visibleSet;
  let index = 0;

  Object.keys(dag).forEach((key) => {
    if (visibleSet.has(key)) {
      orderByKey[key] = index;
      index += 1;
    }
  });

  graph.nodeKeys.forEach((key) => {
    if (orderByKey[key] === undefined) {
      orderByKey[key] = index;
      index += 1;
    }
  });

  return orderByKey;
}

function buildOriginalOrderById(items: LayoutItem[], stableOrderByKey: Record<NodeKey, number>): Record<NodeKey, number> {
  const originalOrderById: Record<NodeKey, number> = {};
  const fallbackOffset = Object.keys(stableOrderByKey).length;
  items.forEach((item, index) => {
    originalOrderById[item.id] = item.realKey ? stableOrderByKey[item.realKey] : fallbackOffset + index;
  });
  return originalOrderById;
}

function buildLayers(items: LayoutItem[], originalOrderById: Record<NodeKey, number>): Map<number, LayoutItem[]> {
  const layers = new Map<number, LayoutItem[]>();
  items.forEach((item) => {
    if (!layers.has(item.layer)) {
      layers.set(item.layer, []);
    }
    layers.get(item.layer)!.push(item);
  });

  layers.forEach((layerItems) => {
    layerItems.sort((a, b) => originalOrderById[a.id] - originalOrderById[b.id]);
  });
  refreshItemOrders(layers);
  return layers;
}

function reduceCrossings(layers: Map<number, LayoutItem[]>, segments: LayoutEdge[], originalOrder: Record<NodeKey, number>): void {
  const sortedLayerIndexes = Array.from(layers.keys()).sort((a, b) => a - b);
  if (sortedLayerIndexes.length < 2) {
    return;
  }

  const crossingIndex = buildCrossingIndex(layers, segments);
  let bestCrossings = countTotalCrossings(layers, crossingIndex);

  for (let pass = 0; pass < CROSSING_REDUCTION_PASSES; pass += 1) {
    [...sortedLayerIndexes].reverse().forEach((layer) => {
      if (layer === sortedLayerIndexes[sortedLayerIndexes.length - 1]) {
        return;
      }
      sortLayerByNeighbors(layers.get(layer)!, crossingIndex.outgoing, crossingIndex, originalOrder);
      refreshItemOrders(layers);
      transposeLayer(layers, layer, crossingIndex);
    });

    sortedLayerIndexes.forEach((layer) => {
      if (layer === sortedLayerIndexes[0]) {
        return;
      }
      sortLayerByNeighbors(layers.get(layer)!, crossingIndex.incoming, crossingIndex, originalOrder);
      refreshItemOrders(layers);
      transposeLayer(layers, layer, crossingIndex);
    });

    const nextCrossings = countTotalCrossings(layers, crossingIndex);
    if (nextCrossings >= bestCrossings) {
      if (nextCrossings === bestCrossings) {
        bestCrossings = nextCrossings;
      }
      break;
    }
    bestCrossings = nextCrossings;
  }
}

function buildCrossingIndex(layers: Map<number, LayoutItem[]>, segments: LayoutEdge[]): CrossingIndex {
  const layerById: Record<NodeKey, number> = {};
  const itemById: Record<NodeKey, LayoutItem> = {};
  layers.forEach((layerItems, layer) => {
    layerItems.forEach((item) => {
      layerById[item.id] = layer;
      itemById[item.id] = item;
    });
  });

  const incoming: Record<NodeKey, NodeKey[]> = {};
  const outgoing: Record<NodeKey, NodeKey[]> = {};
  const segmentsByUpperLayer = new Map<number, LayerSegment[]>();

  segments.forEach((edge) => {
    const sourceLayer = layerById[edge.source];
    const targetLayer = layerById[edge.target];
    if (sourceLayer === undefined || targetLayer === undefined || targetLayer !== sourceLayer + 1) {
      return;
    }

    if (!incoming[edge.target]) {
      incoming[edge.target] = [];
    }
    if (!outgoing[edge.source]) {
      outgoing[edge.source] = [];
    }
    incoming[edge.target].push(edge.source);
    outgoing[edge.source].push(edge.target);

    if (!segmentsByUpperLayer.has(sourceLayer)) {
      segmentsByUpperLayer.set(sourceLayer, []);
    }
    segmentsByUpperLayer.get(sourceLayer)!.push({ source: edge.source, target: edge.target });
  });

  return { incoming, outgoing, segmentsByUpperLayer, itemById };
}

function sortLayerByNeighbors(
  layerItems: LayoutItem[],
  neighborMap: Record<NodeKey, NodeKey[]>,
  crossingIndex: CrossingIndex,
  originalOrder: Record<NodeKey, number>,
): void {
  layerItems.sort((a, b) => {
    const aScore = getNeighborScore(a.id, neighborMap, crossingIndex);
    const bScore = getNeighborScore(b.id, neighborMap, crossingIndex);
    if (aScore.median !== bScore.median) {
      return aScore.median - bScore.median;
    }
    if (aScore.average !== bScore.average) {
      return aScore.average - bScore.average;
    }
    return originalOrder[a.id] - originalOrder[b.id];
  });
}

function getNeighborScore(
  itemId: NodeKey,
  neighborMap: Record<NodeKey, NodeKey[]>,
  crossingIndex: CrossingIndex,
): { median: number; average: number } {
  const orders = (neighborMap[itemId] || []).map((neighborKey) => getItemOrder(neighborKey, crossingIndex)).sort((a, b) => a - b);
  if (!orders.length) {
    const ownOrder = getItemOrder(itemId, crossingIndex);
    return { median: ownOrder, average: ownOrder };
  }

  const middle = Math.floor(orders.length / 2);
  const median = orders.length % 2 === 0 ? (orders[middle - 1] + orders[middle]) / 2 : orders[middle];
  const average = orders.reduce((sum, order) => sum + order, 0) / orders.length;
  return { median, average };
}

function transposeLayer(layers: Map<number, LayoutItem[]>, layer: number, crossingIndex: CrossingIndex): void {
  const layerItems = layers.get(layer);
  if (!layerItems || layerItems.length < 2) {
    return;
  }

  let improved = true;
  while (improved) {
    improved = false;
    for (let index = 0; index < layerItems.length - 1; index += 1) {
      const first = layerItems[index];
      const second = layerItems[index + 1];
      const delta = countAdjacentSwapCrossingDelta(first.id, second.id, crossingIndex);
      if (delta < 0) {
        layerItems[index] = second;
        layerItems[index + 1] = first;
        second.order = index;
        first.order = index + 1;
        improved = true;
      }
    }
  }
}

function countAdjacentSwapCrossingDelta(firstId: NodeKey, secondId: NodeKey, crossingIndex: CrossingIndex): number {
  return (
    countNeighborSwapDelta(crossingIndex.incoming[firstId] || [], crossingIndex.incoming[secondId] || [], crossingIndex) +
    countNeighborSwapDelta(crossingIndex.outgoing[firstId] || [], crossingIndex.outgoing[secondId] || [], crossingIndex)
  );
}

function countNeighborSwapDelta(firstNeighbors: NodeKey[], secondNeighbors: NodeKey[], crossingIndex: CrossingIndex): number {
  let before = 0;
  let after = 0;
  firstNeighbors.forEach((firstNeighbor) => {
    secondNeighbors.forEach((secondNeighbor) => {
      const difference = getItemOrder(firstNeighbor, crossingIndex) - getItemOrder(secondNeighbor, crossingIndex);
      if (difference > 0) {
        before += 1;
      } else if (difference < 0) {
        after += 1;
      }
    });
  });
  return after - before;
}

function countTotalCrossings(layers: Map<number, LayoutItem[]>, crossingIndex: CrossingIndex): number {
  const sortedLayerIndexes = Array.from(layers.keys()).sort((a, b) => a - b);
  let crossings = 0;
  for (let index = 0; index < sortedLayerIndexes.length - 1; index += 1) {
    crossings += countCrossingsBetweenLayerSegments(crossingIndex.segmentsByUpperLayer.get(sortedLayerIndexes[index]) || [], crossingIndex);
  }
  return crossings;
}

function countCrossingsBetweenLayerSegments(segments: LayerSegment[], crossingIndex: CrossingIndex): number {
  if (segments.length < 2) {
    return 0;
  }

  const orderedSegments = segments
    .map((edge) => ({ sourceOrder: getItemOrder(edge.source, crossingIndex), targetOrder: getItemOrder(edge.target, crossingIndex) }))
    .sort((a, b) => (a.sourceOrder === b.sourceOrder ? a.targetOrder - b.targetOrder : a.sourceOrder - b.sourceOrder));

  const maxTargetOrder = orderedSegments.reduce((maxOrder, edge) => Math.max(maxOrder, edge.targetOrder), 0);
  const tree = new FenwickTree(maxTargetOrder + 2);
  let crossings = 0;
  let processed = 0;

  for (let index = 0; index < orderedSegments.length;) {
    const sourceOrder = orderedSegments[index].sourceOrder;
    let nextIndex = index;
    while (nextIndex < orderedSegments.length && orderedSegments[nextIndex].sourceOrder === sourceOrder) {
      nextIndex += 1;
    }

    for (let groupIndex = index; groupIndex < nextIndex; groupIndex += 1) {
      const targetOrder = orderedSegments[groupIndex].targetOrder;
      crossings += processed - tree.sum(targetOrder + 1);
    }
    for (let groupIndex = index; groupIndex < nextIndex; groupIndex += 1) {
      tree.add(orderedSegments[groupIndex].targetOrder + 1, 1);
      processed += 1;
    }

    index = nextIndex;
  }

  return crossings;
}

function refreshItemOrders(layers: Map<number, LayoutItem[]>): void {
  layers.forEach((layerItems) => refreshLayerOrder(layerItems));
}

function refreshLayerOrder(layerItems: LayoutItem[]): void {
  layerItems.forEach((item, order) => {
    item.order = order;
  });
}

function getItemOrder(itemId: NodeKey, crossingIndex: CrossingIndex): number {
  return crossingIndex.itemById[itemId]?.order ?? 0;
}

class FenwickTree {
  private readonly values: number[];

  constructor(size: number) {
    this.values = new Array(size + 1).fill(0);
  }

  add(index: number, value: number): void {
    for (let cursor = index; cursor < this.values.length; cursor += cursor & -cursor) {
      this.values[cursor] += value;
    }
  }

  sum(index: number): number {
    let total = 0;
    for (let cursor = index; cursor > 0; cursor -= cursor & -cursor) {
      total += this.values[cursor];
    }
    return total;
  }
}
