import { useEffect, useState, type ChangeEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import type { GraphAppearance, GraphLayoutAppearance } from "../../graph/appearance";
import type { GraphLayoutMode } from "../../graph/types";
import type { AiSettings } from "../../ai/types";
import { CloseIcon } from "../topbar/TopbarIcons";
import AiSettingsPanel, { type AiConnectionStatus } from "./AiSettingsPanel";
import AppearanceSettings from "./AppearanceSettings";
import { APPEARANCE_TOKEN_CONTROLS, SETTINGS_CHAPTERS, type SettingsChapter } from "./settingsConfig";
import { parseCssPixelValue } from "./settingsUtils";

interface SettingsModalProps {
  open: boolean;
  layoutMode: GraphLayoutMode;
  appearance: GraphAppearance;
  hideNodeBorders: boolean;
  alignNodeWidthsToMax: boolean;
  status: string;
  consoleSidebarOpen: boolean;
  aiSettings: AiSettings;
  aiBusy: boolean;
  onClose: () => void;
  onLayoutModeChange: (mode: GraphLayoutMode) => void;
  onLayoutAppearanceChange: <K extends keyof GraphLayoutAppearance>(key: K, value: GraphLayoutAppearance[K]) => void;
  onAppearanceCssVarChange: (key: string, value: string) => void;
  onAppearanceCssChange: (css: string) => void;
  onAppearanceDisplayChange: <K extends keyof GraphAppearance["display"]>(key: K, value: GraphAppearance["display"][K]) => void;
  onAppearanceReset: () => void;
  onAppearanceImportClick: (event: MouseEvent<HTMLInputElement>) => void;
  onAppearanceImportChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onNodeBordersToggle: () => void;
  onNodeWidthAlignToggle: () => void;
  onConsoleSidebarToggle: () => void;
  onAiSettingsChange: (settings: AiSettings) => void;
  onAiConnectionTest: () => Promise<boolean>;
}

export default function SettingsModal({
  open,
  layoutMode,
  appearance,
  hideNodeBorders,
  alignNodeWidthsToMax,
  status,
  consoleSidebarOpen,
  aiSettings,
  aiBusy,
  onClose,
  onLayoutModeChange,
  onLayoutAppearanceChange,
  onAppearanceCssVarChange,
  onAppearanceCssChange,
  onAppearanceDisplayChange,
  onAppearanceReset,
  onAppearanceImportClick,
  onAppearanceImportChange,
  onNodeBordersToggle,
  onNodeWidthAlignToggle,
  onConsoleSidebarToggle,
  onAiSettingsChange,
  onAiConnectionTest,
}: SettingsModalProps) {
  const [activeChapter, setActiveChapter] = useState<SettingsChapter>("appearance");
  const [providerMenuOpen, setProviderMenuOpen] = useState(false);
  const [aiConnectionStatus, setAiConnectionStatus] = useState<AiConnectionStatus>("idle");
  const [appearanceCssDraft, setAppearanceCssDraft] = useState(appearance.css);
  const [cssVarDrafts, setCssVarDrafts] = useState<Record<string, string>>(() => buildCssVarDrafts(appearance));
  const [titleSizeDraft, setTitleSizeDraft] = useState(() => String(parseCssPixelValue(appearance.cssVars["--dag-title-font-size"], 15)));
  const titleFontSize = parseCssPixelValue(appearance.cssVars["--dag-title-font-size"], 15);

  useEffect(() => {
    setAiConnectionStatus("idle");
  }, [aiSettings.provider, aiSettings.baseUrl, aiSettings.model, aiSettings.apiKey]);

  useEffect(() => {
    setAppearanceCssDraft(appearance.css);
    setCssVarDrafts(buildCssVarDrafts(appearance));
    setTitleSizeDraft(String(titleFontSize));
  }, [appearance, titleFontSize]);

  const handleAiConnectionTestClick = async () => {
    setAiConnectionStatus("testing");
    const ok = await onAiConnectionTest();
    setAiConnectionStatus(ok ? "success" : "error");
  };

  if (!open) {
    return null;
  }

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="settings-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <section id="settings-modal" className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
        <div className="settings-modal-header">
          <div>
            <p id="settings-modal-title" className="control-label">Settings</p>
          </div>
          <button type="button" className="ghost-btn topbar-icon-btn" title="Close settings" aria-label="Close settings" onClick={onClose}>
            <span className="topbar-icon" aria-hidden="true"><CloseIcon /></span>
          </button>
        </div>

        <div className="settings-modal-body">
          <nav className="settings-tabs" aria-label="Settings sections">
            {SETTINGS_CHAPTERS.map((chapter) => (
              <button
                key={chapter.key}
                type="button"
                className={`settings-tab${activeChapter === chapter.key ? " is-active" : ""}`}
                aria-pressed={activeChapter === chapter.key}
                onClick={() => setActiveChapter(chapter.key)}
              >
                {chapter.label}
              </button>
            ))}
          </nav>

          <div className="settings-page">
            {activeChapter === "appearance" ? (
              <AppearanceSettings
                layoutMode={layoutMode}
                appearance={appearance}
                status={status}
                consoleSidebarOpen={consoleSidebarOpen}
                hideNodeBorders={hideNodeBorders}
                alignNodeWidthsToMax={alignNodeWidthsToMax}
                appearanceCssDraft={appearanceCssDraft}
                cssVarDrafts={cssVarDrafts}
                titleSizeDraft={titleSizeDraft}
                titleFontSize={titleFontSize}
                onAppearanceCssDraftChange={setAppearanceCssDraft}
                onCssVarDraftsChange={setCssVarDrafts}
                onTitleSizeDraftChange={setTitleSizeDraft}
                onLayoutModeChange={onLayoutModeChange}
                onLayoutAppearanceChange={onLayoutAppearanceChange}
                onAppearanceCssVarChange={onAppearanceCssVarChange}
                onAppearanceCssChange={onAppearanceCssChange}
                onAppearanceDisplayChange={onAppearanceDisplayChange}
                onAppearanceReset={onAppearanceReset}
                onAppearanceImportClick={onAppearanceImportClick}
                onAppearanceImportChange={onAppearanceImportChange}
                onConsoleSidebarToggle={onConsoleSidebarToggle}
                onNodeBordersToggle={onNodeBordersToggle}
                onNodeWidthAlignToggle={onNodeWidthAlignToggle}
              />
            ) : null}

            {activeChapter === "ai" ? (
              <AiSettingsPanel
                aiSettings={aiSettings}
                aiBusy={aiBusy}
                providerMenuOpen={providerMenuOpen}
                aiConnectionStatus={aiConnectionStatus}
                onProviderMenuOpenChange={setProviderMenuOpen}
                onAiConnectionTestClick={handleAiConnectionTestClick}
                onAiSettingsChange={onAiSettingsChange}
              />
            ) : null}
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function buildCssVarDrafts(appearance: GraphAppearance): Record<string, string> {
  return Object.fromEntries(APPEARANCE_TOKEN_CONTROLS.map((token) => [token.key, appearance.cssVars[token.key] || ""]));
}
