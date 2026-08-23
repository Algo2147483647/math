import { executeConsoleInstructions } from "../console/executor";
import { parseConsoleSource } from "../console/dsl";
import { DEFAULT_GRAPH_APPEARANCE, type GraphAppearance } from "../graph/appearance";
import { getNodeChildren, getNodeParents } from "../graph/accessors";
import type { FieldMapping } from "../graph/fieldMapping";
import { getRelationKeys } from "../graph/relations";
import type { GraphLayoutMode, GraphSelection, NodeKey, NormalizedDag } from "../graph/types";
import { buildAiGraphContext } from "./context";
import type {
  ActionPlan,
  AiContextPacket,
  AiEvent,
  AiExecutionMode,
  AiHarnessState,
  AiResponse,
  AiRiskLevel,
  CommandBatch,
  ProposedChange,
  ValidationReport,
  WorkingMemory,
} from "./types";

interface ConsoleHistoryEntry {
  tone: string;
  text: string;
}

interface BuildContextInput {
  harness: AiHarnessState;
  dag: NormalizedDag | null;
  layoutMode: GraphLayoutMode;
  selection: GraphSelection | null;
  contextNodeKey: NodeKey | null;
  mapping: FieldMapping;
  appearance?: GraphAppearance;
  consoleEntries: ConsoleHistoryEntry[];
}

interface PlanInput {
  response: Extract<AiResponse, { kind: "propose_changes" | "run_console" | "inspect" }>;
  harness: AiHarnessState;
  turnId: string;
  userMessage: string;
}

interface ValidateInput {
  batch: CommandBatch;
  dag: NormalizedDag | null;
  contextNodeKey: NodeKey | null;
  mapping: FieldMapping;
  appearance?: GraphAppearance;
  graphRevision: string;
}

const MAX_RECENT_EVENTS = 40;
const MAX_RECENT_CONSOLE_LINES = 16;

export function createInitialAiHarnessState(mode: AiExecutionMode): AiHarnessState {
  const sessionId = createId("session");
  return {
    sessionId,
    graphId: "local-graph",
    graphRevision: "0",
    workingMemory: createEmptyWorkingMemory(),
    recentEvents: [],
    artifactRefs: {},
    mode,
  };
}

export function createTurnId(): string {
  return createId("turn");
}

export function syncHarnessRuntime(
  harness: AiHarnessState,
  input: { graphId: string; graphRevision: string; mode: AiExecutionMode },
): AiHarnessState {
  const activePlan = harness.activePlan && isOpenPlanStatus(harness.activePlan.status) && harness.activePlan.scope.graphRevisionBase !== input.graphRevision
    ? { ...harness.activePlan, status: "superseded" as const, timestamps: { ...harness.activePlan.timestamps, updatedAt: Date.now() } }
    : harness.activePlan;
  const pendingCommandBatch = activePlan?.status === "superseded" ? undefined : harness.pendingCommandBatch;
  return {
    ...harness,
    graphId: input.graphId,
    graphRevision: input.graphRevision,
    mode: input.mode,
    activePlan,
    pendingCommandBatch,
    workingMemory: {
      ...harness.workingMemory,
      activePlanId: activePlan?.status === "superseded" ? undefined : activePlan?.id,
      pendingCommandBatchId: pendingCommandBatch?.id,
    },
  };
}

function isOpenPlanStatus(status: ActionPlan["status"]): boolean {
  return status === "draft" || status === "proposed" || status === "approved" || status === "validating" || status === "ready" || status === "executing";
}

export function appendAiEvents(harness: AiHarnessState, events: AiEvent[]): AiHarnessState {
  return {
    ...harness,
    recentEvents: [...harness.recentEvents, ...events].slice(-MAX_RECENT_EVENTS),
  };
}

export function createAiEvent(
  harness: AiHarnessState,
  turnId: string,
  type: AiEvent["type"],
  payload: Record<string, unknown>,
  causality?: AiEvent["causality"],
): AiEvent {
  return {
    id: createId("event"),
    sessionId: harness.sessionId,
    turnId,
    type,
    timestamp: Date.now(),
    graphRevisionBefore: harness.graphRevision,
    payload,
    causality,
  };
}

