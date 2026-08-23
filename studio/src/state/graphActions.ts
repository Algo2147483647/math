import type { CommandResult } from "../graph/commands";
import type { GraphLayoutMode, GraphSelection, NormalizedDag, NodeKey } from "../graph/types";
import type { EditTransaction } from "./initialState";

export type GraphAction =
  | { type: "graphLoaded"; dag: NormalizedDag; fileName: string; selection: GraphSelection; status: string }
  | { type: "graphReinterpreted"; dag: NormalizedDag; selection: GraphSelection | null; history: GraphSelection[]; status: string }
  | { type: "graphLoadFailed"; status: string }
  | { type: "graphCommandCommitted"; result: CommandResult; transaction: EditTransaction; status?: string }
  | { type: "graphCommandsCommitted"; transaction: EditTransaction; renamedKeys: Array<{ from: NodeKey; to: NodeKey }>; deletedKeys: NodeKey[]; status: string }
  | { type: "undoRequested" }
  | { type: "redoRequested" }
  | { type: "selectionChanged"; selection: GraphSelection; pushHistory?: boolean }
  | { type: "navigateBack" }
  | { type: "layoutModeChanged"; mode: GraphLayoutMode }
  | { type: "zoomChanged"; scale: number; minScale?: number }
  | { type: "settingsToggled"; open?: boolean }
  | { type: "consoleSidebarToggled"; open?: boolean }
  | { type: "consoleSidebarWidthChanged"; width: number }
  | { type: "contextMenuOpened"; x: number; y: number; nodeKey: NodeKey | null }
  | { type: "contextMenuClosed" }
  | { type: "relationEditorOpened"; nodeKey: NodeKey; field: "parents" | "children" }
  | { type: "nodeDetailOpened"; nodeKey: NodeKey }
  | { type: "modalClosed" }
  | { type: "statusChanged"; status: string };
