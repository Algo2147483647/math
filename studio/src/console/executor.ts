import { applyGraphCommand, type CommandResult } from "../graph/commands";
import { DEFAULT_GRAPH_APPEARANCE, type GraphAppearance } from "../graph/appearance";
import { applyAppearanceCommand, type AppearanceCommandResult } from "../graph/appearanceCommands";
import { getCustomFieldNames, getNodeChildren, getNodeDefine, getNodeParents, getNodeTitle, getNodeType } from "../graph/accessors";
import { getDefaultFieldMapping, type FieldMapping } from "../graph/fieldMapping";
import { getRelationKeys } from "../graph/relations";
import { structuredCloneValue } from "../graph/serialize";
import type { NodeKey, NormalizedDag } from "../graph/types";
import type { ConsoleInstruction, ConsoleNodeOperand } from "./dsl";
import { buildConsoleHelpText } from "./reference";

export interface ConsoleUiEffect {
  type: "show" | "json";
  nodeKey: NodeKey;
  line: number;
}

export type ConsoleRunResult =
  | {
    ok: true;
    dag: NormalizedDag;
    contextNodeKey: NodeKey | null;
    results: CommandResult[];
    appearance: GraphAppearance;
    appearanceResults: AppearanceCommandResult[];
    uiEffects: ConsoleUiEffect[];
    outputMessages: string[];
    instructionCount: number;
    mutationCount: number;
    appearanceMutationCount: number;
  }
  | {
    ok: false;
    line: number;
    message: string;
    contextNodeKey: NodeKey | null;
  };

