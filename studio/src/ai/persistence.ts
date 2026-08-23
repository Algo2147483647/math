import type { ActionPlan, AiEvent, AiExecutionMode, AiHarnessState, AiRiskLevel, CommandBatch, ProposedChange, ValidationReport, WorkingMemory } from "./types";

const AI_HARNESS_STORAGE_PREFIX = "dag-studio:ai-harness:";
const MAX_PERSISTED_EVENTS = 40;

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadPersistedAiHarnessState(
  graphId: string,
  mode: AiExecutionMode,
  storage: StorageLike | null = getBrowserStorage(),
): AiHarnessState | null {
  if (!storage) {
    return null;
  }
  try {
    const raw = storage.getItem(buildAiHarnessStorageKey(graphId));
    return parsePersistedAiHarnessState(raw, mode);
  } catch {
    return null;
  }
}

export function savePersistedAiHarnessState(
  harness: AiHarnessState,
  storage: StorageLike | null = getBrowserStorage(),
): void {
  if (!storage) {
    return;
  }
  try {
    storage.setItem(buildAiHarnessStorageKey(harness.graphId), JSON.stringify(serializeAiHarnessState(harness)));
  } catch {
    // Ignore storage failures so AI remains usable in locked-down contexts.
  }
}

export function parsePersistedAiHarnessState(raw: string | null, fallbackMode: AiExecutionMode): AiHarnessState | null {
  if (!raw) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(parsed)) {
    return null;
  }
  const sessionId = sanitizeString(parsed.sessionId, "");
  const graphId = sanitizeString(parsed.graphId, "");
  const graphRevision = sanitizeString(parsed.graphRevision, "0");
  if (!sessionId || !graphId) {
    return null;
  }
  const activePlan = sanitizeActionPlan(parsed.activePlan);
  const pendingCommandBatch = sanitizeCommandBatch(parsed.pendingCommandBatch);
  return {
    sessionId,
    graphId,
    graphRevision,
    workingMemory: sanitizeWorkingMemory(parsed.workingMemory),
    activePlan,
    pendingCommandBatch,
    recentEvents: Array.isArray(parsed.recentEvents)
      ? parsed.recentEvents.map(sanitizeAiEvent).filter((event): event is AiEvent => Boolean(event)).slice(-MAX_PERSISTED_EVENTS)
      : [],
    artifactRefs: isRecord(parsed.artifactRefs)
      ? {
        lastAnalysis: sanitizeOptionalString(parsed.artifactRefs.lastAnalysis),
        lastValidation: sanitizeOptionalString(parsed.artifactRefs.lastValidation),
        lastDiff: sanitizeOptionalString(parsed.artifactRefs.lastDiff),
      }
      : {},
    mode: sanitizeAiExecutionMode(parsed.mode, fallbackMode),
  };
}

export function buildAiHarnessStorageKey(graphId: string): string {
  return `${AI_HARNESS_STORAGE_PREFIX}${encodeURIComponent(graphId || "local-graph")}`;
}

function serializeAiHarnessState(harness: AiHarnessState): AiHarnessState {
  return {
    ...harness,
    recentEvents: harness.recentEvents.slice(-MAX_PERSISTED_EVENTS),
  };
}

function getBrowserStorage(): StorageLike | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  return window.localStorage;
}

function sanitizeActionPlan(value: unknown): ActionPlan | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const id = sanitizeString(value.id, "");
  const sessionId = sanitizeString(value.sessionId, "");
  const graphId = sanitizeString(value.graphId, "");
  const title = sanitizeString(value.title, "");
  const goal = sanitizeString(value.goal, "");
  if (!id || !sessionId || !graphId || !title) {
    return undefined;
  }
  return {
    id,
    sessionId,
    graphId,
    status: sanitizePlanStatus(value.status),
    title,
    goal,
    source: isRecord(value.source)
      ? {
        userTurnId: sanitizeString(value.source.userTurnId, ""),
        analysisEventId: sanitizeOptionalString(value.source.analysisEventId),
        createdFromMessage: sanitizeString(value.source.createdFromMessage, ""),
      }
      : { userTurnId: "", createdFromMessage: "" },
    scope: isRecord(value.scope)
      ? {
        targetNodes: sanitizeStringArray(value.scope.targetNodes),
        targetEdges: sanitizeStringArray(value.scope.targetEdges),
        affectedConcepts: sanitizeStringArray(value.scope.affectedConcepts),
        graphRevisionBase: sanitizeString(value.scope.graphRevisionBase, "0"),
      }
      : { targetNodes: [], targetEdges: [], affectedConcepts: [], graphRevisionBase: "0" },
    assumptions: sanitizeStringArray(value.assumptions),
    changes: Array.isArray(value.changes)
      ? value.changes.map(sanitizeProposedChange).filter((change): change is ProposedChange => Boolean(change))
      : [],
    commandBatch: sanitizeCommandBatch(value.commandBatch),
    validation: sanitizeValidationReport(value.validation),
    ui: isRecord(value.ui)
      ? {
        displaySummary: sanitizeString(value.ui.displaySummary, ""),
        requiresUserConfirmation: typeof value.ui.requiresUserConfirmation === "boolean" ? value.ui.requiresUserConfirmation : true,
        riskLevel: sanitizeRiskLevel(value.ui.riskLevel),
      }
      : { displaySummary: "", requiresUserConfirmation: true, riskLevel: "medium" },
    timestamps: isRecord(value.timestamps)
      ? {
        createdAt: sanitizeNumber(value.timestamps.createdAt, Date.now()),
        updatedAt: sanitizeNumber(value.timestamps.updatedAt, Date.now()),
      }
      : { createdAt: Date.now(), updatedAt: Date.now() },
  };
}

