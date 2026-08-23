import { getNodeChildKeys, getNodeParentKeys } from "./accessors";
import { getDefaultFieldMapping, type FieldMapping } from "./fieldMapping";
import type { GraphSelection, NodeKey, NormalizedDag } from "./types";

export function findRootsFromDag(dag: NormalizedDag, mapping: FieldMapping = getDefaultFieldMapping()): NodeKey[] {
  const nodeKeys = Object.keys(dag);
  const nodesWithIncoming = new Set<NodeKey>();
  nodeKeys.forEach((nodeKey) => {
    getNodeParentKeys(dag[nodeKey], mapping).forEach((parentKey) => {
      if (parentKey && parentKey !== nodeKey) {
        nodesWithIncoming.add(nodeKey);
      }
    });
  });

  nodeKeys.forEach((nodeKey) => {
    getNodeChildKeys(dag[nodeKey], mapping).forEach((childKey) => {
      if (childKey && childKey !== nodeKey) {
        nodesWithIncoming.add(childKey);
      }
    });
  });

  const inferredRoots = nodeKeys.filter((nodeKey) => !nodesWithIncoming.has(nodeKey));
  return inferredRoots.length ? inferredRoots : nodeKeys;
}

export function getInitialSelection(dag: NormalizedDag, mapping: FieldMapping = getDefaultFieldMapping()): GraphSelection {
  const roots = findRootsFromDag(dag, mapping);
  if (roots.length === 1) {
    return { type: "node", key: roots[0] };
  }
  return { type: "full" };
}

export function getFullGraphSelection(): GraphSelection {
  return { type: "full" };
}

export function areSelectionsEqual(left: GraphSelection | null, right: GraphSelection | null): boolean {
  return selectionToKey(left) === selectionToKey(right);
}

export function selectionToKey(selection: GraphSelection | null): string {
  if (!selection) {
    return "";
  }
  if (selection.type === "node") {
    return `node:${selection.key}`;
  }
  if (selection.type === "full") {
    return "full";
  }
  return `forest:${selection.label}:${selection.keys.slice().sort().join("|")}`;
}

export function isSelectionValid(selection: GraphSelection | null, dag: NormalizedDag): boolean {
  if (!selection) {
    return false;
  }
  if (selection.type === "full") {
    return Object.keys(dag).length > 0;
  }
  if (selection.type === "node") {
    return Boolean(dag[selection.key]);
  }
  return selection.keys.some((key) => Boolean(dag[key]));
}

export function remapSelectionKeys(selection: GraphSelection | null, keyMapper: (key: NodeKey) => NodeKey | null): GraphSelection | null {
  if (!selection) {
    return null;
  }
  if (selection.type === "node") {
    const nextKey = keyMapper(selection.key);
    return nextKey ? { type: "node", key: nextKey } : null;
  }
  if (selection.type === "forest") {
    const keys = selection.keys.map(keyMapper).filter(Boolean) as NodeKey[];
    return keys.length ? { ...selection, keys } : null;
  }
  return selection;
}

export function removeSelectionKeys(selection: GraphSelection | null, deleteSet: Set<NodeKey>): GraphSelection | null {
  return remapSelectionKeys(selection, (key) => (deleteSet.has(key) ? null : key));
}

export function getParentLevelSelection(dag: NormalizedDag, topLevelKeys: NodeKey[], mapping: FieldMapping = getDefaultFieldMapping()): GraphSelection | null {
  if (!topLevelKeys.length) {
    return null;
  }

  const parentKeys = Array.from(new Set(topLevelKeys.flatMap((nodeKey) => getNodeParentKeys(dag[nodeKey], mapping))));
  if (!parentKeys.length) {
    return null;
  }
  if (parentKeys.length === 1) {
    return { type: "node", key: parentKeys[0] };
  }
  return { type: "forest", keys: parentKeys, label: "Parent level" };
}

export function sanitizeNodeLabel(text: unknown): string {
  return String(text ?? "")
    .split("\\")
    .pop()!
    .split("/")
    .pop()!
    .replace(/\.[^.]+$/, "")
    .replace(/_+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