export function executeConsoleInstructions(
  dag: NormalizedDag,
  instructions: ConsoleInstruction[],
  initialContextNodeKey: NodeKey | null,
  mapping: FieldMapping = getDefaultFieldMapping(),
  appearance: GraphAppearance = DEFAULT_GRAPH_APPEARANCE,
): ConsoleRunResult {
  let workingDag = structuredCloneValue(dag);
  let workingAppearance = appearance;
  let contextNodeKey = initialContextNodeKey;
  const results: CommandResult[] = [];
  const appearanceResults: AppearanceCommandResult[] = [];
  const uiEffects: ConsoleUiEffect[] = [];
  const outputMessages: string[] = [];

  for (const instruction of instructions) {
    try {
      switch (instruction.type) {
        case "help": {
          outputMessages.push(buildConsoleHelpText());
          break;
        }
        case "clear": {
          break;
        }
        case "appearanceCssShow": {
          outputMessages.push(workingAppearance.css || "(empty CSS)");
          break;
        }
        case "appearance": {
          const result = applyAppearanceCommand(workingAppearance, instruction.command);
          workingAppearance = result.appearance;
          appearanceResults.push(result);
          outputMessages.push(result.message);
          break;
        }
        case "keys": {
          outputMessages.push(buildKeyList(workingDag));
          break;
        }
        case "graphStats": {
          outputMessages.push(buildGraphStats(workingDag, mapping));
          break;
        }
        case "find": {
          outputMessages.push(buildFindResults(workingDag, instruction.query, mapping));
          break;
        }
        case "neighbors": {
          const key = resolveExistingNodeKey(instruction.key, contextNodeKey, workingDag, instruction.line);
          outputMessages.push(buildNeighborSummary(key, workingDag, instruction.depth, mapping));
          break;
        }
        case "path": {
          const fromKey = resolveExistingNodeKey(instruction.fromKey, contextNodeKey, workingDag, instruction.line);
          const toKey = resolveExistingNodeKey(instruction.toKey, contextNodeKey, workingDag, instruction.line);
          outputMessages.push(buildDirectedPathSummary(fromKey, toKey, workingDag, mapping));
          break;
        }
        case "use": {
          const key = resolveExistingNodeKey(instruction.key, contextNodeKey, workingDag, instruction.line);
          contextNodeKey = key;
          break;
        }
        case "show": {
          const key = resolveExistingNodeKey(instruction.key, contextNodeKey, workingDag, instruction.line);
          uiEffects.push({ type: "show", nodeKey: key, line: instruction.line });
          break;
        }
        case "list": {
          const key = resolveExistingNodeKey(instruction.key, contextNodeKey, workingDag, instruction.line);
          outputMessages.push(buildNodeSummary(key, workingDag, mapping));
          break;
        }
        case "json": {
          const key = resolveExistingNodeKey(instruction.key, contextNodeKey, workingDag, instruction.line);
          uiEffects.push({ type: "json", nodeKey: key, line: instruction.line });
          break;
        }
        case "rename": {
          const oldKey = resolveExistingNodeKey(instruction.oldKey, contextNodeKey, workingDag, instruction.line);
          const result = applyGraphCommand(workingDag, { type: "renameNode", oldKey, newKey: instruction.newKey }, mapping);
          workingDag = result.dag;
          contextNodeKey = remapContextKey(contextNodeKey, result);
          syncUiEffects(uiEffects, result);
          results.push(result);
          break;
        }
        case "delete": {
          const key = resolveExistingNodeKey(instruction.key, contextNodeKey, workingDag, instruction.line);
          const result = applyGraphCommand(workingDag, instruction.recursive ? { type: "deleteSubtree", rootKey: key } : { type: "deleteNode", key }, mapping);
          workingDag = result.dag;
          contextNodeKey = remapContextKey(contextNodeKey, result);
          syncUiEffects(uiEffects, result);
          results.push(result);
          break;
        }
        case "add": {
          const parentKey = instruction.parentKey
            ? resolveExistingNodeKey(instruction.parentKey, contextNodeKey, workingDag, instruction.line)
            : undefined;
          const result = applyGraphCommand(workingDag, { type: "addNode", key: instruction.key, parentKey }, mapping);
          workingDag = result.dag;
          contextNodeKey = remapContextKey(contextNodeKey, result);
          syncUiEffects(uiEffects, result);
          results.push(result);
          break;
        }
        case "setEdge": {
          const parentKey = instruction.createMissing
            ? resolveOrCreateNodeKey(instruction.parentKey, contextNodeKey, instruction.line)
            : resolveExistingNodeKey(instruction.parentKey, contextNodeKey, workingDag, instruction.line);
          const childKey = instruction.createMissing
            ? resolveOrCreateNodeKey(instruction.childKey, contextNodeKey, instruction.line)
            : resolveExistingNodeKey(instruction.childKey, contextNodeKey, workingDag, instruction.line);
          if (instruction.createMissing) {
            [parentKey, childKey].forEach((key) => {
              if (!workingDag[key]) {
                const addResult = applyGraphCommand(workingDag, { type: "addNode", key }, mapping);
                workingDag = addResult.dag;
                contextNodeKey = remapContextKey(contextNodeKey, addResult);
                syncUiEffects(uiEffects, addResult);
                results.push(addResult);
              }
            });
          }
          const result = applyGraphCommand(workingDag, { type: "setEdge", parentKey, childKey, weight: instruction.weight }, mapping);
          workingDag = result.dag;
          contextNodeKey = remapContextKey(contextNodeKey, result);
          syncUiEffects(uiEffects, result);
          results.push(result);
          break;
        }
        case "removeEdge": {
          const parentKey = resolveExistingNodeKey(instruction.parentKey, contextNodeKey, workingDag, instruction.line);
          const childKey = resolveExistingNodeKey(instruction.childKey, contextNodeKey, workingDag, instruction.line);
          const result = applyGraphCommand(workingDag, { type: "removeEdge", parentKey, childKey }, mapping);
          workingDag = result.dag;
          contextNodeKey = remapContextKey(contextNodeKey, result);
          syncUiEffects(uiEffects, result);
          results.push(result);
          break;
        }
        case "setParents": {
          const key = resolveExistingNodeKey(instruction.key, contextNodeKey, workingDag, instruction.line);
          const parents = instruction.keys.map((item) => resolveExistingNodeKey(item, contextNodeKey, workingDag, instruction.line));
          const result = applyGraphCommand(workingDag, { type: "setParents", key, parents }, mapping);
          workingDag = result.dag;
          contextNodeKey = remapContextKey(contextNodeKey, result);
          syncUiEffects(uiEffects, result);
          results.push(result);
          break;
        }
        case "setChildren": {
          const key = resolveExistingNodeKey(instruction.key, contextNodeKey, workingDag, instruction.line);
          const children = instruction.keys.map((item) => resolveExistingNodeKey(item, contextNodeKey, workingDag, instruction.line));
          const result = applyGraphCommand(workingDag, { type: "setChildren", key, children }, mapping);
          workingDag = result.dag;
          contextNodeKey = remapContextKey(contextNodeKey, result);
          syncUiEffects(uiEffects, result);
          results.push(result);
          break;
        }
        case "setField": {
          const key = resolveExistingNodeKey(instruction.key, contextNodeKey, workingDag, instruction.line);
          if (instruction.field === "key") {
            throw new Error("Use mv to rename a node key.");
          }
          if (instruction.field === "parents" || instruction.field === "children") {
            throw new Error(`Use ${instruction.field} to replace relation sets.`);
          }
          const currentNode = workingDag[key];
          if (!currentNode) {
            throw new Error(`Node "${key}" does not exist.`);
          }
          const { key: _oldKey, ...fields } = structuredCloneValue(currentNode);
          fields[instruction.field] = instruction.value;
          const result = applyGraphCommand(workingDag, { type: "updateNodeFields", key, fields }, mapping);
          workingDag = result.dag;
          contextNodeKey = remapContextKey(contextNodeKey, result);
          syncUiEffects(uiEffects, result);
          results.push(result);
          break;
        }
        case "unsetField": {
          const key = resolveExistingNodeKey(instruction.key, contextNodeKey, workingDag, instruction.line);
          if (instruction.field === "key") {
            throw new Error("Use mv to rename a node key.");
          }
          if (instruction.field === "parents" || instruction.field === "children") {
            throw new Error(`Use ${instruction.field} or rm-edge to edit relation fields.`);
          }
          const currentNode = workingDag[key];
          if (!currentNode) {
            throw new Error(`Node "${key}" does not exist.`);
          }
          if (!Object.prototype.hasOwnProperty.call(currentNode, instruction.field)) {
            outputMessages.push(`Node "${key}" has no field named "${instruction.field}".`);
            break;
          }
          const { key: _oldKey, ...fields } = structuredCloneValue(currentNode);
          delete fields[instruction.field];
          const result = applyGraphCommand(workingDag, { type: "updateNodeFields", key, fields }, mapping);
          workingDag = result.dag;
          contextNodeKey = remapContextKey(contextNodeKey, result);
          syncUiEffects(uiEffects, result);
          results.push(result);
          break;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "The console instruction failed.";
      return { ok: false, line: instruction.line, message, contextNodeKey };
    }
  }

  return {
    ok: true,
    dag: workingDag,
    appearance: workingAppearance,
    contextNodeKey,
    results,
    appearanceResults,
    uiEffects,
    outputMessages,
    instructionCount: instructions.length,
    mutationCount: results.length,
    appearanceMutationCount: appearanceResults.length,
  };
}

function resolveExistingNodeKey(
  operand: ConsoleNodeOperand,
  contextNodeKey: NodeKey | null,
  dag: NormalizedDag,
  line: number,
): NodeKey {
  const key = operand.type === "context" ? contextNodeKey : operand.value;
  if (!key) {
    throw new Error(`Line ${line}: Current context is empty. Use "use <node>" first.`);
  }
  if (!dag[key]) {
    throw new Error(`Node "${key}" does not exist.`);
  }
  return key;
}

function resolveOrCreateNodeKey(operand: ConsoleNodeOperand, contextNodeKey: NodeKey | null, line: number): NodeKey {
  const key = operand.type === "context" ? contextNodeKey : operand.value;
  if (!key) {
    throw new Error(`Line ${line}: Current context is empty. Use "use <node>" first.`);
  }
  return key;
}

function remapContextKey(contextNodeKey: NodeKey | null, result: CommandResult): NodeKey | null {
  if (!contextNodeKey) {
    return null;
  }
  if (result.renamedKey && contextNodeKey === result.renamedKey.from) {
    return result.renamedKey.to;
  }
  if (result.deletedKeys?.includes(contextNodeKey)) {
    return null;
  }
  return contextNodeKey;
}

function syncUiEffects(effects: ConsoleUiEffect[], result: CommandResult): void {
  const deleted = new Set(result.deletedKeys || []);
  effects.forEach((effect, index) => {
    if (result.renamedKey && effect.nodeKey === result.renamedKey.from) {
      effects[index] = { ...effect, nodeKey: result.renamedKey.to };
      return;
    }
    if (deleted.has(effect.nodeKey)) {
      effects[index] = { ...effect, nodeKey: "" };
    }
  });
}

export function buildConsoleMutationLabel(mutationCount: number, fallbackMessage: string | undefined): string {
  if (mutationCount <= 1) {
    return fallbackMessage || "Executed 1 console command.";
  }
  return `Executed ${mutationCount} console commands.`;
}

export function collectBatchEffects(results: CommandResult[]): { renamedKeys: Array<{ from: NodeKey; to: NodeKey }>; deletedKeys: NodeKey[] } {
  const renamedKeys: Array<{ from: NodeKey; to: NodeKey }> = [];
  const deletedKeys = new Set<NodeKey>();

  results.forEach((result) => {
    if (result.renamedKey) {
      renamedKeys.push(result.renamedKey);
    }
    result.deletedKeys?.forEach((key) => deletedKeys.add(key));
  });

  return { renamedKeys, deletedKeys: Array.from(deletedKeys) };
}

function buildKeyList(dag: NormalizedDag): string {
  const keys = Object.keys(dag).sort((left, right) => left.localeCompare(right));
  if (!keys.length) {
    return "Keys (0)";
  }
  return [`Keys (${keys.length}):`, ...keys].join("\n");
}

function buildGraphStats(dag: NormalizedDag, mapping: FieldMapping = getDefaultFieldMapping()): string {
  const keys = Object.keys(dag).sort((left, right) => left.localeCompare(right));
  const edgeCount = keys.reduce((count, key) => count + getRelationKeys(getNodeChildren(dag[key], mapping)).length, 0);
  const roots = keys.filter((key) => getRelationKeys(getNodeParents(dag[key], mapping)).length === 0);
  const leaves = keys.filter((key) => getRelationKeys(getNodeChildren(dag[key], mapping)).length === 0);
  const typeCounts = keys.reduce<Record<string, number>>((counts, key) => {
    const type = getNodeType(dag[key], mapping) || "(empty)";
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});
  const typeLines = Object.entries(typeCounts)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 12)
    .map(([type, count]) => `- ${type}: ${count}`);

  return [
    `Graph: ${keys.length} nodes, ${edgeCount} directed edges.`,
    `Roots (${roots.length}): ${formatKeySample(roots)}`,
    `Leaves (${leaves.length}): ${formatKeySample(leaves)}`,
    "Types:",
    ...(typeLines.length ? typeLines : ["- (none)"]),
  ].join("\n");
}

function buildFindResults(dag: NormalizedDag, query: string, mapping: FieldMapping = getDefaultFieldMapping()): string {
  const needle = normalizeSearchText(query);
  const matches = Object.keys(dag)
    .map((key) => ({ key, score: scoreNodeMatch(key, dag[key], needle, mapping) }))
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score || left.key.localeCompare(right.key));

  if (!matches.length) {
    return `No matches for "${query}".`;
  }

  const shown = matches.slice(0, 20);
  return [
    `Matches (${shown.length}${matches.length > shown.length ? ` of ${matches.length}` : ""}) for "${query}":`,
    ...shown.map(({ key }) => {
      const node = dag[key];
      return `- ${key} | title: ${formatScalarPreview(getNodeTitle(node, mapping))} | type: ${formatScalarPreview(getNodeType(node, mapping))} | define: ${formatScalarPreview(getNodeDefine(node, mapping))}`;
    }),
  ].join("\n");
}

