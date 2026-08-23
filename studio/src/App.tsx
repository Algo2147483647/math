import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { buildStageData } from "./layout/stage-layout";
import { getNodeTitle } from "./graph/accessors";
import { applyGraphCommand, type GraphCommand } from "./graph/commands";
import {
  getDefaultFieldMapping,
  getDisplayFieldName,
  type FieldMapping,
} from "./graph/fieldMapping";
import { getFullGraphSelection, getParentLevelSelection, sanitizeNodeLabel } from "./graph/selectors";
import { serializeDag } from "./graph/serialize";
import { copyTextToClipboard, readTextFromClipboard } from "./adapters/clipboard";
import { pickJsonFile, readJsonFile } from "./adapters/fileAccess";
import { openMarkdownInTypora, syncDefaultWorkspace, type WorkspaceRename } from "./adapters/defaultWorkspace";
import { useDefaultGraph } from "./hooks/useDefaultGraph";
import { useGraphPan } from "./hooks/useGraphPan";
import { useGraphPreferences } from "./hooks/useGraphPreferences";
import { useGraphZoom } from "./hooks/useGraphZoom";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useOutsideDismiss } from "./hooks/useOutsideDismiss";
import { useResizeObserver } from "./hooks/useResizeObserver";
import { repairSelectionAfterCommand } from "./state/derived";
import { graphReducer, repairHistoryAfterCommand } from "./state/graphReducer";
import { initialGraphAppState } from "./state/initialState";
import { loadGraphPagePreferences } from "./state/preferences";
import ConsoleSidebar, { type ConsoleEntry, type ConsoleReviewCard } from "./components/ConsoleSidebar";
import ContextMenu, { type ContextMenuAction } from "./components/ContextMenu";
import NodeDetailModal from "./components/NodeDetailModal";
import RelationEditorModal from "./components/RelationEditorModal";
import Topbar from "./components/Topbar";
import Workspace from "./components/Workspace";
import type { GraphLayoutMode, NodeKey, NormalizedDag } from "./graph/types";
import { getGraphLayoutLabel } from "./graph/types";
import { getGraphTypeOptions, projectGraphByType } from "./graph/typeFilter";
import { DEFAULT_GRAPH_APPEARANCE, sanitizeGraphAppearance, type GraphAppearance, type GraphLayoutAppearance } from "./graph/appearance";
import { applyAppearanceCommand, buildAppearanceMutationLabel } from "./graph/appearanceCommands";
import type { EditTransaction } from "./state/initialState";
import { collectBatchEffects, buildConsoleMutationLabel, executeConsoleInstructions } from "./console/executor";
import { parseConsoleSource } from "./console/dsl";
import { CONSOLE_COMMAND_REFERENCE } from "./console/reference";
import { requestAiPlan, testAiConnection } from "./ai/providers";
import type { AiSettings } from "./ai/types";
import type { ActionPlan, ValidationReport } from "./ai/types";
import {
  appendAiEvents,
  attachValidationToHarness,
  buildAiContextPacket,
  createAiEvent,
  createInitialAiHarnessState,
  createPlanFromAiResponse,
  createTurnId,
  formatReviewInstruction,
  formatValidationReport,
  installPlan,
  isReadOnlyCommand,
  markPendingBatchExecuted,
  referencesPreviousWork,
  shouldExecuteValidatedBatch,
  syncHarnessRuntime,
  validateCommandBatch,
} from "./ai/harness";
import { loadPersistedAiHarnessState, savePersistedAiHarnessState } from "./ai/persistence";

