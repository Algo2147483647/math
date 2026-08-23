import type { CommandResult } from "../graph/commands";
import type { GraphSelection, NormalizedDag } from "../graph/types";
import { getInitialSelection, isSelectionValid, remapSelectionKeys, removeSelectionKeys } from "../graph/selectors";

export function repairSelectionAfterCommand(
  dag: NormalizedDag,
  currentSelection: GraphSelection | null,
  preferredSelection: GraphSelection | null,
  result: CommandResult,
): GraphSelection {
  let nextPreferred = preferredSelection;
  let nextCurrent = currentSelection;

  if (result.renamedKey) {
    const { from, to } = result.renamedKey;
    nextPreferred = remapSelectionKeys(nextPreferred, (key) => (key === from ? to : key));
    nextCurrent = remapSelectionKeys(nextCurrent, (key) => (key === from ? to : key));
  }

  if (result.deletedKeys?.length) {
    const deleteSet = new Set(result.deletedKeys);
    nextPreferred = removeSelectionKeys(nextPreferred, deleteSet);
    nextCurrent = removeSelectionKeys(nextCurrent, deleteSet);
  }

  if (isSelectionValid(nextPreferred, dag)) {
    return nextPreferred!;
  }
  if (isSelectionValid(nextCurrent, dag)) {
    return nextCurrent!;
  }
  return getInitialSelection(dag);
}