function buildNeighborSummary(nodeKey: NodeKey, dag: NormalizedDag, depth: number, mapping: FieldMapping = getDefaultFieldMapping()): string {
  const visited = new Set<NodeKey>([nodeKey]);
  let frontier = [nodeKey];
  const layers: Array<{ depth: number; parents: NodeKey[]; children: NodeKey[] }> = [];

  for (let currentDepth = 1; currentDepth <= depth; currentDepth += 1) {
    const parents = new Set<NodeKey>();
    const children = new Set<NodeKey>();
    frontier.forEach((key) => {
      getRelationKeys(getNodeParents(dag[key], mapping)).forEach((parentKey) => {
        if (!visited.has(parentKey) && dag[parentKey]) {
          parents.add(parentKey);
        }
      });
      getRelationKeys(getNodeChildren(dag[key], mapping)).forEach((childKey) => {
        if (!visited.has(childKey) && dag[childKey]) {
          children.add(childKey);
        }
      });
    });

    const nextKeys = [...parents, ...children].sort((left, right) => left.localeCompare(right));
    if (!nextKeys.length) {
      break;
    }
    nextKeys.forEach((key) => visited.add(key));
    layers.push({
      depth: currentDepth,
      parents: Array.from(parents).sort((left, right) => left.localeCompare(right)),
      children: Array.from(children).sort((left, right) => left.localeCompare(right)),
    });
    frontier = nextKeys;
  }

  const node = dag[nodeKey];
  return [
    buildNodeSummary(nodeKey, dag, mapping),
    `Neighbors up to depth ${depth}:`,
    ...(layers.length
      ? layers.flatMap((layer) => [
        `depth ${layer.depth} parents: ${formatKeySample(layer.parents)}`,
        `depth ${layer.depth} children: ${formatKeySample(layer.children)}`,
      ])
      : ["(none)"]),
    `Definition: ${formatScalarPreview(getNodeDefine(node, mapping))}`,
  ].join("\n");
}

