import type { FieldMapping } from "../graph/fieldMapping";
import { useEffect } from "react";
import { inferFieldMapping } from "../graph/fieldMapping";
import { normalizeDagInput } from "../graph/normalize";
import { getInitialSelection } from "../graph/selectors";
import { loadDefaultWorkspace } from "../adapters/defaultWorkspace";
import type { GraphAction } from "../state/graphActions";
import { formatWorkspaceCorrespondenceError, validateJsonMarkdownCorrespondence } from "../workspace/validation";

export function useDefaultGraph(
  dispatch: React.Dispatch<GraphAction>,
  setFieldMapping: (mapping: FieldMapping) => void,
  setMarkdownContents: (contents: Record<string, string>) => void,
): void {
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const workspace = await loadDefaultWorkspace();
        if (cancelled) {
          return;
        }
        const inferredMapping = inferFieldMapping(workspace.payload);
        const dag = normalizeDagInput(workspace.payload);
        const selection = getInitialSelection(dag, inferredMapping);
        const correspondence = validateJsonMarkdownCorrespondence(workspace.payload, workspace.markdownFileNames);
        const status = correspondence.ok
          ? `${Object.keys(dag).length} nodes loaded from ${workspace.filePath}. JSON/Markdown key validation passed.`
          : formatWorkspaceCorrespondenceError(correspondence, workspace.filePath);
        setFieldMapping(inferredMapping);
        setMarkdownContents(workspace.markdownContents);
        dispatch({
          type: "graphLoaded",
          dag,
          fileName: workspace.fileName,
          selection,
          status,
        });
        if (!correspondence.ok) {
          console.error(status);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }
        console.error(error);
        const detail = error instanceof Error ? error.message : "Unknown workspace error.";
        dispatch({ type: "graphLoadFailed", status: `Unable to open content/math.json automatically. ${detail}` });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch, setFieldMapping, setMarkdownContents]);
}
