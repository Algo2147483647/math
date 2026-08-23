import { getNodeChildKeys, getNodeChildren, getNodeType } from "../graph/accessors";
import { getDefaultFieldMapping, type FieldMapping } from "../graph/fieldMapping";
import type { GraphLayoutMode, GraphSelection, NodeKey, NormalizedDag, RelationValue } from "../graph/types";
import { DEFAULT_GRAPH_APPEARANCE, type GraphAppearance, type GraphLayoutAppearance } from "../graph/appearance";
import { getRelationKeys } from "../graph/relations";
import { structuredCloneValue } from "../graph/serialize";
import { resolveStageEdgeGeometry } from "./edgeGeometry";
import { getNodeVisual, truncateTitleToWidth } from "./text";
import { resolveStageSelection, withSyntheticSelectionRoot } from "./selection";
import type { LayoutRoutePoint, StageData, StageNode, StageNodeColorTokens, StageRoutePoint } from "./types";
import { buildLevelLayout } from "./algorithms/level";
import { buildDagreLayout } from "./algorithms/dagre";
import { buildSugiyamaLayout } from "./algorithms/sugiyama";
import { buildSugiyamaStageRoutes, buildSugiyamaVerticalPlanner } from "./sugiyama-edge-routing";

type TypeColorSwatch = {
  hue: number;
  saturation: number;
  lightness: number;
};

const TYPE_COLOR_SWATCHES = [
  { hue: 356, saturation: 58, lightness: 47 },
  { hue: 214, saturation: 62, lightness: 44 },
  { hue: 145, saturation: 52, lightness: 40 },
  { hue: 32, saturation: 66, lightness: 47 },
  { hue: 188, saturation: 54, lightness: 42 },
  { hue: 265, saturation: 48, lightness: 48 },
  { hue: 325, saturation: 48, lightness: 48 },
  { hue: 210, saturation: 24, lightness: 44 },
] satisfies TypeColorSwatch[];

