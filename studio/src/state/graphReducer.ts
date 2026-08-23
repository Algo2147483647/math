import { areSelectionsEqual, isSelectionValid, remapSelectionKeys, removeSelectionKeys } from "../graph/selectors";
import { getGraphLayoutLabel } from "../graph/types";
import { initialGraphAppState, type GraphAppState } from "./initialState";
import type { GraphAction } from "./graphActions";
import { clampConsoleSidebarWidth } from "./preferences";

const EDIT_HISTORY_LIMIT = 100;

export function graphReducer(state: GraphAppState, action: GraphAction): GraphAppState {
  switch (action.type) {
    case "graphLoaded":
      return {
        ...initialGraphAppState,
        dag: action.dag,
        source: {
          fileName: action.fileName,
        },
        selection: action.selection,
        history: [],
        editHistory: {
          undoStack: [],
          redoStack: [],
          revision: 0,
        },
        layout: state.layout,
        ui: {
          ...initialGraphAppState.ui,
          consoleSidebarOpen: state.ui.consoleSidebarOpen,
          consoleSidebarWidth: state.ui.consoleSidebarWidth,
          status: action.status,
        },
      };
    case "graphReinterpreted":
      return {
        ...state,
        dag: action.dag,
        selection: action.selection,
        history: action.history,
        editHistory: {
          ...state.editHistory,
          undoStack: [],
          redoStack: [],
        },
        ui: {
          ...state.ui,
          contextMenu: null,
          relationEditor: null,
          nodeDetail: null,
          status: action.status,
        },
      };
    case "graphLoadFailed":
      return { ...state, dag: null, ui: { ...state.ui, status: action.status } };
    case "selectionChanged": {
      const shouldPush = action.pushHistory && state.selection && !areSelectionsEqual(state.selection, action.selection);
      return {
        ...state,
        selection: action.selection,
        history: shouldPush ? [...state.history, state.selection!] : state.history,
        ui: { ...state.ui, contextMenu: null },
      };
    }
    case "navigateBack": {
      const previousSelection = state.history[state.history.length - 1];
      if (!previousSelection) {
        return state;
      }
      return {
        ...state,
        selection: previousSelection,
        history: state.history.slice(0, -1),
        ui: { ...state.ui, contextMenu: null },
      };
    }
    case "graphCommandCommitted": {
      const { result, transaction } = action;
      const revision = transaction.revisionAfter;
      const undoStack = pushEditTransaction(state.editHistory.undoStack, transaction);
      const nextUi = applyBatchUiEffects(state.ui, result.renamedKey ? [result.renamedKey] : [], result.deletedKeys || []);

      return {
        ...state,
        dag: transaction.afterDag,
        selection: transaction.afterSelection,
        history: transaction.afterNavigationHistory,
        editHistory: {
          ...state.editHistory,
          undoStack,
          redoStack: [],
          revision,
        },
        ui: {
          ...nextUi,
          contextMenu: null,
          status: action.status || result.message || state.ui.status,
        },
      };
    }
    case "graphCommandsCommitted": {
      const revision = action.transaction.revisionAfter;
      const undoStack = pushEditTransaction(state.editHistory.undoStack, action.transaction);
      const nextUi = applyBatchUiEffects(state.ui, action.renamedKeys, action.deletedKeys);

      return {
        ...state,
        dag: action.transaction.afterDag,
        selection: action.transaction.afterSelection,
        history: action.transaction.afterNavigationHistory,
        editHistory: {
          ...state.editHistory,
          undoStack,
          redoStack: [],
          revision,
        },
        ui: {
          ...nextUi,
          contextMenu: null,
          status: action.status,
        },
      };
    }
    case "undoRequested": {
      const transaction = state.editHistory.undoStack[state.editHistory.undoStack.length - 1];
      if (!transaction) {
        return state;
      }

      const undoStack = state.editHistory.undoStack.slice(0, -1);
      const redoStack = [...state.editHistory.redoStack, transaction];
      const revision = transaction.revisionBefore;

      return {
        ...state,
        dag: transaction.beforeDag,
        selection: transaction.beforeSelection,
        history: transaction.beforeNavigationHistory,
        editHistory: {
          ...state.editHistory,
          undoStack,
          redoStack,
          revision,
        },
        ui: {
          ...state.ui,
          contextMenu: null,
          relationEditor: null,
          nodeDetail: null,
          status: `Undid: ${transaction.label}`,
        },
      };
    }
    case "redoRequested": {
      const transaction = state.editHistory.redoStack[state.editHistory.redoStack.length - 1];
      if (!transaction) {
        return state;
      }

      const redoStack = state.editHistory.redoStack.slice(0, -1);
      const undoStack = pushEditTransaction(state.editHistory.undoStack, transaction);
      const revision = transaction.revisionAfter;

      return {
        ...state,
        dag: transaction.afterDag,
        selection: transaction.afterSelection,
        history: transaction.afterNavigationHistory,
        editHistory: {
          ...state.editHistory,
          undoStack,
          redoStack,
          revision,
        },
        ui: {
          ...state.ui,
          contextMenu: null,
          relationEditor: null,
          nodeDetail: null,
          status: `Redid: ${transaction.label}`,
        },
      };
    }
    case "layoutModeChanged":
      return {
        ...state,
        layout: { ...state.layout, mode: action.mode },
        ui: {
          ...state.ui,
          contextMenu: null,
          status: state.dag ? `Layout: ${getGraphLayoutLabel(action.mode)}.` : state.ui.status,
        },
      };
    case "zoomChanged":
      if (
        Math.abs(state.zoom.scale - action.scale) < 0.0001
        && Math.abs(state.zoom.minScale - (action.minScale ?? state.zoom.minScale)) < 0.0001
      ) {
        return state;
      }
      return {
        ...state,
        zoom: {
          ...state.zoom,
          minScale: action.minScale ?? state.zoom.minScale,
          scale: action.scale,
        },
      };
    case "settingsToggled":
      return { ...state, ui: { ...state.ui, settingsOpen: action.open ?? !state.ui.settingsOpen } };
    case "consoleSidebarToggled":
      return { ...state, ui: { ...state.ui, consoleSidebarOpen: action.open ?? !state.ui.consoleSidebarOpen } };
    case "consoleSidebarWidthChanged":
      return { ...state, ui: { ...state.ui, consoleSidebarWidth: clampConsoleSidebarWidth(action.width) } };
    case "contextMenuOpened":
      return { ...state, ui: { ...state.ui, contextMenu: { x: action.x, y: action.y, nodeKey: action.nodeKey } } };
    case "contextMenuClosed":
      return { ...state, ui: { ...state.ui, contextMenu: null } };
    case "relationEditorOpened":
      return { ...state, ui: { ...state.ui, contextMenu: null, relationEditor: { nodeKey: action.nodeKey, field: action.field } } };
    case "nodeDetailOpened":
      return { ...state, ui: { ...state.ui, contextMenu: null, nodeDetail: { nodeKey: action.nodeKey } } };
    case "modalClosed":
      return { ...state, ui: { ...state.ui, relationEditor: null, nodeDetail: null } };
    case "statusChanged":
      return { ...state, ui: { ...state.ui, status: action.status } };
  }
}

