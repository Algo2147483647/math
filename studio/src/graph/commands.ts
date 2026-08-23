import { createEmptyDagNode, getNodeChildKeys, getNodeChildren, getNodeParentKeys, getNodeParents, setNodeChildren, setNodeParents, setNodeSemanticField } from "./accessors";
import { getDefaultFieldMapping, type FieldMapping } from "./fieldMapping";
import type { DagNode, NodeKey, NormalizedDag, RelationValue } from "./types";
import { DEFAULT_RELATION_VALUE } from "./types";
import { getRelationKeys, removeRelation, renameRelation, syncBidirectionalRelationMap, syncBidirectionalRelations, toRelationMap } from "./relations";
import { structuredCloneValue } from "./serialize";

export type GraphCommand =
  | { type: "renameNode"; oldKey: NodeKey; newKey: NodeKey }
  | { type: "deleteNode"; key: NodeKey }
  | { type: "deleteSubtree"; rootKey: NodeKey }
  | { type: "addNode"; key: NodeKey; parentKey?: NodeKey }
  | { type: "addNodeFromFields"; key: NodeKey; fields: Record<string, unknown>; parentKey?: NodeKey }
  | { type: "setEdge"; parentKey: NodeKey; childKey: NodeKey; weight?: RelationValue }
  | { type: "removeEdge"; parentKey: NodeKey; childKey: NodeKey }
  | { type: "updateNodeFields"; key: NodeKey; nextKey?: NodeKey; fields: Record<string, unknown> }
  | { type: "setParents"; key: NodeKey; parents: NodeKey[] }
  | { type: "setChildren"; key: NodeKey; children: NodeKey[] }
  | { type: "setParentRelations"; key: NodeKey; parents: Record<NodeKey, RelationValue> }
  | { type: "setChildRelations"; key: NodeKey; children: Record<NodeKey, RelationValue> };

export interface CommandResult {
  dag: NormalizedDag;
  changedKeys: NodeKey[];
  deletedKeys?: NodeKey[];
  renamedKey?: { from: NodeKey; to: NodeKey };
  message?: string;
}

export function applyGraphCommand(sourceDag: NormalizedDag, command: GraphCommand, mapping: FieldMapping = getDefaultFieldMapping()): CommandResult {
  const dag = structuredCloneValue(sourceDag);

  switch (command.type) {
    case "renameNode":
      return renameNode(dag, mapping, command.oldKey, command.newKey);
    case "deleteNode":
      return deleteNodes(dag, mapping, [command.key], `Deleted node ${command.key}.`);
    case "deleteSubtree":
      return deleteNodes(dag, mapping, collectSubtreeNodeKeys(dag, command.rootKey, mapping), `Deleted subtree rooted at ${command.rootKey}.`);
    case "addNode":
      return addNode(dag, mapping, command.key, command.parentKey);
    case "addNodeFromFields":
      return addNodeFromFields(dag, mapping, command.key, command.fields, command.parentKey);
    case "setEdge":
      return setEdge(dag, mapping, command.parentKey, command.childKey, command.weight);
    case "removeEdge":
      return removeEdge(dag, mapping, command.parentKey, command.childKey);
    case "setParents":
      syncBidirectionalRelations(dag, mapping, command.key, "parents", command.parents);
      return { dag, changedKeys: [command.key, ...command.parents], message: `Updated parents for ${command.key}.` };
    case "setChildren":
      syncBidirectionalRelations(dag, mapping, command.key, "children", command.children);
      return { dag, changedKeys: [command.key, ...command.children], message: `Updated children for ${command.key}.` };
    case "setParentRelations":
      syncBidirectionalRelationMap(dag, mapping, command.key, "parents", command.parents);
      return { dag, changedKeys: [command.key, ...Object.keys(command.parents)], message: `Updated parents for ${command.key}.` };
    case "setChildRelations":
      syncBidirectionalRelationMap(dag, mapping, command.key, "children", command.children);
      return { dag, changedKeys: [command.key, ...Object.keys(command.children)], message: `Updated children for ${command.key}.` };
    case "updateNodeFields":
      return updateNodeFields(dag, mapping, command.key, command.nextKey || command.key, command.fields);
  }
}

function renameNode(dag: NormalizedDag, mapping: FieldMapping, oldKey: NodeKey, newKey: NodeKey): CommandResult {
  const sourceKey = oldKey.trim();
  const targetKey = newKey.trim();
  assertValidNewKey(dag, targetKey, sourceKey);
  const nodeValue = dag[sourceKey];
  if (!nodeValue) {
    throw new Error(`Node "${sourceKey}" does not exist.`);
  }

  delete dag[sourceKey];
  dag[targetKey] = { ...nodeValue, key: targetKey };
  Object.keys(dag).forEach((nodeKey) => {
    renameRelation(dag[nodeKey], mapping, "parents", sourceKey, targetKey);
    renameRelation(dag[nodeKey], mapping, "children", sourceKey, targetKey);
  });
  return {
    dag,
    changedKeys: [targetKey],
    renamedKey: { from: sourceKey, to: targetKey },
    message: `Renamed node key from ${sourceKey} to ${targetKey}.`,
  };
}

