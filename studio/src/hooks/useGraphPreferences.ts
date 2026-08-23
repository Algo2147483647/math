import { useEffect } from "react";
import type { AiSettings } from "../ai/types";
import type { GraphAppearance } from "../graph/appearance";
import type { GraphAppState } from "../state/initialState";
import { saveGraphPagePreferences } from "../state/preferences";

export function useGraphPreferences({
  state,
  appearance,
  hideNodeBorders,
  alignNodeWidthsToMax,
  aiSettings,
}: {
  state: GraphAppState;
  appearance: GraphAppearance;
  hideNodeBorders: boolean;
  alignNodeWidthsToMax: boolean;
  aiSettings: AiSettings;
}) {
  useEffect(() => {
    saveGraphPagePreferences({
      layoutMode: state.layout.mode,
      appearance,
      hideNodeBorders,
      alignNodeWidthsToMax,
      consoleSidebarOpen: state.ui.consoleSidebarOpen,
      consoleSidebarWidth: state.ui.consoleSidebarWidth,
      aiSettings,
    });
  }, [aiSettings, alignNodeWidthsToMax, appearance, hideNodeBorders, state.layout.mode, state.ui.consoleSidebarOpen, state.ui.consoleSidebarWidth]);
}