export function referencesPreviousWork(message: string): boolean {
  const normalized = message.toLocaleLowerCase();
  return [
    "previous",
    "just now",
    "above",
    "as you said",
    "based on your",
    "apply it",
    "do it",
    "continue",
    "complete",
  ].some((phrase) => normalized.includes(phrase));
}

export function buildAiContextPacket(input: BuildContextInput): AiContextPacket {
  const graphContext = buildAiGraphContext({
    dag: input.dag,
    layoutMode: input.layoutMode,
    selection: input.selection,
    contextNodeKey: input.contextNodeKey,
    mapping: input.mapping,
    appearance: input.appearance || DEFAULT_GRAPH_APPEARANCE,
  });
  const recentConsoleEvents = input.consoleEntries
    .slice(-MAX_RECENT_CONSOLE_LINES)
    .map((entry, index) => createSyntheticConsoleEvent(input.harness, index, entry));

  return {
    system: {
      role: "graph_editing_agent",
      language: "auto",
      responseProtocolVersion: "v2",
      editPolicy: {
        mode: input.harness.mode,
        autoEditEnabled: input.harness.mode === "auto-edit",
        requireReviewForDestructiveChanges: true,
      },
    },
    graph: {
      ...graphContext,
      graphRevision: input.harness.graphRevision,
      currentSelection: formatSelectionKeys(input.selection),
      focusedNodes: input.contextNodeKey ? [input.contextNodeKey] : [],
    },
    tools: {
      availableCommands: graphContext.commandReference,
      commandExamples: [
        "/find Group",
        "/neighbors Group 2",
        "/add Subgroup -p Group",
        "/set Group define \"A group is a set with an associative binary operation, an identity element, and inverses.\"",
        "/edge Group Representation_Theory",
        "/style-var --dag-node-fill \"#1e293b\"",
        "/style-var --dag-node-fill \"rgba(18, 24, 38, 0.94)\"",
        "/style-css append \".dag-node[data-type=\\\"service\\\"] .dag-node__shape { fill: #eef6ff; }\"",
        "/layout rowGap 34",
      ],
      constraints: [
        "All commands must start with /.",
        "Use /find, /ls, /neighbors, /path, or /graph when more graph facts are needed.",
        "Do not reference missing nodes unless the same command batch creates them first or uses /edge --create-missing.",
        "Use /set for title, type, define, and other non-relation fields.",
        "Use /parents, /children, /edge, or /rm-edge for relation fields.",
        "Use /style-var, /style-css, /style-reset, and /layout for UI appearance changes.",
        "Only use --dag-* CSS variables and stable .dag-* SVG selectors for appearance CSS.",
      ],
    },
    memory: {
      recentEvents: [...input.harness.recentEvents, ...recentConsoleEvents].slice(-MAX_RECENT_EVENTS),
      activePlan: input.harness.activePlan,
      workingMemory: input.harness.workingMemory,
    },
    execution: {
      pendingCommandBatch: input.harness.pendingCommandBatch,
      lastValidation: input.harness.pendingCommandBatch?.validation || input.harness.activePlan?.validation,
    },
    budget: {
      maxInputTokens: 9000,
      reservedOutputTokens: 1400,
      compressionLevel: "light",
    },
  };
}

