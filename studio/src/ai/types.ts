export type AiProvider = "openai-compatible" | "deepseek" | "anthropic" | "gemini" | "ollama";

export type AiExecutionMode = "ask" | "review" | "auto-readonly" | "auto-edit";

export interface AiSettings {
  provider: AiProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  executionMode: AiExecutionMode;
}

export type AiResponse =
  | { kind: "answer"; answer: string; memoryPatch?: Partial<WorkingMemory> }
  | {
    kind: "propose_changes";
    answer: string;
    plan: {
      title: string;
      goal: string;
      assumptions?: string[];
      affectedNodes?: string[];
      changes: ProposedChange[];
    };
    draftCommands?: ConsoleCommandDraft[];
    nextAction?: {
      type: "await_user_confirmation" | "validate_then_execute" | "needs_inspection";
      message: string;
    };
    memoryPatch?: Partial<WorkingMemory>;
  }
  | {
    kind: "run_console";
    answer: string;
    commandBatch: {
      title?: string;
      commands: string[];
      expectedGraphEffects?: string[];
      riskLevel?: AiRiskLevel;
    };
    preflightRequired?: boolean;
    memoryPatch?: Partial<WorkingMemory>;
  }
  | {
    kind: "clarify";
    answer: string;
    missingInformation?: Array<{ field: string; reason: string; candidates?: string[] }>;
    fallbackActions?: string[];
    memoryPatch?: Partial<WorkingMemory>;
  }
  | {
    kind: "inspect";
    answer: string;
    commands: string[];
    memoryPatch?: Partial<WorkingMemory>;
  };

export type AiRiskLevel = "low" | "medium" | "high";

export type AiEventType =
  | "user.message"
  | "assistant.answer"
  | "analysis.proposed"
  | "plan.created"
  | "plan.updated"
  | "command.drafted"
  | "command.validated"
  | "command.executed"
  | "graph.changed"
  | "error"
  | "user.approved"
  | "user.rejected";

export interface AiEvent {
  id: string;
  sessionId: string;
  turnId: string;
  type: AiEventType;
  timestamp: number;
  graphRevisionBefore?: string;
  graphRevisionAfter?: string;
  payload: Record<string, unknown>;
  causality?: {
    parentEventIds: string[];
    sourcePlanId?: string;
    sourceCommandBatchId?: string;
  };
}

export interface WorkingMemory {
  activeTopic?: string;
  currentIntent?: {
    type:
      | "analyze_graph"
      | "modify_graph"
      | "continue_previous_plan"
      | "translate_content"
      | "execute_pending_commands"
      | "inspect_node"
      | "clarify";
    confidence: number;
    sourceUserMessage: string;
  };
  focus: {
    nodeIds: string[];
    edgeIds: string[];
    concepts: string[];
  };
  lastAnalysisRef?: string;
  activePlanId?: string;
  pendingCommandBatchId?: string;
  userPreferences: {
    preferredLanguage?: "English" | "Chinese" | "auto";
    autoApplyLowRiskCommands?: boolean;
    requireReviewForDestructiveChanges?: boolean;
  };
  unresolvedQuestions: string[];
}

export interface ConsoleCommandDraft {
  command: string;
  rationale?: string;
  risk?: AiRiskLevel;
}

export interface ProposedChange {
  id?: string;
  kind:
    | "add_node"
    | "set_property"
    | "add_edge"
    | "remove_edge"
    | "merge_node"
    | "rename_node"
    | "restructure_subgraph";
  target?: {
    nodeId?: string;
    edgeId?: string;
    property?: string;
  };
  rationale: string;
  draftCommands: string[];
  dependencies?: string[];
  risk?: AiRiskLevel;
}

export interface CommandBatch {
  id: string;
  planId?: string;
  status: "draft" | "validated" | "ready" | "executing" | "executed" | "failed";
  title: string;
  commands: string[];
  expectedGraphEffects: string[];
  riskLevel: AiRiskLevel;
  validation?: ValidationReport;
  createdAt: number;
  executedAt?: number;
}

export interface ActionPlan {
  id: string;
  sessionId: string;
  graphId: string;
  status: "draft" | "proposed" | "approved" | "validating" | "ready" | "executing" | "applied" | "failed" | "cancelled" | "superseded";
  title: string;
  goal: string;
  source: {
    userTurnId: string;
    analysisEventId?: string;
    createdFromMessage: string;
  };
  scope: {
    targetNodes: string[];
    targetEdges: string[];
    affectedConcepts: string[];
    graphRevisionBase: string;
  };
  assumptions: string[];
  changes: ProposedChange[];
  commandBatch?: CommandBatch;
  validation?: ValidationReport;
  ui: {
    displaySummary: string;
    requiresUserConfirmation: boolean;
    riskLevel: AiRiskLevel;
  };
  timestamps: {
    createdAt: number;
    updatedAt: number;
  };
}

export interface ValidationReport {
  commandBatchId: string;
  graphRevisionBase: string;
  results: Array<{
    command: string;
    valid: boolean;
    errors: string[];
    warnings: string[];
    expectedDiff?: string[];
  }>;
  allPassed: boolean;
  riskLevel: AiRiskLevel;
  requiresConfirmation: boolean;
  summary: string;
}

export interface AiHarnessState {
  sessionId: string;
  graphId: string;
  graphRevision: string;
  workingMemory: WorkingMemory;
  activePlan?: ActionPlan;
  pendingCommandBatch?: CommandBatch;
  recentEvents: AiEvent[];
  artifactRefs: {
    lastAnalysis?: string;
    lastValidation?: string;
    lastDiff?: string;
  };
  mode: AiExecutionMode;
}

export interface AiGraphContext {
  summary: string;
  commandReference: string;
}

export interface AiRequest {
  settings: AiSettings;
  context: AiContextPacket;
  message: string;
}

export interface AiContextPacket {
  system: {
    role: "graph_editing_agent";
    language: "zh" | "en" | "auto";
    responseProtocolVersion: "v2";
    editPolicy: {
      mode: AiExecutionMode;
      autoEditEnabled: boolean;
      requireReviewForDestructiveChanges: boolean;
    };
  };
  graph: AiGraphContext & {
    graphRevision: string;
    currentSelection?: string[];
    focusedNodes?: string[];
  };
  tools: {
    availableCommands: string;
    commandExamples: string[];
    constraints: string[];
  };
  memory: {
    recentEvents: AiEvent[];
    activePlan?: ActionPlan;
    workingMemory: WorkingMemory;
  };
  execution: {
    pendingCommandBatch?: CommandBatch;
    lastValidation?: ValidationReport;
  };
  budget: {
    maxInputTokens: number;
    reservedOutputTokens: number;
    compressionLevel: "none" | "light" | "aggressive";
  };
}

export type LegacyAiPlan =
  | { type: "answer"; text: string }
  | { type: "run_console"; explanation: string; commands: string[] };
