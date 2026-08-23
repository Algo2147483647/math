import { DEFAULT_WORKSPACE_FILE_ENDPOINT } from "./defaultWorkspace";

export type MarkdownImageSourceResult =
  | { ok: true; url: string; objectUrl: boolean }
  | { ok: false };

export async function resolveMarkdownImageSource(source: string): Promise<MarkdownImageSourceResult> {
  const value = String(source || "").trim();
  if (!value) {
    return { ok: false };
  }
  if (!isWorkspaceRelativePath(value)) {
    return { ok: true, url: value, objectUrl: false };
  }

  const path = normalizeWorkspacePath(value);
  if (!path) {
    return { ok: false };
  }

  try {
    const response = await fetch(`${DEFAULT_WORKSPACE_FILE_ENDPOINT}?path=${encodeURIComponent(path)}`);
    if (!response.ok) {
      return { ok: false };
    }
    const url = URL.createObjectURL(await response.blob());
    return { ok: true, url, objectUrl: true };
  } catch {
    return { ok: false };
  }
}

function isWorkspaceRelativePath(value: string): boolean {
  return !value.startsWith("#")
    && !value.startsWith("/")
    && !/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(value)
    && !/^(?:data|blob):/i.test(value)
    && !/^[a-z][a-z0-9+.-]*:/i.test(value);
}

function normalizeWorkspacePath(value: string): string | null {
  const suffixIndex = Math.min(...[value.indexOf("?"), value.indexOf("#")].filter((index) => index >= 0), value.length);
  const segments: string[] = [];
  for (const rawSegment of value.slice(0, suffixIndex).replace(/\\/g, "/").split("/")) {
    if (!rawSegment || rawSegment === ".") {
      continue;
    }
    if (rawSegment === "..") {
      if (!segments.length) {
        return null;
      }
      segments.pop();
      continue;
    }
    try {
      segments.push(decodeURIComponent(rawSegment));
    } catch {
      segments.push(rawSegment);
    }
  }
  return segments.length ? segments.join("/") : null;
}
