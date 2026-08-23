import assert from "node:assert/strict";
import { applyGraphCommand, collectSubtreeNodeKeys } from "../graph/commands";
import { getParentLevelSelection, getInitialSelection, remapSelectionKeys, removeSelectionKeys, sanitizeNodeLabel } from "../graph/selectors";
import { serializeDag } from "../graph/serialize";
import { getGraphTypeOptions, projectGraphByType, TYPE_FILTER_SHORTCUT_RELATION } from "../graph/typeFilter";
import { defineSuite, defineTest } from "./harness";
import { createChildOnlyDag, createCustomFieldMapping, createForestDag, createMappedSampleDag, createSampleDag } from "./fixtures";

export const graphSuite = defineSuite("graph", [
  defineTest("renameNode updates reciprocal relations without mutating the source dag", () => {
    const sourceDag = createSampleDag();
    const beforeSnapshot = serializeDag(sourceDag);

    const result = applyGraphCommand(sourceDag, { type: "renameNode", oldKey: "B", newKey: "B_Renamed" });

    assert.equal(sourceDag.B.key, "B");
    assert.deepEqual(serializeDag(sourceDag), beforeSnapshot);
    assert.equal(result.dag.B_Renamed.key, "B_Renamed");
    assert.ok(!("B" in result.dag));
    assert.deepEqual(result.dag.A.children, { B_Renamed: "edge_ab", C: "edge_ac" });
    assert.deepEqual(result.dag.D.parents, { B_Renamed: "edge_bd" });
  }),

  defineTest("deleteSubtree removes descendants and cleans dangling relations", () => {
    const sourceDag = createSampleDag();
    const result = applyGraphCommand(sourceDag, { type: "deleteSubtree", rootKey: "B" });

    assert.deepEqual(collectSubtreeNodeKeys(sourceDag, "B").sort(), ["B", "D"]);
    assert.ok(!("B" in result.dag));
    assert.ok(!("D" in result.dag));
    assert.deepEqual(result.dag.A.children, { C: "edge_ac" });
    assert.deepEqual(result.deletedKeys?.sort(), ["B", "D"]);
  }),

  defineTest("addNode initializes an empty type field", () => {
    const sourceDag = createSampleDag();
    const result = applyGraphCommand(sourceDag, { type: "addNode", key: "E" });

    assert.equal(result.dag.E.type, "");
    assert.deepEqual(result.dag.E.parents, {});
    assert.deepEqual(result.dag.E.children, {});

    const mapping = createCustomFieldMapping();
    const mappedResult = applyGraphCommand(createMappedSampleDag(), { type: "addNode", key: "E" }, mapping);
    assert.equal(mappedResult.dag.E.kind, "");
  }),

  defineTest("type projection hides other nodes and bridges hidden paths", () => {
    const sourceDag = createSampleDag();
    sourceDag.A.type = "visible";
    sourceDag.B.type = "hidden";
    sourceDag.C.type = "visible";
    sourceDag.D.type = "visible";

    const projected = projectGraphByType(sourceDag, "visible");

    assert.deepEqual(Object.keys(projected).sort(), ["A", "C", "D"]);
    assert.deepEqual(projected.A.children, {
      C: "edge_ac",
      D: TYPE_FILTER_SHORTCUT_RELATION,
    });
    assert.deepEqual(projected.C.parents, { A: "edge_ac" });
    assert.deepEqual(projected.D.parents, { A: TYPE_FILTER_SHORTCUT_RELATION });
    assert.deepEqual(sourceDag.A.children, { B: "edge_ab", C: "edge_ac" });
    assert.deepEqual(getGraphTypeOptions(sourceDag), ["hidden", "visible"]);
  }),

  defineTest("updateNodeFields resynchronizes bidirectional parent and child relations", () => {
    const sourceDag = createSampleDag();
    const result = applyGraphCommand(sourceDag, {
      type: "updateNodeFields",
      key: "C",
      fields: {
        title: "Gamma 2",
        define: "Moved",
        parents: { B: "linked_from_b" },
        children: { D: "edge_cd" },
      },
    });

    assert.deepEqual(result.dag.C.parents, { B: "linked_from_b" });
    assert.deepEqual(result.dag.B.children, { D: "edge_bd", C: "related_to" });
    assert.deepEqual(result.dag.A.children, { B: "edge_ab" });
    assert.deepEqual(result.dag.D.parents, { B: "edge_bd", C: "related_to" });
  }),

  defineTest("selectors derive initial and parent-level selections correctly", () => {
    assert.deepEqual(getInitialSelection(createForestDag()), { type: "full" });
    assert.deepEqual(getInitialSelection(createSampleDag()), { type: "node", key: "A" });
    assert.deepEqual(getInitialSelection(createChildOnlyDag()), { type: "node", key: "Root" });
    assert.deepEqual(getParentLevelSelection(createSampleDag(), ["D"]), { type: "node", key: "B" });
  }),

  defineTest("node labels preserve title hyphens", () => {
    assert.equal(sanitizeNodeLabel("Alpha-Beta_Title"), "Alpha-Beta Title");
  }),

  defineTest("commands preserve raw mapped field names while operating on semantic relations", () => {
    const mapping = createCustomFieldMapping();
    const sourceDag = createMappedSampleDag();
    const result = applyGraphCommand(sourceDag, {
      type: "updateNodeFields",
      key: "C",
      fields: {
        label: "Gamma 2",
        description: "Moved",
        kind: "task",
        prev: { B: "linked_from_b" },
        next: { D: "edge_cd" },
      },
    }, mapping);

    assert.equal(result.dag.C.label, "Gamma 2");
    assert.deepEqual(result.dag.C.prev, { B: "linked_from_b" });
    assert.deepEqual(result.dag.C.next, { D: "edge_cd" });
    assert.deepEqual(result.dag.B.next, { D: "edge_bd", C: "related_to" });
    assert.deepEqual(result.dag.A.next, { B: "edge_ab" });
    assert.deepEqual(result.dag.D.prev, { B: "edge_bd", C: "related_to" });
    assert.equal("children" in result.dag.C, false);
    assert.equal("parents" in result.dag.C, false);
    assert.deepEqual(getInitialSelection(sourceDag, mapping), { type: "node", key: "A" });
    assert.deepEqual(getParentLevelSelection(sourceDag, ["D"], mapping), { type: "node", key: "B" });
    assert.deepEqual(serializeDag(result.dag, mapping).C, {
      label: "Gamma 2",
      description: "Moved",
      kind: "task",
      prev: { B: "linked_from_b" },
      next: { D: "edge_cd" },
    });
  }),

  defineTest("selection remapping helpers preserve only valid keys", () => {
    const forestSelection = { type: "forest" as const, keys: ["A", "B", "C"], label: "Focus" };

    assert.deepEqual(remapSelectionKeys(forestSelection, (key) => (key === "B" ? "B2" : key)), {
      type: "forest",
      keys: ["A", "B2", "C"],
      label: "Focus",
    });
    assert.deepEqual(removeSelectionKeys(forestSelection, new Set(["A", "C"])), {
      type: "forest",
      keys: ["B"],
      label: "Focus",
    });
  }),
]);
