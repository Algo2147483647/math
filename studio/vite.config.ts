import { readFile, readdir, stat } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Connect, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const CONTENT_ROOT = fileURLToPath(new URL("../content/", import.meta.url));
const WORKSPACE_ENDPOINT = "/api/default-workspace";
const WORKSPACE_FILE_ENDPOINT = `${WORKSPACE_ENDPOINT}/file`;

export default defineConfig({
  plugins: [react(), defaultWorkspacePlugin()],
  server: {
    proxy: {
      "/api/open-in-typora": "http://127.0.0.1:8765",
      "/api/default-workspace/sync": "http://127.0.0.1:8765",
    },
  },
  preview: {
    proxy: {
      "/api/open-in-typora": "http://127.0.0.1:8765",
      "/api/default-workspace/sync": "http://127.0.0.1:8765",
    },
  },
});

function defaultWorkspacePlugin(): Plugin {
  const installMiddleware = (middlewares: Connect.Server) => {
    middlewares.use(async (request, response, next) => {
      const requestUrl = new URL(request.url || "/", "http://dag-studio.local");
      if (request.method === "GET" && requestUrl.pathname === WORKSPACE_ENDPOINT) {
        try {
          const [rawJson, entries] = await Promise.all([
            readFile(resolve(CONTENT_ROOT, "math.json"), "utf8"),
            readdir(CONTENT_ROOT, { withFileTypes: true }),
          ]);
          const markdownFileNames = entries
            .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".md")
            .map((entry) => entry.name)
            .sort((left, right) => left.localeCompare(right));
          const payload = JSON.parse(rawJson) as Record<string, unknown>;
          const markdownFileNameSet = new Set(markdownFileNames);
          const markdownContents = Object.fromEntries(await Promise.all(
            Object.keys(payload).map(async (key) => {
              const fileName = `${key.replace(/ /g, "_")}.md`;
              return [key, markdownFileNameSet.has(fileName) ? await readFile(resolve(CONTENT_ROOT, fileName), "utf8") : ""];
            }),
          ));
          sendJson(response, 200, {
            workspaceName: "content",
            workspacePath: "content",
            fileName: "math.json",
            filePath: "content/math.json",
            payload,
            markdownFileNames,
            markdownContents,
          });
        } catch (error) {
          sendJson(response, 500, {
            error: error instanceof Error ? error.message : "Unable to read the default workspace.",
          });
        }
        return;
      }

      if (request.method === "GET" && requestUrl.pathname === WORKSPACE_FILE_ENDPOINT) {
        const requestedPath = requestUrl.searchParams.get("path") || "";
        const targetPath = resolveWorkspaceFilePath(requestedPath);
        if (!targetPath) {
          sendJson(response, 400, { error: "The requested workspace path is invalid." });
          return;
        }
        try {
          const fileStat = await stat(targetPath);
          if (!fileStat.isFile()) {
            sendJson(response, 404, { error: "The requested workspace resource is not a file." });
            return;
          }
          response.statusCode = 200;
          response.setHeader("Content-Type", getContentType(targetPath));
          response.end(await readFile(targetPath));
        } catch {
          sendJson(response, 404, { error: `Workspace resource not found: ${requestedPath}` });
        }
        return;
      }

      next();
    });
  };

  return {
    name: "dag-studio-default-workspace",
    configureServer(server) {
      installMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      installMiddleware(server.middlewares);
    },
  };
}

function resolveWorkspaceFilePath(requestedPath: string): string | null {
  if (!requestedPath || requestedPath.includes("\0")) {
    return null;
  }
  const targetPath = resolve(CONTENT_ROOT, requestedPath.replace(/\\/g, "/"));
  const relativePath = relative(CONTENT_ROOT, targetPath);
  return relativePath.startsWith("..") || isAbsolute(relativePath) ? null : targetPath;
}

function sendJson(response: Parameters<Connect.NextHandleFunction>[1], statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function getContentType(filePath: string): string {
  const contentTypes: Record<string, string> = {
    ".avif": "image/avif",
    ".bmp": "image/bmp",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".json": "application/json; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".webp": "image/webp",
  };
  return contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
}