export function buildStageData(input: {
  dag: NormalizedDag;
  mapping?: FieldMapping;
  selection: GraphSelection | null;
  layoutMode?: GraphLayoutMode;
  appearance?: GraphAppearance;
  alignNodeWidthsToMax?: boolean;
}): StageData | null {
  const { dag: sourceDag, mapping = getDefaultFieldMapping(), selection: requestedSelection, layoutMode = "sugiyama", appearance = DEFAULT_GRAPH_APPEARANCE, alignNodeWidthsToMax = false } = input;
  const theme = appearance.layout;
  if (!sourceDag || Object.keys(sourceDag).length === 0) {
    return null;
  }

  const dag = structuredCloneValue(sourceDag);
  const selection = resolveStageSelection(dag, requestedSelection, mapping);
  const layoutDag = withSyntheticSelectionRoot(dag, selection, mapping);
  const forestTopLevelSet = new Set(selection.topLevelKeys);
  const layoutRoots = selection.isForest ? selection.topLevelKeys : [selection.rootKey];
  const reachable = selection.isForest
    ? collectReachableFromRoots(layoutDag, selection.topLevelKeys, mapping)
    : collectReachableNodes(layoutDag, selection.rootKey, mapping);
  const typeColorMap = buildTypeColorMap(sourceDag, mapping);
  const visualByKey = buildNodeVisualMap(layoutDag, reachable, mapping, theme, alignNodeWidthsToMax);
  const layoutResult = resolveLayout(layoutMode, layoutDag, layoutRoots, mapping, visualByKey, theme);
  const coordinates = layoutResult.coordinates;
  const nodeKeys = Array.from(reachable).filter((key) => layoutDag[key] && coordinates.has(key));
  const nodesByLayer = new Map<number, StageNode[]>();
  const nodeMap: Record<NodeKey, StageNode> = {};
  const edges: StageData["edges"] = [];
  const incomingMap = buildIncomingMap(layoutDag, nodeKeys, mapping);

  nodeKeys.forEach((nodeKey) => {
    const node = layoutDag[nodeKey];
    const coordinate = coordinates.get(nodeKey);
    const visual = visualByKey.get(nodeKey);
    if (!coordinate || !visual) {
      return;
    }

    const [layer, order] = coordinate;
    const typeLabel = normalizeTypeLabel(getNodeType(node, mapping));
    const nodeData: StageNode = {
      key: nodeKey,
      layer,
      order,
      title: visual.title,
      displayTitle: truncateTitleToWidth(visual.title, visual.width),
      typeLabel,
      colorTokens: typeLabel ? typeColorMap.get(typeLabel) : undefined,
      width: visual.width,
      height: theme.nodeHeight,
      isRoot: selection.isForest ? forestTopLevelSet.has(nodeKey) : nodeKey === selection.rootKey,
      x: 0,
      y: 0,
    };

    if (!nodesByLayer.has(layer)) {
      nodesByLayer.set(layer, []);
    }
    nodesByLayer.get(layer)!.push(nodeData);
    nodeMap[nodeKey] = nodeData;
  });

  const fallbackSlotCounts = new Map(Array.from(nodesByLayer.entries()).map(([layer, layerNodes]) => [layer, layerNodes.length]));
  const sortedLayers = Array.from(new Set([
    ...nodesByLayer.keys(),
    ...(layoutResult.layerSlotCounts?.keys() || []),
  ])).sort((a, b) => a - b);

  let laneCenters = new Map<number, number>();
  let lanes: StageData["lanes"] = [];
  let slotCountsByLayer = layoutResult.layerSlotCounts || fallbackSlotCounts;
  let stageInnerHeight = measureStageInnerHeight(slotCountsByLayer, theme);
  let stageWidth = 0;
  let stageHeight = 0;
  let absoluteOffset: { x: number; y: number } | undefined;
  let sugiyamaVerticalPlanner: ReturnType<typeof buildSugiyamaVerticalPlanner> | undefined;

  if (layoutResult.nodePositions?.size) {
    const absoluteGeometry = applyAbsoluteLayoutGeometry({
      nodeKeys,
      nodeMap,
      nodesByLayer,
      sortedLayers,
      nodePositions: layoutResult.nodePositions,
      theme,
      selection,
    });
    lanes = absoluteGeometry.lanes;
    laneCenters = absoluteGeometry.laneCenters;
    slotCountsByLayer = absoluteGeometry.slotCountsByLayer;
    stageInnerHeight = absoluteGeometry.stageInnerHeight;
    stageWidth = absoluteGeometry.stageWidth;
    stageHeight = absoluteGeometry.stageHeight;
    absoluteOffset = absoluteGeometry.absoluteOffset;
  } else {
    if (layoutMode === "sugiyama") {
      sugiyamaVerticalPlanner = buildSugiyamaVerticalPlanner({
        nodesByLayer,
        logicalSlotCountsByLayer: slotCountsByLayer,
        sortedLayers,
        theme,
      });
      stageInnerHeight = sugiyamaVerticalPlanner.stageInnerHeight;
    }

    sortedLayers.forEach((layer) => {
      const layerNodes = (nodesByLayer.get(layer) || []).sort((a, b) => a.order - b.order);
      if (layoutMode === "level" && layer > 0) {
        layerNodes.sort((a, b) => {
          const aScore = getBarycentricScore(a.key, incomingMap, nodeMap);
          const bScore = getBarycentricScore(b.key, incomingMap, nodeMap);
          return aScore === bScore ? a.order - b.order : aScore - bScore;
        });
      }

      if (layoutMode === "level") {
        layerNodes.forEach((nodeData, index) => {
          nodeData.order = index;
        });
      }

       if (layoutMode === "sugiyama" && sugiyamaVerticalPlanner) {
        layerNodes.forEach((nodeData) => {
          const displayOrder = sugiyamaVerticalPlanner?.nodeDisplayOrderByKey.get(nodeData.key);
          const centerY = sugiyamaVerticalPlanner?.nodeCenterYByKey.get(nodeData.key);
          if (displayOrder !== undefined) {
            nodeData.order = displayOrder;
          }
          if (centerY !== undefined) {
            nodeData.y = centerY;
          }
        });
        return;
      }

      const slotCount = slotCountsByLayer.get(layer) || layerNodes.length || 1;
      const layerHeight = slotCount * theme.nodeHeight + Math.max(slotCount - 1, 0) * theme.rowGap;
      const startY = theme.stagePaddingY + (stageInnerHeight - layerHeight) / 2;
      layerNodes.forEach((nodeData) => {
        nodeData.y = startY + nodeData.order * (theme.nodeHeight + theme.rowGap) + theme.nodeHeight / 2;
      });
    });

    const columnWidths = sortedLayers.map((layer) => {
      const layerNodes = nodesByLayer.get(layer) || [];
      return layerNodes.length ? Math.max(...layerNodes.map((node) => node.width)) : theme.minNodeWidth;
    });
    let cursorX = theme.stagePaddingX;

    sortedLayers.forEach((layer, index) => {
      const layerWidth = columnWidths[index];
      const layerNodes = nodesByLayer.get(layer) || [];
      const laneCenter = cursorX + layerWidth / 2;
      laneCenters.set(layer, laneCenter);
      layerNodes.forEach((nodeData) => {
        nodeData.x = laneCenter;
      });
      lanes.push({
        layer,
        label: layer === 0 ? (selection.isForest ? "Root" : "Focus") : `Tier ${layer}`,
        x: laneCenter,
        width: layerWidth,
      });
      cursorX += layerWidth + theme.columnGap;
    });

    stageWidth = cursorX - theme.columnGap + theme.stagePaddingX;
    stageHeight = stageInnerHeight + theme.stagePaddingY * 2;
  }

  const sugiyamaStageRoutes = layoutMode === "sugiyama"
      ? buildSugiyamaStageRoutes({
          edgeRoutes: layoutResult.edgeRoutes,
          nodeMap,
          nodesByLayer,
          planner: sugiyamaVerticalPlanner || buildSugiyamaVerticalPlanner({
            nodesByLayer,
            logicalSlotCountsByLayer: slotCountsByLayer,
            sortedLayers,
            theme,
          }),
        })
    : undefined;

  nodeKeys.forEach((sourceKey) => {
    const sourceNode = layoutDag[sourceKey];
    const children = getNodeChildren(sourceNode, mapping);
    const childKeys = getRelationKeys(children);
    childKeys.forEach((targetKey) => {
      if (!nodeMap[targetKey]) {
        return;
      }
      const weight = Array.isArray(children) ? 1 : (children as Record<NodeKey, RelationValue>)[targetKey];
      const route = layoutResult.edgeRoutes?.get(`${sourceKey}-->${targetKey}`);
      const points = layoutMode === "sugiyama"
        ? sugiyamaStageRoutes?.get(`${sourceKey}-->${targetKey}`)
        : route?.points.map((point) => (
            getRoutePointPosition(point, laneCenters, slotCountsByLayer, stageInnerHeight, theme, absoluteOffset)
          ));
      edges.push({
        id: `${sourceKey}-->${targetKey}`,
        source: sourceKey,
        target: targetKey,
        weight,
        label: getEdgeLabel(weight),
        points: points && points.length ? points : undefined,
        path: "",
        labelPosition: { x: 0, y: 0 },
      });
    });
  });

  const connectedKeysByNode = buildConnectedKeysByNode(nodeKeys, edges);
  edges.forEach((edge) => {
    const sourceNode = nodeMap[edge.source];
    const targetNode = nodeMap[edge.target];
    if (!sourceNode || !targetNode) {
      return;
    }
    const geometry = resolveStageEdgeGeometry(layoutMode, sourceNode, targetNode, edge.points);
    edge.path = geometry.path;
    edge.labelPosition = geometry.labelPosition;
  });

  return {
    dag: layoutDag,
    layoutMode,
    root: selection.rootKey,
    selection,
    topLevelKeys: selection.topLevelKeys,
    isForest: selection.isForest,
    nodeMap,
    nodes: Object.values(nodeMap),
    edges,
    connectedKeysByNode,
    lanes,
    stageWidth: Math.max(stageWidth, theme.stageMinWidth),
    stageHeight: Math.max(stageHeight, theme.stageMinHeight),
    warnings: layoutResult.warnings,
  };
}

