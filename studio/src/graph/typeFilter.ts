import { getNodeChildren, getNodeType, setNodeChildren, setNodeParents } from "./accessors";
import { getDefaultFieldMapping, type FieldMapping } from "./fieldMapping";
import { getRelationKeys, toRelationMap } from "./relations";
import type { NodeKey, NormalizedDag, RelationValue } from "./types";

export const TYPE_FILTER_SHORTCUT_RELATION = "filtered_path";

export function getGraphTypeOptions(dag: NormalizedDag, mapping: FieldMapping = getDefaultFieldMapping()): string[] {
  return Array.from(new Set(
    Object.values(dag)
      .map((node) => getNodeType(node, mapping))
      .filter(Boolean),
  )).sort((left, right) => left.localeCompare(right));
}

export function projectGraphByType(
  sourceDag: NormalizedDag,
  selectedType: string,
  mapping: FieldMapping = getDefaultFieldMapping(),
): NormalizedDag {
  const type = selectedType.trim();
  if (!type) {
    return sourceDag;
  }

  const visibleKeys = new Set(
    Object.keys(sourceDag).filter((key) => getNodeType(sourceDag[key], mapping) === type),
  );
  const projectedDag: NormalizedDag = {};

  visibleKeys.forEach((key) => {
    projectedDag[key] = { ...sourceDag[key] };
    setNodeParents(projectedDag[key], mapping, {});
    setNodeChildren(projectedDag[key], mapping, {});
  });

  visibleKeys.forEach((sourceKey) => {
    const projectedChildren: Record<NodeKey, RelationValue> = {};
    const sourceChildren = toRelationMap(getNodeChildren(sourceDag[sourceKey], mapping));

    Object.entries(sourceChildren).forEach(([childKey, relation]) => {
      if (visibleKeys.has(childKey)) {
        projectedChildren[childKey] = relation;
      }
    });

    Object.keys(sourceChildren).forEach((childKey) => {
      if (!visibleKeys.has(childKey)) {
        collectFirstVisibleDescendants(sourceDag, childKey, sourceKey, visibleKeys, mapping).forEach((targetKey) => {
          if (!Object.prototype.hasOwnProperty.call(projectedChildren, targetKey)) {
            projectedChildren[targetKey] = TYPE_FILTER_SHORTCUT_RELATION;
          }
        });
      }
    });

    setNodeChildren(projectedDag[sourceKey], mapping, projectedChildren);
  });

  visibleKeys.forEach((key) => setNodeParents(projectedDag[key], mapping, {}));
  visibleKeys.forEach((sourceKey) => {
    const children = toRelationMap(getNodeChildren(projectedDag[sourceKey], mapping));
    Object.entries(children).forEach(([targetKey, relation]) => {
      const target = projectedDag[targetKey];
      if (!target) {
        return;
      }
      const parents = toRelationMap(target[mapping.parents]);
      parents[sourceKey] = relation;
      setNodeParents(target, mapping, parents);
    });
  });

  return projectedDag;
}

function collectFirstVisibleDescendants(
  dag: NormalizedDag,
  startKey: NodeKey,
  sourceKey: NodeKey,
  visibleKeys: Set<NodeKey>,
  mapping: FieldMapping,
): Set<NodeKey> {
  const targets = new Set<NodeKey>();
  const visited = new Set<NodeKey>();
  const stack = [startKey];

  while (stack.length) {
    const key = stack.pop()!;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    if (visibleKeys.has(key)) {
      if (key !== sourceKey) {
        targets.add(key);
      }
      continue;
    }

    const node = dag[key];
    if (node) {
      getRelationKeys(getNodeChildren(node, mapping)).forEach((childKey) => stack.push(childKey));
    }
  }

  return targets;
}
