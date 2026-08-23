export interface WorkspaceCorrespondenceIssue {
  jsonKeysWithoutMarkdown: string[];
  markdownKeysWithoutJson: string[];
  duplicateMarkdownKeys: string[];
}

export type WorkspaceCorrespondenceResult =
  | { ok: true }
  | ({ ok: false } & WorkspaceCorrespondenceIssue);

export function validateJsonMarkdownCorrespondence(
  payload: unknown,
  markdownFileNames: string[],
): WorkspaceCorrespondenceResult {
  const jsonKeys = getJsonKeys(payload);
  const markdownKeys = markdownFileNames
    .filter((fileName) => /\.md$/i.test(fileName))
    .map((fileName) => fileName.replace(/\.md$/i, ""));
  const markdownStemByJsonKey = new Map(jsonKeys.map((key) => [key, key.replace(/ /g, "_")]));
  const jsonKeySet = new Set(markdownStemByJsonKey.values());
  const markdownKeySet = new Set(markdownKeys);
  const duplicateMarkdownKeys = [...new Set(
    markdownKeys.filter((key, index) => markdownKeys.indexOf(key) !== index),
  )].sort(compareKeys);
  const jsonKeysWithoutMarkdown = jsonKeys
    .filter((key) => !markdownKeySet.has(markdownStemByJsonKey.get(key) as string))
    .sort(compareKeys);
  const markdownKeysWithoutJson = [...markdownKeySet]
    .filter((key) => !jsonKeySet.has(key))
    .sort(compareKeys);

  if (!jsonKeysWithoutMarkdown.length && !markdownKeysWithoutJson.length && !duplicateMarkdownKeys.length) {
    return { ok: true };
  }
  return {
    ok: false,
    jsonKeysWithoutMarkdown,
    markdownKeysWithoutJson,
    duplicateMarkdownKeys,
  };
}

export function formatWorkspaceCorrespondenceError(
  result: Extract<WorkspaceCorrespondenceResult, { ok: false }>,
  filePath = "content/math.json",
): string {
  const details: string[] = [];
  if (result.jsonKeysWithoutMarkdown.length) {
    details.push(`JSON keys without Markdown files: ${result.jsonKeysWithoutMarkdown.join(", ")}`);
  }
  if (result.markdownKeysWithoutJson.length) {
    details.push(`Markdown files without JSON keys: ${result.markdownKeysWithoutJson.map((key) => `${key}.md`).join(", ")}`);
  }
  if (result.duplicateMarkdownKeys.length) {
    details.push(`duplicate Markdown filename stems: ${result.duplicateMarkdownKeys.join(", ")}`);
  }
  return `Workspace validation failed for ${filePath}. ${details.join(". ")}.`;
}

function getJsonKeys(payload: unknown): string[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return [];
  }
  return Object.keys(payload as Record<string, unknown>);
}

function compareKeys(left: string, right: string): number {
  return left.localeCompare(right);
}