function pushEditTransaction(stack: GraphAppState["editHistory"]["undoStack"], transaction: GraphAppState["editHistory"]["undoStack"][number]) {
  const next = [...stack, transaction];
  return next.length > EDIT_HISTORY_LIMIT ? next.slice(next.length - EDIT_HISTORY_LIMIT) : next;
}

function applyBatchUiEffects(
  ui: GraphAppState["ui"],
  renamedKeys: Array<{ from: string; to: string }>,
  deletedKeys: string[],
): GraphAppState["ui"] {
  const deleted = new Set(deletedKeys);
  let nodeDetail = ui.nodeDetail;
  let relationEditor = ui.relationEditor;

  renamedKeys.forEach((renamed) => {
    if (nodeDetail?.nodeKey === renamed.from) {
      nodeDetail = { nodeKey: renamed.to };
    }
    if (relationEditor?.nodeKey === renamed.from) {
      relationEditor = { ...relationEditor, nodeKey: renamed.to };
    }
  });

  if (nodeDetail && deleted.has(nodeDetail.nodeKey)) {
    nodeDetail = null;
  }
  if (relationEditor && deleted.has(relationEditor.nodeKey)) {
    relationEditor = null;
  }

  return {
    ...ui,
    nodeDetail,
    relationEditor,
  };
}

export function repairHistoryAfterCommand(state: GraphAppState, result: { dag: NonNullable<GraphAppState["dag"]>; renamedKey?: { from: string; to: string }; deletedKeys?: string[] }): GraphAppState["history"] {
  let history = state.history;
  if (result.renamedKey) {
    history = history.map((item) => remapSelectionKeys(item, (key) => (key === result.renamedKey!.from ? result.renamedKey!.to : key))).filter(Boolean) as GraphAppState["history"];
  }
  if (result.deletedKeys?.length) {
    const deleteSet = new Set(result.deletedKeys);
    history = history.map((item) => removeSelectionKeys(item, deleteSet)).filter(Boolean) as GraphAppState["history"];
  }
  return history.filter((item) => isSelectionValid(item, result.dag));
}
