import { createEmptyDagNode, getNodeRelation, getNodeRelationMap, setNodeRelation } from "./accessors";
import type { FieldMapping } from "./fieldMapping";
import { DEFAULT_RELATION_VALUE, type DagNode, type NodeKey, type NormalizedDag, type RelationField, type RelationValue } from "./types";

export function uniqueKeys(keys: Iterable<unknown>): NodeKey[] {
  return Array.from(
    new Set(
      Array.from(keys)
        .map((item) => String(item ?? "").trim())
        .filter(Boolean),
    ),
  );
}

export function normalizeRelationField(value: unknown): RelationField {
  if (Array.isArray(value)) {
    return uniqueKeys(value);
  }

  if (value && typeof value === "object") {
    const relationMap: Record<NodeKey, RelationValue> = {};
    Object.entries(value as Record<string, unknown>).forEach(([rawKey, rawValue]) => {
      const key = String(rawKey ?? "").trim();
      if (key) {
        relationMap[key] = coerceRelationValue(rawValue);
      }
    });
    return relationMap;
  }

  return {};
}

export function coerceRelationValue(value: unknown): RelationValue {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
    return value;
  }
  return value === undefined ? DEFAULT_RELATION_VALUE : String(value);
}

export function getRelationKeys(relationValue: unknown): NodeKey[] {
  if (Array.isArray(relationValue)) {
    return uniqueKeys(relationValue);
  }

  if (relationValue && typeof relationValue === "object") {
    return Object.keys(relationValue).map((key) => key.trim()).filter(Boolean);
  }

  return [];
}

export function toRelationMap(value: unknown, defaultRelationValue: RelationValue = DEFAULT_RELATION_VALUE): Record<NodeKey, RelationValue> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const relationMap: Record<NodeKey, RelationValue> = {};
    Object.entries(value as Record<string, unknown>).forEach(([rawKey, rawValue]) => {
      const key = String(rawKey ?? "").trim();
      if (key) {
        relationMap[key] = coerceRelationValue(rawValue);
      }
    });
    return relationMap;
  }

  const relationMap: Record<NodeKey, RelationValue> = {};
  getRelationKeys(value).forEach((key) => {
    relationMap[key] = defaultRelationValue;
  });
  return relationMap;
}

export function addRelation(
  node: DagNode,
  mapping: FieldMapping,
  fieldName: "parents" | "children",
  relationKey: NodeKey,
  relationValue: RelationValue = DEFAULT_RELATION_VALUE,
): void {
  const targetKey = relationKey.trim();
  if (!targetKey) {
    return;
  }

  const currentValue = getNodeRelation(node, mapping, fieldName);
  if (Array.isArray(currentValue)) {
    if (!currentValue.includes(targetKey)) {
      setNodeRelation(node, mapping, fieldName, [...currentValue, targetKey]);
    }
    return;
  }

  const relationMap = currentValue && typeof currentValue === "object" ? { ...currentValue } as Record<NodeKey, RelationValue> : {};
  if (!Object.prototype.hasOwnProperty.call(relationMap, targetKey)) {
    relationMap[targetKey] = relationValue;
  }
  setNodeRelation(node, mapping, fieldName, relationMap);
}

export function removeRelation(node: DagNode, mapping: FieldMapping, fieldName: "parents" | "children", relationKey: NodeKey): void {
  const targetKey = relationKey.trim();
  if (!targetKey) {
    return;
  }

  const currentValue = getNodeRelation(node, mapping, fieldName);
  if (Array.isArray(currentValue)) {
    setNodeRelation(node, mapping, fieldName, currentValue.filter((item) => item !== targetKey));
    return;
  }

  if (currentValue && typeof currentValue === "object") {
    const relationMap = { ...currentValue } as Record<NodeKey, RelationValue>;
    delete relationMap[targetKey];
    setNodeRelation(node, mapping, fieldName, relationMap);
  }
}

export function renameRelation(
  node: DagNode,
  mapping: FieldMapping,
  fieldName: "parents" | "children",
  oldKey: NodeKey,
  newKey: NodeKey,
): void {
  const sourceKey = oldKey.trim();
  const targetKey = newKey.trim();
  if (!sourceKey || !targetKey || sourceKey === targetKey) {
    return;
  }

  const currentValue = getNodeRelation(node, mapping, fieldName);
  if (Array.isArray(currentValue)) {
    setNodeRelation(node, mapping, fieldName, uniqueKeys(currentValue.map((item) => (item === sourceKey ? targetKey : item))));
    return;
  }

  if (currentValue && typeof currentValue === "object" && Object.prototype.hasOwnProperty.call(currentValue, sourceKey)) {
    const relationMap = { ...currentValue } as Record<NodeKey, RelationValue>;
    const relation = relationMap[sourceKey];
    delete relationMap[sourceKey];
    if (!Object.prototype.hasOwnProperty.call(relationMap, targetKey)) {
      relationMap[targetKey] = relation;
    }
    setNodeRelation(node, mapping, fieldName, relationMap);
  }
}