export default function App() {
  const [state, dispatch] = useReducer(graphReducer, initialGraphAppState);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>(() => getDefaultFieldMapping());
  const [appearance, setAppearance] = useState<GraphAppearance>(() => loadGraphPagePreferences().appearance || DEFAULT_GRAPH_APPEARANCE);
  const [appearanceUndoStack, setAppearanceUndoStack] = useState<Array<{ label: string; before: GraphAppearance; after: GraphAppearance }>>([]);
  const [appearanceRedoStack, setAppearanceRedoStack] = useState<Array<{ label: string; before: GraphAppearance; after: GraphAppearance }>>([]);
  const [hideNodeBorders, setHideNodeBorders] = useState<boolean>(() => loadGraphPagePreferences().hideNodeBorders ?? false);
  const [alignNodeWidthsToMax, setAlignNodeWidthsToMax] = useState<boolean>(() => loadGraphPagePreferences().alignNodeWidthsToMax ?? false);
  const [aiSettings, setAiSettings] = useState<AiSettings>(() => loadGraphPagePreferences().aiSettings);
  const [markdownContents, setMarkdownContents] = useState<Record<string, string>>({});
  const [selectedType, setSelectedType] = useState("");
  const [aiHarness, setAiHarness] = useState(() => createInitialAiHarnessState(aiSettings.executionMode));
  const [aiBusy, setAiBusy] = useState(false);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const [consoleInput, setConsoleInput] = useState("");
  const [consoleContextNodeKey, setConsoleContextNodeKey] = useState<NodeKey | null>(null);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([
    { id: 1, tone: "info", text: "Graph console ready." },
  ]);
  const [consoleHistory, setConsoleHistory] = useState<string[]>([]);
  const [, setConsoleHistoryIndex] = useState<number | null>(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [nodeDetailInitialFocus, setNodeDetailInitialFocus] = useState<"fields" | "raw">("fields");
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const topbarRef = useRef<HTMLElement>(null);
  const restoredAiHarnessGraphRef = useRef<string | null>(null);
  const restoredReviewCardRef = useRef<string | null>(null);
  const pendingNodeClickTimeoutRef = useRef<number | null>(null);
  const workspaceSyncQueueRef = useRef<Promise<void>>(Promise.resolve());

  const syncWorkspaceDag = useCallback((dag: NormalizedDag, renamedKeys: WorkspaceRename[] = []) => {
    const payload = serializeDag(dag, fieldMapping);
    workspaceSyncQueueRef.current = workspaceSyncQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        const result = await syncDefaultWorkspace(payload, renamedKeys);
        setMarkdownContents((current) => {
          const next = { ...current };
          result.renamedMarkdown.forEach(({ from, to }) => {
            if (Object.prototype.hasOwnProperty.call(next, from)) {
              next[to] = next[from];
            }
            delete next[from];
          });
          result.deletedMarkdown.forEach((key) => delete next[key]);
          Object.entries(result.createdMarkdown).forEach(([key, content]) => {
            next[key] = content;
          });
          return next;
        });
        dispatch({ type: "statusChanged", status: `Synced ${result.nodeCount} nodes to content/math.json.` });
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Unable to sync content/math.json.";
        dispatch({ type: "statusChanged", status: message });
        window.alert(message);
      });
  }, [fieldMapping]);

  useDefaultGraph(dispatch, setFieldMapping, setMarkdownContents);
  useGraphPreferences({
    state,
    appearance,
    hideNodeBorders,
    alignNodeWidthsToMax,
    aiSettings,
  });

  useEffect(() => {
    const graphId = state.source.fileName || "local-graph";
    const graphRevision = String(state.editHistory.revision);
    setAiHarness((current) => {
      const graphChanged = restoredAiHarnessGraphRef.current !== graphId;
      const restored = graphChanged ? loadPersistedAiHarnessState(graphId, aiSettings.executionMode) : null;
      const base = restored || (graphChanged ? createInitialAiHarnessState(aiSettings.executionMode) : current);
      restoredAiHarnessGraphRef.current = graphId;
      return syncHarnessRuntime(base, {
        graphId,
        graphRevision,
        mode: aiSettings.executionMode,
      });
    });
  }, [aiSettings.executionMode, state.editHistory.revision, state.source.fileName]);

  useEffect(() => {
    savePersistedAiHarnessState(aiHarness);
  }, [aiHarness]);

  useEffect(() => {
    const plan = aiHarness.activePlan;
    if (!plan || restoredReviewCardRef.current === `${aiHarness.graphId}:${plan.id}:${plan.status}`) {
      return;
    }
    if (consoleEntries.some((entry) => entry.tone === "ai-review" && entry.review.planId === plan.id)) {
      restoredReviewCardRef.current = `${aiHarness.graphId}:${plan.id}:${plan.status}`;
      return;
    }
    if ((plan.status === "ready" || plan.status === "failed" || plan.status === "superseded") && plan.commandBatch?.validation) {
      appendConsoleReviewEntry(
        setConsoleEntries,
        buildConsoleReviewCard(plan, plan.commandBatch.validation, plan.status === "superseded" ? "stale" : undefined),
      );
      restoredReviewCardRef.current = `${aiHarness.graphId}:${plan.id}:${plan.status}`;
    }
  }, [aiHarness.activePlan, aiHarness.graphId, consoleEntries]);

  useEffect(() => {
    if (consoleContextNodeKey && state.dag && !state.dag[consoleContextNodeKey]) {
      setConsoleContextNodeKey(null);
    }
  }, [consoleContextNodeKey, state.dag]);

  useEffect(() => {
    setActiveSuggestionIndex(0);
  }, [consoleInput]);

  useEffect(() => {
    return () => {
      clearPendingNodeClick();
    };
  }, []);

  const typeOptions = useMemo(() => state.dag ? getGraphTypeOptions(state.dag, fieldMapping) : [], [fieldMapping, state.dag]);
  useEffect(() => {
    if (selectedType && !typeOptions.includes(selectedType)) {
      setSelectedType("");
    }
  }, [selectedType, typeOptions]);
  const displayDag = useMemo(
    () => state.dag ? projectGraphByType(state.dag, selectedType, fieldMapping) : null,
    [fieldMapping, selectedType, state.dag],
  );
  const stage = useMemo(() => displayDag ? buildStageData({ dag: displayDag, mapping: fieldMapping, selection: selectedType ? { type: "full" } : state.selection, layoutMode: state.layout.mode, appearance, alignNodeWidthsToMax }) : null, [alignNodeWidthsToMax, appearance, displayDag, fieldMapping, selectedType, state.layout.mode, state.selection]);
  const parentSelection = useMemo(() => !selectedType && displayDag && stage ? getParentLevelSelection(displayDag, stage.topLevelKeys, fieldMapping) : null, [displayDag, fieldMapping, selectedType, stage]);
  const consoleSidebarVisible = state.ui.consoleSidebarOpen;
  const consoleSuggestions = useMemo(() => getConsoleSuggestions(consoleInput), [consoleInput]);
  const status = useMemo(() => {
    if (!state.dag || !stage) {
      return state.ui.status;
    }
    const focusNode = stage.dag[stage.root];
    const focusTitle = focusNode ? getNodeTitle(focusNode, fieldMapping) : "";
    const focusLabel = focusNode?.synthetic ? focusTitle || "Selected roots" : sanitizeNodeLabel(focusTitle || stage.root);
    const layoutLabel = getGraphLayoutLabel(state.layout.mode);
    const warningText = stage.warnings.length ? ` ${stage.warnings[0]}` : "";
    return state.ui.status
      && !state.ui.status.includes("loaded from")
      && !state.ui.status.startsWith("Mode:")
      && !state.ui.status.startsWith("Layout:")
      ? state.ui.status
      : `${layoutLabel} layout.${selectedType ? ` Type: ${selectedType}.` : ` Focused on ${focusLabel}.`} ${stage.nodes.length} nodes and ${stage.edges.length} links are visible.${warningText}`;
  }, [selectedType, stage, state.dag, state.layout.mode, state.ui.status]);
  const handleZoomChange = useCallback((scale: number, minScale?: number) => {
    dispatch({ type: "zoomChanged", scale, minScale });
  }, []);

  const commitAppearance = useCallback((nextAppearance: GraphAppearance, label: string) => {
    setAppearance((current) => {
      if (JSON.stringify(current) === JSON.stringify(nextAppearance)) {
        return current;
      }
      setAppearanceUndoStack((stack) => [...stack, { label, before: current, after: nextAppearance }].slice(-100));
      setAppearanceRedoStack([]);
      return nextAppearance;
    });
  }, []);

  const undoAppearance = useCallback(() => {
    setAppearanceUndoStack((undoStack) => {
      const transaction = undoStack.at(-1);
      if (!transaction) {
        return undoStack;
      }
      setAppearance(transaction.before);
      setAppearanceRedoStack((redoStack) => [...redoStack, transaction]);
      dispatch({ type: "statusChanged", status: `Undid: ${transaction.label}` });
      return undoStack.slice(0, -1);
    });
  }, []);

  const redoAppearance = useCallback(() => {
    setAppearanceRedoStack((redoStack) => {
      const transaction = redoStack.at(-1);
      if (!transaction) {
        return redoStack;
      }
      setAppearance(transaction.after);
      setAppearanceUndoStack((undoStack) => [...undoStack, transaction].slice(-100));
      dispatch({ type: "statusChanged", status: `Redid: ${transaction.label}` });
      return redoStack.slice(0, -1);
    });
  }, []);

  const zoom = useGraphZoom({
    containerRef,
    svgRef,
    topbarRef,
    stage,
    scale: state.zoom.scale,
    minScale: state.zoom.minScale,
    maxScale: state.zoom.maxScale,
    onZoomChange: handleZoomChange,
  });

  const handleResize = useCallback(() => zoom.refresh(true), [zoom]);
  useResizeObserver(containerRef, handleResize);
  useGraphPan({ containerRef, enabled: Boolean(stage), onPanStart: () => dispatch({ type: "contextMenuClosed" }) });

  useOutsideDismiss(Boolean(state.ui.contextMenu), () => dispatch({ type: "contextMenuClosed" }));
  const handleGraphUndo = useCallback(() => {
    const transaction = state.editHistory.undoStack.at(-1);
    if (!transaction) {
      return;
    }
    dispatch({ type: "undoRequested" });
    const inverseRenames = [...(transaction.renamedKeys || [])]
      .reverse()
      .map(({ from, to }) => ({ from: to, to: from }));
    syncWorkspaceDag(transaction.beforeDag, inverseRenames);
  }, [state.editHistory.undoStack, syncWorkspaceDag]);

  const handleGraphRedo = useCallback(() => {
    const transaction = state.editHistory.redoStack.at(-1);
    if (!transaction) {
      return;
    }
    dispatch({ type: "redoRequested" });
    syncWorkspaceDag(transaction.afterDag, transaction.renamedKeys || []);
  }, [state.editHistory.redoStack, syncWorkspaceDag]);

  useKeyboardShortcuts({
    onEscape: () => {
      dispatch({ type: "contextMenuClosed" });
      dispatch({ type: "modalClosed" });
    },
    onUndo: () => {
      if (state.editHistory.undoStack.length > 0) {
        handleGraphUndo();
      } else if (appearanceUndoStack.length > 0) {
        undoAppearance();
      }
    },
    onRedo: () => {
      if (state.editHistory.redoStack.length > 0) {
        handleGraphRedo();
      } else if (appearanceRedoStack.length > 0) {
        redoAppearance();
      }
    },
  });

  const commitCommand = useCallback((command: GraphCommand, preferredSelection = state.selection) => {
    if (!state.dag) {
      return;
    }
    try {
      const result = applyGraphCommand(state.dag, command, fieldMapping);
      const selection = repairSelectionAfterCommand(result.dag, state.selection, preferredSelection, result);
      const history = repairHistoryAfterCommand(state, result);
      const transaction: EditTransaction = {
        label: result.message || "Updated graph.",
        beforeDag: state.dag,
        afterDag: result.dag,
        beforeSelection: state.selection,
        afterSelection: selection,
        beforeNavigationHistory: state.history,
        afterNavigationHistory: history,
        revisionBefore: state.editHistory.revision,
        revisionAfter: state.editHistory.revision + 1,
        renamedKeys: result.renamedKey ? [result.renamedKey] : [],
      };
      dispatch({ type: "graphCommandCommitted", result, transaction });
      syncWorkspaceDag(result.dag, transaction.renamedKeys);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The graph command failed.";
      dispatch({ type: "statusChanged", status: message });
      window.alert(message);
    }
  }, [fieldMapping, state, syncWorkspaceDag]);

  const runConsoleSource = useCallback((rawSource: string) => {
    const source = rawSource.trim();
    if (!source) {
      return;
    }

    appendConsoleInputEntries(setConsoleEntries, buildConsolePrompt(consoleContextNodeKey), source);
    setConsoleHistory((current) => (current[current.length - 1] === source ? current : [...current, source]));
    setConsoleHistoryIndex(null);

    if (source === "/clear" || source === "/cls") {
      setConsoleEntries([{ id: Date.now(), tone: "info", text: "Console cleared." }]);
      return;
    }

    const parsed = parseConsoleSource(source);
    if (!parsed.ok) {
      appendConsoleEntry(setConsoleEntries, "error", `Line ${parsed.error.line}: ${parsed.error.message}`);
      return;
    }
    if (!parsed.instructions.length) {
      appendConsoleEntry(setConsoleEntries, "info", "No instructions were found.");
      return;
    }
    if (parsed.instructions.some((instruction) => instruction.type === "clear")) {
      setConsoleEntries([{ id: Date.now(), tone: "info", text: "Console cleared." }]);
    }
    if (!state.dag && parsed.instructions.some((instruction) => requiresGraphForConsoleInstruction(instruction.type))) {
      appendConsoleEntry(setConsoleEntries, "error", "The workspace graph is not loaded yet.");
      return;
    }

    const executed = executeConsoleInstructions(state.dag || {}, parsed.instructions, consoleContextNodeKey, fieldMapping, appearance);
    if (!executed.ok) {
      setConsoleContextNodeKey(executed.contextNodeKey);
      appendConsoleEntry(
        setConsoleEntries,
        "error",
        executed.message.startsWith("Line ") ? executed.message : `Line ${executed.line}: ${executed.message}`,
      );
      return;
    }

    setConsoleContextNodeKey(executed.contextNodeKey);
    executed.outputMessages.forEach((message) => appendConsoleEntry(setConsoleEntries, "info", message));

    if (executed.appearanceMutationCount > 0) {
      const label = buildAppearanceMutationLabel(
        executed.appearanceMutationCount,
        executed.appearanceResults[executed.appearanceResults.length - 1]?.message,
      );
      commitAppearance(executed.appearance, label);
      appendConsoleEntry(setConsoleEntries, "success", label);
    }

    if (executed.mutationCount > 0) {
      const beforeDag = state.dag;
      if (!beforeDag) {
        appendConsoleEntry(setConsoleEntries, "error", "The workspace graph is not loaded yet.");
        return;
      }
      let nextSelection = state.selection;
      let nextHistory = state.history;
      executed.results.forEach((result) => {
        nextSelection = repairSelectionAfterCommand(result.dag, nextSelection, nextSelection, result);
        nextHistory = repairHistoryAfterCommand({ ...state, history: nextHistory } as typeof state, result);
      });

      const batchEffects = collectBatchEffects(executed.results);
      const transaction: EditTransaction = {
        label: buildConsoleMutationLabel(executed.mutationCount, executed.results[executed.results.length - 1]?.message),
        beforeDag,
        afterDag: executed.dag,
        beforeSelection: state.selection,
        afterSelection: nextSelection,
        beforeNavigationHistory: state.history,
        afterNavigationHistory: nextHistory,
        revisionBefore: state.editHistory.revision,
        revisionAfter: state.editHistory.revision + 1,
        renamedKeys: batchEffects.renamedKeys,
      };
      dispatch({
        type: "graphCommandsCommitted",
        transaction,
        renamedKeys: batchEffects.renamedKeys,
        deletedKeys: batchEffects.deletedKeys,
        status: buildConsoleMutationLabel(executed.mutationCount, executed.results[executed.results.length - 1]?.message),
      });
      syncWorkspaceDag(executed.dag, batchEffects.renamedKeys);
    }

    const finalUiEffect = executed.uiEffects.filter((effect) => effect.nodeKey).at(-1);
    if (finalUiEffect) {
      setNodeDetailInitialFocus(finalUiEffect.type === "json" ? "raw" : "fields");
      dispatch({ type: "nodeDetailOpened", nodeKey: finalUiEffect.nodeKey });
    }

    appendConsoleEntry(
      setConsoleEntries,
      "success",
      buildConsoleSuccessMessage(executed.instructionCount, executed.mutationCount, executed.appearanceMutationCount, executed.contextNodeKey, finalUiEffect?.type),
    );
  }, [appearance, commitAppearance, consoleContextNodeKey, fieldMapping, state, syncWorkspaceDag]);

  const handleAiRequest = useCallback(async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || aiBusy) {
      return;
    }
    const turnId = createTurnId();
    const runtimeHarness = syncHarnessRuntime(aiHarness, {
      graphId: state.source.fileName || "local-graph",
      graphRevision: String(state.editHistory.revision),
      mode: aiSettings.executionMode,
    });
    let nextHarness = appendAiEvents(runtimeHarness, [
      createAiEvent(runtimeHarness, turnId, "user.message", { message }),
    ]);

    appendConsoleInputEntries(setConsoleEntries, "ask>", message);
    setConsoleHistory((current) => (current[current.length - 1] === message ? current : [...current, message]));
    setConsoleHistoryIndex(null);

    if (!aiSettings.baseUrl.trim() || !aiSettings.model.trim()) {
      appendConsoleEntry(setConsoleEntries, "error", "AI requires a base URL and model in the controls panel.");
      setAiHarness(appendAiEvents(nextHarness, [
        createAiEvent(nextHarness, turnId, "error", { message: "AI requires a base URL and model." }),
      ]));
      return;
    }

    if (referencesPreviousWork(message) && nextHarness.pendingCommandBatch) {
      const validation = validateCommandBatch({
        batch: nextHarness.pendingCommandBatch,
        dag: state.dag,
        contextNodeKey: consoleContextNodeKey,
        mapping: fieldMapping,
        appearance,
        graphRevision: String(state.editHistory.revision),
      });
      nextHarness = attachValidationToHarness(nextHarness, validation, turnId);
      appendConsoleEntry(setConsoleEntries, validation.allPassed ? "info" : "error", formatValidationReport(validation));
      if (nextHarness.activePlan) {
        appendConsoleReviewEntry(setConsoleEntries, buildConsoleReviewCard(nextHarness.activePlan, validation));
      }
      if (!validation.allPassed) {
        setAiHarness(nextHarness);
        return;
      }

      const commands = nextHarness.pendingCommandBatch?.commands || [];
      const shouldExecute = commands.every(isReadOnlyCommand)
        || shouldExecuteValidatedBatch(aiSettings.executionMode, validation)
        || (aiSettings.executionMode === "review" && isExecutionApproval(message));
      if (!shouldExecute) {
        appendConsoleEntry(setConsoleEntries, "info", formatReviewInstruction(aiSettings.executionMode));
        setAiHarness(nextHarness);
        return;
      }

      runConsoleSource(commands.join("\n"));
      nextHarness = markPendingBatchExecuted(nextHarness, turnId);
      if (nextHarness.activePlan?.commandBatch?.validation) {
        updateConsoleReviewEntry(setConsoleEntries, buildConsoleReviewCard(nextHarness.activePlan, nextHarness.activePlan.commandBatch.validation, "applied"));
      }
      setAiHarness(nextHarness);
      return;
    }

    setAiBusy(true);
    try {
      const context = buildAiContextPacket({
        harness: nextHarness,
        dag: state.dag,
        layoutMode: state.layout.mode,
        selection: state.selection,
        contextNodeKey: consoleContextNodeKey,
        mapping: fieldMapping,
        appearance,
        consoleEntries,
      });
      const response = await requestAiPlan({ settings: aiSettings, context, message });
      if (response.kind === "answer") {
        appendConsoleEntry(setConsoleEntries, "ai", response.answer);
        setAiHarness(appendAiEvents(nextHarness, [
          createAiEvent(nextHarness, turnId, "assistant.answer", { answer: response.answer }),
        ]));
        return;
      }
      if (response.kind === "clarify") {
        const missing = response.missingInformation?.length
          ? `\nMissing information:\n${response.missingInformation.map((item) => `- ${item.field}: ${item.reason}`).join("\n")}`
          : "";
        appendConsoleEntry(setConsoleEntries, "ai", `${response.answer}${missing}`);
        setAiHarness(appendAiEvents(nextHarness, [
          createAiEvent(nextHarness, turnId, "assistant.answer", { answer: response.answer, missingInformation: response.missingInformation || [] }),
        ]));
        return;
      }

      const plan = createPlanFromAiResponse({
        response,
        harness: nextHarness,
        turnId,
        userMessage: message,
      });
      nextHarness = installPlan(nextHarness, plan, turnId);
      appendConsoleEntry(setConsoleEntries, "ai", response.answer);

      const batch = nextHarness.pendingCommandBatch;
      if (!batch) {
        appendConsoleEntry(setConsoleEntries, "ai-action", plan.ui.displaySummary);
        setAiHarness(nextHarness);
        return;
      }

      const validation = validateCommandBatch({
        batch,
        dag: state.dag,
        contextNodeKey: consoleContextNodeKey,
        mapping: fieldMapping,
        appearance,
        graphRevision: String(state.editHistory.revision),
      });
      nextHarness = attachValidationToHarness(nextHarness, validation, turnId);
      if (nextHarness.activePlan) {
        appendConsoleReviewEntry(setConsoleEntries, buildConsoleReviewCard(nextHarness.activePlan, validation));
      }
      if (!validation.allPassed) {
        setAiHarness(nextHarness);
        return;
      }

      const commands = batch.commands;
      if (commands.every(isReadOnlyCommand) || shouldExecuteValidatedBatch(aiSettings.executionMode, validation)) {
        runConsoleSource(commands.join("\n"));
        nextHarness = markPendingBatchExecuted(nextHarness, turnId);
        if (nextHarness.activePlan?.commandBatch?.validation) {
          updateConsoleReviewEntry(setConsoleEntries, buildConsoleReviewCard(nextHarness.activePlan, nextHarness.activePlan.commandBatch.validation, "applied"));
        }
        setAiHarness(nextHarness);
        return;
      }

      appendConsoleEntry(setConsoleEntries, "info", formatReviewInstruction(aiSettings.executionMode));
      setAiHarness(nextHarness);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "AI request failed.";
      appendConsoleEntry(setConsoleEntries, "error", messageText);
      setAiHarness(appendAiEvents(nextHarness, [
        createAiEvent(nextHarness, turnId, "error", { message: messageText }),
      ]));
    } finally {
      setAiBusy(false);
    }
  }, [aiBusy, aiHarness, aiSettings, appearance, consoleContextNodeKey, consoleEntries, fieldMapping, runConsoleSource, state.dag, state.editHistory.revision, state.layout.mode, state.selection, state.source.fileName]);

  const handleAiReviewApply = useCallback((planId: string) => {
    const turnId = createTurnId();
    const runtimeHarness = syncHarnessRuntime(aiHarness, {
      graphId: state.source.fileName || "local-graph",
      graphRevision: String(state.editHistory.revision),
      mode: aiSettings.executionMode,
    });
    if (!runtimeHarness.activePlan || runtimeHarness.activePlan.id !== planId || !runtimeHarness.pendingCommandBatch) {
      appendConsoleEntry(setConsoleEntries, "error", "No matching pending AI plan is available.");
      return;
    }

    let nextHarness = appendAiEvents(runtimeHarness, [
      createAiEvent(runtimeHarness, turnId, "user.approved", { planId }),
    ]);
    const validation = validateCommandBatch({
      batch: runtimeHarness.pendingCommandBatch,
      dag: state.dag,
      contextNodeKey: consoleContextNodeKey,
      mapping: fieldMapping,
      appearance,
      graphRevision: String(state.editHistory.revision),
    });
    nextHarness = attachValidationToHarness(nextHarness, validation, turnId);
    if (nextHarness.activePlan) {
      updateConsoleReviewEntry(setConsoleEntries, buildConsoleReviewCard(nextHarness.activePlan, validation));
    }
    if (!validation.allPassed) {
      appendConsoleEntry(setConsoleEntries, "error", formatValidationReport(validation));
      setAiHarness(nextHarness);
      return;
    }

    const commands = nextHarness.pendingCommandBatch?.commands || [];
    runConsoleSource(commands.join("\n"));
    nextHarness = markPendingBatchExecuted(nextHarness, turnId);
    if (nextHarness.activePlan?.commandBatch?.validation) {
      updateConsoleReviewEntry(setConsoleEntries, buildConsoleReviewCard(nextHarness.activePlan, nextHarness.activePlan.commandBatch.validation, "applied"));
    }
    setAiHarness(nextHarness);
  }, [aiHarness, aiSettings.executionMode, appearance, consoleContextNodeKey, fieldMapping, runConsoleSource, state.dag, state.editHistory.revision, state.source.fileName]);

  const handleAiReviewDismiss = useCallback((planId: string) => {
    const turnId = createTurnId();
    setAiHarness((current) => {
      if (!current.activePlan || current.activePlan.id !== planId) {
        return current;
      }
      const dismissedPlan: ActionPlan = {
        ...current.activePlan,
        status: "cancelled",
        timestamps: { ...current.activePlan.timestamps, updatedAt: Date.now() },
      };
      return appendAiEvents({
        ...current,
        activePlan: dismissedPlan,
        pendingCommandBatch: undefined,
        workingMemory: {
          ...current.workingMemory,
          activePlanId: dismissedPlan.id,
          pendingCommandBatchId: undefined,
        },
      }, [
        createAiEvent(current, turnId, "user.rejected", { planId }),
      ]);
    });
    updateConsoleReviewCardStatus(setConsoleEntries, planId, "dismissed");
    appendConsoleEntry(setConsoleEntries, "info", "AI plan dismissed.");
  }, []);

  const handleAiReviewCopy = useCallback((commands: string[]) => {
    void copyTextToClipboard(commands.join("\n"))
      .then(() => appendConsoleEntry(setConsoleEntries, "success", "Copied AI commands."))
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Copy failed.";
        appendConsoleEntry(setConsoleEntries, "error", message);
      });
  }, []);

  const handleConsoleRun = useCallback(() => {
    if (!consoleInput.trim()) {
      return;
    }
    if (consoleInput.trimStart().startsWith("/")) {
      runConsoleSource(consoleInput);
    } else {
      void handleAiRequest(consoleInput);
    }
    setConsoleInput("");
  }, [consoleInput, handleAiRequest, runConsoleSource]);

  const handleConsolePaste = useCallback((event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = event.clipboardData.getData("text");
    if (!/\r?\n/.test(pastedText)) {
      return;
    }

    const { selectionStart, selectionEnd, value } = event.currentTarget;
    const insertStart = selectionStart ?? value.length;
    const insertEnd = selectionEnd ?? insertStart;
    const nextValue = `${value.slice(0, insertStart)}${pastedText}${value.slice(insertEnd)}`;
    event.preventDefault();
    if (nextValue.trimStart().startsWith("/")) {
      runConsoleSource(nextValue);
    } else {
      void handleAiRequest(nextValue);
    }
    setConsoleInput("");
  }, [handleAiRequest, runConsoleSource]);

  const handleConsoleSidebarResizeStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const startX = event.clientX;
    const startWidth = state.ui.consoleSidebarWidth;

    const handlePointerMove = (pointerEvent: PointerEvent) => {
      dispatch({ type: "consoleSidebarWidthChanged", width: startWidth + (pointerEvent.clientX - startX) });
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }, [state.ui.consoleSidebarWidth]);

  function handleNodeClick(nodeKey: string) {
    clearPendingNodeClick();
    pendingNodeClickTimeoutRef.current = window.setTimeout(() => {
      pendingNodeClickTimeoutRef.current = null;
      if (!state.selection || state.selection.type !== "node" || state.selection.key !== nodeKey) {
        dispatch({ type: "selectionChanged", selection: { type: "node", key: nodeKey }, pushHistory: true });
      }
    }, 240);
  }

  function handleNodeDoubleClick(nodeKey: string) {
    clearPendingNodeClick();
    if (!stage?.nodeMap[nodeKey]) {
      return;
    }
    setNodeDetailInitialFocus("fields");
    dispatch({ type: "nodeDetailOpened", nodeKey });
  }

  function clearPendingNodeClick() {
    if (pendingNodeClickTimeoutRef.current === null) {
      return;
    }
    window.clearTimeout(pendingNodeClickTimeoutRef.current);
    pendingNodeClickTimeoutRef.current = null;
  }

  function handleNodeContextMenu(event: React.MouseEvent<SVGGElement>, nodeKey: string) {
    event.preventDefault();
    event.stopPropagation();
    const menuWidth = 190;
    const menuHeight = 368;
    dispatch({
      type: "contextMenuOpened",
      x: Math.min(event.clientX, window.innerWidth - menuWidth - 8),
      y: Math.min(event.clientY, window.innerHeight - menuHeight - 8),
      nodeKey,
    });
  }

  function handleBackgroundContextMenu(event: React.MouseEvent<Element>) {
    if (!state.dag || event.target instanceof Element && event.target.closest(".dag-node")) {
      return;
    }
    event.preventDefault();
    const menuWidth = 190;
    const menuHeight = 96;
    dispatch({
      type: "contextMenuOpened",
      x: Math.min(event.clientX, window.innerWidth - menuWidth - 8),
      y: Math.min(event.clientY, window.innerHeight - menuHeight - 8),
      nodeKey: null,
    });
  }

  function handleContextMenuAction(action: ContextMenuAction, nodeKey: NodeKey | null) {
    dispatch({ type: "contextMenuClosed" });
    if (action === "view-node" && nodeKey) {
      dispatch({ type: "nodeDetailOpened", nodeKey });
      return;
    }
    if (action === "copy-key" && nodeKey) {
      void handleCopyNodeKey(nodeKey);
      return;
    }
    if (action === "rename-node" && nodeKey) {
      promptRenameNode(nodeKey);
      return;
    }
    if (action === "delete-node" && nodeKey) {
      commitCommand({ type: "deleteNode", key: nodeKey });
      return;
    }
    if (action === "delete-subtree" && nodeKey && state.dag) {
      commitCommand({ type: "deleteSubtree", rootKey: nodeKey });
      return;
    }
    if (action === "edit-parents" && nodeKey) {
      dispatch({ type: "relationEditorOpened", nodeKey, field: "parents" });
      return;
    }
    if (action === "edit-children" && nodeKey) {
      dispatch({ type: "relationEditorOpened", nodeKey, field: "children" });
      return;
    }
    if (action === "add-node") {
      promptAddNode(nodeKey);
      return;
    }
    if (action === "paste-node") {
      void handlePasteNode();
      return;
    }
  }

  async function handleCopyNodeKey(nodeKey: NodeKey) {
    try {
      await copyTextToClipboard(nodeKey);
      dispatch({ type: "statusChanged", status: `Copied node key "${nodeKey}" to the clipboard.` });
    } catch (error) {
      console.error(error);
      dispatch({ type: "statusChanged", status: `Unable to copy node key "${nodeKey}".` });
    }
  }

  async function handlePasteNode(parentKey?: NodeKey) {
    if (!state.dag) {
      dispatch({ type: "statusChanged", status: "The workspace graph is not loaded yet." });
      return;
    }

    try {
      const clipboardText = await readTextFromClipboard();
      const parsed = JSON.parse(clipboardText) as unknown;
      const pasted = getPastedNodeFields(parsed);
      if (!pasted) {
        throw new Error("Clipboard does not contain a node JSON object.");
      }

      const nextKey = promptForPastedNodeKey(pasted.key);
      if (nextKey === null) {
        return;
      }
      commitCommand(
        { type: "addNodeFromFields", key: nextKey, fields: pasted.fields, parentKey },
        parentKey ? state.selection : { type: "node", key: nextKey },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to paste node from clipboard.";
      console.error(error);
      dispatch({ type: "statusChanged", status: message });
      window.alert(message);
    }
  }

  function promptForPastedNodeKey(rawKey: string): NodeKey | null {
    const trimmedKey = rawKey.trim();
    const defaultKey = trimmedKey && !state.dag?.[trimmedKey] ? trimmedKey : `${trimmedKey || "Pasted_Node"}_Copy`;
    const input = window.prompt("Enter a new unique node key:", defaultKey);
    return input === null ? null : input.trim();
  }

  function promptRenameNode(nodeKey: NodeKey) {
    const input = window.prompt("Enter a new unique node key:", nodeKey);
    if (input === null) {
      return;
    }
    commitCommand({ type: "renameNode", oldKey: nodeKey, newKey: input.trim() });
  }

  function promptAddNode(referenceNodeKey: NodeKey | null) {
    const input = window.prompt("Enter a new unique node key:", "New_Node");
    if (input === null) {
      return;
    }
    const newKey = input.trim();
    commitCommand({ type: "addNode", key: newKey, parentKey: referenceNodeKey || undefined });
  }

  function handleLayoutModeChange(mode: GraphLayoutMode) {
    dispatch({ type: "layoutModeChanged", mode });
  }

  function handleLayoutAppearanceChange<K extends keyof GraphLayoutAppearance>(key: K, value: GraphLayoutAppearance[K]) {
    const nextAppearance = sanitizeGraphAppearance({
      ...appearance,
      layout: {
        ...appearance.layout,
        [key]: value,
      },
    });
    commitAppearance(nextAppearance, `Set layout ${String(key)}.`);
  }

  function handleAppearanceCssVarChange(key: string, value: string) {
    const nextAppearance = sanitizeGraphAppearance({
      ...appearance,
      cssVars: {
        ...appearance.cssVars,
        [key]: value,
      },
    });
    commitAppearance(nextAppearance, `Set ${key}.`);
  }

  function handleAppearanceDisplayChange<K extends keyof GraphAppearance["display"]>(key: K, value: GraphAppearance["display"][K]) {
    const nextAppearance = sanitizeGraphAppearance({
      ...appearance,
      display: {
        ...appearance.display,
        [key]: value,
      },
    });
    commitAppearance(nextAppearance, `Set display ${String(key)}.`);
  }

  function handleAppearanceCssChange(css: string) {
    commitAppearance(applyAppearanceCommand(appearance, { type: "replaceCss", css }).appearance, "Replaced graph CSS.");
  }

  function handleAppearanceReset() {
    commitAppearance(DEFAULT_GRAPH_APPEARANCE, "Reset graph appearance.");
  }

  async function handleAppearanceImportClick(event: React.MouseEvent<HTMLInputElement>) {
    if (typeof window.showOpenFilePicker !== "function") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    try {
      const pickedFile = await pickJsonFile();
      if (pickedFile) {
        await importAppearanceFile(pickedFile);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      console.error(error);
      dispatch({ type: "statusChanged", status: "The selected UI appearance file could not be opened." });
    }
  }

  async function handleAppearanceImportChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    await importAppearanceFile(file);
    event.target.value = "";
  }

  async function importAppearanceFile(file: File) {
    try {
      const payload = await readJsonFile(file);
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("Appearance JSON must be an object.");
      }
      commitAppearance(sanitizeGraphAppearance(payload), `Imported graph appearance from ${file.name}.`);
      dispatch({ type: "statusChanged", status: `Imported UI appearance from ${file.name}.` });
    } catch (error) {
      console.error(error);
      dispatch({ type: "statusChanged", status: `Unable to import UI appearance from ${file.name}.` });
    }
  }

  async function handleAiConnectionTest() {
    if (!aiSettings.baseUrl.trim() || !aiSettings.model.trim()) {
      dispatch({ type: "statusChanged", status: "AI requires a base URL and model before testing." });
      return false;
    }
    setAiBusy(true);
    try {
      await testAiConnection(aiSettings);
      dispatch({ type: "statusChanged", status: `AI connection succeeded for ${aiSettings.model}.` });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI connection failed.";
      dispatch({ type: "statusChanged", status: message });
      return false;
    } finally {
      setAiBusy(false);
    }
  }

  const relationEditor = state.ui.relationEditor;
  const detailNodeKey = state.ui.nodeDetail?.nodeKey || null;

  return (
    <div className="app-shell">
      <Topbar
        topbarRef={topbarRef}
        layoutMode={state.layout.mode}
        appearance={appearance}
        hideNodeBorders={hideNodeBorders}
        alignNodeWidthsToMax={alignNodeWidthsToMax}
        status={status}
        hasGraph={Boolean(stage)}
        canBack={state.history.length > 0}
        canUp={Boolean(parentSelection)}
        canUndo={state.editHistory.undoStack.length > 0 || appearanceUndoStack.length > 0}
        canRedo={state.editHistory.redoStack.length > 0 || appearanceRedoStack.length > 0}
        zoomPercent={Math.round(state.zoom.scale * 100)}
        canZoomOut={Boolean(stage) && state.zoom.scale > state.zoom.minScale + 0.001}
        canZoomIn={Boolean(stage) && state.zoom.scale < state.zoom.maxScale - 0.001}
        settingsOpen={state.ui.settingsOpen}
        consoleSidebarOpen={consoleSidebarVisible}
        aiSettings={aiSettings}
        aiBusy={aiBusy}
        typeOptions={typeOptions}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        onBack={() => dispatch({ type: "navigateBack" })}
        onUp={() => parentSelection && dispatch({ type: "selectionChanged", selection: parentSelection, pushHistory: true })}
        onAll={() => dispatch({ type: "selectionChanged", selection: getFullGraphSelection(), pushHistory: true })}
        onUndo={() => state.editHistory.undoStack.length > 0 ? handleGraphUndo() : undoAppearance()}
        onRedo={() => state.editHistory.redoStack.length > 0 ? handleGraphRedo() : redoAppearance()}
        onZoomOut={zoom.zoomOut}
        onZoomIn={zoom.zoomIn}
        onZoomFit={zoom.zoomFit}
        onZoomPercentCommit={(percent) => zoom.setZoomPercent(percent)}
        onSettingsToggle={() => dispatch({ type: "settingsToggled" })}
        onConsoleSidebarToggle={() => dispatch({ type: "consoleSidebarToggled" })}
        onLayoutModeChange={handleLayoutModeChange}
        onLayoutAppearanceChange={handleLayoutAppearanceChange}
        onAppearanceCssVarChange={handleAppearanceCssVarChange}
        onAppearanceCssChange={handleAppearanceCssChange}
        onAppearanceDisplayChange={handleAppearanceDisplayChange}
        onAppearanceReset={handleAppearanceReset}
        onAppearanceImportClick={handleAppearanceImportClick}
        onAppearanceImportChange={handleAppearanceImportChange}
        onNodeBordersToggle={() => setHideNodeBorders((current) => !current)}
        onNodeWidthAlignToggle={() => setAlignNodeWidthsToMax((current) => !current)}
        onAiSettingsChange={setAiSettings}
        onAiConnectionTest={handleAiConnectionTest}
      />

      <Workspace
        containerRef={containerRef}
        svgRef={svgRef}
        stage={stage}
        status={status}
        sidebar={(
          <ConsoleSidebar
            hasGraph={Boolean(state.dag)}
            entries={consoleEntries}
            inputValue={consoleInput}
            contextNodeKey={consoleContextNodeKey}
            aiBusy={aiBusy}
            aiHarness={aiHarness}
            suggestions={consoleSuggestions}
            activeSuggestionIndex={activeSuggestionIndex}
            onReviewApply={handleAiReviewApply}
            onReviewDismiss={handleAiReviewDismiss}
            onReviewCopy={handleAiReviewCopy}
            onInputChange={(value) => {
              setConsoleInput(value);
              setConsoleHistoryIndex(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleConsoleRun();
                return;
              }
              if (event.key === "Tab" && consoleSuggestions.length > 0) {
                event.preventDefault();
                setConsoleInput(consoleSuggestions[activeSuggestionIndex]?.insertText || consoleInput);
                return;
              }
              if (consoleSuggestions.length > 0 && event.key === "ArrowDown") {
                event.preventDefault();
                setActiveSuggestionIndex((current) => (current + 1) % consoleSuggestions.length);
                return;
              }
              if (consoleSuggestions.length > 0 && event.key === "ArrowUp") {
                event.preventDefault();
                setActiveSuggestionIndex((current) => (current - 1 + consoleSuggestions.length) % consoleSuggestions.length);
                return;
              }
              if (!consoleSuggestions.length && event.key === "ArrowUp" && consoleHistory.length > 0) {
                event.preventDefault();
                setConsoleHistoryIndex((current) => {
                  const next = current === null ? consoleHistory.length - 1 : Math.max(0, current - 1);
                  setConsoleInput(consoleHistory[next] || "");
                  return next;
                });
                return;
              }
              if (!consoleSuggestions.length && event.key === "ArrowDown" && consoleHistory.length > 0) {
                event.preventDefault();
                setConsoleHistoryIndex((current) => {
                  if (current === null) {
                    return null;
                  }
                  const next = current + 1;
                  if (next >= consoleHistory.length) {
                    setConsoleInput("");
                    return null;
                  }
                  setConsoleInput(consoleHistory[next] || "");
                  return next;
                });
              }
            }}
            onPaste={handleConsolePaste}
            onSuggestionSelect={(suggestion) => setConsoleInput(suggestion.insertText)}
          />
        )}
        sidebarOpen={consoleSidebarVisible}
        sidebarWidth={state.ui.consoleSidebarWidth}
        appearance={appearance}
        focusedKey={focusedKey}
        hideNodeBorders={hideNodeBorders}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeContextMenu={handleNodeContextMenu}
        onBackgroundContextMenu={handleBackgroundContextMenu}
        onFocusChange={setFocusedKey}
        onScroll={() => dispatch({ type: "contextMenuClosed" })}
        onSidebarResizeStart={handleConsoleSidebarResizeStart}
      />

      <ContextMenu menu={state.ui.contextMenu} onAction={handleContextMenuAction} />
      <RelationEditorModal
        open={Boolean(relationEditor)}
        nodeKey={relationEditor?.nodeKey || null}
        field={relationEditor?.field || null}
        fieldLabel={relationEditor?.field ? getDisplayFieldName(relationEditor.field, fieldMapping) : undefined}
        node={relationEditor && state.dag ? state.dag[relationEditor.nodeKey] || null : null}
        onSave={(relations) => {
          if (relationEditor) {
            commitCommand(relationEditor.field === "parents"
              ? { type: "setParentRelations", key: relationEditor.nodeKey, parents: relations }
              : { type: "setChildRelations", key: relationEditor.nodeKey, children: relations });
            dispatch({ type: "modalClosed" });
          }
        }}
        onClose={() => dispatch({ type: "modalClosed" })}
      />
      <NodeDetailModal
        open={Boolean(detailNodeKey)}
        nodeKey={detailNodeKey}
        node={detailNodeKey && state.dag ? state.dag[detailNodeKey] || null : null}
        fieldMapping={fieldMapping}
        markdownContent={detailNodeKey ? markdownContents[detailNodeKey] ?? null : null}
        initialFocus={nodeDetailInitialFocus}
        onOpenInTypora={async (nodeKey) => {
          try {
            const filePath = await openMarkdownInTypora(nodeKey);
            dispatch({ type: "statusChanged", status: `Opened ${filePath} in Typora.` });
          } catch (error) {
            const message = error instanceof Error ? error.message : `Unable to open ${nodeKey}.md in Typora.`;
            dispatch({ type: "statusChanged", status: message });
            throw error;
          }
        }}
        onSave={(nextKey, fields) => {
          if (detailNodeKey) {
            commitCommand({ type: "updateNodeFields", key: detailNodeKey, nextKey, fields });
          }
        }}
        onClose={() => dispatch({ type: "modalClosed" })}
      />
    </div>
  );
}