export function createPlanFromAiResponse(input: PlanInput): ActionPlan {
  const now = Date.now();
  const response = input.response;
  const commands = collectCommandsFromResponse(response);
  const riskLevel = maxRisk([
    response.kind === "run_console" ? response.commandBatch.riskLevel : undefined,
    ...collectChangesFromResponse(response).map((change) => change.risk),
    ...commands.map(classifyCommandRisk),
  ]);
  const batch: CommandBatch | undefined = commands.length
    ? {
      id: createId("batch"),
      status: "draft",
      title: getResponseTitle(response),
      commands,
      expectedGraphEffects: getExpectedGraphEffects(response),
      riskLevel,
      createdAt: now,
    }
    : undefined;

  const changes = collectChangesFromResponse(response);
  const title = getResponseTitle(response);
  const goal = response.kind === "propose_changes" ? response.plan.goal : response.answer;
  const affectedNodes = response.kind === "propose_changes" ? response.plan.affectedNodes || [] : extractMentionedNodes(commands);
  const planId = createId("plan");
  const commandBatch = batch ? { ...batch, planId } : undefined;

  return {
    id: planId,
    sessionId: input.harness.sessionId,
    graphId: input.harness.graphId,
    status: "proposed",
    title,
    goal,
    source: {
      userTurnId: input.turnId,
      createdFromMessage: input.userMessage,
    },
    scope: {
      targetNodes: affectedNodes,
      targetEdges: [],
      affectedConcepts: affectedNodes,
      graphRevisionBase: input.harness.graphRevision,
    },
    assumptions: response.kind === "propose_changes" ? response.plan.assumptions || [] : [],
    changes,
    commandBatch,
    ui: {
      displaySummary: buildPlanSummary(title, changes, commandBatch),
      requiresUserConfirmation: riskLevel !== "low" || Boolean(commandBatch?.commands.some(isDestructiveCommand)),
      riskLevel,
    },
    timestamps: {
      createdAt: now,
      updatedAt: now,
    },
  };
}

export function installPlan(harness: AiHarnessState, plan: ActionPlan, turnId: string): AiHarnessState {
  const planEvent = createAiEvent(harness, turnId, "plan.created", {
    planId: plan.id,
    title: plan.title,
    goal: plan.goal,
    commandCount: plan.commandBatch?.commands.length || 0,
    riskLevel: plan.ui.riskLevel,
  });
  const commandEvent = plan.commandBatch
    ? createAiEvent(harness, turnId, "command.drafted", {
      planId: plan.id,
      commandBatchId: plan.commandBatch.id,
      commands: plan.commandBatch.commands,
    }, { parentEventIds: [planEvent.id], sourcePlanId: plan.id, sourceCommandBatchId: plan.commandBatch.id })
    : null;

  return {
    ...appendAiEvents(harness, commandEvent ? [planEvent, commandEvent] : [planEvent]),
    activePlan: plan,
    pendingCommandBatch: plan.commandBatch,
    workingMemory: {
      ...harness.workingMemory,
      activeTopic: plan.title,
      activePlanId: plan.id,
      pendingCommandBatchId: plan.commandBatch?.id,
      focus: {
        ...harness.workingMemory.focus,
        nodeIds: plan.scope.targetNodes,
        concepts: plan.scope.affectedConcepts,
      },
      currentIntent: {
        type: plan.commandBatch ? "modify_graph" : "analyze_graph",
        confidence: 0.86,
        sourceUserMessage: plan.source.createdFromMessage,
      },
    },
  };
}

