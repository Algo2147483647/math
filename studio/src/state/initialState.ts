import type { GraphLayoutMode, GraphSelection, NodeKey, NormalizedDag } from "../graph/types";
import { loadGraphPagePreferences } from "./preferences";

export interface EditTransaction {
  label: string;
  beforeDag: NormalizedDag;
  afterDag: NormalizedDag;
  beforeSelection: GraphSelection | null;
  afterSelection: GraphSelection | null;
  beforeNavigationHistory: GraphSelection[];
  afterNavigationHistory: GraphSelection[];
  revisionBefore: number;
  revisionAfter: number;
  renamedKeys?: Array<{ from: NodeKey; to: NodeKey }>;
}

export interface GraphAppState {
  dag: NormalizedDag | null;
  source: {
    fileName: string;
  };
  selection: GraphSelection | null;
  history: GraphSelection[];
  editHistory: {
    undoStack: EditTransaction[];
    redoStack: EditTransaction[];
    revision: number;
  };
  layout: {
    mode: GraphLayoutMode;
  };
  zoom: {
    scale: number;
    minScale: number;
    maxScale: number;
  };
  ui: {
    status: string;
    settingsOpen: boolean;
    consoleSidebarOpen: boolean;
    consoleSidebarWidth: number;
    contextMenu: null | { x: number; y: number; nodeKey: NodeKey | null };
    relationEditor: null | { nodeKey: NodeKey; field: "parents" | "children" };
    nodeDetail: null | { nodeKey: NodeKey };
  };
}

const savedPreferences = loadGraphPagePreferences();

export const initialGraphAppState: GraphAppState = {
  dag: null,
  source: {
    fileName: "math.json",
  },
  selection: null,
  history: [],
  editHistory: {
    undoStack: [],
    redoStack: [],
    revision: 0,
  },
  layout: {
    mode: savedPreferences.layoutMode,
  },
  zoom: {
    scale: 1,
    minScale: 1,
    maxScale: Number.POSITIVE_INFINITY,
  },
  ui: {
    status: "Opening content/math.json...",
    settingsOpen: false,
    consoleSidebarOpen: savedPreferences.consoleSidebarOpen,
    consoleSidebarWidth: savedPreferences.consoleSidebarWidth,
    contextMenu: null,
    relationEditor: null,
    nodeDetail: null,
  },
};