function buildConsoleSuccessMessage(
  instructionCount: number,
  mutationCount: number,
  appearanceMutationCount: number,
  contextNodeKey: NodeKey | null,
  uiEffectType: "show" | "json" | undefined,
): string {
  const parts = [`${instructionCount} instruction${instructionCount === 1 ? "" : "s"} executed`];
  if (mutationCount > 0) {
    parts.push(`${mutationCount} mutation${mutationCount === 1 ? "" : "s"} committed`);
  }
  if (appearanceMutationCount > 0) {
    parts.push(`${appearanceMutationCount} appearance update${appearanceMutationCount === 1 ? "" : "s"} committed`);
  }
  if (uiEffectType === "show") {
    parts.push("node viewer opened");
  } else if (uiEffectType === "json") {
    parts.push("raw JSON editor opened");
  }
  parts.push(`context=${contextNodeKey || "unset"}`);
  return `${parts.join(", ")}.`;
}

function requiresGraphForConsoleInstruction(type: string): boolean {
  return !["help", "clear", "appearance", "appearanceCssShow"].includes(type);
}

function appendConsoleEntry(
  setEntries: React.Dispatch<React.SetStateAction<ConsoleEntry[]>>,
  tone: Exclude<ConsoleEntry["tone"], "ai-review">,
  text: string,
): void {
  setEntries((current) => [...current, { id: Date.now() + current.length, tone, text }]);
}

