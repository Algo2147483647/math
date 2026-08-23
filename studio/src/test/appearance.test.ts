import assert from "node:assert/strict";
import { DEFAULT_GRAPH_APPEARANCE, sanitizeGraphAppearance } from "../graph/appearance";
import { buildStageData } from "../layout/stage-layout";
import { parseGraphPagePreferences } from "../state/preferences";
import { defineSuite, defineTest } from "./harness";
import { createSampleDag } from "./fixtures";

export const appearanceSuite = defineSuite("appearance", [
  defineTest("sanitizeGraphAppearance fills defaults and clamps layout values", () => {
    const appearance = sanitizeGraphAppearance({
      layout: {
        columnGap: -1,
        rowGap: 999,
        minNodeWidth: 999,
        maxNodeWidth: 10,
        stageMinWidth: 10_000,
      },
    });

    assert.equal(appearance.version, 1);
    assert.equal(appearance.layout.columnGap, 48);
    assert.equal(appearance.layout.rowGap, 140);
    assert.equal(appearance.layout.minNodeWidth, 260);
    assert.equal(appearance.layout.maxNodeWidth, 260);
    assert.equal(appearance.layout.stageMinWidth, 4000);
    assert.equal(appearance.display.showEdgeLabels, true);
    assert.equal(appearance.css, DEFAULT_GRAPH_APPEARANCE.css);
  }),

  defineTest("sanitizeGraphAppearance preserves edge label display preference", () => {
    assert.equal(sanitizeGraphAppearance({ display: { showEdgeLabels: false } }).display.showEdgeLabels, false);
    assert.equal(sanitizeGraphAppearance({ display: { showEdgeLabels: "false" } }).display.showEdgeLabels, false);
    assert.equal(sanitizeGraphAppearance({ display: {} }).display.showEdgeLabels, true);
  }),

  defineTest("sanitizeGraphAppearance only accepts dag css vars and removes imports", () => {
    const appearance = sanitizeGraphAppearance({
      cssVars: {
        "--dag-node-fill": "#fff",
        "--graph-node-fill": "#000",
      },
      css: "@import url('https://example.test/style.css');\n.dag-node__shape { fill: red; }",
    });

    assert.equal(appearance.cssVars["--dag-node-fill"], "#fff");
    assert.equal(Object.prototype.hasOwnProperty.call(appearance.cssVars, "--graph-node-fill"), false);
    assert.match(appearance.css, /\.dag-node__shape/);
    assert.doesNotMatch(appearance.css, /@import/i);
  }),

  defineTest("default root and active node fills follow the configured node fill", () => {
    assert.match(DEFAULT_GRAPH_APPEARANCE.css, /fill:\s*var\(--dag-node-root-fill,\s*var\(--dag-node-fill\)\)/);
    assert.match(DEFAULT_GRAPH_APPEARANCE.css, /fill:\s*var\(--dag-node-active-fill,\s*var\(--dag-node-fill\)\)/);
  }),

  defineTest("latest preferences parse appearance directly", () => {
    const raw = JSON.stringify({
      appearance: {
        ...DEFAULT_GRAPH_APPEARANCE,
        cssVars: {
          "--dag-title-font-size": "18px",
          "--dag-title-font-style": "normal",
        },
        layout: {
          ...DEFAULT_GRAPH_APPEARANCE.layout,
          columnGap: 144,
        },
        display: {
          showEdgeLabels: false,
        },
      },
    });
    const parsed = parseGraphPagePreferences(raw);

    assert.equal(parsed?.appearance?.layout.columnGap, 144);
    assert.equal(parsed?.appearance?.display.showEdgeLabels, false);
    assert.equal(parsed?.appearance?.cssVars["--dag-title-font-size"], "18px");
    assert.equal(parsed?.appearance?.cssVars["--dag-title-font-style"], "normal");
  }),

  defineTest("buildStageData uses appearance layout minimum stage size", () => {
    const stage = buildStageData({
      dag: createSampleDag(),
      selection: { type: "node", key: "A" },
      appearance: {
        ...DEFAULT_GRAPH_APPEARANCE,
        layout: {
          ...DEFAULT_GRAPH_APPEARANCE.layout,
          stageMinWidth: 1234,
          stageMinHeight: 789,
        },
      },
    });

    assert.ok(stage);
    assert.equal(stage.stageWidth, 1234);
    assert.equal(stage.stageHeight, 789);
  }),
]);
