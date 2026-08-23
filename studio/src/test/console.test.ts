import assert from "node:assert/strict";
import { parseConsoleSource } from "../console/dsl";
import { buildConsoleMutationLabel, collectBatchEffects, executeConsoleInstructions } from "../console/executor";
import { DEFAULT_GRAPH_APPEARANCE } from "../graph/appearance";
import { defineSuite, defineTest } from "./harness";
import { createSampleDag } from "./fixtures";

export const consoleSuite = defineSuite("console", [
  defineTest("parser accepts comments, quoted strings, and create-missing edges", () => {
    const parsed = parseConsoleSource([
      "# comment",
      "/use A",
      "/set . define \"hello world\"",
      "/edge . Missing_Node true --create-missing",
    ].join("\n"));

    assert.equal(parsed.ok, true);
    if (!parsed.ok) {
      return;
    }

    assert.equal(parsed.instructions.length, 3);
    assert.deepEqual(parsed.instructions[1], {
      type: "setField",
      key: { type: "context" },
      field: "define",
      value: "hello world",
      line: 3,
    });
    assert.deepEqual(parsed.instructions[2], {
      type: "setEdge",
      parentKey: { type: "context" },
      childKey: { type: "key", value: "Missing_Node" },
      weight: true,
      createMissing: true,
      line: 4,
    });
  }),

  defineTest("parser and executor accept clear inside multiline batches", () => {
    const dag = createSampleDag();
    const parsed = parseConsoleSource([
      "/use A",
      "/clear",
      "/cls",
      "/set . type concept",
    ].join("\n"));

    assert.equal(parsed.ok, true);
    if (!parsed.ok) {
      return;
    }

    assert.deepEqual(parsed.instructions.slice(1, 3), [
      { type: "clear", line: 2 },
      { type: "clear", line: 3 },
    ]);

    const executed = executeConsoleInstructions(dag, parsed.instructions, null);
    assert.equal(executed.ok, true);
    if (!executed.ok) {
      return;
    }

    assert.equal(executed.dag.A.type, "concept");
    assert.equal(executed.contextNodeKey, "A");
    assert.equal(executed.instructionCount, 4);
    assert.equal(executed.mutationCount, 1);
  }),

  defineTest("keys lists all node keys without mutating the graph", () => {
    const parsed = parseConsoleSource("/keys");
    assert.equal(parsed.ok, true);
    if (!parsed.ok) {
      return;
    }

    assert.deepEqual(parsed.instructions, [{ type: "keys", line: 1 }]);

    const executed = executeConsoleInstructions(createSampleDag(), parsed.instructions, null);
    assert.equal(executed.ok, true);
    if (!executed.ok) {
      return;
    }

    assert.deepEqual(executed.outputMessages, ["Keys (4):\nA\nB\nC\nD"]);
    assert.equal(executed.instructionCount, 1);
    assert.equal(executed.mutationCount, 0);
  }),

  defineTest("read-only graph analysis commands inspect data without mutations", () => {
    const parsed = parseConsoleSource([
      "/graph",
      "/find \"Alpha\"",
      "/neighbors A 2",
      "/path A D",
    ].join("\n"));

    assert.equal(parsed.ok, true);
    if (!parsed.ok) {
      return;
    }

    assert.deepEqual(parsed.instructions[0], { type: "graphStats", line: 1 });
    assert.deepEqual(parsed.instructions[1], { type: "find", query: "Alpha", line: 2 });
    assert.deepEqual(parsed.instructions[2], {
      type: "neighbors",
      key: { type: "key", value: "A" },
      depth: 2,
      line: 3,
    });
    assert.deepEqual(parsed.instructions[3], {
      type: "path",
      fromKey: { type: "key", value: "A" },
      toKey: { type: "key", value: "D" },
      line: 4,
    });

    const executed = executeConsoleInstructions(createSampleDag(), parsed.instructions, null);
    assert.equal(executed.ok, true);
    if (!executed.ok) {
      return;
    }

    assert.equal(executed.mutationCount, 0);
    assert.match(executed.outputMessages[0], /Graph: 4 nodes/);
    assert.match(executed.outputMessages[1], /Matches/);
    assert.match(executed.outputMessages[2], /Neighbors up to depth 2/);
    assert.match(executed.outputMessages[3], /Path/);
  }),

  defineTest("appearance commands update layout variables and CSS without graph mutations", () => {
    const parsed = parseConsoleSource([
      "/layout rowGap 44",
      "/style-var --dag-node-fill \"#101827\"",
      "/style-css append \".dag-node__shape { stroke-width: 2; }\"",
    ].join("\n"));

    assert.equal(parsed.ok, true);
    if (!parsed.ok) {
      return;
    }

    const executed = executeConsoleInstructions(createSampleDag(), parsed.instructions, null, undefined, DEFAULT_GRAPH_APPEARANCE);
    assert.equal(executed.ok, true);
    if (!executed.ok) {
      return;
    }

    assert.equal(executed.mutationCount, 0);
    assert.equal(executed.appearanceMutationCount, 3);
    assert.equal(executed.appearance.layout.rowGap, 44);
    assert.equal(executed.appearance.cssVars["--dag-node-fill"], "#101827");
    assert.match(executed.appearance.css, /stroke-width: 2/);
  }),

  defineTest("style-css show prints current appearance CSS", () => {
    const parsed = parseConsoleSource("/style-css show");
    assert.equal(parsed.ok, true);
    if (!parsed.ok) {
      return;
    }

    const executed = executeConsoleInstructions({}, parsed.instructions, null, undefined, DEFAULT_GRAPH_APPEARANCE);
    assert.equal(executed.ok, true);
    if (!executed.ok) {
      return;
    }

    assert.equal(executed.mutationCount, 0);
    assert.equal(executed.appearanceMutationCount, 0);
    assert.match(executed.outputMessages[0], /\.dag-node__shape/);
  }),

  defineTest("executor applies batch mutations and tracks ui effects", () => {
    const dag = createSampleDag();
    const parsed = parseConsoleSource([
      "/use A",
      "/add New_Node -p .",
      "/set New_Node title \"Created from console\"",
      "/json New_Node",
      "/mv New_Node Final_Node",
    ].join("\n"));

    assert.equal(parsed.ok, true);
    if (!parsed.ok) {
      return;
    }

    const executed = executeConsoleInstructions(dag, parsed.instructions, null);
    assert.equal(executed.ok, true);
    if (!executed.ok) {
      return;
    }

    assert.ok(executed.dag.Final_Node);
    assert.equal(executed.dag.Final_Node.title, "Created from console");
    assert.equal(executed.contextNodeKey, "A");
    assert.equal(executed.uiEffects.at(-1)?.type, "json");
    assert.equal(executed.mutationCount, 3);

    const batchEffects = collectBatchEffects(executed.results);
    assert.deepEqual(batchEffects.renamedKeys, [{ from: "New_Node", to: "Final_Node" }]);
    assert.equal(buildConsoleMutationLabel(executed.mutationCount, executed.results.at(-1)?.message), "Executed 3 console commands.");
  }),

  defineTest("executor returns line-aware errors when context is missing", () => {
    const parsed = parseConsoleSource("/show .");
    assert.equal(parsed.ok, true);
    if (!parsed.ok) {
      return;
    }

    const executed = executeConsoleInstructions(createSampleDag(), parsed.instructions, null);
    assert.equal(executed.ok, false);
    if (executed.ok) {
      return;
    }

    assert.equal(executed.line, 1);
    assert.match(executed.message, /Current context is empty/);
  }),

  defineTest("parser requires slash-prefixed commands", () => {
    const parsed = parseConsoleSource("keys");

    assert.equal(parsed.ok, false);
    if (parsed.ok) {
      return;
    }

    assert.equal(parsed.error.line, 1);
    assert.match(parsed.error.message, /must start with \//);
  }),

  defineTest("parser rejects removed copy and preset commands", () => {
    for (const command of ["/cp A B", "/style-preset default"]) {
      const parsed = parseConsoleSource(command);
      assert.equal(parsed.ok, false);
      if (!parsed.ok) {
        assert.match(parsed.error.message, /Unknown instruction/);
      }
    }
  }),
]);
