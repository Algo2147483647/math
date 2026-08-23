import type { ChangeEvent, MouseEvent, RefObject } from "react";
import type { GraphAppearance, GraphLayoutAppearance } from "../graph/appearance";
import type { GraphLayoutMode } from "../graph/types";
import type { AiSettings } from "../ai/types";
import SettingsModal from "./settings/SettingsModal";
import { ArrowLeftIcon, ArrowUpIcon, FitIcon, GraphRootsIcon, MinusIcon, PlusIcon, RedoIcon, SlidersIcon, UndoIcon } from "./topbar/TopbarIcons";
import IconButton from "./ui/IconButton";
import ZoomInput from "./ui/ZoomInput";

interface TopbarProps {
  topbarRef: RefObject<HTMLElement>;
  layoutMode: GraphLayoutMode;
  appearance: GraphAppearance;
  hideNodeBorders: boolean;
  alignNodeWidthsToMax: boolean;
  status: string;
  hasGraph: boolean;
  canBack: boolean;
  canUp: boolean;
  canUndo: boolean;
  canRedo: boolean;
  zoomPercent: number;
  canZoomOut: boolean;
  canZoomIn: boolean;
  settingsOpen: boolean;
  consoleSidebarOpen: boolean;
  aiSettings: AiSettings;
  aiBusy: boolean;
  typeOptions: string[];
  selectedType: string;
  onTypeChange: (type: string) => void;
  onBack: () => void;
  onUp: () => void;
  onAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onZoomFit: () => void;
  onZoomPercentCommit: (percent: number) => void;
  onSettingsToggle: () => void;
  onConsoleSidebarToggle: () => void;
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
  onAiSettingsChange: (settings: AiSettings) => void;
  onAiConnectionTest: () => Promise<boolean>;
}

export default function Topbar({
  topbarRef,
  layoutMode,
  appearance,
  hideNodeBorders,
  alignNodeWidthsToMax,
  status,
  hasGraph,
  canBack,
  canUp,
  canUndo,
  canRedo,
  zoomPercent,
  canZoomOut,
  canZoomIn,
  settingsOpen,
  consoleSidebarOpen,
  aiSettings,
  aiBusy,
  typeOptions,
  selectedType,
  onTypeChange,
  onBack,
  onUp,
  onAll,
  onUndo,
  onRedo,
  onZoomOut,
  onZoomIn,
  onZoomFit,
  onZoomPercentCommit,
  onSettingsToggle,
  onConsoleSidebarToggle,
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
  onAiSettingsChange,
  onAiConnectionTest,
}: TopbarProps) {
  return (
    <header ref={topbarRef} className="topbar">
      <div className="topbar-brand">
        <h1>DAG Studio</h1>
      </div>
      <div className="topbar-actions">
        <label className="topbar-group type-filter-control">
          <span>Type</span>
          <select
            aria-label="Filter graph by type"
            value={selectedType}
            disabled={!hasGraph || typeOptions.length === 0}
            onChange={(event) => onTypeChange(event.currentTarget.value)}
          >
            <option value="">All types</option>
            {typeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <div className="topbar-group nav-controls" aria-label="Graph navigation controls">
          <IconButton id="back-btn" label="Back" disabled={!canBack} onClick={onBack} icon={<ArrowLeftIcon />} />
          <IconButton id="up-btn" label="Up" disabled={!canUp} onClick={onUp} icon={<ArrowUpIcon />} />
          <IconButton id="all-btn" label="Show all roots" disabled={!hasGraph} onClick={onAll} icon={<GraphRootsIcon />} />
        </div>
        <div className="topbar-group zoom-controls" aria-label="Graph zoom controls">
          <IconButton id="zoom-out-btn" label="Zoom out" disabled={!canZoomOut} onClick={onZoomOut} icon={<MinusIcon />} />
          <IconButton id="zoom-in-btn" label="Zoom in" disabled={!canZoomIn} onClick={onZoomIn} icon={<PlusIcon />} />
          <ZoomInput value={zoomPercent} disabled={!hasGraph} onCommit={onZoomPercentCommit} />
          <IconButton id="zoom-fit-btn" label="Fit graph to viewport" disabled={!hasGraph} onClick={onZoomFit} icon={<FitIcon />} />
        </div>
        <div className="topbar-group file-controls" aria-label="Graph file controls">
          <IconButton id="undo-btn" label="Undo" disabled={!canUndo} onClick={onUndo} icon={<UndoIcon />} />
          <IconButton id="redo-btn" label="Redo" disabled={!canRedo} onClick={onRedo} icon={<RedoIcon />} />
          <div id="floating-controls" className="control-dock">
            <IconButton
              id="settings-btn"
              label="Open controls"
              icon={<SlidersIcon />}
              ariaExpanded={settingsOpen}
              ariaControls="settings-modal"
              onClick={onSettingsToggle}
              className="settings-toggle-btn topbar-icon-btn"
            />
            <SettingsModal
              open={settingsOpen}
              layoutMode={layoutMode}
              appearance={appearance}
              hideNodeBorders={hideNodeBorders}
              alignNodeWidthsToMax={alignNodeWidthsToMax}
              status={status}
              consoleSidebarOpen={consoleSidebarOpen}
              aiSettings={aiSettings}
              aiBusy={aiBusy}
              onClose={onSettingsToggle}
              onLayoutModeChange={onLayoutModeChange}
              onLayoutAppearanceChange={onLayoutAppearanceChange}
              onAppearanceCssVarChange={onAppearanceCssVarChange}
              onAppearanceCssChange={onAppearanceCssChange}
              onAppearanceDisplayChange={onAppearanceDisplayChange}
              onAppearanceReset={onAppearanceReset}
              onAppearanceImportClick={onAppearanceImportClick}
              onAppearanceImportChange={onAppearanceImportChange}
              onNodeBordersToggle={onNodeBordersToggle}
              onNodeWidthAlignToggle={onNodeWidthAlignToggle}
              onConsoleSidebarToggle={onConsoleSidebarToggle}
              onAiSettingsChange={onAiSettingsChange}
              onAiConnectionTest={onAiConnectionTest}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
