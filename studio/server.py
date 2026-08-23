#!/usr/bin/env python3
"""Run DAG Studio and expose narrowly scoped local desktop integrations."""

from __future__ import annotations

import argparse
import copy
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import threading
import tempfile
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse
import webbrowser


PROJECT_ROOT = Path(__file__).resolve().parent.parent
STUDIO_ROOT = PROJECT_ROOT / "studio"
CONTENT_ROOT = PROJECT_ROOT / "content"
API_HOST = "127.0.0.1"
API_PORT = 8765
VITE_HOST = "127.0.0.1"
VITE_PORT = 5173
WORKSPACE_JSON = CONTENT_ROOT / "math.json"
MAX_REQUEST_BYTES = 10 * 1024 * 1024
WORKSPACE_LOCK = threading.Lock()
DELETED_MARKDOWN_CACHE: dict[tuple[str, str], str] = {}


class StudioApiHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802
        if urlparse(self.path).path == "/health":
            self._send_json(200, {"ok": True})
            return
        self._send_json(404, {"error": "Endpoint not found."})

    def do_POST(self) -> None:  # noqa: N802
        endpoint = urlparse(self.path).path
        if endpoint == "/api/default-workspace/sync":
            try:
                payload = self._read_json(MAX_REQUEST_BYTES)
                if not isinstance(payload, dict):
                    raise ValueError("The workspace sync request must be an object.")
                graph_payload = payload.get("payload")
                renamed_keys = payload.get("renamedKeys", [])
                result = sync_workspace(graph_payload, renamed_keys)
                self._send_json(200, {"ok": True, **result})
            except (ValueError, json.JSONDecodeError) as error:
                self._send_json(400, {"error": str(error)})
            except Exception as error:
                self._send_json(500, {"error": str(error)})
            return

        if endpoint != "/api/open-in-typora":
            self._send_json(404, {"error": "Endpoint not found."})
            return
        try:
            payload = self._read_json()
            node_key = payload.get("nodeKey") if isinstance(payload, dict) else None
            markdown_path = resolve_node_markdown(node_key)
            command = build_typora_command(markdown_path)
            subprocess.Popen(command, close_fds=True)
            self._send_json(200, {
                "ok": True,
                "filePath": str(markdown_path.relative_to(PROJECT_ROOT)).replace(os.sep, "/"),
            })
        except FileNotFoundError as error:
            self._send_json(404, {"error": str(error)})
        except (ValueError, json.JSONDecodeError) as error:
            self._send_json(400, {"error": str(error)})
        except Exception as error:  # Keep a useful error at the UI boundary.
            self._send_json(500, {"error": str(error)})

    def log_message(self, message: str, *args: object) -> None:
        print(f"[studio-api] {message % args}")

    def _read_json(self, max_bytes: int = 4096) -> object:
        content_length = int(self.headers.get("Content-Length", "0"))
        if content_length <= 0 or content_length > max_bytes:
            raise ValueError("The request body is empty or too large.")
        return json.loads(self.rfile.read(content_length).decode("utf-8"))

    def _send_json(self, status: int, payload: object) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def resolve_node_markdown(node_key: object) -> Path:
    normalized_key = validate_node_key(node_key)
    markdown_path = get_markdown_path(CONTENT_ROOT, normalized_key)
    if not markdown_path.is_file():
        raise FileNotFoundError(f"Markdown file not found: content/{normalized_key}.md")
    return markdown_path


def validate_node_key(node_key: object) -> str:
    if not isinstance(node_key, str) or not node_key.strip():
        raise ValueError("Node keys must be non-empty strings.")
    normalized_key = node_key.strip()
    if normalized_key != node_key or normalized_key != Path(normalized_key).name:
        raise ValueError(f'Node key "{node_key}" must be a Markdown filename stem, not a path.')
    if any(character in normalized_key for character in '<>:"/\\|?*') or normalized_key in {".", ".."}:
        raise ValueError(f'Node key "{node_key}" is not a valid Markdown filename stem.')
    return normalized_key


def node_key_to_markdown_stem(node_key: str) -> str:
    return validate_node_key(node_key).replace(" ", "_")


def markdown_stem_to_node_key(markdown_stem: str) -> str:
    return validate_node_key(markdown_stem).replace("_", " ")


