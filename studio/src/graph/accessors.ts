import { getMappedFieldName, MAPPABLE_SYSTEM_FIELD_KEYS, type FieldMapping, type MappableSystemFieldKey } from "./fieldMapping";
import { DEFAULT_RELATION_VALUE, type DagNode, type NodeKey, type RelationField, type RelationValue } from "./types";

export function createEmptyDagNode(key: NodeKey, mapping: FieldMapping): DagNode {
  return {
    key,
    [getMappedFieldName(mapping, "define")]: "",
    [getMappedFieldName(mapping, "type")]: "",
    [getMappedFieldName(mapping, "parents")]: {},
    [getMappedFieldName(mapping, "children")]: {},
  };
}

export function getNodeSemanticField(node: DagNode | Record<string, unknown>, mapping: FieldMapping, fieldName: MappableSystemFieldKey): unknown {
  return node[getMappedFieldName(mapping, fieldName)];
}

export function setNodeSemanticField(
  node: DagNode | Record<string, unknown>,
  mapping: FieldMapping,
  fieldName: MappableSystemFieldKey,
  value: unknown,
): void {
  node[getMappedFieldName(mapping, fieldName)] = value;
}

export function getNodeTitle(node: DagNode | Record<string, unknown>, mapping: FieldMapping): string {
  return String(getNodeSemanticField(node, mapping, "title") || "").trim();
}

export function getNodeDefine(node: DagNode | Record<string, unknown>, mapping: FieldMapping): string {
  return String(getNodeSemanticField(node, mapping, "define") || "");
}

export function getNodeType(node: DagNode | Record<string, unknown>, mapping: FieldMapping): string {
  return String(getNodeSemanticField(node, mapping, "type") || "").trim();
}

export function getNodeParents(node: DagNode | Record<string, unknown>, mapping: FieldMapping): RelationField {
  return normalizeRelationField(getNodeSemanticField(node, mapping, "parents"));
}

export function getNodeChildren(node: DagNode | Record<string, unknown>, mapping: FieldMapping): RelationField {
  return normalizeRelationField(getNodeSemanticField(node, mapping, "children"));
}

export function getNodeParentKeys(node: DagNode | Record<string, unknown>, mapping: FieldMapping): NodeKey[] {
  return getRelationKeys(getNodeParents(node, mapping));
}

export function getNodeChildKeys(node: DagNode | Record<string, unknown>, mapping: FieldMapping): NodeKey[] {
  return getRelationKeys(getNodeChildren(node, mapping));
}

export function setNodeParents(node: DagNode | Record<string, unknown>, mapping: FieldMapping, value: RelationField): void {
  setNodeSemanticField(node, mapping, "parents", normalizeRelationField(value));
}

export function setNodeChildren(node: DagNode | Record<string, unknown>, mapping: FieldMapping, value: RelationField): void {
  setNodeSemanticField(node, mapping, "children", normalizeRelationField(value));
}

export function getNodeRelation(node: DagNode | Record<string, unknown>, mapping: FieldMapping, fieldName: "parents" | "children"): RelationField {
  return fieldName === "parents" ? getNodeParents(node, mapping) : getNodeChildren(node, mapping);
}

export function setNodeRelation(node: DagNode | Record<string, unknown>, mapping: FieldMapping, fieldName: "parents" | "children", value: RelationField): void {
  if (fieldName === "parents") {
    setNodeParents(node, mapping, value);
    return;
  }
  setNodeChildren(node, mapping, value);
}

export function getNodeRelationMap(
  node: DagNode | Record<string, unknown>,
  mapping: FieldMapping,
  fieldName: "parents" | "children",
  defaultRelationValue: RelationValue = DEFAULT_RELATION_VALUE,
): Record<NodeKey, RelationValue> {
  return toRelationMap(getNodeRelation(node, mapping, fieldName), defaultRelationValue);
}

export function getCustomFieldNames(node: DagNode | Record<string, unknown>, mapping: FieldMapping): string[] {
  const semanticFieldNames = new Set(MAPPABLE_SYSTEM_FIELD_KEYS.map((fieldName) => getMappedFieldName(mapping, fieldName)));
  return Object.keys(node).filter((fieldName) => fieldName !== "key" && !semanticFieldNames.has(fieldName));
}

export function normalizeNodeWithSchema(node: DagNode, mapping: FieldMapping): DagNode {
  const nextNode = { ...node };
  const parentFieldName = getMappedFieldName(mapping, "parents");
  const childFieldName = getMappedFieldName(mapping, "children");
  if (Object.prototype.hasOwnProperty.call(nextNode, parentFieldName)) {
    setNodeParents(nextNode, mapping, getNodeParents(nextNode, mapping));
  }
  if (Object.prototype.hasOwnProperty.call(nextNode, childFieldName)) {
    setNodeChildren(nextNode, mapping, getNodeChildren(nextNode, mapping));
  }
  return nextNode;
}

function uniqueKeys(keys: Iterable<unknown>): NodeKey[] {
  return Array.from(
    new Set(
      Array.from(keys)
        .map((item) => String(item ?? "").trim())
        .filter(Boolean),
    ),
  );
}

function normalizeRelationField(value: unknown): RelationField {
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

function coerceRelationValue(value: unknown): RelationValue {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
    return value;
  }
  return value === undefined ? DEFAULT_RELATION_VALUE : String(value);
}

function getRelationKeys(relationValue: unknown): NodeKey[] {
  if (Array.isArray(relationValue)) {
    return uniqueKeys(relationValue);
  }

  if (relationValue && typeof relationValue === "object") {
    return Object.keys(relationValue).map((key) => key.trim()).filter(Boolean);
  }

  return [];
}

function toRelationMap(value: unknown, defaultRelationValue: RelationValue = DEFAULT_RELATION_VALUE): Record<NodeKey, RelationValue> {
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