export function validateCommandBatch(input: ValidateInput): ValidationReport {
  const reportBase = {
    commandBatchId: input.batch.id,
    graphRevisionBase: input.graphRevision,
    riskLevel: input.batch.riskLevel,
  };

  if (!input.batch.commands.length) {
    return {
      ...reportBase,
      results: [],
      allPassed: false,
      requiresConfirmation: true,
      summary: "No commands were provided.",
    };
  }

  const source = input.batch.commands.join("\n");
  const parsed = parseConsoleSource(source);
  if (!parsed.ok) {
    return {
      ...reportBase,
      results: input.batch.commands.map((command, index) => ({
        command,
        valid: index + 1 !== parsed.error.line,
        errors: index + 1 === parsed.error.line ? [parsed.error.message] : [],
        warnings: [],
      })),
      allPassed: false,
      riskLevel: maxRisk([input.batch.riskLevel, ...input.batch.commands.map(classifyCommandRisk)]),
      requiresConfirmation: true,
      summary: `Command syntax failed on line ${parsed.error.line}: ${parsed.error.message}`,
    };
  }

  if (!input.dag && parsed.instructions.some((instruction) => !["help", "clear", "appearance", "appearanceCssShow"].includes(instruction.type))) {
    return {
      ...reportBase,
      results: input.batch.commands.map((command) => ({
        command,
        valid: false,
        errors: ["No graph is loaded."],
        warnings: [],
      })),
      allPassed: false,
      requiresConfirmation: true,
      summary: "No graph is loaded.",
    };
  }

  const execution = executeConsoleInstructions(input.dag || {}, parsed.instructions, input.contextNodeKey, input.mapping, input.appearance || DEFAULT_GRAPH_APPEARANCE);
  const commandRisks = input.batch.commands.map(classifyCommandRisk);
  const riskLevel = maxRisk([input.batch.riskLevel, ...commandRisks]);
  const destructive = input.batch.commands.some(isDestructiveCommand);

  if (!execution.ok) {
    return {
      ...reportBase,
      results: input.batch.commands.map((command, index) => ({
        command,
        valid: index + 1 !== execution.line,
        errors: index + 1 === execution.line ? [execution.message] : [],
        warnings: buildCommandWarnings(command),
      })),
      allPassed: false,
      riskLevel,
      requiresConfirmation: true,
      summary: `Command validation failed on line ${execution.line}: ${execution.message}`,
    };
  }

  const diffPreview = [
    ...buildDiffPreview(input.dag || {}, execution.dag, input.mapping),
    ...execution.appearanceResults.flatMap((result) => result.diff),
  ];
  const mutationSummary = diffPreview.length
    ? diffPreview
    : ["No graph mutations expected."];
  return {
    ...reportBase,
    results: input.batch.commands.map((command, index) => ({
      command,
      valid: true,
      errors: [],
      warnings: buildCommandWarnings(command),
      expectedDiff: index === 0 ? mutationSummary : undefined,
    })),
    allPassed: true,
    riskLevel,
    requiresConfirmation: destructive || riskLevel === "high" || execution.mutationCount > 0,
    summary: [
      `Preflight passed for ${execution.instructionCount} command${execution.instructionCount === 1 ? "" : "s"}.`,
      ...mutationSummary,
      `Risk: ${riskLevel}.`,
    ].join(" "),
  };
}

export function attachValidationToHarness(harness: AiHarnessState, validation: ValidationReport, turnId: string): AiHarnessState {
  const pending = harness.pendingCommandBatch
    ? { ...harness.pendingCommandBatch, status: validation.allPassed ? "validated" as const : "failed" as const, validation, riskLevel: validation.riskLevel }
    : undefined;
  const activePlan = harness.activePlan
    ? {
      ...harness.activePlan,
      status: validation.allPassed ? "ready" as const : "failed" as const,
      commandBatch: pending,
      validation,
      timestamps: { ...harness.activePlan.timestamps, updatedAt: Date.now() },
    }
    : undefined;
  const event = createAiEvent(harness, turnId, "command.validated", {
    commandBatchId: validation.commandBatchId,
    allPassed: validation.allPassed,
    riskLevel: validation.riskLevel,
    summary: validation.summary,
  }, pending ? { parentEventIds: [], sourcePlanId: pending.planId, sourceCommandBatchId: pending.id } : undefined);

  return {
    ...appendAiEvents(harness, [event]),
    activePlan,
    pendingCommandBatch: pending,
    artifactRefs: {
      ...harness.artifactRefs,
      lastValidation: validation.commandBatchId,
    },
    workingMemory: {
      ...harness.workingMemory,
      activePlanId: activePlan?.id,
      pendingCommandBatchId: pending?.id,
    },
  };
}

export function markPendingBatchExecuted(harness: AiHarnessState, turnId: string): AiHarnessState {
  const pending = harness.pendingCommandBatch
    ? { ...harness.pendingCommandBatch, status: "executed" as const, executedAt: Date.now() }
    : undefined;
  const activePlan = harness.activePlan
    ? {
      ...harness.activePlan,
      status: "applied" as const,
      commandBatch: pending,
      timestamps: { ...harness.activePlan.timestamps, updatedAt: Date.now() },
    }
    : undefined;
  const event = createAiEvent(harness, turnId, "command.executed", {
    commandBatchId: pending?.id,
    planId: activePlan?.id,
    commandCount: pending?.commands.length || 0,
  }, pending ? { parentEventIds: [], sourcePlanId: pending.planId, sourceCommandBatchId: pending.id } : undefined);

  return {
    ...appendAiEvents(harness, [event]),
    activePlan,
    pendingCommandBatch: undefined,
    workingMemory: {
      ...harness.workingMemory,
      activePlanId: activePlan?.id,
      pendingCommandBatchId: undefined,
      currentIntent: activePlan ? {
        type: "execute_pending_commands",
        confidence: 1,
        sourceUserMessage: activePlan.source.createdFromMessage,
      } : harness.workingMemory.currentIntent,
    },
  };
}

