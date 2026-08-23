import type { ReactNode } from "react";

interface IconButtonProps {
  id: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  ariaControls?: string;
  ariaExpanded?: boolean;
  className?: string;
}

export default function IconButton({ id, label, icon, disabled, onClick, ariaControls, ariaExpanded, className = "ghost-btn topbar-icon-btn" }: IconButtonProps) {
  return (
    <button
      id={id}
      className={className}
      type="button"
      title={label}
      aria-label={label}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="topbar-icon" aria-hidden="true">{icon}</span>
    </button>
  );
}
