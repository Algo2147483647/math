import type { GraphLayoutAppearance } from "../graph/appearance";
import type { NodeKey } from "../graph/types";
import type { LayoutEdgeRoute, StageNode, StageRoutePoint } from "./types";

const SUGIYAMA_CHANNEL_INSET = 12;
const SUGIYAMA_CHANNEL_MIN_SPACING = 10;
const SUGIYAMA_CHANNEL_WIDTH_UTILIZATION = 0.8;
const SUGIYAMA_CHANNEL_INTERVAL_GAP = 6;
const EDGE_STROKE_WIDTH = 1.65;
const EDGE_NODE_CLEARANCE_Y = 10;
const EMPTY_CORRIDOR_HEIGHT = 16;

interface SugiyamaLogicalRouteVertex {
  layer: number;
  order: number;
}

interface SugiyamaBoundarySegment {
  edgeId: string;
  upper: SugiyamaLogicalRouteVertex;
  lower: SugiyamaLogicalRouteVertex;
  startY: number;
  endY: number;
}

interface SugiyamaBoundaryBundle {
  bundleKey: string;
  segments: SugiyamaBoundarySegment[];
  startY: number;
  endY: number;
}

interface LayerNodeBand {
  key: NodeKey;
  logicalOrder: number;
  displayOrder: number;
  centerY: number;
}

interface LayerEdgeCorridor {
  logicalOrders: number[];
  laneYs: number[];
  height: number;
}

interface LayerVerticalPlan {
  totalHeight: number;
  nodeBands: LayerNodeBand[];
  orderY: Map<number, number>;
}

export interface SugiyamaVerticalPlanner {
  stageInnerHeight: number;
  nodeCenterYByKey: Map<NodeKey, number>;
  nodeDisplayOrderByKey: Map<NodeKey, number>;
  logicalOrderByKey: Map<NodeKey, number>;
  orderYByLayer: Map<number, Map<number, number>>;
}

export function buildSugiyamaVerticalPlanner(input: {
  nodesByLayer: Map<number, StageNode[]>;
  logicalSlotCountsByLayer: Map<number, number>;
  sortedLayers: number[];
  theme: GraphLayoutAppearance;
}): SugiyamaVerticalPlanner {
  const { nodesByLayer, logicalSlotCountsByLayer, sortedLayers, theme } = input;
  const planByLayer = new Map<number, LayerVerticalPlan>();
  let stageInnerHeight = theme.nodeHeight * 3.4;

  sortedLayers.forEach((layer) => {
    const layerNodes = (nodesByLayer.get(layer) || []).slice().sort((left, right) => left.order - right.order);
    const logicalSlotCount = Math.max(logicalSlotCountsByLayer.get(layer) || layerNodes.length || 1, layerNodes.length || 1);
    const plan = buildLayerVerticalPlan(layerNodes, logicalSlotCount, theme);
    planByLayer.set(layer, plan);
    stageInnerHeight = Math.max(stageInnerHeight, plan.totalHeight);
  });

  const nodeCenterYByKey = new Map<NodeKey, number>();
  const nodeDisplayOrderByKey = new Map<NodeKey, number>();
  const logicalOrderByKey = new Map<NodeKey, number>();
  const orderYByLayer = new Map<number, Map<number, number>>();

  sortedLayers.forEach((layer) => {
    const plan = planByLayer.get(layer);
    if (!plan) {
      return;
    }
    const offsetY = theme.stagePaddingY + (stageInnerHeight - plan.totalHeight) / 2;
    const finalOrderY = new Map<number, number>();
    plan.orderY.forEach((value, order) => {
      finalOrderY.set(order, offsetY + value);
    });
    orderYByLayer.set(layer, finalOrderY);
    plan.nodeBands.forEach((band) => {
      nodeCenterYByKey.set(band.key, offsetY + band.centerY);
      nodeDisplayOrderByKey.set(band.key, band.displayOrder);
      logicalOrderByKey.set(band.key, band.logicalOrder);
    });
  });

  return {
    stageInnerHeight,
    nodeCenterYByKey,
    nodeDisplayOrderByKey,
    logicalOrderByKey,
    orderYByLayer,
  };
}

