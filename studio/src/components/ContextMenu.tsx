import type React from "react";
import type { NodeKey } from "../graph/types";

export type ContextMenuAction = "view-node" | "copy-key" | "rename-node" | "delete-node" | "delete-subtree" | "edit-parents" | "edit-children" | "add-node" | "paste-node";

interface ContextMenuProps {
  menu: null | { x: number; y: number; nodeKey: NodeKey | null };
  onAction: (action: ContextMenuAction, nodeKey: NodeKey | null) => void;
}

type ContextMenuEntry =
  | { type: "action"; action: ContextMenuAction; label: string; requiresNode?: boolean; tone?: "default" | "danger" }
  | { type: "divider" };

const nodeEntries: ContextMenuEntry[] = [
  { type: "action", action: "view-node", label: "View Node", requiresNode: true },
  { type: "action", action: "copy-key", label: "Copy Key", requiresNode: true },
  { type: "action", action: "rename-node", label: "Rename Key", requiresNode: true },
  { type: "divider" },
  { type: "action", action: "add-node", label: "Add Child Node" },
  { type: "action", action: "edit-children", label: "Edit Children", requiresNode: true },
  { type: "action", action: "edit-parents", label: "Edit Parents", requiresNode: true },
  { type: "divider" },
  { type: "action", action: "delete-node", label: "Delete Node", requiresNode: true, tone: "danger" },
  { type: "action", action: "delete-subtree", label: "Delete Subtree", requiresNode: true, tone: "danger" },
];

const backgroundEntries: ContextMenuEntry[] = [
  { type: "action", action: "add-node", label: "Add Node" },
  { type: "action", action: "paste-node", label: "Paste Node" },
];

export default function ContextMenu({ menu, onAction }: ContextMenuProps) {
  const isVisible = Boolean(menu);
  const left = menu ? Math.max(8, menu.x) : 0;
  const top = menu ? Math.max(8, menu.y) : 0;
  const entries = menu?.nodeKey ? nodeEntries : backgroundEntries;

  return (
    <div id="node-context-menu" className={`node-context-menu${isVisible ? " is-visible" : ""}`} aria-hidden={!isVisible} style={{ left, top }}>
      {entries.map((item, index) => {
        if (item.type === "divider") {
          return <div key={`divider-${index}`} className="context-menu-divider" aria-hidden="true" />;
        }

        const disabled = Boolean(item.requiresNode && !menu?.nodeKey);
        return (
          <button
            key={item.action}
            type="button"
            className={`context-menu-item${item.tone === "danger" ? " context-menu-item-danger" : ""}`}
            data-action={item.action}
            disabled={disabled}
            style={{ opacity: disabled ? 0.45 : 1 }}
            onClick={(event) => {
              event.stopPropagation();
              if (!disabled) {
                onAction(item.action, menu?.nodeKey || null);
              }
            }}
          >
            <span className="context-menu-icon" aria-hidden="true">{renderContextMenuIcon(item.action)}</span>
            <span className="context-menu-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ContextMenuIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="context-menu-icon-svg" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function renderContextMenuIcon(action: ContextMenuAction) {
  switch (action) {
    case "view-node":
      return (
        <ContextMenuIcon>
          <path d="M3 12S6.4 5.5 12 5.5S21 12 21 12S17.6 18.5 12 18.5S3 12 3 12Z" />
          <circle cx="12" cy="12" r="2.6" />
        </ContextMenuIcon>
      );
    case "copy-key":
      return (
        <ContextMenuIcon>
          <rect x="8" y="8" width="11" height="11" rx="2" />
          <path d="M5 15V6C5 5.4 5.4 5 6 5H15" />
        </ContextMenuIcon>
      );
    case "paste-node":
      return (
        <ContextMenuIcon>
          <path d="M9 4H15L16 6H18C18.6 6 19 6.4 19 7V19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V7C5 6.4 5.4 6 6 6H8Z" />
          <path d="M9 6H15" />
          <path d="M12 10V16" />
          <path d="M9.5 13.5L12 16L14.5 13.5" />
        </ContextMenuIcon>
      );
    case "add-node":
      return (
        <ContextMenuIcon>
          <circle cx="12" cy="12" r="7" />
          <path d="M12 8V16" />
          <path d="M8 12H16" />
        </ContextMenuIcon>
      );
    case "edit-children":
      return (
        <ContextMenuIcon>
          <circle cx="12" cy="6" r="2" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="18" r="2" />
          <path d="M12 8V12H7V16" />
          <path d="M12 12H17V16" />
        </ContextMenuIcon>
      );
    case "edit-parents":
      return (
        <ContextMenuIcon>
          <circle cx="7" cy="6" r="2" />
          <circle cx="17" cy="6" r="2" />
          <circle cx="12" cy="18" r="2" />
          <path d="M7 8V12H12V16" />
          <path d="M17 8V12H12" />
        </ContextMenuIcon>
      );
    case "rename-node":
      return (
        <ContextMenuIcon>
          <path d="M5 19L8.5 18.2L18.2 8.5L15.5 5.8L5.8 15.5Z" />
          <path d="M14.5 6.8L17.2 9.5" />
        </ContextMenuIcon>
      );
    case "delete-node":
    case "delete-subtree":
      return (
        <ContextMenuIcon>
          <path d="M5 7H19" />
          <path d="M10 11V17" />
          <path d="M14 11V17" />
          <path d="M8 7L9 19H15L16 7" />
          <path d="M9.5 7V5H14.5V7" />
        </ContextMenuIcon>
      );
  }
}