function appendConsoleReviewEntry(
  setEntries: React.Dispatch<React.SetStateAction<ConsoleEntry[]>>,
  review: ConsoleReviewCard,
): void {
  setEntries((current) => [...current, { id: Date.now() + current.length, tone: "ai-review", text: review.title, review }]);
}

function updateConsoleReviewEntry(
  setEntries: React.Dispatch<React.SetStateAction<ConsoleEntry[]>>,
  review: ConsoleReviewCard,
): void {
  setEntries((current) => {
    let updated = false;
    const next = current.map((entry) => {
      if (entry.tone !== "ai-review" || entry.review.planId !== review.planId) {
        return entry;
      }
      updated = true;
      return { ...entry, text: review.title, review };
    });
    return updated ? next : [...current, { id: Date.now() + current.length, tone: "ai-review", text: review.title, review }];
  });
}

function updateConsoleReviewCardStatus(
  setEntries: React.Dispatch<React.SetStateAction<ConsoleEntry[]>>,
  planId: string,
  status: ConsoleReviewCard["status"],
): void {
  setEntries((current) => current.map((entry) => {
    if (entry.tone !== "ai-review" || entry.review.planId !== planId) {
      return entry;
    }
    return {
      ...entry,
      review: {
        ...entry.review,
        status,
        canApply: false,
      },
    };
  }));
}