export function shouldExecuteValidatedBatch(mode: AiExecutionMode, validation: ValidationReport): boolean {
  if (!validation.allPassed) {
    return false;
  }
  if (mode === "auto-readonly") {
    return validation.riskLevel === "low" && !validation.requiresConfirmation;
  }
  if (mode !== "auto-edit") {
    return false;
  }
  if (validation.riskLevel === "high") {
    return false;
  }
  return !validation.results.some((result) => result.command.trim().toLowerCase().startsWith("/rm"));
}

export function formatValidationReport(validation: ValidationReport): string {
  const failed = validation.results.filter((result) => !result.valid);
  const warnings = validation.results.flatMap((result) => result.warnings.map((warning) => `${result.command}: ${warning}`));
  return [
    `Preflight: ${validation.allPassed ? "passed" : "failed"}`,
    validation.summary,
    warnings.length ? `Warnings:\n${warnings.map((warning) => `- ${warning}`).join("\n")}` : "",
    failed.length ? `Errors:\n${failed.map((result) => `- ${result.command}: ${result.errors.join("; ")}`).join("\n")}` : "",
  ].filter(Boolean).join("\n");
}

export function formatReviewInstruction(mode: AiExecutionMode): string {
  if (mode === "ask") {
    return "Ask mode: commands are saved as a pending plan. Type \"apply it\" after switching to Review or Auto Edit, or copy the commands to run them manually.";
  }
  if (mode === "review") {
    return "Review mode: preflight passed. Type \"apply it\" to execute the pending command batch.";
  }
  if (mode === "auto-readonly") {
    return "Auto Readonly mode: edit commands are held for review. Switch to Review or Auto Edit to apply them.";
  }
  return "Auto Edit mode: command batch is ready.";
}

export function isReadOnlyCommand(command: string): boolean {
  const normalized = command.trim().toLowerCase();
  return (
    normalized === "/help"
    || normalized === "/keys"
    || normalized === "/graph"
    || normalized === "/clear"
    || normalized === "/cls"
    || normalized.startsWith("/find ")
    || normalized.startsWith("/ls ")
    || normalized.startsWith("/neighbors ")
    || normalized.startsWith("/path ")
    || normalized.startsWith("/use ")
    || normalized.startsWith("/show ")
    || normalized.startsWith("/json ")
    || normalized === "/style-css"
    || normalized === "/style-css show"
  );
}

function createEmptyWorkingMemory(): WorkingMemory {
  return {
    focus: {
      nodeIds: [],
      edgeIds: [],
      concepts: [],
    },
    userPreferences: {
      preferredLanguage: "auto",
      requireReviewForDestructiveChanges: true,
    },
    unresolvedQuestions: [],
  };
}

function createSyntheticConsoleEvent(harness: AiHarnessState, index: number, entry: ConsoleHistoryEntry): AiEvent {
  return {
    id: `console-${index}`,
    sessionId: harness.sessionId,
    turnId: "console-history",
    type: entry.tone === "input" ? "user.message" : "assistant.answer",
    timestamp: Date.now() - (MAX_RECENT_CONSOLE_LINES - index),
    graphRevisionBefore: harness.graphRevision,
    payload: {
      tone: entry.tone,
      text: entry.text,
    },
  };
}

function formatSelectionKeys(selection: GraphSelection | null): string[] {
  if (!selection) {
    return [];
  }
  if (selection.type === "node") {
    return [selection.key];
  }
  if ("keys" in selection) {
    return selection.keys;
  }
  return [];
}