def validate_markdown_stem_collisions(node_keys: set[str]) -> None:
    owners: dict[str, str] = {}
    for key in sorted(node_keys):
        stem = node_key_to_markdown_stem(key)
        previous = owners.get(stem)
        if previous is not None and previous != key:
            raise ValueError(
                f'Node keys "{previous}" and "{key}" both map to Markdown file "{stem}.md".'
            )
        owners[stem] = key


def get_markdown_path(content_root: Path, node_key: str) -> Path:
    markdown_path = (content_root / f"{node_key_to_markdown_stem(node_key)}.md").resolve()
    try:
        markdown_path.relative_to(content_root.resolve())
    except ValueError as error:
        raise ValueError("The requested Markdown file is outside the content workspace.") from error
    return markdown_path


def load_graph_json(json_path: Path) -> dict[str, object]:
    payload = json.loads(json_path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"{json_path.name} must contain a top-level JSON object.")
    return payload


def reconcile_graph_payload(
    payload: object,
    markdown_stems: set[str] | None = None,
) -> tuple[dict[str, dict[str, object]], dict[str, int]]:
    if not isinstance(payload, dict):
        raise ValueError("The graph payload must be a top-level JSON object.")

    graph: dict[str, dict[str, object]] = {}
    for raw_key, raw_node in payload.items():
        key = validate_node_key(raw_key)
        graph[key] = copy.deepcopy(raw_node) if isinstance(raw_node, dict) else {}
    validate_markdown_stem_collisions(set(graph))

    added_markdown_nodes = 0
    mapped_stems = {node_key_to_markdown_stem(key) for key in graph}
    for stem in sorted(markdown_stems or set()):
        validate_node_key(stem)
        if stem not in mapped_stems:
            key = markdown_stem_to_node_key(stem)
            graph[key] = {"type": "", "parents": {}, "children": {}}
            mapped_stems.add(stem)
            added_markdown_nodes += 1

    added_reference_nodes = 0
    while True:
        missing_references: set[str] = set()
        for node in graph.values():
            node.setdefault("type", "")
            node["parents"] = normalize_relation_map(node.get("parents"))
            node["children"] = normalize_relation_map(node.get("children"))
            missing_references.update(node["parents"].keys())
            missing_references.update(node["children"].keys())
        missing_references.difference_update(graph)
        if not missing_references:
            break
        for key in sorted(missing_references):
            validate_node_key(key)
            graph[key] = {"type": "", "parents": {}, "children": {}}
            added_reference_nodes += 1
        validate_markdown_stem_collisions(set(graph))

    mirrored_edges = 0
    for parent_key, parent_node in list(graph.items()):
        children = parent_node["children"]
        for child_key, relation in list(children.items()):
            child_parents = graph[child_key]["parents"]
            if parent_key not in child_parents:
                child_parents[parent_key] = copy.deepcopy(relation)
                mirrored_edges += 1

    for child_key, child_node in list(graph.items()):
        parents = child_node["parents"]
        for parent_key, relation in list(parents.items()):
            parent_children = graph[parent_key]["children"]
            if child_key not in parent_children:
                parent_children[child_key] = copy.deepcopy(relation)
                mirrored_edges += 1

    return graph, {
        "addedMarkdownNodes": added_markdown_nodes,
        "addedReferenceNodes": added_reference_nodes,
        "mirroredEdges": mirrored_edges,
    }


def normalize_relation_map(value: object) -> dict[str, object]:
    if not isinstance(value, dict):
        return {}
    output: dict[str, object] = {}
    for raw_key, relation in value.items():
        key = validate_node_key(raw_key)
        output[key] = copy.deepcopy(relation)
    return output


def write_graph_json_atomic(json_path: Path, graph: dict[str, dict[str, object]]) -> None:
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        newline="\n",
        dir=json_path.parent,
        prefix=f".{json_path.name}.",
        suffix=".tmp",
        delete=False,
    ) as temporary_file:
        json.dump(graph, temporary_file, ensure_ascii=False, indent=2)
        temporary_file.write("\n")
        temporary_file.flush()
        os.fsync(temporary_file.fileno())
        temporary_path = Path(temporary_file.name)
    os.replace(temporary_path, json_path)


def create_markdown_file(content_root: Path, node_key: str, content: str | None = None) -> str:
    markdown_path = get_markdown_path(content_root, node_key)
    markdown_content = content if content is not None else f"# {node_key}\n"
    try:
        with markdown_path.open("x", encoding="utf-8", newline="\n") as output:
            output.write(markdown_content)
    except FileExistsError:
        return markdown_path.read_text(encoding="utf-8")
    return markdown_content