function resolveLayout(
  layoutMode: GraphLayoutMode,
  layoutDag: Record<NodeKey, NormalizedDag[NodeKey] | undefined>,
  layoutRoots: NodeKey[],
  mapping: FieldMapping,
  visualByKey: Map<NodeKey, { width: number }>,
  theme: GraphLayoutAppearance,
) {
  if (layoutMode === "sugiyama") {
    return buildSugiyamaLayout(layoutDag, layoutRoots, mapping);
  }
  if (layoutMode === "dagre") {
    const nodeSizes = new Map<NodeKey, { width: number; height: number }>();
    visualByKey.forEach((visual, nodeKey) => {
      nodeSizes.set(nodeKey, { width: visual.width, height: theme.nodeHeight });
    });
    return buildDagreLayout(layoutDag, layoutRoots, mapping, nodeSizes);
  }
  return buildLevelLayout(layoutDag, layoutRoots, mapping);
}

function buildNodeVisualMap(
  dag: Record<NodeKey, NormalizedDag[NodeKey] | undefined>,
  nodeKeys: Set<NodeKey>,
  mapping: FieldMapping,
  theme: GraphLayoutAppearance,
  alignNodeWidthsToMax: boolean,
): Map<NodeKey, ReturnType<typeof getNodeVisual>> {
  const visuals = new Map<NodeKey, ReturnType<typeof getNodeVisual>>();
  nodeKeys.forEach((nodeKey) => {
    const node = dag[nodeKey];
    if (!node) {
      return;
    }
    visuals.set(nodeKey, getNodeVisual(nodeKey, node, mapping, theme.minNodeWidth, theme.maxNodeWidth, alignNodeWidthsToMax));
  });
  return visuals;
}

