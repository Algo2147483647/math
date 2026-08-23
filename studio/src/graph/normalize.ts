import type { DagNode, NodeKey, NormalizedDag, RawGraphInput, RawGraphNode } from "./types";

export function normalizeDagInput(input: unknown): NormalizedDag {
  const dag: NormalizedDag = {};

  if (Array.isArray(input)) {
    input.forEach((item) => {
      if (!item || typeof item !== "object") {
        return;
      }
      const key = String((item as RawGraphNode).key ?? "").trim();
      if (!key) {
        return;
      }
      dag[key] = normalizeNodeValue(key, item as RawGraphNode);
    });
    return dag;
  }

  if (hasNodesArray(input)) {
    return normalizeDagInput(input.nodes);
  }

  if (input && typeof input === "object") {
    Object.entries(input as Record<NodeKey, RawGraphNode>).forEach(([rawKey, value]) => {
      const key = String(rawKey).trim();
      if (!key) {
        return;
      }
      dag[key] = normalizeNodeValue(key, value || {});
    });
  }

  return dag;
}

function hasNodesArray(input: unknown): input is Extract<RawGraphInput, { nodes: RawGraphNode[] }> {
  return Boolean(input && typeof input === "object" && Array.isArray((input as { nodes?: unknown }).nodes));
}

export function normalizeNodeValue(key: NodeKey, value: RawGraphNode): DagNode {
  const nodeValue = value && typeof value === "object" ? { ...value } : {};
  nodeValue.key = key;
  return nodeValue as DagNode;
}