export function buildSugiyamaStageRoutes(input: {
  edgeRoutes: Map<string, LayoutEdgeRoute> | undefined;
  nodeMap: Record<NodeKey, StageNode>;
  nodesByLayer: Map<number, StageNode[]>;
  planner: SugiyamaVerticalPlanner;
}): Map<string, StageRoutePoint[]> {
  const { edgeRoutes, nodeMap, nodesByLayer, planner } = input;
  if (!edgeRoutes?.size) {
    return new Map();
  }

  const layerBounds = buildSugiyamaLayerBounds(nodesByLayer);
  const boundarySegments = new Map<number, SugiyamaBoundarySegment[]>();
  const logicalRoutes = new Map<string, SugiyamaLogicalRouteVertex[]>();

  edgeRoutes.forEach((route, edgeId) => {
    const sourceNode = nodeMap[route.source];
    const targetNode = nodeMap[route.target];
    if (!sourceNode || !targetNode) {
      return;
    }

    const logicalRoute = buildSugiyamaLogicalRoute(route, sourceNode, targetNode, planner.logicalOrderByKey);
    logicalRoutes.set(edgeId, logicalRoute);
    for (let index = 0; index < logicalRoute.length - 1; index += 1) {
      const upper = logicalRoute[index];
      const lower = logicalRoute[index + 1];
      if (lower.layer !== upper.layer + 1) {
        continue;
      }
      const upperY = planner.orderYByLayer.get(upper.layer)?.get(upper.order);
      const lowerY = planner.orderYByLayer.get(lower.layer)?.get(lower.order);
      if (upperY === undefined || lowerY === undefined) {
        continue;
      }
      if (!boundarySegments.has(upper.layer)) {
        boundarySegments.set(upper.layer, []);
      }
      boundarySegments.get(upper.layer)!.push({
        edgeId,
        upper,
        lower,
        startY: upperY,
        endY: lowerY,
      });
    }
  });

  const channelXByBoundary = new Map<number, Map<string, number>>();
  boundarySegments.forEach((segments, boundaryLayer) => {
    channelXByBoundary.set(
      boundaryLayer,
      assignSugiyamaBoundaryChannels(segments, boundaryLayer, layerBounds),
    );
  });

  const stageRoutes = new Map<string, StageRoutePoint[]>();
  logicalRoutes.forEach((logicalRoute, edgeId) => {
    const sourceNode = nodeMap[edgeRoutes.get(edgeId)?.source || ""];
    const targetNode = nodeMap[edgeRoutes.get(edgeId)?.target || ""];
    if (!sourceNode || !targetNode) {
      return;
    }

    const points: StageRoutePoint[] = [];
    let currentY = sourceNode.y;

    for (let index = 0; index < logicalRoute.length - 1; index += 1) {
      const upper = logicalRoute[index];
      const lower = logicalRoute[index + 1];
      if (lower.layer !== upper.layer + 1) {
        continue;
      }

      const channelX = channelXByBoundary.get(upper.layer)?.get(edgeId);
      const nextY = planner.orderYByLayer.get(lower.layer)?.get(lower.order);
      if (channelX === undefined || nextY === undefined) {
        continue;
      }

      points.push({ layer: upper.layer, order: upper.order, x: channelX, y: currentY });
      currentY = nextY;
      points.push({ layer: lower.layer, order: lower.order, x: channelX, y: currentY });
    }

    stageRoutes.set(edgeId, simplifyStageRoutePoints(points, sourceNode, targetNode));
  });

  return stageRoutes;
}