function collectReachableNodes(dag: Record<NodeKey, NormalizedDag[NodeKey] | undefined>, root: NodeKey, mapping: FieldMapping): Set<NodeKey> {
  return collectReachableFromRoots(dag, [root], mapping);
}

function collectReachableFromRoots(dag: Record<NodeKey, NormalizedDag[NodeKey] | undefined>, roots: NodeKey[], mapping: FieldMapping): Set<NodeKey> {
  const visited = new Set<NodeKey>();
  const stack = roots.slice();
  while (stack.length) {
    const nodeKey = stack.pop()!;
    const node = dag[nodeKey];
    if (visited.has(nodeKey) || !node) {
      continue;
    }
    visited.add(nodeKey);
    getNodeChildKeys(node, mapping).forEach((childKey) => stack.push(childKey));
  }
  return visited;
}

function buildIncomingMap(dag: Record<NodeKey, NormalizedDag[NodeKey] | undefined>, nodeKeys: NodeKey[], mapping: FieldMapping): Record<NodeKey, NodeKey[]> {
  const visibleKeys = new Set(nodeKeys);
  const incomingMap: Record<NodeKey, NodeKey[]> = {};
  nodeKeys.forEach((nodeKey) => {
    incomingMap[nodeKey] = [];
  });
  nodeKeys.forEach((sourceKey) => {
    const sourceNode = dag[sourceKey];
    if (!sourceNode) {
      return;
    }
    getNodeChildKeys(sourceNode, mapping).forEach((targetKey) => {
      if (visibleKeys.has(targetKey)) {
        incomingMap[targetKey].push(sourceKey);
      }
    });
  });
  return incomingMap;
}

function getBarycentricScore(nodeKey: NodeKey, incomingMap: Record<NodeKey, NodeKey[]>, nodeMap: Record<NodeKey, StageNode>): number {
  const parents = incomingMap[nodeKey] || [];
  if (!parents.length) {
    return nodeMap[nodeKey].order;
  }
  const total = parents.reduce((sum, parentKey) => sum + (nodeMap[parentKey] ? nodeMap[parentKey].order : 0), 0);
  return total / parents.length;
}

