import { useEffect, useRef, useState } from "react";
import type { AiEvent, AiHarnessState, CommandBatch, ValidationReport } from "../ai/types";
import type { NodeKey } from "../graph/types";

export interface ConsoleReviewCard {
  planId: string;
  title: string;
  goal: string;
  riskLevel: "low" | "medium" | "high";
  status: "ready" | "failed" | "applied" | "dismissed" | "stale";
  commandCount: number;
  changeCount: number;
  commands: string[];
  diffPreview: string[];
  validationSummary: string;
  canApply: boolean;
}

export type ConsoleEntryTone = "input" | "success" | "error" | "info" | "ai" | "ai-action" | "ai-review";

export type ConsoleEntry =
  | { id: number; tone: Exclude<ConsoleEntryTone, "ai-review">; text: string }
  | { id: number; tone: "ai-review"; text: string; review: ConsoleReviewCard };

interface ConsoleSuggestion {
  label: string;
  insertText: string;
}

interface ConsoleSidebarProps {
  hasGraph: boolean;
  entries: ConsoleEntry[];
  inputValue: string;
  contextNodeKey: NodeKey | null;
  aiBusy: boolean;
  aiHarness: AiHarnessState;
  suggestions: ConsoleSuggestion[];
  activeSuggestionIndex: number;
  onReviewApply: (planId: string) => void;
  onReviewDismiss: (planId: string) => void;
  onReviewCopy: (commands: string[]) => void;
  onInputChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (event: React.ClipboardEvent<HTMLInputElement>) => void;
  onSuggestionSelect: (suggestion: ConsoleSuggestion) => void;
}

