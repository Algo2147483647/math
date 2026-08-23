import type { FieldMapping } from "./fieldMapping";
import { normalizeNodeWithSchema } from "./accessors";
import type { NodeKey, NormalizedDag, RawGraphNode } from "./types";

export function serializeDag(dag: NormalizedDag, mapping?: FieldMapping): Record<NodeKey, RawGraphNode> {
  const output: Record<NodeKey, RawGraphNode> = {};

  Object.entries(dag).forEach(([key, value]) => {
    if (!value || typeof value !== "object") {
      return;
    }

    const normalizedNode = mapping ? normalizeNodeWithSchema(value, mapping) : value;
    const nodeValue = structuredCloneValue(normalizedNode) as RawGraphNode;
    if (nodeValue.key === key) {
      delete nodeValue.key;
    }
    output[key] = nodeValue;
  });

  return output;
}

export function structuredCloneValue<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}