function sanitizeCommandBatch(value: unknown): CommandBatch | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const id = sanitizeString(value.id, "");
  const title = sanitizeString(value.title, "");
  const commands = sanitizeStringArray(value.commands).filter((command) => command.startsWith("/"));
  if (!id || !title || !commands.length) {
    return undefined;
  }
  return {
    id,
    planId: sanitizeOptionalString(value.planId),
    status: sanitizeCommandBatchStatus(value.status),
    title,
    commands,
    expectedGraphEffects: sanitizeStringArray(value.expectedGraphEffects),
    riskLevel: sanitizeRiskLevel(value.riskLevel),
    validation: sanitizeValidationReport(value.validation),
    createdAt: sanitizeNumber(value.createdAt, Date.now()),
    executedAt: typeof value.executedAt === "number" ? value.executedAt : undefined,
  };
}

function sanitizeValidationReport(value: unknown): ValidationReport | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const commandBatchId = sanitizeString(value.commandBatchId, "");
  if (!commandBatchId) {
    return undefined;
  }
  return {
    commandBatchId,
    graphRevisionBase: sanitizeString(value.graphRevisionBase, "0"),
    results: Array.isArray(value.results)
      ? value.results.map(sanitizeValidationResult).filter((result): result is ValidationReport["results"][number] => Boolean(result))
      : [],
    allPassed: typeof value.allPassed === "boolean" ? value.allPassed : false,
    riskLevel: sanitizeRiskLevel(value.riskLevel),
    requiresConfirmation: typeof value.requiresConfirmation === "boolean" ? value.requiresConfirmation : true,
    summary: sanitizeString(value.summary, ""),
  };
}

function sanitizeValidationResult(value: unknown): ValidationReport["results"][number] | null {
  if (!isRecord(value)) {
    return null;
  }
  const command = sanitizeString(value.command, "");
  if (!command) {
    return null;
  }
  return {
    command,
    valid: typeof value.valid === "boolean" ? value.valid : false,
    errors: sanitizeStringArray(value.errors),
    warnings: sanitizeStringArray(value.warnings),
    expectedDiff: sanitizeStringArray(value.expectedDiff),
  };
}

function sanitizeProposedChange(value: unknown): ProposedChange | null {
  if (!isRecord(value)) {
    return null;
  }
  const kind = sanitizeChangeKind(value.kind);
  const rationale = sanitizeString(value.rationale, "");
  const draftCommands = sanitizeStringArray(value.draftCommands).filter((command) => command.startsWith("/"));
  if (!kind || !rationale || !draftCommands.length) {
    return null;
  }
  return {
    id: sanitizeOptionalString(value.id),
    kind,
    target: isRecord(value.target)
      ? {
        nodeId: sanitizeOptionalString(value.target.nodeId),
        edgeId: sanitizeOptionalString(value.target.edgeId),
        property: sanitizeOptionalString(value.target.property),
      }
      : undefined,
    rationale,
    draftCommands,
    dependencies: sanitizeStringArray(value.dependencies),
    risk: sanitizeRiskLevel(value.risk),
  };
}

function sanitizeAiEvent(value: unknown): AiEvent | null {
  if (!isRecord(value)) {
    return null;
  }
  const id = sanitizeString(value.id, "");
  const sessionId = sanitizeString(value.sessionId, "");
  const turnId = sanitizeString(value.turnId, "");
  const type = sanitizeAiEventType(value.type);
  if (!id || !sessionId || !turnId || !type) {
    return null;
  }
  return {
    id,
    sessionId,
    turnId,
    type,
    timestamp: sanitizeNumber(value.timestamp, Date.now()),
    graphRevisionBefore: sanitizeOptionalString(value.graphRevisionBefore),
    graphRevisionAfter: sanitizeOptionalString(value.graphRevisionAfter),
    payload: isRecord(value.payload) ? value.payload : {},
    causality: isRecord(value.causality)
      ? {
        parentEventIds: sanitizeStringArray(value.causality.parentEventIds),
        sourcePlanId: sanitizeOptionalString(value.causality.sourcePlanId),
        sourceCommandBatchId: sanitizeOptionalString(value.causality.sourceCommandBatchId),
      }
      : undefined,
  };
}

