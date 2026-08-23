export const DEFAULT_WORKSPACE_ENDPOINT = "/api/default-workspace";
export const DEFAULT_WORKSPACE_FILE_ENDPOINT = `${DEFAULT_WORKSPACE_ENDPOINT}/file`;
export const DEFAULT_WORKSPACE_SYNC_ENDPOINT = `${DEFAULT_WORKSPACE_ENDPOINT}/sync`;

export interface DefaultWorkspaceDocument {
  workspaceName: string;
  workspacePath: string;
  fileName: string;
  filePath: string;
  payload: unknown;
  markdownFileNames: string[];
  markdownContents: Record<string, string>;
}

export async function loadDefaultWorkspace(): Promise<DefaultWorkspaceDocument> {
  const response = await fetch(DEFAULT_WORKSPACE_ENDPOINT, {
    headers: { Accept: "application/json" },
  });
  const body = await response.json().catch(() => null) as Partial<DefaultWorkspaceDocument> & { error?: unknown } | null;
  if (!response.ok) {
    throw new Error(typeof body?.error === "string" ? body.error : "Unable to open the default content workspace.");
  }
  if (
    !body
    || typeof body.workspaceName !== "string"
    || typeof body.workspacePath !== "string"
    || typeof body.fileName !== "string"
    || typeof body.filePath !== "string"
    || !Array.isArray(body.markdownFileNames)
    || !isStringRecord(body.markdownContents)
  ) {
    throw new Error("The default workspace response is invalid.");
  }
  return body as DefaultWorkspaceDocument;
}

export async function openMarkdownInTypora(nodeKey: string): Promise<string> {
  const response = await fetch("/api/open-in-typora", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nodeKey }),
  });
  const body = await response.json().catch(() => null) as { error?: unknown; filePath?: unknown } | null;
  if (!response.ok) {
    throw new Error(typeof body?.error === "string" ? body.error : `Unable to open ${nodeKey}.md in Typora.`);
  }
  return typeof body?.filePath === "string" ? body.filePath : `${nodeKey}.md`;
}

export interface WorkspaceRename {
  from: string;
  to: string;
}

export interface WorkspaceSyncResult {
  nodeCount: number;
  createdMarkdown: Record<string, string>;
  deletedMarkdown: string[];
  renamedMarkdown: WorkspaceRename[];
  repair: {
    addedMarkdownNodes: number;
    addedReferenceNodes: number;
    mirroredEdges: number;
  };
}

export async function syncDefaultWorkspace(
  payload: Record<string, unknown>,
  renamedKeys: WorkspaceRename[] = [],
): Promise<WorkspaceSyncResult> {
  const response = await fetch(DEFAULT_WORKSPACE_SYNC_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload, renamedKeys }),
  });
  const body = await response.json().catch(() => null) as Partial<WorkspaceSyncResult> & { error?: unknown } | null;
  if (!response.ok) {
    throw new Error(typeof body?.error === "string" ? body.error : "Unable to sync content/math.json.");
  }
  if (
    !body
    || typeof body.nodeCount !== "number"
    || !isStringRecord(body.createdMarkdown)
    || !Array.isArray(body.deletedMarkdown)
    || !Array.isArray(body.renamedMarkdown)
  ) {
    throw new Error("The workspace sync response is invalid.");
  }
  return body as WorkspaceSyncResult;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return Boolean(
    value
      && typeof value === "object"
      && !Array.isArray(value)
      && Object.values(value as Record<string, unknown>).every((item) => typeof item === "string"),
  );
}
