import { getMappedFieldName, type FieldMapping } from "../graph/fieldMapping";
import type { DagNode, GraphSelection, NodeKey, NormalizedDag } from "../graph/types";
import type { ResolvedStageSelection } from "./types";
import { findRootsFromDag } from "../graph/selectors";

export const GRAPH_ROOT_KEY = "__graph_root__";
export const SELECTION_ROOT_KEY = "__selection_root__";

export function resolveStageSelection(dag: NormalizedDag, requestedSelection: GraphSelection | null, mapping: FieldMapping): ResolvedStageSelection {
  const roots = findRootsFromDag(dag, mapping);

  if (requestedSelection?.type === "forest") {
    const topLevelKeys = Array.from(new Set(requestedSelection.keys.filter((key) => dag[key])));
    if (topLevelKeys.length) {
      return {
        rootKey: SELECTION_ROOT_KEY,
        topLevelKeys,
        isForest: true,
        label: requestedSelection.label || "Parent level",
        appSelection: { ...requestedSelection, keys: topLevelKeys },
      };
    }
  }

  if (requestedSelection?.type === "node" && dag[requestedSelection.key]) {
    return {
      rootKey: requestedSelection.key,
      topLevelKeys: [requestedSelection.key],
      isForest: false,
      label: requestedSelection.key,
      appSelection: requestedSelection,
    };
  }

  if (requestedSelection?.type === "full" || roots.length !== 1) {
    const topLevelKeys = roots.length ? roots : Object.keys(dag);
    return {
      rootKey: GRAPH_ROOT_KEY,
      topLevelKeys,
      isForest: true,
      label: "All roots",
      appSelection: { type: "full" },
    };
  }

  return {
    rootKey: roots[0],
    topLevelKeys: [roots[0]],
    isForest: false,
    label: roots[0],
    appSelection: { type: "node", key: roots[0] },
  };
}

export function withSyntheticSelectionRoot(dag: NormalizedDag, selection: ResolvedStageSelection, mapping: FieldMapping): Record<NodeKey, DagNode & { synthetic?: boolean }> {
  const nextDag: Record<NodeKey, DagNode & { synthetic?: boolean }> = { ...dag };
  if (selection.isForest) {
    nextDag[selection.rootKey] = {
      key: selection.rootKey,
      [getMappedFieldName(mapping, "title")]: selection.label,
      [getMappedFieldName(mapping, "children")]: selection.topLevelKeys,
      [getMappedFieldName(mapping, "parents")]: {},
      synthetic: true,
    };
  }
  return nextDag;
}