def get_markdown_stems(content_root: Path) -> set[str]:
    return {path.stem for path in content_root.iterdir() if path.is_file() and path.suffix.lower() == ".md"}


def repair_workspace(
    content_root: Path = CONTENT_ROOT,
    json_path: Path = WORKSPACE_JSON,
) -> dict[str, object]:
    with WORKSPACE_LOCK:
        original = load_graph_json(json_path)
        graph, report = reconcile_graph_payload(original, get_markdown_stems(content_root))
        created_markdown: dict[str, str] = {}
        for key in graph:
            markdown_path = get_markdown_path(content_root, key)
            if not markdown_path.is_file():
                created_markdown[key] = create_markdown_file(content_root, key)
        if graph != original:
            write_graph_json_atomic(json_path, graph)
        return {
            **report,
            "createdMarkdown": created_markdown,
            "changed": graph != original or bool(created_markdown),
        }


def normalize_renamed_keys(value: object) -> list[tuple[str, str]]:
    if not isinstance(value, list):
        raise ValueError("renamedKeys must be an array.")
    output: list[tuple[str, str]] = []
    for item in value:
        if not isinstance(item, dict):
            raise ValueError("Each renamedKeys entry must be an object.")
        output.append((validate_node_key(item.get("from")), validate_node_key(item.get("to"))))
    return output


def sync_workspace(
    payload: object,
    renamed_keys: object = None,
    content_root: Path = CONTENT_ROOT,
    json_path: Path = WORKSPACE_JSON,
) -> dict[str, object]:
    with WORKSPACE_LOCK:
        current_graph = load_graph_json(json_path)
        requested_keys = set(payload) if isinstance(payload, dict) else set()
        current_keys = set(current_graph)
        known_stems = {node_key_to_markdown_stem(key) for key in current_keys | requested_keys}
        external_markdown = get_markdown_stems(content_root) - known_stems
        graph, repair_report = reconcile_graph_payload(payload, external_markdown)
        desired_keys = set(graph)
        desired_stems = {node_key_to_markdown_stem(key) for key in desired_keys}
        rename_pairs = normalize_renamed_keys(renamed_keys or [])

        renamed_markdown: list[dict[str, str]] = []
        for old_key, new_key in rename_pairs:
            if old_key not in current_keys or old_key in desired_keys or new_key not in desired_keys:
                continue
            old_path = get_markdown_path(content_root, old_key)
            new_path = get_markdown_path(content_root, new_key)
            if old_path.is_file():
                if old_path != new_path and not new_path.exists():
                    os.replace(old_path, new_path)
                if old_path == new_path or new_path.is_file():
                    renamed_markdown.append({"from": old_key, "to": new_key})

        created_markdown: dict[str, str] = {}
        for key in sorted(desired_keys):
            markdown_path = get_markdown_path(content_root, key)
            if not markdown_path.is_file():
                cache_key = (str(content_root.resolve()), key)
                created_markdown[key] = create_markdown_file(content_root, key, DELETED_MARKDOWN_CACHE.pop(cache_key, None))

        deleted_markdown: list[str] = []
        for stem in sorted(get_markdown_stems(content_root) - desired_stems):
            markdown_path = (content_root / f"{stem}.md").resolve()
            deleted_key = next(
                (key for key in current_keys if node_key_to_markdown_stem(key) == stem),
                markdown_stem_to_node_key(stem),
            )
            cache_key = (str(content_root.resolve()), deleted_key)
            DELETED_MARKDOWN_CACHE[cache_key] = markdown_path.read_text(encoding="utf-8")
            markdown_path.unlink()
            deleted_markdown.append(stem)

        write_graph_json_atomic(json_path, graph)
        return {
            "nodeCount": len(graph),
            "createdMarkdown": created_markdown,
            "deletedMarkdown": deleted_markdown,
            "renamedMarkdown": renamed_markdown,
            "repair": repair_report,
        }


