import { getCustomFieldNames, getNodeChildren, getNodeDefine, getNodeParents, getNodeTitle, getNodeType } from "../graph/accessors";
import type { FieldMapping } from "../graph/fieldMapping";
import { getRelationKeys } from "../graph/relations";
import type { GraphLayoutMode, GraphSelection, NodeKey, NormalizedDag } from "../graph/types";
import type { GraphAppearance } from "../graph/appearance";
import { CONSOLE_COMMAND_REFERENCE } from "../console/reference";
import type { AiGraphContext } from "./types";

const MAX_CONTEXT_NODES = 80;
const MAX_NODE_INDEX_ITEMS = 240;

export function buildAiGraphContext({
  dag,
  layoutMode,
  selection,
  contextNodeKey,
  mapping,
  appearance,
}: {
  dag: NormalizedDag | null;
  layoutMode: GraphLayoutMode;
  selection: GraphSelection | null;
  contextNodeKey: NodeKey | null;
  mapping: FieldMapping;
  appearance: GraphAppearance;
}): AiGraphContext {
  const commandReference = CONSOLE_COMMAND_REFERENCE
    .map((command) => `${command.label}: ${command.help}`)
    .join("\n");

  if (!dag) {
    return {
      commandReference,
      summary: [
        "No graph is currently loaded.",
      `Layout mode: ${layoutMode}`,
      formatAppearanceSummary(appearance),
      "Console commands are available for help and graph mutation after a graph is loaded.",
      ].join("\n"),
    };
  }

  const keys = Object.keys(dag).sort((left, right) => left.localeCompare(right));
  const edgeCount = countEdges(dag, mapping);
  const selectionText = formatSelection(selection);
  const shownKeys = keys.slice(0, MAX_CONTEXT_NODES);
  const omittedCount = Math.max(0, keys.length - shownKeys.length);
  const indexedKeys = keys.slice(0, MAX_NODE_INDEX_ITEMS);
  const indexOmittedCount = Math.max(0, keys.length - indexedKeys.length);
  const nodeLines = shownKeys.flatMap((key) => formatNodeSummary(key, dag, mapping));
  const nodeIndexLines = indexedKeys.map((key) => formatNodeIndexLine(key, dag, mapping));

  return {
    commandReference,
    summary: [
      `Graph has ${keys.length} node${keys.length === 1 ? "" : "s"} and ${edgeCount} directed edge${edgeCount === 1 ? "" : "s"}.`,
      `Layout mode: ${layoutMode}`,
      formatAppearanceSummary(appearance),
      `Current console context node: ${contextNodeKey || "(unset)"}`,
      `Current selection: ${selectionText}`,
      "Node lookup index:",
      ...nodeIndexLines,
      indexOmittedCount > 0 ? `... ${indexOmittedCount} additional node index item${indexOmittedCount === 1 ? "" : "s"} omitted. Use /find <query> to search beyond this context.` : "",
      "Nodes:",
      ...nodeLines,
      omittedCount > 0 ? `... ${omittedCount} additional detailed node summar${omittedCount === 1 ? "y" : "ies"} omitted from AI context. Use /find, /ls, /neighbors, /path, or /graph for more data.` : "",
    ].filter(Boolean).join("\n"),
  };
}

function formatAppearanceSummary(appearance: GraphAppearance): string {
  const vars = Object.entries(appearance.cssVars)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
  return [
    "Appearance can be edited with /layout, /style-var, /style-css, and /style-reset.",
    "Stable SVG selectors: .dag-graph, .dag-node, .dag-node__shape, .dag-node__title, .dag-edge, .dag-edge__path, .dag-stage__lane.",
    "Useful data selectors: .dag-node[data-type=\"service\"], .dag-node[data-root=\"true\"], .dag-edge[data-weight=\"2\"], .dag-edge[data-active=\"true\"].",
    `Appearance layout: ${JSON.stringify(appearance.layout)}`,
    `Appearance display: ${JSON.stringify(appearance.display)}`,
    "Appearance cssVars:",
    vars,
  ].join("\n");
}

function countEdges(dag: NormalizedDag, mapping: FieldMapping): number {
  return Object.values(dag).reduce((count, node) => count + getRelationKeys(getNodeChildren(node, mapping)).length, 0);
}

function formatSelection(selection: GraphSelection | null): string {
  if (!selection) {
    return "(none)";
  }
  if (selection.type === "node") {
    return `node ${selection.key}`;
  }
  if (selection.type === "full") {
    return "full graph";
  }
  return `${selection.type} ${selection.keys.join(", ")}`;
}

function formatNodeSummary(key: NodeKey, dag: NormalizedDag, mapping: FieldMapping): string[] {
  const node = dag[key];
  const parents = getRelationKeys(getNodeParents(node, mapping));
  const children = getRelationKeys(getNodeChildren(node, mapping));
  const title = getNodeTitle(node, mapping);
  const type = getNodeType(node, mapping);
  const define = getNodeDefine(node, mapping);
  const customFields = getCustomFieldNames(node, mapping);

  return [
    `- ${key}`,
    `  title: ${formatPreview(title)}`,
    `  type: ${formatPreview(type)}`,
    `  define: ${formatPreview(define)}`,
    `  parents: ${parents.length ? parents.join(", ") : "(none)"}`,
    `  children: ${children.length ? children.join(", ") : "(none)"}`,
    customFields.length ? `  custom fields: ${customFields.join(", ")}` : "",
  ].filter(Boolean);
}

function formatNodeIndexLine(key: NodeKey, dag: NormalizedDag, mapping: FieldMapping): string {
  const node = dag[key];
  const title = getNodeTitle(node, mapping);
  const type = getNodeType(node, mapping);
  return `- ${key} | title: ${formatPreview(title)} | type: ${formatPreview(type)}`;
}

function formatPreview(value: unknown): string {
  if (value === undefined || value === null || value === "") {
    return "(empty)";
  }
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}
