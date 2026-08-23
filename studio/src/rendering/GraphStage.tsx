import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import type { StageData } from "../layout/types";
import { appearanceToStageStyle, type GraphAppearance } from "../graph/appearance";
import GraphBackdrop from "./GraphBackdrop";
import GraphDefs from "./GraphDefs";
import GraphEdge from "./GraphEdge";
import GraphNode from "./GraphNode";

const EMPTY_CONNECTED_KEYS = new Set<string>();
const DENSE_STAGE_NODE_THRESHOLD = 220;
const DENSE_STAGE_EDGE_THRESHOLD = 440;
const DENSE_STAGE_AREA_THRESHOLD = 20_000_000;

interface GraphStageProps {
  stage: StageData;
  focusedKey: string | null;
  hideNodeBorders: boolean;
  appearance: GraphAppearance;
  svgRef: React.RefObject<SVGSVGElement>;
  onNodeClick: (key: string) => void;
  onNodeDoubleClick: (key: string) => void;
  onNodeContextMenu: (event: React.MouseEvent<SVGGElement>, key: string) => void;
  onBackgroundContextMenu: (event: React.MouseEvent<Element>) => void;
  onFocusChange: (key: string | null) => void;
}

export default function GraphStage({ stage, focusedKey, hideNodeBorders, appearance, svgRef, onNodeClick, onNodeDoubleClick, onNodeContextMenu, onBackgroundContextMenu, onFocusChange }: GraphStageProps) {
  const hoveredKeyRef = useRef<string | null>(null);
  const focusedKeyRef = useRef<string | null>(focusedKey);
  const appliedInteractiveKeyRef = useRef<string | null>(null);
  const nodeElementsByKeyRef = useRef(new Map<string, SVGGElement>());
  const edgeElementsByNodeKeyRef = useRef(new Map<string, SVGGElement[]>());
  const connectedNodeElementsRef = useRef(new Set<SVGGElement>());
  const activeEdgeElementsRef = useRef(new Set<SVGGElement>());
  const currentNodeElementRef = useRef<SVGGElement | null>(null);
  const isDenseStage = stage.nodes.length >= DENSE_STAGE_NODE_THRESHOLD
    || stage.edges.length >= DENSE_STAGE_EDGE_THRESHOLD
    || stage.stageWidth * stage.stageHeight >= DENSE_STAGE_AREA_THRESHOLD;
  const stageStyle = appearanceToStageStyle(appearance) as CSSProperties;

  const clearInteractiveClasses = useCallback(() => {
    const svgElement = svgRef.current;
    if (!svgElement) {
      return;
    }

    svgElement.dataset.hasInteractiveNode = "false";

    if (currentNodeElementRef.current) {
      currentNodeElementRef.current.dataset.hovered = "false";
      currentNodeElementRef.current.dataset.focused = "false";
      currentNodeElementRef.current = null;
    }

    connectedNodeElementsRef.current.forEach((nodeElement) => {
      nodeElement.dataset.connected = "false";
    });
    connectedNodeElementsRef.current.clear();

    activeEdgeElementsRef.current.forEach((edgeElement) => {
      edgeElement.dataset.active = "false";
    });
    activeEdgeElementsRef.current.clear();
  }, [svgRef]);

  const applyInteractiveKey = useCallback((nextKey: string | null) => {
    const svgElement = svgRef.current;
    if (!svgElement) {
      return;
    }

    const previousKey = appliedInteractiveKeyRef.current;
    if (previousKey === nextKey) {
      if (nextKey) {
        const currentNodeElement = nodeElementsByKeyRef.current.get(nextKey);
        if (currentNodeElement) {
          currentNodeElement.dataset.hovered = hoveredKeyRef.current === nextKey ? "true" : "false";
          currentNodeElement.dataset.focused = focusedKeyRef.current === nextKey ? "true" : "false";
        }
      }
      return;
    }

    if (!nextKey) {
      clearInteractiveClasses();
      appliedInteractiveKeyRef.current = null;
      return;
    }

    const nextNodeElement = nodeElementsByKeyRef.current.get(nextKey);
    if (!nextNodeElement) {
      clearInteractiveClasses();
      appliedInteractiveKeyRef.current = null;
      return;
    }

    const previousConnectedKeys = getAdjacentKeys(previousKey, stage);
    const nextConnectedKeys = getAdjacentKeys(nextKey, stage);

    const previousEdgeElements = new Set(edgeElementsByNodeKeyRef.current.get(previousKey || "") || []);
    const nextEdgeElements = new Set(edgeElementsByNodeKeyRef.current.get(nextKey) || []);

    if (!previousKey) {
      svgElement.dataset.hasInteractiveNode = "true";
    }

    if (currentNodeElementRef.current && currentNodeElementRef.current !== nextNodeElement) {
      currentNodeElementRef.current.dataset.hovered = "false";
      currentNodeElementRef.current.dataset.focused = "false";
    }

    nextNodeElement.dataset.hovered = hoveredKeyRef.current === nextKey ? "true" : "false";
    nextNodeElement.dataset.focused = focusedKeyRef.current === nextKey ? "true" : "false";
    currentNodeElementRef.current = nextNodeElement;

    previousConnectedKeys.forEach((connectedKey) => {
      if (nextConnectedKeys.has(connectedKey)) {
        return;
      }
      const connectedNodeElement = nodeElementsByKeyRef.current.get(connectedKey);
      if (!connectedNodeElement) {
        return;
      }
      connectedNodeElement.dataset.connected = "false";
      connectedNodeElementsRef.current.delete(connectedNodeElement);
    });

    nextConnectedKeys.forEach((connectedKey) => {
      const connectedNodeElement = nodeElementsByKeyRef.current.get(connectedKey);
      if (!connectedNodeElement) {
        return;
      }
      connectedNodeElement.dataset.connected = "true";
      connectedNodeElementsRef.current.add(connectedNodeElement);
    });

    previousEdgeElements.forEach((edgeElement) => {
      if (nextEdgeElements.has(edgeElement)) {
        return;
      }
      edgeElement.dataset.active = "false";
      activeEdgeElementsRef.current.delete(edgeElement);
    });

    nextEdgeElements.forEach((edgeElement) => {
      edgeElement.dataset.active = "true";
      activeEdgeElementsRef.current.add(edgeElement);
    });

    appliedInteractiveKeyRef.current = nextKey;
  }, [clearInteractiveClasses, stage.connectedKeysByNode, svgRef]);

  useEffect(() => {
    focusedKeyRef.current = focusedKey;
    if (!hoveredKeyRef.current) {
      applyInteractiveKey(resolveVisibleNodeKey(focusedKey, stage));
    }
  }, [applyInteractiveKey, focusedKey, stage]);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) {
      return;
    }

    nodeElementsByKeyRef.current = collectNodeElements(svgElement);
    edgeElementsByNodeKeyRef.current = collectEdgeElements(svgElement);
    syncInteractiveKey(hoveredKeyRef.current);
    let frameHandle = 0;
    let pendingKey: string | null = null;

    const scheduleInteractiveKey = (nextKey: string | null) => {
      pendingKey = nextKey;
      if (frameHandle) {
        return;
      }
      frameHandle = window.requestAnimationFrame(() => {
        frameHandle = 0;
        if (hoveredKeyRef.current === pendingKey) {
          return;
        }
        syncInteractiveKey(pendingKey);
      });
    };

    const handlePointerOver = (event: PointerEvent) => {
      scheduleInteractiveKey(resolveNodeKey(event.target));
    };

    const handlePointerLeave = () => {
      if (frameHandle) {
        window.cancelAnimationFrame(frameHandle);
        frameHandle = 0;
      }
      if (!hoveredKeyRef.current) {
        return;
      }
      syncInteractiveKey(null);
    };

    svgElement.addEventListener("pointerover", handlePointerOver);
    svgElement.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      if (frameHandle) {
        window.cancelAnimationFrame(frameHandle);
      }
      svgElement.removeEventListener("pointerover", handlePointerOver);
      svgElement.removeEventListener("pointerleave", handlePointerLeave);
      hoveredKeyRef.current = null;
      appliedInteractiveKeyRef.current = null;
      clearInteractiveClasses();
      nodeElementsByKeyRef.current = new Map();
      edgeElementsByNodeKeyRef.current = new Map();
    };
  }, [applyInteractiveKey, clearInteractiveClasses, stage, svgRef]);

  return (
    <svg
      className="dag-graph"
      data-layout={stage.layoutMode}
      data-density={isDenseStage ? "dense" : "normal"}
      data-borderless={hideNodeBorders ? "true" : "false"}
      data-has-interactive-node="false"
      ref={svgRef}
      viewBox={`0 0 ${stage.stageWidth} ${stage.stageHeight}`}
      width={stage.stageWidth}
      height={stage.stageHeight}
      style={stageStyle}
      role="img"
      aria-label={`DAG view focused on ${stage.selection.label}`}
      onContextMenu={onBackgroundContextMenu}
    >
      <GraphDefs appearanceCss={appearance.css} />
      <GraphBackdrop stage={stage} />
      <g className="dag-edge-layer">
        {stage.edges.map((edge) => (
          <GraphEdge
            key={edge.id}
            edge={edge}
            showLabel={appearance.display.showEdgeLabels}
          />
        ))}
      </g>
      <g className="dag-node-layer">
        {stage.nodes.map((node) => (
          <GraphNode
            key={node.key}
            node={node}
            isActive={node.key === stage.root}
            onClick={onNodeClick}
            onDoubleClick={onNodeDoubleClick}
            onContextMenu={onNodeContextMenu}
            onFocusChange={onFocusChange}
          />
        ))}
      </g>
    </svg>
  );

  function syncInteractiveKey(nextHoveredKey: string | null) {
    hoveredKeyRef.current = resolveVisibleNodeKey(nextHoveredKey, stage);
    applyInteractiveKey(hoveredKeyRef.current || resolveVisibleNodeKey(focusedKeyRef.current, stage));
  }
}