function collectCommandsFromResponse(response: Extract<AiResponse, { kind: "propose_changes" | "run_console" | "inspect" }>): string[] {
  if (response.kind === "run_console") {
    return response.commandBatch.commands;
  }
  if (response.kind === "inspect") {
    return response.commands;
  }
  const draftCommands = response.draftCommands?.map((draft) => draft.command) || [];
  const changeCommands = response.plan.changes.flatMap((change) => change.draftCommands);
  return dedupeCommands([...draftCommands, ...changeCommands]);
}

function collectChangesFromResponse(response: Extract<AiResponse, { kind: "propose_changes" | "run_console" | "inspect" }>): ProposedChange[] {
  if (response.kind === "propose_changes") {
    return response.plan.changes.map((change, index) => ({
      ...change,
      id: change.id || createId(`change-${index}`),
      dependencies: change.dependencies || [],
      risk: change.risk || maxRisk(change.draftCommands.map(classifyCommandRisk)),
    }));
  }
  const commands = response.kind === "run_console" ? response.commandBatch.commands : response.commands;
  return commands.map((command, index) => ({
    id: createId(`change-${index}`),
    kind: isReadOnlyCommand(command) ? "set_property" : inferChangeKind(command),
    rationale: response.answer,
    draftCommands: [command],
    dependencies: [],
    risk: classifyCommandRisk(command),
  }));
}

function getResponseTitle(response: Extract<AiResponse, { kind: "propose_changes" | "run_console" | "inspect" }>): string {
  if (response.kind === "propose_changes") {
    return response.plan.title;
  }
  if (response.kind === "run_console") {
    return response.commandBatch.title || "AI command batch";
  }
  return "AI inspection commands";
}

function getExpectedGraphEffects(response: Extract<AiResponse, { kind: "propose_changes" | "run_console" | "inspect" }>): string[] {
  if (response.kind === "propose_changes") {
    return collectChangeRationales(response.plan.changes);
  }
  if (response.kind === "run_console") {
    return response.commandBatch.expectedGraphEffects || [];
  }
  return ["Inspect graph state with read-only commands."];
}

function collectChangeRationales(changes: ProposedChange[]): string[] {
  return changes.map((change) => change.rationale).filter(Boolean);
}

function dedupeCommands(commands: string[]): string[] {
  const seen = new Set<string>();
  return commands
    .map((command) => command.trim())
    .filter((command) => {
      if (!command || !command.startsWith("/") || seen.has(command)) {
        return false;
      }
      seen.add(command);
      return true;
    });
}

function inferChangeKind(command: string): ProposedChange["kind"] {
  const normalized = command.trim().toLowerCase();
  if (normalized.startsWith("/add ")) return "add_node";
  if (normalized.startsWith("/edge ")) return "add_edge";
  if (normalized.startsWith("/rm-edge ")) return "remove_edge";
  if (normalized.startsWith("/mv ")) return "rename_node";
  if (normalized.startsWith("/rm ")) return "remove_edge";
  if (normalized.startsWith("/style-") || normalized.startsWith("/layout ")) return "set_property";
  return "set_property";
}

function extractMentionedNodes(commands: string[]): string[] {
  const candidates = commands.flatMap((command) => command.split(/\s+/).slice(1, 4));
  return Array.from(new Set(candidates.filter((item) => item && !item.startsWith("-") && !item.includes("="))));
}

function buildPlanSummary(title: string, changes: ProposedChange[], batch: CommandBatch | undefined): string {
  return `${title}: ${changes.length} proposed change${changes.length === 1 ? "" : "s"}, ${batch?.commands.length || 0} command${batch?.commands.length === 1 ? "" : "s"}.`;
}

function buildCommandWarnings(command: string): string[] {
  const normalized = command.trim().toLowerCase();
  const warnings: string[] = [];
  if (normalized.startsWith("/set ") && normalized.includes(" define ")) {
    warnings.push("definition field will be overwritten");
  }
  if (normalized.startsWith("/parents ") || normalized.startsWith("/children ")) {
    warnings.push("relation set replacement can remove existing edges");
  }
  if (isDestructiveCommand(command)) {
    warnings.push("destructive command requires review");
  }
  if (normalized.startsWith("/style-css replace")) {
    warnings.push("custom CSS will replace the current graph appearance stylesheet");
  }
  return warnings;
}