def build_typora_command(markdown_path: Path) -> list[str]:
    if sys.platform == "win32":
        executable = find_typora_on_windows()
        if not executable:
            raise FileNotFoundError("Typora was not found. Install Typora or register Typora.exe in Windows App Paths.")
        return [str(executable), str(markdown_path)]
    if sys.platform == "darwin":
        availability = subprocess.run(["open", "-Ra", "Typora"], capture_output=True, check=False)
        if availability.returncode != 0:
            raise FileNotFoundError("Typora was not found in macOS Applications.")
        return ["open", "-a", "Typora", str(markdown_path)]
    executable = shutil.which("typora")
    if not executable:
        raise FileNotFoundError("Typora was not found on PATH.")
    return [executable, str(markdown_path)]


def find_typora_on_windows() -> Path | None:
    candidates: list[Path] = []
    command = shutil.which("Typora.exe") or shutil.which("Typora")
    if command:
        candidates.append(Path(command))
    try:
        import winreg

        for hive in (winreg.HKEY_CURRENT_USER, winreg.HKEY_LOCAL_MACHINE):
            try:
                with winreg.OpenKey(hive, r"Software\Microsoft\Windows\CurrentVersion\App Paths\Typora.exe") as key:
                    candidates.append(Path(winreg.QueryValue(key, None)))
            except OSError:
                pass
    except ImportError:
        pass
    for environment_name, suffix in (
        ("LOCALAPPDATA", ("Programs", "Typora", "Typora.exe")),
        ("ProgramFiles", ("Typora", "Typora.exe")),
        ("ProgramFiles(x86)", ("Typora", "Typora.exe")),
    ):
        base = os.environ.get(environment_name)
        if base:
            candidates.append(Path(base).joinpath(*suffix))
    return next((candidate for candidate in candidates if candidate.is_file()), None)


def wait_for_port(host: str, port: int, timeout_seconds: float = 30.0) -> None:
    deadline = time.monotonic() + timeout_seconds
    while time.monotonic() < deadline:
        try:
            with socket.create_connection((host, port), timeout=0.4):
                return
        except OSError:
            time.sleep(0.2)
    raise TimeoutError(f"Timed out waiting for http://{host}:{port}/")


def ensure_frontend_dependencies() -> None:
    vite_script = STUDIO_ROOT / "node_modules" / "vite" / "bin" / "vite.js"
    if vite_script.is_file():
        return
    npm = shutil.which("npm")
    if not npm:
        raise FileNotFoundError("npm was not found. Install Node.js before starting DAG Studio.")
    print("Installing Studio dependencies...")
    subprocess.run([npm, "install"], cwd=STUDIO_ROOT, check=True)


def run(*, open_browser: bool = True) -> int:
    ensure_frontend_dependencies()
    repair_report = repair_workspace()
    if repair_report["changed"]:
        print(f"Repaired content workspace: {json.dumps(repair_report, ensure_ascii=False)}")
    node = shutil.which("node")
    if not node:
        raise FileNotFoundError("Node.js was not found.")

    api_server = ThreadingHTTPServer((API_HOST, API_PORT), StudioApiHandler)
    api_thread = threading.Thread(target=api_server.serve_forever, name="studio-api", daemon=True)
    api_thread.start()

    vite_script = STUDIO_ROOT / "node_modules" / "vite" / "bin" / "vite.js"
    vite_process = subprocess.Popen([
        node,
        str(vite_script),
        "--host",
        VITE_HOST,
        "--port",
        str(VITE_PORT),
        "--strictPort",
    ], cwd=STUDIO_ROOT)

    try:
        wait_for_port(VITE_HOST, VITE_PORT)
        studio_url = f"http://{VITE_HOST}:{VITE_PORT}/"
        print(f"DAG Studio is ready: {studio_url}")
        if open_browser:
            webbrowser.open(studio_url)
        return vite_process.wait()
    except KeyboardInterrupt:
        return 0
    finally:
        api_server.shutdown()
        api_server.server_close()
        if vite_process.poll() is None:
            vite_process.terminate()
            try:
                vite_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                vite_process.kill()


if __name__ == "__main__":
    try:
        parser = argparse.ArgumentParser(description="Start DAG Studio and its local desktop integration API.")
        parser.add_argument("--no-browser", action="store_true", help="Start services without opening a browser tab.")
        arguments = parser.parse_args()
        raise SystemExit(run(open_browser=not arguments.no_browser))
    except Exception as startup_error:
        print(f"Unable to start DAG Studio: {startup_error}", file=sys.stderr)
        raise SystemExit(1)