function resolveNodeKey(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) {
    return null;
  }
  return target.closest<SVGGElement>(".dag-node[data-key]")?.dataset.key || null;
}

function collectNodeElements(svgElement: SVGSVGElement): Map<string, SVGGElement> {
  const nodeElementsByKey = new Map<string, SVGGElement>();
  svgElement.querySelectorAll<SVGGElement>(".dag-node[data-key]").forEach((nodeElement) => {
    const nodeKey = nodeElement.dataset.key;
    if (nodeKey) {
      nodeElementsByKey.set(nodeKey, nodeElement);
    }
  });
  return nodeElementsByKey;
}

function collectEdgeElements(svgElement: SVGSVGElement): Map<string, SVGGElement[]> {
  const edgeElementsByNodeKey = new Map<string, SVGGElement[]>();
  svgElement.querySelectorAll<SVGGElement>(".dag-edge[data-source][data-target]").forEach((edgeElement) => {
    const sourceKey = edgeElement.dataset.source;
    const targetKey = edgeElement.dataset.target;
    if (sourceKey) {
      const sourceEdges = edgeElementsByNodeKey.get(sourceKey) || [];
      sourceEdges.push(edgeElement);
      edgeElementsByNodeKey.set(sourceKey, sourceEdges);
    }
    if (targetKey && targetKey !== sourceKey) {
      const targetEdges = edgeElementsByNodeKey.get(targetKey) || [];
      targetEdges.push(edgeElement);
      edgeElementsByNodeKey.set(targetKey, targetEdges);
    }
  });
  return edgeElementsByNodeKey;
}

function resolveVisibleNodeKey(nodeKey: string | null, stage: StageData): string | null {
  return nodeKey && stage.nodeMap[nodeKey] ? nodeKey : null;
}

function getAdjacentKeys(nodeKey: string | null, stage: StageData): ReadonlySet<string> {
  if (!nodeKey) {
    return EMPTY_CONNECTED_KEYS;
  }

  const connectedKeys = stage.connectedKeysByNode.get(nodeKey);
  if (!connectedKeys) {
    return EMPTY_CONNECTED_KEYS;
  }

  return new Set(Array.from(connectedKeys).filter((connectedKey) => connectedKey !== nodeKey));
}