function measureStageInnerHeight(slotCountsByLayer: Map<number, number>, theme: GraphLayoutAppearance): number {
  let maxHeight = 0;
  slotCountsByLayer.forEach((slotCount) => {
    const layerHeight = slotCount * theme.nodeHeight + Math.max(slotCount - 1, 0) * theme.rowGap;
    maxHeight = Math.max(maxHeight, layerHeight);
  });
  return Math.max(maxHeight, theme.nodeHeight * 3.4);
}

function applyAbsoluteLayoutGeometry(input: {
  nodeKeys: NodeKey[];
  nodeMap: Record<NodeKey, StageNode>;
  nodesByLayer: Map<number, StageNode[]>;
  sortedLayers: number[];
  nodePositions: Map<NodeKey, { x: number; y: number }>;
  theme: GraphLayoutAppearance;
  selection: StageData["selection"];
}): {
  lanes: StageData["lanes"];
  laneCenters: Map<number, number>;
  slotCountsByLayer: Map<number, number>;
  stageInnerHeight: number;
  stageWidth: number;
  stageHeight: number;
  absoluteOffset: { x: number; y: number };
} {
  const { nodeKeys, nodeMap, nodesByLayer, sortedLayers, nodePositions, theme, selection } = input;
  let minLeft = Infinity;
  let maxRight = -Infinity;
  let minTop = Infinity;
  let maxBottom = -Infinity;

  nodeKeys.forEach((nodeKey) => {
    const node = nodeMap[nodeKey];
    const position = nodePositions.get(nodeKey);
    if (!node || !position) {
      return;
    }
    minLeft = Math.min(minLeft, position.x - node.width / 2);
    maxRight = Math.max(maxRight, position.x + node.width / 2);
    minTop = Math.min(minTop, position.y - node.height / 2);
    maxBottom = Math.max(maxBottom, position.y + node.height / 2);
  });

  if (!Number.isFinite(minLeft) || !Number.isFinite(minTop) || !Number.isFinite(maxRight) || !Number.isFinite(maxBottom)) {
    minLeft = 0;
    minTop = 0;
    maxRight = theme.minNodeWidth;
    maxBottom = theme.nodeHeight * 2;
  }

  const absoluteOffset = {
    x: theme.stagePaddingX - minLeft,
    y: theme.stagePaddingY - minTop,
  };

  nodeKeys.forEach((nodeKey) => {
    const node = nodeMap[nodeKey];
    const position = nodePositions.get(nodeKey);
    if (!node || !position) {
      return;
    }
    node.x = position.x + absoluteOffset.x;
    node.y = position.y + absoluteOffset.y;
  });

  const lanes: StageData["lanes"] = [];
  const laneCenters = new Map<number, number>();
  const slotCountsByLayer = new Map<number, number>();

  sortedLayers.forEach((layer) => {
    const layerNodes = nodesByLayer.get(layer) || [];
    slotCountsByLayer.set(layer, layerNodes.length);
    if (!layerNodes.length) {
      return;
    }

    const laneCenter = layerNodes.reduce((sum, node) => sum + node.x, 0) / layerNodes.length;
    laneCenters.set(layer, laneCenter);
    lanes.push({
      layer,
      label: layer === 0 ? (selection.isForest ? "Root" : "Focus") : `Tier ${layer}`,
      x: laneCenter,
      width: Math.max(...layerNodes.map((node) => node.width)),
    });
  });

  const stageWidth = maxRight - minLeft + theme.stagePaddingX * 2;
  const stageHeight = maxBottom - minTop + theme.stagePaddingY * 2;

  return {
    lanes,
    laneCenters,
    slotCountsByLayer,
    stageInnerHeight: Math.max(stageHeight - theme.stagePaddingY * 2, theme.nodeHeight * 3.4),
    stageWidth,
    stageHeight,
    absoluteOffset,
  };
}