function buildLayerVerticalPlan(nodes: StageNode[], logicalSlotCount: number, theme: GraphLayoutAppearance): LayerVerticalPlan {
  const nodeBands: LayerNodeBand[] = [];
  const orderY = new Map<number, number>();
  const realNodes = nodes.slice().sort((left, right) => left.order - right.order);
  const corridors = buildLayerEdgeCorridors(realNodes, logicalSlotCount, theme);
  let cursorY = 0;

  if (corridors[0]) {
    assignCorridorYs(corridors[0], cursorY, theme);
    cursorY += corridors[0].height;
  }

  realNodes.forEach((node, index) => {
    const centerY = cursorY + theme.nodeHeight / 2;
    nodeBands.push({
      key: node.key,
      logicalOrder: node.order,
      displayOrder: index,
      centerY,
    });
    orderY.set(node.order, centerY);
    cursorY += theme.nodeHeight;

    const corridor = corridors[index + 1];
    if (!corridor) {
      return;
    }
    assignCorridorYs(corridor, cursorY, theme);
    cursorY += corridor.height;
  });

  corridors.forEach((corridor) => {
    corridor.logicalOrders.forEach((logicalOrder, index) => {
      const laneY = corridor.laneYs[index];
      if (laneY !== undefined) {
        orderY.set(logicalOrder, laneY);
      }
    });
  });

  return { totalHeight: cursorY || theme.nodeHeight, nodeBands, orderY };
}

function buildLayerEdgeCorridors(nodes: StageNode[], logicalSlotCount: number, theme: GraphLayoutAppearance): LayerEdgeCorridor[] {
  if (!nodes.length) {
    const logicalOrders = buildLogicalOrderRange(0, logicalSlotCount - 1);
    return [{
      logicalOrders,
      laneYs: [],
      height: computeCorridorHeight(logicalOrders.length, theme),
    }];
  }

  const corridors: LayerEdgeCorridor[] = [];
  const firstNode = nodes[0];
  corridors.push(createCorridor(buildLogicalOrderRange(0, firstNode.order - 1), theme));

  for (let index = 0; index < nodes.length - 1; index += 1) {
    const upper = nodes[index];
    const lower = nodes[index + 1];
    corridors.push(createCorridor(buildLogicalOrderRange(upper.order + 1, lower.order - 1), theme));
  }

  const lastNode = nodes[nodes.length - 1];
  corridors.push(createCorridor(buildLogicalOrderRange(lastNode.order + 1, logicalSlotCount - 1), theme));
  return corridors;
}

function createCorridor(logicalOrders: number[], theme: GraphLayoutAppearance): LayerEdgeCorridor {
  return {
    logicalOrders,
    laneYs: [],
    height: computeCorridorHeight(logicalOrders.length, theme),
  };
}

function computeCorridorHeight(laneCount: number, theme: GraphLayoutAppearance): number {
  if (laneCount <= 0) {
    return EMPTY_CORRIDOR_HEIGHT;
  }
  const edgeDemand = laneCount * EDGE_STROKE_WIDTH + Math.max(laneCount - 1, 0) * theme.edgeLaneGap + EDGE_NODE_CLEARANCE_Y * 2;
  return Math.max(edgeDemand, EMPTY_CORRIDOR_HEIGHT, theme.rowGap);
}

function assignCorridorYs(corridor: LayerEdgeCorridor, topY: number, theme: GraphLayoutAppearance): void {
  if (!corridor.logicalOrders.length) {
    corridor.laneYs = [];
    return;
  }

  const laneBandHeight = corridor.logicalOrders.length * EDGE_STROKE_WIDTH + Math.max(corridor.logicalOrders.length - 1, 0) * theme.edgeLaneGap;
  const laneStartY = topY + (corridor.height - laneBandHeight) / 2 + EDGE_STROKE_WIDTH / 2;
  corridor.laneYs = corridor.logicalOrders.map((_, index) => laneStartY + index * (EDGE_STROKE_WIDTH + theme.edgeLaneGap));
}