function buildConsoleReviewCard(
  plan: ActionPlan,
  validation: ValidationReport,
  statusOverride?: ConsoleReviewCard["status"],
): ConsoleReviewCard {
  const commands = plan.commandBatch?.commands || [];
  const diffPreview = validation.results.flatMap((result) => result.expectedDiff || []);
  return {
    planId: plan.id,
    title: plan.title,
    goal: plan.goal,
    riskLevel: validation.riskLevel,
    status: statusOverride || (validation.allPassed ? "ready" : "failed"),
    commandCount: commands.length,
    changeCount: plan.changes.length,
    commands,
    diffPreview,
    validationSummary: validation.summary,
    canApply: validation.allPassed && commands.length > 0 && !statusOverride,
  };
}

function appendConsoleInputEntries(
  setEntries: React.Dispatch<React.SetStateAction<ConsoleEntry[]>>,
  prompt: string,
  source: string,
): void {
  source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => appendConsoleEntry(setEntries, "input", `${prompt} ${line}`));
}

function buildConsolePrompt(contextNodeKey: NodeKey | null): string {
  return contextNodeKey ? `${contextNodeKey}>` : "graph>";
}

function isExecutionApproval(message: string): boolean {
  const normalized = message.trim().toLocaleLowerCase();
  return [
    "apply",
    "approve",
    "execute",
    "run it",
    "do it",
    "complete",
  ].some((phrase) => normalized.includes(phrase));
}

