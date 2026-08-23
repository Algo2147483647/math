import type { GraphLayoutMode } from "../graph/types";
import { DEFAULT_GRAPH_APPEARANCE, sanitizeGraphAppearance, type GraphAppearance } from "../graph/appearance";
import type { AiExecutionMode, AiProvider, AiSettings } from "../ai/types";

const GRAPH_PAGE_PREFERENCES_KEY = "dag-studio:page-preferences";

export interface GraphPagePreferences {
  layoutMode: GraphLayoutMode;
  appearance: GraphAppearance;
  hideNodeBorders: boolean;
  alignNodeWidthsToMax: boolean;
  consoleSidebarOpen: boolean;
  consoleSidebarWidth: number;
  aiSettings: AiSettings;
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  provider: "openai-compatible",
  baseUrl: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4.1-mini",
  temperature: 0.2,
  maxTokens: 900,
  executionMode: "ask",
};

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function getInitialGraphPagePreferences(): GraphPagePreferences {
  return {
    layoutMode: "sugiyama",
    appearance: DEFAULT_GRAPH_APPEARANCE,
    hideNodeBorders: false,
    alignNodeWidthsToMax: false,
    consoleSidebarOpen: false,
    consoleSidebarWidth: 360,
    aiSettings: DEFAULT_AI_SETTINGS,
  };
}

export function loadGraphPagePreferences(storage: StorageLike | null = getBrowserStorage()): GraphPagePreferences {
  const defaults = getInitialGraphPagePreferences();
  if (!storage) {
    return defaults;
  }

  try {
    const parsed = parseGraphPagePreferences(storage.getItem(GRAPH_PAGE_PREFERENCES_KEY));
    return parsed ? { ...defaults, ...parsed } : defaults;
  } catch {
    return defaults;
  }
}

export function saveGraphPagePreferences(
  preferences: GraphPagePreferences,
  storage: StorageLike | null = getBrowserStorage(),
): void {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(GRAPH_PAGE_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // Ignore storage write failures so the page still works in private or locked-down contexts.
  }
}

export function parseGraphPagePreferences(raw: string | null): Partial<GraphPagePreferences> | null {
  if (!raw) {
    return null;
  }

  let parsed: {
    layoutMode?: unknown;
    consoleSidebarOpen?: unknown;
    consoleSidebarWidth?: unknown;
    appearance?: unknown;
    hideNodeBorders?: unknown;
    alignNodeWidthsToMax?: unknown;
    aiSettings?: unknown;
  } | null;
  try {
    parsed = JSON.parse(raw) as { mode?: unknown; layoutMode?: unknown } | null;
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const next: Partial<GraphPagePreferences> = {};
  if (parsed.layoutMode === "level" || parsed.layoutMode === "sugiyama" || parsed.layoutMode === "dagre") {
    next.layoutMode = parsed.layoutMode;
  }
  if (parsed.appearance && typeof parsed.appearance === "object" && !Array.isArray(parsed.appearance)) {
    next.appearance = sanitizeGraphAppearance(parsed.appearance);
  }
  if (typeof parsed.hideNodeBorders === "boolean") {
    next.hideNodeBorders = parsed.hideNodeBorders;
  }
  if (typeof parsed.alignNodeWidthsToMax === "boolean") {
    next.alignNodeWidthsToMax = parsed.alignNodeWidthsToMax;
  }
  if (typeof parsed.consoleSidebarOpen === "boolean") {
    next.consoleSidebarOpen = parsed.consoleSidebarOpen;
  }
  if (typeof parsed.consoleSidebarWidth === "number" && Number.isFinite(parsed.consoleSidebarWidth)) {
    next.consoleSidebarWidth = clampConsoleSidebarWidth(parsed.consoleSidebarWidth);
  }
  if (parsed.aiSettings && typeof parsed.aiSettings === "object" && !Array.isArray(parsed.aiSettings)) {
    next.aiSettings = sanitizeAiSettings(parsed.aiSettings);
  }

  return Object.keys(next).length ? next : null;
}

export function clampConsoleSidebarWidth(width: number): number {
  return Math.round(width);
}

function getBrowserStorage(): StorageLike | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  return window.localStorage;
}

function clampNumericPreference(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Math.round(value)));
}

function sanitizeAiSettings(input: object): AiSettings {
  const record = input as Record<string, unknown>;
  return {
    provider: sanitizeAiProvider(record.provider),
    baseUrl: sanitizeString(record.baseUrl, DEFAULT_AI_SETTINGS.baseUrl),
    apiKey: sanitizeString(record.apiKey, DEFAULT_AI_SETTINGS.apiKey),
    model: sanitizeString(record.model, DEFAULT_AI_SETTINGS.model),
    temperature: clampFloatPreference(record.temperature, DEFAULT_AI_SETTINGS.temperature, 0, 2),
    maxTokens: clampNumericPreference(record.maxTokens, DEFAULT_AI_SETTINGS.maxTokens, 128, 8000),
    executionMode: sanitizeAiExecutionMode(record.executionMode),
  };
}

function sanitizeAiProvider(value: unknown): AiProvider {
  return value === "openai-compatible" || value === "deepseek" || value === "anthropic" || value === "gemini" || value === "ollama"
    ? value
    : DEFAULT_AI_SETTINGS.provider;
}

function sanitizeAiExecutionMode(value: unknown): AiExecutionMode {
  return value === "ask" || value === "review" || value === "auto-readonly" || value === "auto-edit"
    ? value
    : DEFAULT_AI_SETTINGS.executionMode;
}

function sanitizeString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function clampFloatPreference(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, value));
}