function deleteNodes(dag: NormalizedDag, mapping: FieldMapping, nodeKeys: NodeKey[], message: string): CommandResult {
  const deleteSet = new Set(nodeKeys.filter((nodeKey) => Boolean(dag[nodeKey])));
  if (!deleteSet.size) {
    throw new Error("No matching nodes were found.");
  }
  if (deleteSet.size >= Object.keys(dag).length) {
    throw new Error("At least one node must remain in the graph.");
  }

  deleteSet.forEach((nodeKey) => {
    delete dag[nodeKey];
  });

  Object.keys(dag).forEach((otherKey) => {
    deleteSet.forEach((deletedKey) => {
      removeRelation(dag[otherKey], mapping, "parents", deletedKey);
      removeRelation(dag[otherKey], mapping, "children", deletedKey);
    });
  });
  return { dag, changedKeys: Object.keys(dag), deletedKeys: Array.from(deleteSet), message };
}

export function collectSubtreeNodeKeys(dag: NormalizedDag, rootKey: NodeKey, mapping: FieldMapping = getDefaultFieldMapping()): NodeKey[] {
  if (!dag[rootKey]) {
    return [];
  }

  const visited = new Set<NodeKey>();
  const stack = [rootKey];
  while (stack.length) {
    const currentKey = stack.pop()!;
    if (visited.has(currentKey) || !dag[currentKey]) {
      continue;
    }
    visited.add(currentKey);
    getNodeChildKeys(dag[currentKey], mapping).forEach((childKey) => stack.push(childKey));
  }
  return Array.from(visited);
}

function addNode(dag: NormalizedDag, mapping: FieldMapping, key: NodeKey, parentKey?: NodeKey): CommandResult {
  const nextKey = key.trim();
  assertValidNewKey(dag, nextKey);
  dag[nextKey] = createEmptyDagNode(nextKey, mapping);
  if (parentKey && dag[parentKey]) {
    syncBidirectionalRelations(dag, mapping, parentKey, "children", [...getNodeChildKeys(dag[parentKey], mapping), nextKey]);
  }
  return { dag, changedKeys: parentKey ? [nextKey, parentKey] : [nextKey], message: `Added node ${nextKey}.` };
}

function addNodeFromFields(dag: NormalizedDag, mapping: FieldMapping, key: NodeKey, fields: Record<string, unknown>, parentKey?: NodeKey): CommandResult {
  const nextKey = key.trim();
  assertValidNewKey(dag, nextKey);

  const nextNode = structuredCloneValue(fields) as DagNode;
  nextNode.key = nextKey;
  const typeFieldName = mapping.type;
  if (!Object.prototype.hasOwnProperty.call(nextNode, typeFieldName)) {
    setNodeSemanticField(nextNode, mapping, "type", "");
  }
  setNodeParents(nextNode, mapping, {});
  setNodeChildren(nextNode, mapping, {});
  dag[nextKey] = nextNode;

  if (parentKey && dag[parentKey]) {
    syncBidirectionalRelations(dag, mapping, parentKey, "children", [...getNodeChildKeys(dag[parentKey], mapping), nextKey]);
  }

  return { dag, changedKeys: parentKey ? [nextKey, parentKey] : [nextKey], message: `Added node ${nextKey}.` };
}

function setEdge(dag: NormalizedDag, mapping: FieldMapping, parentKey: NodeKey, childKey: NodeKey, weight: RelationValue = DEFAULT_RELATION_VALUE): CommandResult {
  const sourceKey = parentKey.trim();
  const targetKey = childKey.trim();
  const parentNode = dag[sourceKey];
  const childNode = dag[targetKey];

  if (!parentNode) {
    throw new Error(`Node "${sourceKey}" does not exist.`);
  }
  if (!childNode) {
    throw new Error(`Node "${targetKey}" does not exist.`);
  }
  if (sourceKey === targetKey) {
    throw new Error("A node cannot reference itself.");
  }

  const nextChildren = toRelationMap(getNodeChildren(parentNode, mapping));
  nextChildren[targetKey] = weight;
  setNodeChildren(parentNode, mapping, nextChildren);

  const nextParents = toRelationMap(getNodeParents(childNode, mapping));
  nextParents[sourceKey] = weight;
  setNodeParents(childNode, mapping, nextParents);

  return {
    dag,
    changedKeys: [sourceKey, targetKey],
    message: weight === DEFAULT_RELATION_VALUE
      ? `Linked ${sourceKey} -> ${targetKey}.`
      : `Set edge ${sourceKey} -> ${targetKey} to ${String(weight)}.`,
  };
}