function buildDiffPreview(beforeDag: NormalizedDag, afterDag: NormalizedDag, mapping: FieldMapping): string[] {
  const beforeKeys = new Set(Object.keys(beforeDag));
  const afterKeys = new Set(Object.keys(afterDag));
  const lines: string[] = [];

  Array.from(afterKeys)
    .filter((key) => !beforeKeys.has(key))
    .sort((left, right) => left.localeCompare(right))
    .forEach((key) => lines.push(`+ Node: ${key}`));

  Array.from(beforeKeys)
    .filter((key) => !afterKeys.has(key))
    .sort((left, right) => left.localeCompare(right))
    .forEach((key) => lines.push(`- Node: ${key}`));

  Array.from(afterKeys)
    .filter((key) => beforeKeys.has(key))
    .sort((left, right) => left.localeCompare(right))
    .forEach((key) => {
      const beforeNode = beforeDag[key];
      const afterNode = afterDag[key];
      const beforeFields = Object.keys(beforeNode).filter((field) => !isRelationField(field, mapping)).sort();
      const afterFields = Object.keys(afterNode).filter((field) => !isRelationField(field, mapping)).sort();
      const allFields = Array.from(new Set([...beforeFields, ...afterFields])).sort();
      allFields.forEach((field) => {
        if (JSON.stringify(beforeNode[field]) !== JSON.stringify(afterNode[field])) {
          lines.push(`~ ${key}.${field}`);
        }
      });
    });

  diffEdges(beforeDag, afterDag, mapping, "children").forEach((line) => lines.push(line));

  return lines.slice(0, 24);
}

function diffEdges(beforeDag: NormalizedDag, afterDag: NormalizedDag, mapping: FieldMapping, relation: "children" | "parents"): string[] {
  const lines: string[] = [];
  const keys = Array.from(new Set([...Object.keys(beforeDag), ...Object.keys(afterDag)])).sort();
  keys.forEach((key) => {
    const beforeNode = beforeDag[key];
    const afterNode = afterDag[key];
    const beforeRelations = beforeNode ? new Set(getRelationKeys(relation === "children" ? getNodeChildren(beforeNode, mapping) : getNodeParents(beforeNode, mapping))) : new Set<string>();
    const afterRelations = afterNode ? new Set(getRelationKeys(relation === "children" ? getNodeChildren(afterNode, mapping) : getNodeParents(afterNode, mapping))) : new Set<string>();
    Array.from(afterRelations)
      .filter((target) => !beforeRelations.has(target))
      .sort((left, right) => left.localeCompare(right))
      .forEach((target) => lines.push(`+ Edge: ${key} -> ${target}`));
    Array.from(beforeRelations)
      .filter((target) => !afterRelations.has(target))
      .sort((left, right) => left.localeCompare(right))
      .forEach((target) => lines.push(`- Edge: ${key} -> ${target}`));
  });
  return lines;
}

function isRelationField(field: string, mapping: FieldMapping): boolean {
  return field === mapping.parents || field === mapping.children;
}

function classifyCommandRisk(command: string): AiRiskLevel {
  const normalized = command.trim().toLowerCase();
  if (normalized.startsWith("/style-reset") || normalized.startsWith("/style-css replace")) {
    return "medium";
  }
  if (normalized.startsWith("/style-") || normalized.startsWith("/layout ")) {
    return "low";
  }
  if (isDestructiveCommand(normalized) || normalized.startsWith("/parents ") || normalized.startsWith("/children ")) {
    return "high";
  }
  if (isReadOnlyCommand(normalized)) {
    return "low";
  }
  return "medium";
}

function isDestructiveCommand(command: string): boolean {
  const normalized = command.trim().toLowerCase();
  return normalized.startsWith("/rm ") || normalized.startsWith("/rm-edge ") || normalized.startsWith("/unset ");
}

function maxRisk(values: Array<AiRiskLevel | undefined>): AiRiskLevel {
  if (values.includes("high")) {
    return "high";
  }
  if (values.includes("medium")) {
    return "medium";
  }
  return "low";
}

function createId(prefix: string): string {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