export function setRelations(
  node: DagNode,
  mapping: FieldMapping,
  fieldName: "parents" | "children",
  keys: NodeKey[],
  defaultRelationValue: RelationValue = DEFAULT_RELATION_VALUE,
): void {
  const normalizedKeys = uniqueKeys(keys);
  const currentValue = getNodeRelation(node, mapping, fieldName);

  if (Array.isArray(currentValue)) {
    setNodeRelation(node, mapping, fieldName, normalizedKeys);
    return;
  }

  const currentMap = currentValue && typeof currentValue === "object" ? currentValue as Record<NodeKey, RelationValue> : {};
  const nextMap: Record<NodeKey, RelationValue> = {};
  normalizedKeys.forEach((key) => {
    nextMap[key] = Object.prototype.hasOwnProperty.call(currentMap, key) ? currentMap[key] : defaultRelationValue;
  });
  setNodeRelation(node, mapping, fieldName, nextMap);
}

export function ensureNodeExists(dag: NormalizedDag, nodeKey: NodeKey, mapping: FieldMapping): DagNode {
  const key = nodeKey.trim();
  if (!dag[key]) {
    dag[key] = createEmptyDagNode(key, mapping);
  }
  return dag[key];
}

export function syncBidirectionalRelations(dag: NormalizedDag, mapping: FieldMapping, nodeKey: NodeKey, fieldName: "parents" | "children", nextKeys: NodeKey[]): void {
  const node = ensureNodeExists(dag, nodeKey, mapping);
  const oppositeField = fieldName === "parents" ? "children" : "parents";
  const previousKeys = getRelationKeys(getNodeRelation(node, mapping, fieldName));
  const normalizedNextKeys = uniqueKeys(nextKeys).filter((key) => key !== nodeKey);

  setRelations(node, mapping, fieldName, normalizedNextKeys);

  previousKeys.forEach((relatedKey) => {
    if (!normalizedNextKeys.includes(relatedKey) && dag[relatedKey]) {
      removeRelation(dag[relatedKey], mapping, oppositeField, nodeKey);
    }
  });

  normalizedNextKeys.forEach((relatedKey) => {
    const relatedNode = ensureNodeExists(dag, relatedKey, mapping);
    addRelation(relatedNode, mapping, oppositeField, nodeKey);
  });
}

export function syncBidirectionalRelationMap(
  dag: NormalizedDag,
  mapping: FieldMapping,
  nodeKey: NodeKey,
  fieldName: "parents" | "children",
  nextRelations: Record<NodeKey, RelationValue>,
  defaultRelationValue: RelationValue = DEFAULT_RELATION_VALUE,
): void {
  const node = ensureNodeExists(dag, nodeKey, mapping);
  const oppositeField = fieldName === "parents" ? "children" : "parents";
  const previousKeys = getRelationKeys(getNodeRelation(node, mapping, fieldName));
  const normalizedNextRelations: Record<NodeKey, RelationValue> = {};

  Object.entries(nextRelations).forEach(([rawKey, rawValue]) => {
    const key = String(rawKey ?? "").trim();
    if (key && key !== nodeKey) {
      normalizedNextRelations[key] = coerceRelationValue(rawValue);
    }
  });

  setNodeRelation(node, mapping, fieldName, normalizedNextRelations);

  previousKeys.forEach((relatedKey) => {
    if (!Object.prototype.hasOwnProperty.call(normalizedNextRelations, relatedKey) && dag[relatedKey]) {
      removeRelation(dag[relatedKey], mapping, oppositeField, nodeKey);
    }
  });

  Object.entries(normalizedNextRelations).forEach(([relatedKey, relationValue]) => {
    const relatedNode = ensureNodeExists(dag, relatedKey, mapping);
    const oppositeMap = getNodeRelationMap(relatedNode, mapping, oppositeField, defaultRelationValue);
    oppositeMap[nodeKey] = relationValue;
    setNodeRelation(relatedNode, mapping, oppositeField, oppositeMap);
  });
}