function buildDirectedPathSummary(fromKey: NodeKey, toKey: NodeKey, dag: NormalizedDag, mapping: FieldMapping = getDefaultFieldMapping()): string {
  if (fromKey === toKey) {
    return `Path: ${fromKey}`;
  }

  const queue: NodeKey[] = [fromKey];
  const visited = new Set<NodeKey>([fromKey]);
  const previous = new Map<NodeKey, NodeKey>();

  while (queue.length) {
    const currentKey = queue.shift() as NodeKey;
    const children = getRelationKeys(getNodeChildren(dag[currentKey], mapping)).filter((key) => dag[key]);
    for (const childKey of children) {
      if (visited.has(childKey)) {
        continue;
      }
      visited.add(childKey);
      previous.set(childKey, currentKey);
      if (childKey === toKey) {
        const path = [toKey];
        let cursor = toKey;
        while (previous.has(cursor)) {
          cursor = previous.get(cursor) as NodeKey;
          path.push(cursor);
        }
        return `Path (${path.length - 1} edges): ${path.reverse().join(" -> ")}`;
      }
      queue.push(childKey);
    }
  }

  return `No directed path from "${fromKey}" to "${toKey}".`;
}

function buildNodeSummary(nodeKey: NodeKey, dag: NormalizedDag, mapping: FieldMapping = getDefaultFieldMapping()): string {
  const node = dag[nodeKey];
  const lines = [
    `Node: ${nodeKey}`,
    `title: ${formatScalarPreview(getNodeTitle(node, mapping))}`,
    `type: ${formatScalarPreview(getNodeType(node, mapping))}`,
    `define: ${formatScalarPreview(getNodeDefine(node, mapping))}`,
    `parents: ${formatRelationPreview(getNodeParents(node, mapping))}`,
    `children: ${formatRelationPreview(getNodeChildren(node, mapping))}`,
  ];

  const customFieldNames = getCustomFieldNames(node, mapping);
  if (customFieldNames.length) {
    lines.push(`custom: ${customFieldNames.join(", ")}`);
  }

  return lines.join("\n");
}