export default function ConsoleSidebar({
  hasGraph,
  entries,
  inputValue,
  contextNodeKey,
  aiBusy,
  aiHarness,
  suggestions,
  activeSuggestionIndex,
  onReviewApply,
  onReviewDismiss,
  onReviewCopy,
  onInputChange,
  onKeyDown,
  onPaste,
  onSuggestionSelect,
}: ConsoleSidebarProps) {
  const outputRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState<"console" | "activity">("console");

  useEffect(() => {
    const output = outputRef.current;
    if (!output || activePanel !== "console") {
      return;
    }
    output.scrollTop = output.scrollHeight;
  }, [activePanel, entries]);

  return (
    <section className="console-sidebar console-sidebar--terminal" aria-label="Graph console">
      <div className="console-terminal__panel-tabs" role="tablist" aria-label="Console panels">
        <button
          type="button"
          className={activePanel === "console" ? "is-active" : ""}
          aria-selected={activePanel === "console"}
          onClick={() => setActivePanel("console")}
        >
          Console
        </button>
        <button
          type="button"
          className={activePanel === "activity" ? "is-active" : ""}
          aria-selected={activePanel === "activity"}
          onClick={() => setActivePanel("activity")}
        >
          AI Activity
        </button>
      </div>

      {activePanel === "console" ? (
        <div ref={outputRef} className="console-terminal__output">
          {entries.map((entry) => entry.tone === "ai-review" ? (
            <AiReviewCardView
              key={entry.id}
              review={entry.review}
              onApply={onReviewApply}
              onDismiss={onReviewDismiss}
              onCopy={onReviewCopy}
            />
          ) : (
            <div key={entry.id} className={`console-terminal__line console-terminal__line--${entry.tone}`}>
              <span>{entry.text}</span>
            </div>
          ))}
          {!hasGraph ? <div className="console-terminal__line console-terminal__line--info">The workspace graph is not loaded yet.</div> : null}
          {aiBusy ? <div className="console-terminal__line console-terminal__line--ai">AI is thinking...</div> : null}
        </div>
      ) : (
        <AiActivityPanel
          harness={aiHarness}
          onApply={onReviewApply}
          onDismiss={onReviewDismiss}
          onCopy={onReviewCopy}
        />
      )}

      <div className="console-terminal__input-wrap">
        <label className="console-terminal__prompt" htmlFor="graph-console-input">
          {contextNodeKey ? `${contextNodeKey}>` : "graph>"}
        </label>
        <input
          id="graph-console-input"
          className="console-terminal__input"
          type="text"
          spellCheck={false}
          autoComplete="off"
          value={inputValue}
          disabled={aiBusy}
          placeholder="type /help or ask AI"
          onChange={(event) => onInputChange(event.currentTarget.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
        />
      </div>

      {suggestions.length > 0 ? (
        <div className="console-terminal__suggestions" role="listbox" aria-label="Command suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.label}-${index}`}
              type="button"
              className={`console-terminal__suggestion${index === activeSuggestionIndex ? " is-active" : ""}`}
              onMouseDown={(event) => {
                event.preventDefault();
                onSuggestionSelect(suggestion);
              }}
            >
              <span>{suggestion.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function AiActivityPanel({
  harness,
  onApply,
  onDismiss,
  onCopy,
}: {
  harness: AiHarnessState;
  onApply: (planId: string) => void;
  onDismiss: (planId: string) => void;
  onCopy: (commands: string[]) => void;
}) {
  const plan = harness.activePlan;
  const batch = harness.pendingCommandBatch || plan?.commandBatch;
  const events = harness.recentEvents.slice().reverse();
  const canApply = Boolean(plan && batch?.commands.length && batch.validation?.allPassed && plan.status !== "applied" && plan.status !== "superseded" && plan.status !== "cancelled");

  return (
    <div className="console-activity" aria-label="AI activity records">
      <div className="console-activity__summary" aria-label="AI harness summary">
        <span>AI enabled</span>
        <span>{harness.mode}</span>
        <span>rev {harness.graphRevision}</span>
        <span>{events.length} events</span>
      </div>

      {plan ? (
        <section className="console-activity__block" aria-label="Active AI plan">
          <div className="console-activity__block-header">
            <div>
              <p className="console-activity__eyebrow">Active Plan</p>
              <h3>{plan.title}</h3>
            </div>
            <span className={`console-activity__status console-activity__status--${plan.status}`}>{plan.status}</span>
          </div>
          <p className="console-activity__text">{plan.goal}</p>
          <div className="console-activity__meta">
            <span>{plan.changes.length} changes</span>
            <span>{plan.commandBatch?.commands.length || 0} commands</span>
            <span>{plan.ui.riskLevel} risk</span>
          </div>
          {plan.assumptions.length ? (
            <div className="console-activity__section">
              <p className="console-activity__label">Assumptions</p>
              <ul>
                {plan.assumptions.map((assumption, index) => <li key={`${assumption}-${index}`}>{assumption}</li>)}
              </ul>
            </div>
          ) : null}
          <div className="console-activity__actions">
            <button type="button" disabled={!canApply} onClick={() => onApply(plan.id)}>Apply</button>
            <button type="button" disabled={!batch?.commands.length} onClick={() => batch && onCopy(batch.commands)}>Copy Commands</button>
            <button type="button" disabled={plan.status === "cancelled" || plan.status === "applied"} onClick={() => onDismiss(plan.id)}>Dismiss</button>
          </div>
        </section>
      ) : (
        <div className="console-activity__empty">No active AI plan.</div>
      )}

      {batch ? <CommandBatchView batch={batch} /> : null}
      {batch?.validation ? <ValidationReportView validation={batch.validation} /> : null}

      <section className="console-activity__block" aria-label="Recent AI events">
        <div className="console-activity__block-header">
          <div>
            <p className="console-activity__eyebrow">History</p>
            <h3>Recent Events</h3>
          </div>
        </div>
        {events.length ? (
          <ol className="console-activity__events">
            {events.map((event) => <AiEventItem key={event.id} event={event} />)}
          </ol>
        ) : (
          <div className="console-activity__empty">No AI events recorded yet.</div>
        )}
      </section>
    </div>
  );
}

function CommandBatchView({ batch }: { batch: CommandBatch }) {
  return (
    <section className="console-activity__block" aria-label="Pending command batch">
      <div className="console-activity__block-header">
        <div>
          <p className="console-activity__eyebrow">Command Batch</p>
          <h3>{batch.title}</h3>
        </div>
        <span className={`console-activity__status console-activity__status--${batch.status}`}>{batch.status}</span>
      </div>
      {batch.expectedGraphEffects.length ? (
        <div className="console-activity__section">
          <p className="console-activity__label">Expected Effects</p>
          <ul>
            {batch.expectedGraphEffects.map((effect, index) => <li key={`${effect}-${index}`}>{effect}</li>)}
          </ul>
        </div>
      ) : null}
      <pre>{batch.commands.join("\n")}</pre>
    </section>
  );
}

function ValidationReportView({ validation }: { validation: ValidationReport }) {
  return (
    <section className="console-activity__block" aria-label="Last AI validation">
      <div className="console-activity__block-header">
        <div>
          <p className="console-activity__eyebrow">Validation</p>
          <h3>{validation.allPassed ? "Passed" : "Needs Attention"}</h3>
        </div>
        <span className={`console-activity__status console-activity__status--${validation.riskLevel}`}>{validation.riskLevel}</span>
      </div>
      <p className="console-activity__text">{validation.summary}</p>
      <ol className="console-activity__validation">
        {validation.results.map((result, index) => (
          <li key={`${result.command}-${index}`}>
            <span className={result.valid ? "is-valid" : "is-invalid"}>{result.valid ? "ok" : "fail"}</span>
            <code>{result.command}</code>
            {result.errors.length ? <small>{result.errors.join("; ")}</small> : null}
            {result.warnings.length ? <small>{result.warnings.join("; ")}</small> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function AiEventItem({ event }: { event: AiEvent }) {
  return (
    <li className="console-activity__event">
      <div>
        <span>{event.type}</span>
        <time dateTime={new Date(event.timestamp).toISOString()}>{formatEventTime(event.timestamp)}</time>
      </div>
      <pre>{formatEventPayload(event.payload)}</pre>
    </li>
  );
}

function formatEventTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

function formatEventPayload(payload: Record<string, unknown>): string {
  const text = JSON.stringify(payload, null, 2);
  return text.length > 720 ? `${text.slice(0, 717)}...` : text;
}

function AiReviewCardView({
  review,
  onApply,
  onDismiss,
  onCopy,
}: {
  review: ConsoleReviewCard;
  onApply: (planId: string) => void;
  onDismiss: (planId: string) => void;
  onCopy: (commands: string[]) => void;
}) {
  return (
    <article className={`console-review-card console-review-card--${review.status}`} aria-label={`AI review plan ${review.title}`}>
      <div className="console-review-card__header">
        <div>
          <p className="console-review-card__eyebrow">AI Review</p>
          <h3>{review.title}</h3>
        </div>
        <span className={`console-review-card__risk console-review-card__risk--${review.riskLevel}`}>{review.riskLevel}</span>
      </div>
      <p className="console-review-card__goal">{review.goal}</p>
      <div className="console-review-card__meta" aria-label="Plan summary">
        <span>{review.changeCount} changes</span>
        <span>{review.commandCount} commands</span>
        <span>{review.status}</span>
      </div>
      {review.validationSummary ? <p className="console-review-card__validation">{review.validationSummary}</p> : null}
      {review.diffPreview.length ? (
        <div className="console-review-card__section">
          <p className="console-review-card__label">Diff Preview</p>
          <pre>{review.diffPreview.join("\n")}</pre>
        </div>
      ) : null}
      <div className="console-review-card__section">
        <p className="console-review-card__label">Commands</p>
        <pre>{review.commands.join("\n")}</pre>
      </div>
      <div className="console-review-card__actions">
        <button type="button" disabled={!review.canApply} onClick={() => onApply(review.planId)}>Apply</button>
        <button type="button" onClick={() => onCopy(review.commands)}>Copy Commands</button>
        <button type="button" onClick={() => onDismiss(review.planId)}>Dismiss</button>
      </div>
    </article>
  );
}