function getPastedNodeFields(value: unknown): { key: NodeKey; fields: Record<string, unknown> } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const directFields = value as Record<string, unknown>;
  const directKey = typeof directFields.key === "string" ? directFields.key.trim() : "";
  if (directKey) {
    return { key: directKey, fields: directFields };
  }

  const entries = Object.entries(directFields);
  if (entries.length !== 1) {
    return null;
  }

  const [entryKey, entryValue] = entries[0];
  if (!entryKey.trim() || !entryValue || typeof entryValue !== "object" || Array.isArray(entryValue)) {
    return null;
  }

  return { key: entryKey.trim(), fields: entryValue as Record<string, unknown> };
}



interface ConsoleSuggestion {
  label: string;
  insertText: string;
}

const COMMAND_TEMPLATES: ConsoleSuggestion[] = [
  ...CONSOLE_COMMAND_REFERENCE.map((command) => ({ label: command.label, insertText: command.insertText })),
];

function getConsoleSuggestions(input: string): ConsoleSuggestion[] {
  const trimmedStart = input.trimStart();
  if (!trimmedStart || !trimmedStart.startsWith("/")) {
    return [];
  }

  const hasWhitespace = /\s/.test(trimmedStart);
  if (!hasWhitespace) {
    const lower = trimmedStart.toLowerCase();
    return COMMAND_TEMPLATES.filter((item) => item.label.toLowerCase().startsWith(lower)).slice(0, 8);
  }

  const mnemonic = trimmedStart.split(/\s+/, 1)[0]?.toLowerCase() || "";
  return COMMAND_TEMPLATES.filter((item) => item.label.toLowerCase().startsWith(`${mnemonic} `) || item.label.toLowerCase() === mnemonic).slice(0, 6);
}