function removeEdge(dag: NormalizedDag, mapping: FieldMapping, parentKey: NodeKey, childKey: NodeKey): CommandResult {
  const sourceKey = parentKey.trim();
  const targetKey = childKey.trim();
  const parentNode = dag[sourceKey];
  const childNode = dag[targetKey];

  if (!parentNode) {
    throw new Error(`Node "${sourceKey}" does not exist.`);
  }
  if (!childNode) {
    throw new Error(`Node "${targetKey}" does not exist.`);
  }
  if (!getNodeChildKeys(parentNode, mapping).includes(targetKey)) {
    throw new Error(`Edge "${sourceKey}" -> "${targetKey}" does not exist.`);
  }

  removeRelation(parentNode, mapping, "children", targetKey);
  removeRelation(childNode, mapping, "parents", sourceKey);

  return {
    dag,
    changedKeys: [sourceKey, targetKey],
    message: `Removed edge ${sourceKey} -> ${targetKey}.`,
  };
}

function updateNodeFields(dag: NormalizedDag, mapping: FieldMapping, oldKey: NodeKey, nextKey: NodeKey, fields: Record<string, unknown>): CommandResult {
  const sourceKey = oldKey.trim();
  const targetKey = nextKey.trim();
  assertValidNewKey(dag, targetKey, sourceKey);
  if (!dag[sourceKey]) {
    throw new Error(`Node "${sourceKey}" does not exist.`);
  }

  const nextNode = { ...structuredCloneValue(fields), key: targetKey } as DagNode;
  const nextParentKeys = getRelationKeys(nextNode[mapping.parents]);
  const nextChildKeys = getRelationKeys(nextNode[mapping.children]);
  if (nextParentKeys.includes(targetKey) || nextChildKeys.includes(targetKey)) {
    throw new Error("A node cannot reference itself.");
  }

  const previousParentKeys = getNodeParentKeys(dag[sourceKey], mapping);
  const previousChildKeys = getNodeChildKeys(dag[sourceKey], mapping);

  if (sourceKey !== targetKey) {
    delete dag[sourceKey];
    Object.keys(dag).forEach((nodeKey) => {
      renameRelation(dag[nodeKey], mapping, "parents", sourceKey, targetKey);
      renameRelation(dag[nodeKey], mapping, "children", sourceKey, targetKey);
    });
  }

  dag[targetKey] = nextNode;
  syncEditedNodeRelations(dag, mapping, targetKey, previousParentKeys, previousChildKeys, nextParentKeys, nextChildKeys);

  return {
    dag,
    changedKeys: [targetKey],
    renamedKey: sourceKey === targetKey ? undefined : { from: sourceKey, to: targetKey },
    message: `Updated node ${targetKey}.`,
  };
}

function syncEditedNodeRelations(
  dag: NormalizedDag,
  mapping: FieldMapping,
  nodeKey: NodeKey,
  previousParentKeys: NodeKey[],
  previousChildKeys: NodeKey[],
  nextParentKeys: NodeKey[],
  nextChildKeys: NodeKey[],
): void {
  previousParentKeys.forEach((parentKey) => {
    if (!nextParentKeys.includes(parentKey) && dag[parentKey]) {
      removeRelation(dag[parentKey], mapping, "children", nodeKey);
    }
  });
  previousChildKeys.forEach((childKey) => {
    if (!nextChildKeys.includes(childKey) && dag[childKey]) {
      removeRelation(dag[childKey], mapping, "parents", nodeKey);
    }
  });
  syncBidirectionalRelations(dag, mapping, nodeKey, "parents", nextParentKeys);
  syncBidirectionalRelations(dag, mapping, nodeKey, "children", nextChildKeys);
}

function assertValidNewKey(dag: NormalizedDag, key: NodeKey, currentKey?: NodeKey): void {
  if (!key) {
    throw new Error("Node key cannot be empty.");
  }
  if (key.includes("\n") || key.includes(",")) {
    throw new Error("Node key cannot contain commas or line breaks.");
  }
  if (/[<>:\"/\\|?*]/.test(key) || key === "." || key === "..") {
    throw new Error("Node key must be a valid Markdown filename stem.");
  }
  if (key !== currentKey && Object.prototype.hasOwnProperty.call(dag, key)) {
    throw new Error(`Node key "${key}" already exists.`);
  }
}
