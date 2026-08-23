interface EmptyStateProps {
  message: string;
  hidden: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ message, hidden, actionLabel, onAction }: EmptyStateProps) {
  return (
    <section id="empty-state" className={`empty-state${hidden ? " is-hidden" : ""}`}>
      <p className="empty-state__eyebrow">Visual dependency map</p>
      <h2>Inspect your graph with a clearer visual hierarchy</h2>
      <p id="empty-state-message" className="empty-state__message">
        {message}
      </p>
      {actionLabel && onAction ? <button id="empty-state-action" className="primary-btn empty-state__action" type="button" onClick={onAction}>{actionLabel}</button> : null}
    </section>
  );
}