function getRoutePointPosition(
  point: LayoutRoutePoint,
  laneCenters: Map<number, number>,
  slotCountsByLayer: Map<number, number>,
  stageInnerHeight: number,
  theme: GraphLayoutAppearance,
  absoluteOffset?: { x: number; y: number },
): StageRoutePoint {
  if (typeof point.x === "number" && typeof point.y === "number") {
    return {
      layer: point.layer,
      order: point.order,
      x: point.x + (absoluteOffset?.x || 0),
      y: point.y + (absoluteOffset?.y || 0),
    };
  }

  const slotCount = slotCountsByLayer.get(point.layer) || 1;
  const layerHeight = slotCount * theme.nodeHeight + Math.max(slotCount - 1, 0) * theme.rowGap;
  const startY = theme.stagePaddingY + (stageInnerHeight - layerHeight) / 2;
  return {
    layer: point.layer,
    order: point.order,
    x: laneCenters.get(point.layer) || theme.stagePaddingX,
    y: startY + point.order * (theme.nodeHeight + theme.rowGap) + theme.nodeHeight / 2,
  };
}

function getEdgeLabel(weight: unknown): string {
  if (weight === undefined || weight === null || weight === "" || weight === 1) {
    return "";
  }
  return String(weight);
}

function buildConnectedKeysByNode(nodeKeys: NodeKey[], edges: StageData["edges"]): Map<NodeKey, ReadonlySet<NodeKey>> {
  const connectedKeysByNode = new Map<NodeKey, Set<NodeKey>>();
  nodeKeys.forEach((nodeKey) => {
    connectedKeysByNode.set(nodeKey, new Set([nodeKey]));
  });

  edges.forEach((edge) => {
    const sourceKeys = connectedKeysByNode.get(edge.source);
    const targetKeys = connectedKeysByNode.get(edge.target);
    sourceKeys?.add(edge.target);
    targetKeys?.add(edge.source);
  });

  return new Map(Array.from(connectedKeysByNode.entries(), ([nodeKey, connectedKeys]) => [nodeKey, connectedKeys as ReadonlySet<NodeKey>]));
}

function buildTypeColorMap(dag: NormalizedDag, mapping: FieldMapping): Map<string, StageNodeColorTokens> {
  const typeLabels = Array.from(new Set(
    Object.values(dag)
      .map((node) => normalizeTypeLabel(getNodeType(node, mapping)))
      .filter((value): value is string => Boolean(value)),
  )).sort((left, right) => left.localeCompare(right));

  const colorMap = new Map<string, StageNodeColorTokens>();
  if (!typeLabels.length) {
    return colorMap;
  }

  if (typeLabels.length <= TYPE_COLOR_SWATCHES.length) {
    typeLabels.forEach((typeLabel, index) => {
      colorMap.set(typeLabel, createNodeColorTokens(TYPE_COLOR_SWATCHES[index]));
    });
    return colorMap;
  }

  const hueStep = 360 / typeLabels.length;
  typeLabels.forEach((typeLabel, index) => {
    const hue = (index * hueStep + TYPE_COLOR_SWATCHES[0].hue) % 360;
    colorMap.set(typeLabel, createNodeColorTokens({
      hue,
      saturation: 58,
      lightness: 45,
    }));
  });
  return colorMap;
}

function normalizeTypeLabel(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed || undefined;
}

function createNodeColorTokens(swatch: TypeColorSwatch): StageNodeColorTokens {
  const { hue, saturation, lightness } = swatch;

  return {
    glow: hsla(hue, saturation + 8, lightness + 2, 0.13),
    border: hsla(hue, saturation, lightness, 0.34),
    borderStrong: hsla(hue, saturation + 4, lightness - 5, 0.52),
    activeBorder: hsla(hue, saturation + 8, lightness - 3, 0.66),
    pinFill: hsla(hue, saturation + 8, lightness + 4, 0.2),
    pinStroke: hsla(hue, saturation + 6, lightness - 2, 0.34),
    pinCore: hsla(hue, saturation + 8, lightness - 9, 0.88),
    affordanceBg: hsla(hue, Math.max(24, saturation - 10), 94, 0.98),
    affordanceText: hsla(hue, saturation + 6, lightness - 14, 0.88),
  };
}

function hsla(hue: number, saturation: number, lightness: number, alpha: number): string {
  return `hsla(${Math.round(hue)} ${saturation}% ${lightness}% / ${alpha})`;
}
