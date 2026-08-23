import type { ChangeEvent, Dispatch, KeyboardEvent, SetStateAction } from "react";
import type { GraphAppearance, GraphLayoutAppearance } from "../../graph/appearance";
import type { GraphLayoutMode, GraphTitleFontFamily } from "../../graph/types";
import { GRAPH_TITLE_FONT_OPTIONS } from "../../graph/types";
import LayoutSliderControl from "./LayoutSliderControl";
import { APPEARANCE_TOKEN_CONTROLS, LAYOUT_CONTROLS } from "./settingsConfig";
import { clampNumberInput, parseCssPixelValue } from "./settingsUtils";

interface AppearanceSettingsProps {
  layoutMode: GraphLayoutMode;
  appearance: GraphAppearance;
  status: string;
  consoleSidebarOpen: boolean;
  hideNodeBorders: boolean;
  alignNodeWidthsToMax: boolean;
  appearanceCssDraft: string;
  cssVarDrafts: Record<string, string>;
  titleSizeDraft: string;
  titleFontSize: number;
  onAppearanceCssDraftChange: (value: string) => void;
  onCssVarDraftsChange: Dispatch<SetStateAction<Record<string, string>>>;
  onTitleSizeDraftChange: (value: string) => void;
  onLayoutModeChange: (mode: GraphLayoutMode) => void;
  onLayoutAppearanceChange: <K extends keyof GraphLayoutAppearance>(key: K, value: GraphLayoutAppearance[K]) => void;
  onAppearanceCssVarChange: (key: string, value: string) => void;
  onAppearanceCssChange: (css: string) => void;
  onAppearanceDisplayChange: <K extends keyof GraphAppearance["display"]>(key: K, value: GraphAppearance["display"][K]) => void;
  onAppearanceReset: () => void;
  onAppearanceImportClick: (event: React.MouseEvent<HTMLInputElement>) => void;
  onAppearanceImportChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onConsoleSidebarToggle: () => void;
  onNodeBordersToggle: () => void;
  onNodeWidthAlignToggle: () => void;
}