function sanitizeWorkingMemory(value: unknown): WorkingMemory {
  if (!isRecord(value)) {
    return createEmptyWorkingMemory();
  }
  return {
    activeTopic: sanitizeOptionalString(value.activeTopic),
    currentIntent: isRecord(value.currentIntent) && typeof value.currentIntent.type === "string"
      ? {
        type: sanitizeIntentType(value.currentIntent.type),
        confidence: sanitizeNumber(value.currentIntent.confidence, 0),
        sourceUserMessage: sanitizeString(value.currentIntent.sourceUserMessage, ""),
      }
      : undefined,
    focus: isRecord(value.focus)
      ? {
        nodeIds: sanitizeStringArray(value.focus.nodeIds),
        edgeIds: sanitizeStringArray(value.focus.edgeIds),
        concepts: sanitizeStringArray(value.focus.concepts),
      }
      : { nodeIds: [], edgeIds: [], concepts: [] },
    lastAnalysisRef: sanitizeOptionalString(value.lastAnalysisRef),
    activePlanId: sanitizeOptionalString(value.activePlanId),
    pendingCommandBatchId: sanitizeOptionalString(value.pendingCommandBatchId),
    userPreferences: isRecord(value.userPreferences)
      ? {
        preferredLanguage: value.userPreferences.preferredLanguage === "English" || value.userPreferences.preferredLanguage === "Chinese" || value.userPreferences.preferredLanguage === "auto"
          ? value.userPreferences.preferredLanguage
          : "auto",
        autoApplyLowRiskCommands: typeof value.userPreferences.autoApplyLowRiskCommands === "boolean" ? value.userPreferences.autoApplyLowRiskCommands : undefined,
        requireReviewForDestructiveChanges: typeof value.userPreferences.requireReviewForDestructiveChanges === "boolean" ? value.userPreferences.requireReviewForDestructiveChanges : true,
      }
      : { preferredLanguage: "auto", requireReviewForDestructiveChanges: true },
    unresolvedQuestions: sanitizeStringArray(value.unresolvedQuestions),
  };
}

function createEmptyWorkingMemory(): WorkingMemory {
  return {
    focus: { nodeIds: [], edgeIds: [], concepts: [] },
    userPreferences: { preferredLanguage: "auto", requireReviewForDestructiveChanges: true },
    unresolvedQuestions: [],
  };
}

function sanitizePlanStatus(value: unknown): ActionPlan["status"] {
  return value === "draft" || value === "proposed" || value === "approved" || value === "validating" || value === "ready" || value === "executing" || value === "applied" || value === "failed" || value === "cancelled" || value === "superseded"
    ? value
    : "proposed";
}

function sanitizeCommandBatchStatus(value: unknown): CommandBatch["status"] {
  return value === "draft" || value === "validated" || value === "ready" || value === "executing" || value === "executed" || value === "failed"
    ? value
    : "draft";
}

function sanitizeAiExecutionMode(value: unknown, fallback: AiExecutionMode): AiExecutionMode {
  return value === "ask" || value === "review" || value === "auto-readonly" || value === "auto-edit" ? value : fallback;
}

function sanitizeRiskLevel(value: unknown): AiRiskLevel {
  return value === "low" || value === "medium" || value === "high" ? value : "medium";
}

function sanitizeChangeKind(value: unknown): ProposedChange["kind"] | null {
  return value === "add_node" || value === "set_property" || value === "add_edge" || value === "remove_edge" || value === "merge_node" || value === "rename_node" || value === "restructure_subgraph"
    ? value
    : null;
}

function sanitizeAiEventType(value: unknown): AiEvent["type"] | null {
  return value === "user.message" || value === "assistant.answer" || value === "analysis.proposed" || value === "plan.created" || value === "plan.updated" || value === "command.drafted" || value === "command.validated" || value === "command.executed" || value === "graph.changed" || value === "error" || value === "user.approved" || value === "user.rejected"
    ? value
    : null;
}

function sanitizeIntentType(value: string): NonNullable<WorkingMemory["currentIntent"]>["type"] {
  return value === "analyze_graph" || value === "modify_graph" || value === "continue_previous_plan" || value === "translate_content" || value === "execute_pending_commands" || value === "inspect_node" || value === "clarify"
    ? value
    : "clarify";
}

function sanitizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function sanitizeString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function sanitizeOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function sanitizeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
