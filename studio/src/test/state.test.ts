import assert from "node:assert/strict";
import { applyGraphCommand } from "../graph/commands";
import { repairSelectionAfterCommand } from "../state/derived";
import { graphReducer, repairHistoryAfterCommand } from "../state/graphReducer";
import { initialGraphAppState, type EditTransaction, type GraphAppState } from "../state/initialState";
import { defineSuite, defineTest } from "./harness";
import { createSampleDag } from "./fixtures";

export const stateSuite = defineSuite("state", [
  defineTest("graphLoaded preserves workspace preferences while resetting document state", () => {
    const dag = createSampleDag();
    const state: GraphAppState = {
      ...initialGraphAppState,
      layout: { mode: "dagre" },
      ui: {
        ...initialGraphAppState.ui,
        consoleSidebarOpen: true,
        consoleSidebarWidth: 420,
        status: "old",
      },
    };

    const nextState = graphReducer(state, {
      type: "graphLoaded",
      dag,
      fileName: "sample.json",
      selection: { type: "node", key: "A" },
      status: "4 nodes loaded from sample.json.",
    });

    assert.equal(nextState.layout.mode, "dagre");
    assert.equal(nextState.ui.consoleSidebarOpen, true);
    assert.equal(nextState.ui.consoleSidebarWidth, 420);
    assert.equal(nextState.source.fileName, "sample.json");
    assert.equal(nextState.editHistory.undoStack.length, 0);
  }),

  defineTest("graphCommandCommitted advances revision and undo history", () => {
    const dag = createSampleDag();
    const baseState: GraphAppState = {
      ...initialGraphAppState,
      dag,
      source: {
        fileName: "sample.json",
      },
      selection: { type: "node", key: "A" },
      history: [],
      editHistory: {
        undoStack: [],
        redoStack: [],
        revision: 0,
      },
    };
    const result = applyGraphCommand(dag, { type: "addNode", key: "E", parentKey: "A" });
    const selection = repairSelectionAfterCommand(result.dag, baseState.selection, baseState.selection, result);
    const transaction: EditTransaction = {
      label: result.message || "Updated graph.",
      beforeDag: dag,
      afterDag: result.dag,
      beforeSelection: baseState.selection,
      afterSelection: selection,
      beforeNavigationHistory: baseState.history,
      afterNavigationHistory: repairHistoryAfterCommand(baseState, result),
      revisionBefore: 0,
      revisionAfter: 1,
    };

    const nextState = graphReducer(baseState, {
      type: "graphCommandCommitted",
      result,
      transaction,
    });

    assert.equal(nextState.editHistory.revision, 1);
    assert.equal(nextState.editHistory.undoStack.length, 1);
    assert.equal(nextState.editHistory.redoStack.length, 0);
    assert.match(nextState.ui.status, /Added node E/);
  }),

  defineTest("consoleSidebarWidthChanged preserves unrestricted widths", () => {
    const state: GraphAppState = {
      ...initialGraphAppState,
      ui: {
        ...initialGraphAppState.ui,
        consoleSidebarWidth: 360,
      },
    };

    assert.equal(graphReducer(state, { type: "consoleSidebarWidthChanged", width: 120 }).ui.consoleSidebarWidth, 120);
    assert.equal(graphReducer(state, { type: "consoleSidebarWidthChanged", width: 900 }).ui.consoleSidebarWidth, 900);
  }),

  defineTest("repairHistoryAfterCommand remaps renamed selections and removes deleted ones", () => {
    const dag = createSampleDag();
    const state: GraphAppState = {
      ...initialGraphAppState,
      dag,
      selection: { type: "node", key: "A" },
      history: [
        { type: "node", key: "B" },
        { type: "forest", keys: ["B", "C"], label: "Mixed" },
      ],
    };

    const renameResult = applyGraphCommand(dag, { type: "renameNode", oldKey: "B", newKey: "B2" });
    const renamedHistory = repairHistoryAfterCommand(state, {
      dag: renameResult.dag,
      renamedKey: renameResult.renamedKey,
    });
    assert.deepEqual(renamedHistory, [
      { type: "node", key: "B2" },
      { type: "forest", keys: ["B2", "C"], label: "Mixed" },
    ]);

    const deleteResult = applyGraphCommand(dag, { type: "deleteSubtree", rootKey: "B" });
    const deletedHistory = repairHistoryAfterCommand(state, {
      dag: deleteResult.dag,
      deletedKeys: ["B", "C"],
    });
    assert.deepEqual(deletedHistory, []);
  }),
]);