export default function AppearanceSettings({
  layoutMode,
  appearance,
  status,
  consoleSidebarOpen,
  hideNodeBorders,
  alignNodeWidthsToMax,
  appearanceCssDraft,
  cssVarDrafts,
  titleSizeDraft,
  titleFontSize,
  onAppearanceCssDraftChange,
  onCssVarDraftsChange,
  onTitleSizeDraftChange,
  onLayoutModeChange,
  onLayoutAppearanceChange,
  onAppearanceCssVarChange,
  onAppearanceCssChange,
  onAppearanceDisplayChange,
  onAppearanceReset,
  onAppearanceImportClick,
  onAppearanceImportChange,
  onConsoleSidebarToggle,
  onNodeBordersToggle,
  onNodeWidthAlignToggle,
}: AppearanceSettingsProps) {
  const titleFontFamily = appearance.cssVars["--dag-title-font-family"] || GRAPH_TITLE_FONT_OPTIONS[0].value;
  const titleFontStyle = appearance.cssVars["--dag-title-font-style"] === "normal" ? "normal" : "italic";
  const titleFontWeight = appearance.cssVars["--dag-title-font-weight"] === "700" ? 700 : 400;

  const commitAppearanceCssDraft = () => {
    if (appearanceCssDraft !== appearance.css) {
      onAppearanceCssChange(appearanceCssDraft);
    }
  };

  const commitCssVarDraft = (key: string, value: string) => {
    if ((appearance.cssVars[key] || "") !== value) {
      onAppearanceCssVarChange(key, value);
    }
  };

  const commitTitleSizeDraft = () => {
    const value = `${clampNumberInput(titleSizeDraft, 10, 28, titleFontSize)}px`;
    if (appearance.cssVars["--dag-title-font-size"] !== value) {
      onAppearanceCssVarChange("--dag-title-font-size", value);
    }
    onTitleSizeDraftChange(String(parseCssPixelValue(value, titleFontSize)));
  };

  return (
    <>
      <section className="settings-section appearance-actions-section" aria-labelledby="appearance-actions-title">
        <p id="appearance-actions-title" className="control-label">UI Configuration</p>
        <div className="workspace-action-row">
          <label htmlFor="appearanceInput" className="ghost-btn settings-action-btn appearance-import-label">
            Import
            <input type="file" id="appearanceInput" accept=".json,application/json" onClick={onAppearanceImportClick} onChange={onAppearanceImportChange} />
          </label>
          <button type="button" className="ghost-btn settings-action-btn" onClick={onAppearanceReset}>Reset</button>
        </div>
      </section>

      <section className="settings-section" aria-labelledby="layout-mode-title">
        <label className="layout-select-label" htmlFor="layout-mode-select">
          <span id="layout-mode-title" className="control-label">Layout</span>
          <select
            id="layout-mode-select"
            className="layout-select"
            value={layoutMode}
            onChange={(event) => onLayoutModeChange(event.currentTarget.value as GraphLayoutMode)}
          >
            <option value="sugiyama">Sugiyama layered</option>
            <option value="level">Level layout</option>
            <option value="dagre">Dagre layered</option>
          </select>
        </label>
      </section>

      <section className="settings-section settings-section-emphasis" aria-labelledby="layout-tuning-title">
        <div className="settings-section-header">
          <p id="layout-tuning-title" className="control-label">Layout Tuning</p>
        </div>
        <div className="settings-slider-grid">
          {LAYOUT_CONTROLS.map((control) => (
            <LayoutSliderControl
              key={control.key}
              control={control}
              value={appearance.layout[control.key]}
              onChange={(value) => onLayoutAppearanceChange(control.key, value)}
            />
          ))}
        </div>
      </section>

      <section className="settings-section" aria-labelledby="appearance-tokens-title">
        <p id="appearance-tokens-title" className="control-label">Tokens</p>
        <div className="ai-settings-grid">
          {APPEARANCE_TOKEN_CONTROLS.map((token) => (
            <label key={token.key} className="settings-field-label" htmlFor={`appearance-token-${token.key}`}>
              <span>{token.label}</span>
              <input
                id={`appearance-token-${token.key}`}
                className="settings-text-input"
                type="text"
                value={cssVarDrafts[token.key] ?? appearance.cssVars[token.key] ?? ""}
                onChange={(event) => onCssVarDraftsChange((current) => ({ ...current, [token.key]: event.currentTarget.value }))}
                onBlur={(event) => commitCssVarDraft(token.key, event.currentTarget.value)}
                onKeyDown={(event) => handleCssVarKeyDown(event, token.key, commitCssVarDraft)}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="settings-section" aria-labelledby="appearance-css-title">
        <p id="appearance-css-title" className="control-label">Custom CSS</p>
        <textarea
          className="settings-text-input appearance-css-editor"
          value={appearanceCssDraft}
          spellCheck={false}
          rows={10}
          onChange={(event) => onAppearanceCssDraftChange(event.currentTarget.value)}
          onBlur={commitAppearanceCssDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              commitAppearanceCssDraft();
              event.currentTarget.blur();
            }
          }}
        />
      </section>

      <section className="settings-section title-style-section" aria-labelledby="title-style-title">
        <p id="title-style-title" className="control-label">Title</p>
        <div className="title-style-row">
          <select
            className="title-font-select"
            value={titleFontFamily}
            aria-label="Title font"
            onChange={(event) => onAppearanceCssVarChange("--dag-title-font-family", event.currentTarget.value as GraphTitleFontFamily)}
          >
            {GRAPH_TITLE_FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
          <label className="title-size-control" htmlFor="title-font-size-input">
            <input
              id="title-font-size-input"
              className="title-size-input"
              type="number"
              min={10}
              max={28}
              step={1}
              value={titleSizeDraft}
              aria-label="Title font size"
              onChange={(event) => onTitleSizeDraftChange(event.currentTarget.value)}
              onBlur={commitTitleSizeDraft}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  commitTitleSizeDraft();
                  event.currentTarget.blur();
                }
              }}
            />
            <span className="title-size-unit">px</span>
          </label>
          <div className="title-format-buttons" role="group" aria-label="Title format">
            <button
              type="button"
              className={`title-format-btn${titleFontWeight === 700 ? " is-active" : ""}`}
              title="Bold"
              aria-label="Bold title"
              aria-pressed={titleFontWeight === 700}
              onClick={() => onAppearanceCssVarChange("--dag-title-font-weight", titleFontWeight === 700 ? "400" : "700")}
            >
              B
            </button>
            <button
              type="button"
              className={`title-format-btn title-format-btn-italic${titleFontStyle === "italic" ? " is-active" : ""}`}
              title="Italic"
              aria-label="Italic title"
              aria-pressed={titleFontStyle === "italic"}
              onClick={() => onAppearanceCssVarChange("--dag-title-font-style", titleFontStyle === "italic" ? "normal" : "italic")}
            >
              I
            </button>
          </div>
        </div>
      </section>

      <section className="settings-section" aria-labelledby="view-options-title">
        <p id="view-options-title" className="control-label">View</p>
        <div className="workspace-action-row">
          <button type="button" className={`ghost-btn settings-action-btn${hideNodeBorders ? " settings-action-btn-active" : ""}`} aria-pressed={hideNodeBorders} onClick={onNodeBordersToggle}>
            {hideNodeBorders ? "Show Borders" : "Hide Borders"}
          </button>
          <button type="button" className={`ghost-btn settings-action-btn${alignNodeWidthsToMax ? " settings-action-btn-active" : ""}`} aria-pressed={alignNodeWidthsToMax} onClick={onNodeWidthAlignToggle}>
            {alignNodeWidthsToMax ? "Auto Width" : "Max Width"}
          </button>
          <button
            type="button"
            className={`ghost-btn settings-action-btn${appearance.display.showEdgeLabels ? " settings-action-btn-active" : ""}`}
            aria-pressed={appearance.display.showEdgeLabels}
            onClick={() => onAppearanceDisplayChange("showEdgeLabels", !appearance.display.showEdgeLabels)}
          >
            {appearance.display.showEdgeLabels ? "Hide Edge Labels" : "Show Edge Labels"}
          </button>
        </div>
      </section>

      <section className="settings-section" aria-labelledby="appearance-workspace-title">
        <p id="appearance-workspace-title" className="control-label">Workspace</p>
        <div className="workspace-action-row">
          <button
            id="console-sidebar-toggle-btn"
            className={`ghost-btn settings-action-btn${consoleSidebarOpen ? " settings-action-btn-active" : ""}`}
            type="button"
            aria-pressed={consoleSidebarOpen}
            onClick={onConsoleSidebarToggle}
          >
            {consoleSidebarOpen ? "Hide Console" : "Show Console"}
          </button>
        </div>
      </section>

      <p id="graph-summary" className="graph-summary">{status}</p>
    </>
  );
}

function handleCssVarKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  key: string,
  commitCssVarDraft: (key: string, value: string) => void,
) {
  if (event.key === "Enter") {
    commitCssVarDraft(key, event.currentTarget.value);
    event.currentTarget.blur();
  }
}