function formatScalarPreview(value: unknown): string {
  if (value === undefined || value === null || value === "") {
    return "(empty)";
  }
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
}

function formatRelationPreview(value: unknown): string {
  const keys = getRelationKeys(value);
  if (!keys.length) {
    return "(none)";
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return keys.map((key) => `${key}:${formatScalarPreview((value as Record<string, unknown>)[key])}`).join(", ");
  }
  return keys.join(", ");
}

function formatKeySample(keys: NodeKey[], limit = 18): string {
  if (!keys.length) {
    return "(none)";
  }
  const shown = keys.slice(0, limit);
  return `${shown.join(", ")}${keys.length > shown.length ? `, ... +${keys.length - shown.length}` : ""}`;
}

function normalizeSearchText(value: unknown): string {
  return String(value ?? "").trim().toLocaleLowerCase();
}

function scoreNodeMatch(nodeKey: NodeKey, node: Record<string, unknown>, needle: string, mapping: FieldMapping): number {
  if (!needle) {
    return 0;
  }

  const key = normalizeSearchText(nodeKey);
  const title = normalizeSearchText(getNodeTitle(node, mapping));
  const type = normalizeSearchText(getNodeType(node, mapping));
  const define = normalizeSearchText(getNodeDefine(node, mapping));
  const custom = getCustomFieldNames(node, mapping)
    .map((fieldName) => normalizeSearchText(node[fieldName]))
    .join(" ");

  if (key === needle || title === needle) {
    return 100;
  }
  if (key.startsWith(needle) || title.startsWith(needle)) {
    return 80;
  }
  if (key.includes(needle) || title.includes(needle)) {
    return 60;
  }
  if (type.includes(needle)) {
    return 40;
  }
  if (define.includes(needle)) {
    return 25;
  }
  if (custom.includes(needle)) {
    return 15;
  }
  return 0;
}