function buildLogicalOrderRange(start: number, end: number): number[] {
  if (end < start) {
    return [];
  }
  const values: number[] = [];
  for (let value = start; value <= end; value += 1) {
    values.push(value);
  }
  return values;
}

function buildSugiyamaLayerBounds(nodesByLayer: Map<number, StageNode[]>): Map<number, { left: number; right: number; center: number }> {
  const bounds = new Map<number, { left: number; right: number; center: number }>();
  nodesByLayer.forEach((nodes, layer) => {
    if (!nodes.length) {
      return;
    }
    const left = Math.min(...nodes.map((node) => node.x - node.width / 2));
    const right = Math.max(...nodes.map((node) => node.x + node.width / 2));
    const center = nodes.reduce((sum, node) => sum + node.x, 0) / nodes.length;
    bounds.set(layer, { left, right, center });
  });
  return bounds;
}

function buildSugiyamaLogicalRoute(
  route: LayoutEdgeRoute,
  sourceNode: StageNode,
  targetNode: StageNode,
  logicalOrderByKey: Map<NodeKey, number>,
): SugiyamaLogicalRouteVertex[] {
  const sourceOrder = logicalOrderByKey.get(sourceNode.key) ?? sourceNode.order;
  const targetOrder = logicalOrderByKey.get(targetNode.key) ?? targetNode.order;
  const intermediate = sourceNode.layer <= targetNode.layer ? route.points : route.points.slice().reverse();
  return [
    { layer: sourceNode.layer, order: sourceOrder },
    ...intermediate.map((point) => ({ layer: point.layer, order: point.order })),
    { layer: targetNode.layer, order: targetOrder },
  ];
}

function assignSugiyamaBoundaryChannels(
  segments: SugiyamaBoundarySegment[],
  boundaryLayer: number,
  layerBounds: Map<number, { left: number; right: number; center: number }>,
): Map<string, number> {
  const leftLayer = layerBounds.get(boundaryLayer);
  const rightLayer = layerBounds.get(boundaryLayer + 1);
  const corridorStart = (leftLayer?.right ?? leftLayer?.center ?? 0) + SUGIYAMA_CHANNEL_INSET;
  const corridorEnd = (rightLayer?.left ?? rightLayer?.center ?? corridorStart) - SUGIYAMA_CHANNEL_INSET;
  const corridorWidth = Math.max(corridorEnd - corridorStart, 0);
  const center = corridorStart <= corridorEnd ? (corridorStart + corridorEnd) / 2 : corridorStart;

  const bundles = buildSugiyamaBoundaryBundles(segments);
  const sortedBundles = bundles.slice().sort((left, right) => {
    if (left.startY !== right.startY) {
      return left.startY - right.startY;
    }
    if (left.endY !== right.endY) {
      return left.endY - right.endY;
    }
    return left.bundleKey.localeCompare(right.bundleKey);
  });

  const channelTailY: number[] = [];
  const channelIndexByBundle = new Map<string, number>();
  sortedBundles.forEach((bundle) => {
    let channelIndex = channelTailY.findIndex((tailY) => bundle.startY >= tailY + SUGIYAMA_CHANNEL_INTERVAL_GAP);
    if (channelIndex === -1) {
      channelIndex = channelTailY.length;
      channelTailY.push(bundle.endY);
    } else {
      channelTailY[channelIndex] = bundle.endY;
    }
    channelIndexByBundle.set(bundle.bundleKey, channelIndex);
  });

  const channelCount = Math.max(channelTailY.length, 1);
  const minimumSpread = Math.max(channelCount - 1, 0) * SUGIYAMA_CHANNEL_MIN_SPACING;
  const desiredSpread = corridorWidth * SUGIYAMA_CHANNEL_WIDTH_UTILIZATION;
  const preferredSpread = channelCount <= 1
    ? 0
    : Math.max(0, Math.min(corridorWidth, Math.max(minimumSpread, desiredSpread)));
  const step = channelCount > 1 ? preferredSpread / (channelCount - 1) : 0;
  const bandStart = center - preferredSpread / 2;
  const xByEdge = new Map<string, number>();

  bundles.forEach((bundle) => {
    const channelIndex = channelIndexByBundle.get(bundle.bundleKey) || 0;
    const x = channelCount === 1 ? center : bandStart + channelIndex * step;
    const snappedX = snapSvgCoordinate(clamp(x, corridorStart, corridorEnd));
    bundle.segments.forEach((segment) => {
      xByEdge.set(segment.edgeId, snappedX);
    });
  });

  return xByEdge;
}

