import type { ReactNode } from "react";

function IconShell({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="topbar-icon-svg" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function ArrowLeftIcon() {
  return (
    <IconShell>
      <path d="M19 12H5" />
      <path d="M11 18L5 12L11 6" />
    </IconShell>
  );
}

export function ArrowUpIcon() {
  return (
    <IconShell>
      <path d="M12 19V5" />
      <path d="M6 11L12 5L18 11" />
    </IconShell>
  );
}

export function GraphRootsIcon() {
  return (
    <IconShell>
      <circle cx="6" cy="7" r="2.2" />
      <circle cx="18" cy="7" r="2.2" />
      <circle cx="12" cy="17" r="2.2" />
      <path d="M7.8 8.6L10.4 14.2" />
      <path d="M16.2 8.6L13.6 14.2" />
    </IconShell>
  );
}

export function UndoIcon() {
  return (
    <IconShell>
      <path d="M9 9H5V5" />
      <path d="M5 9C6.8 6.4 9.8 5 13 5C18 5 21 8.3 21 12.9C21 17.4 17.7 20 13.5 20" />
    </IconShell>
  );
}

export function RedoIcon() {
  return (
    <IconShell>
      <path d="M15 9H19V5" />
      <path d="M19 9C17.2 6.4 14.2 5 11 5C6 5 3 8.3 3 12.9C3 17.4 6.3 20 10.5 20" />
    </IconShell>
  );
}

export function MinusIcon() {
  return (
    <IconShell>
      <path d="M6 12H18" />
    </IconShell>
  );
}

export function PlusIcon() {
  return (
    <IconShell>
      <path d="M12 6V18" />
      <path d="M6 12H18" />
    </IconShell>
  );
}

export function FitIcon() {
  return (
    <IconShell>
      <path d="M8 4H4V8" />
      <path d="M16 4H20V8" />
      <path d="M8 20H4V16" />
      <path d="M16 20H20V16" />
      <path d="M9 9L4 4" />
      <path d="M15 9L20 4" />
      <path d="M9 15L4 20" />
      <path d="M15 15L20 20" />
    </IconShell>
  );
}

export function SlidersIcon() {
  return (
    <IconShell>
      <path d="M5 6H19" />
      <path d="M5 12H19" />
      <path d="M5 18H19" />
      <circle cx="9" cy="6" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="11" cy="18" r="1.8" fill="currentColor" stroke="none" />
    </IconShell>
  );
}

export function CloseIcon() {
  return (
    <IconShell>
      <path d="M6 6L18 18" />
      <path d="M18 6L6 18" />
    </IconShell>
  );
}

export function ChevronDownIcon() {
  return (
    <IconShell>
      <path d="M7 10L12 15L17 10" />
    </IconShell>
  );
}
