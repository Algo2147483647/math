import { normalizeDagInput } from "../graph/normalize";
import { getDefaultFieldMapping, type FieldMapping } from "../graph/fieldMapping";
import type { NormalizedDag } from "../graph/types";

export function createSampleDag(): NormalizedDag {
  return normalizeDagInput({
    A: {
      title: "Alpha",
      define: "Root node",
      children: {
        B: "edge_ab",
        C: "edge_ac",
      },
    },
    B: {
      title: "Beta",
      define: "Child B",
      parents: {
        A: "edge_ab",
      },
      children: {
        D: "edge_bd",
      },
    },
    C: {
      title: "Gamma",
      define: "Child C",
      parents: {
        A: "edge_ac",
      },
    },
    D: {
      title: "Delta",
      define: "Leaf D",
      parents: {
        B: "edge_bd",
      },
      meta: { priority: 1 },
    },
  });
}

export function createForestDag(): NormalizedDag {
  return normalizeDagInput({
    Left: { define: "Left root" },
    Right: { define: "Right root" },
  });
}

export function createChildOnlyDag(): NormalizedDag {
  return normalizeDagInput({
    Root: {
      children: {
        Mid: "edge_rm",
      },
    },
    Mid: {
      children: {
        Leaf: "edge_ml",
      },
    },
    Leaf: {
      define: "terminal",
    },
  });
}

export function createCustomFieldMapping(): FieldMapping {
  return {
    ...getDefaultFieldMapping(),
    title: "label",
    define: "description",
    children: "next",
    parents: "prev",
    type: "kind",
  };
}

export function createMappedSampleDag(): NormalizedDag {
  return normalizeDagInput({
    A: {
      label: "Alpha",
      description: "Root node",
      kind: "root",
      next: {
        B: "edge_ab",
        C: "edge_ac",
      },
    },
    B: {
      label: "Beta",
      description: "Child B",
      kind: "task",
      prev: {
        A: "edge_ab",
      },
      next: {
        D: "edge_bd",
      },
    },
    C: {
      label: "Gamma",
      description: "Child C",
      kind: "task",
      prev: {
        A: "edge_ac",
      },
    },
    D: {
      label: "Delta",
      description: "Leaf D",
      kind: "task",
      prev: {
        B: "edge_bd",
      },
      meta: { priority: 1 },
    },
  });
}