function buildSugiyamaBoundaryBundles(segments: SugiyamaBoundarySegment[]): SugiyamaBoundaryBundle[] {
  const bundlesByKey = new Map<string, SugiyamaBoundaryBundle>();

  segments.forEach((segment) => {
    const bundleKey = `${segment.upper.layer}:${segment.upper.order}`;
    const intervalStart = Math.min(segment.startY, segment.endY);
    const intervalEnd = Math.max(segment.startY, segment.endY);
    const existing = bundlesByKey.get(bundleKey);
    if (existing) {
      existing.segments.push(segment);
      existing.startY = Math.min(existing.startY, intervalStart);
      existing.endY = Math.max(existing.endY, intervalEnd);
      return;
    }

    bundlesByKey.set(bundleKey, {
      bundleKey,
      segments: [segment],
      startY: intervalStart,
      endY: intervalEnd,
    });
  });

  return Array.from(bundlesByKey.values());
}

function simplifyStageRoutePoints(points: StageRoutePoint[], sourceNode: StageNode, targetNode: StageNode): StageRoutePoint[] {
  const simplified: StageRoutePoint[] = [];
  const start = { x: sourceNode.x + sourceNode.width / 2 + 4, y: sourceNode.y };
  const end = { x: targetNode.x - targetNode.width / 2, y: targetNode.y };

  points.forEach((point) => {
    const previous = simplified[simplified.length - 1];
    if (previous && nearlyEqual(previous.x, point.x) && nearlyEqual(previous.y, point.y)) {
      return;
    }
    simplified.push(point);
    while (simplified.length >= 3) {
      const current = simplified[simplified.length - 1];
      const middle = simplified[simplified.length - 2];
      const before = simplified[simplified.length - 3];
      const first = simplified.length === 3 ? start : simplified[simplified.length - 4];
      if (isCollinearOrthogonal(first, before, middle) || isCollinearOrthogonal(before, middle, current)) {
        simplified.splice(simplified.length - 2, 1);
        continue;
      }
      break;
    }
  });

  while (simplified.length && nearlyEqual(simplified[0].x, start.x) && nearlyEqual(simplified[0].y, start.y)) {
    simplified.shift();
  }
  while (simplified.length && nearlyEqual(simplified[simplified.length - 1].x, end.x) && nearlyEqual(simplified[simplified.length - 1].y, end.y)) {
    simplified.pop();
  }

  return simplified.filter((point, index) => {
    const previous = index === 0 ? start : simplified[index - 1];
    const next = index === simplified.length - 1 ? end : simplified[index + 1];
    return !isCollinearOrthogonal(previous, point, next);
  });
}

function isCollinearOrthogonal(
  first: { x: number; y: number },
  middle: { x: number; y: number },
  last: { x: number; y: number },
): boolean {
  return (nearlyEqual(first.x, middle.x) && nearlyEqual(middle.x, last.x))
    || (nearlyEqual(first.y, middle.y) && nearlyEqual(middle.y, last.y));
}

function nearlyEqual(left: number, right: number): boolean {
  return Math.abs(left - right) < 0.001;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function snapSvgCoordinate(value: number): number {
  return Math.round(value) + 0.5;
}
