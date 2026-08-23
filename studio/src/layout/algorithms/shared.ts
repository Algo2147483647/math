import { getNodeChildKeys } from "../../graph/accessors";
import type { FieldMapping } from "../../graph/fieldMapping";
import type { DagNode, NodeKey } from "../../graph/types";

export interface VisibleGraph {
  nodeKeys: NodeKey[];
  visibleSet: Set<NodeKey>;
  incoming: Record<NodeKey, NodeKey[]>;
  outgoing: Record<NodeKey, NodeKey[]>;
  orderByKey: Record<NodeKey, number>;
}

export function getExistingRoots(dag: Record<NodeKey, unknown>, roots: NodeKey[]): NodeKey[] {
  return Array.from(new Set(roots.filter((root) => Boolean(dag[root]))));
}

export function collectReachableFromRoots(dag: Record<NodeKey, DagNode | undefined>, roots: NodeKey[], mapping: FieldMapping): Set<NodeKey> {
  return new Set(collectReachableInLevelOrder(dag, roots, mapping));
}

export function collectReachableInLevelOrder(dag: Record<NodeKey, DagNode | undefined>, roots: NodeKey[], mapping: FieldMapping): NodeKey[] {
  const queue = getExistingRoots(dag, roots);
  const visited = new Set(queue);
  const nodeKeys: NodeKey[] = [];

  while (queue.length) {
    const key = queue.shift()!;
    const node = dag[key];
    if (!node) {
      continue;
    }
    nodeKeys.push(key);
    getNodeChildKeys(node, mapping).forEach((childKey) => {
      if (dag[childKey] && !visited.has(childKey)) {
        visited.add(childKey);
        queue.push(childKey);
      }
    });
  }

  return nodeKeys;
}

export function buildVisibleGraph(dag: Record<NodeKey, DagNode | undefined>, roots: NodeKey[], mapping: FieldMapping): VisibleGraph {
  const nodeKeys = collectReachableInLevelOrder(dag, roots, mapping);
  const visibleSet = new Set(nodeKeys);
  const incoming: Record<NodeKey, NodeKey[]> = {};
  const outgoing: Record<NodeKey, NodeKey[]> = {};
  const orderByKey: Record<NodeKey, number> = {};

  nodeKeys.forEach((nodeKey, index) => {
    incoming[nodeKey] = [];
    outgoing[nodeKey] = [];
    orderByKey[nodeKey] = index;
  });

  nodeKeys.forEach((sourceKey) => {
    const sourceNode = dag[sourceKey];
    if (!sourceNode) {
      return;
    }
    getNodeChildKeys(sourceNode, mapping).forEach((targetKey) => {
      if (visibleSet.has(targetKey)) {
        outgoing[sourceKey].push(targetKey);
        incoming[targetKey].push(sourceKey);
      }
    });
  });

  return { nodeKeys, visibleSet, incoming, outgoing, orderByKey };
}
