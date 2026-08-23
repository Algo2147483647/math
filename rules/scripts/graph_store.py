from __future__ import annotations

import json
import os
import shutil
import tempfile
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Callable

from graph_model import (
    Graph,
    Node,
    add_child_in_graph,
    add_parent_in_graph,
    create_node_in_graph,
    delete_node_from_graph,
    get_node_from_graph,
    list_nodes_in_graph,
    remove_child_in_graph,
    remove_parent_in_graph,
    rename_node_in_graph,
    serialize_graph,
    sync_graph_relations,
    update_node_in_graph,
)


STANDARD_NODE_FIELDS = ("define", "parents", "children", "properties")
DEFAULT_NODE_PAYLOAD = {
    "define": "",
    "parents": {},
    "children": {},
    "properties": "",
}

GRAPH_LOCK_TIMEOUT_SECONDS = 10.0
GRAPH_LOCK_POLL_INTERVAL_SECONDS = 0.05


def _graph_lock_path(json_path: Path) -> Path:
    return json_path.with_suffix(f"{json_path.suffix}.lock")


@contextmanager
def _acquire_graph_lock(json_path: Path):
    json_path.parent.mkdir(parents=True, exist_ok=True)
    lock_path = _graph_lock_path(json_path)
    deadline = time.monotonic() + GRAPH_LOCK_TIMEOUT_SECONDS
    lock_fd: int | None = None

    while True:
        try:
            lock_fd = os.open(lock_path, os.O_CREAT | os.O_EXCL | os.O_RDWR)
            os.write(lock_fd, str(os.getpid()).encode("ascii", errors="ignore"))
            break
        except FileExistsError:
            if time.monotonic() >= deadline:
                raise TimeoutError(f"Timed out waiting for graph lock: {lock_path}")
            time.sleep(GRAPH_LOCK_POLL_INTERVAL_SECONDS)

    try:
        yield
    finally:
        if lock_fd is not None:
            os.close(lock_fd)
        try:
            lock_path.unlink()
        except FileNotFoundError:
            pass


def write_text_atomically(path: str | Path, text: str, *, encoding: str = "utf-8") -> None:
    target_path = Path(path)
    target_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path: Path | None = None

    try:
        with tempfile.NamedTemporaryFile(
            "w",
            encoding=encoding,
            dir=target_path.parent,
            delete=False,
            suffix=target_path.suffix,
        ) as handle:
            handle.write(text)
            temp_path = Path(handle.name)
        os.replace(temp_path, target_path)
    except Exception:
        if temp_path is not None:
            try:
                temp_path.unlink()
            except FileNotFoundError:
                pass
        raise


def create_backup_file(path: str | Path, backup_path: str | Path | None = None) -> str:
    source_path = Path(path)
    if not source_path.exists():
        raise FileNotFoundError(f"File not found for backup: {source_path}")

    target_path = (
        Path(backup_path)
        if backup_path is not None
        else source_path.with_suffix(f"{source_path.suffix}.bak")
    )
    target_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source_path, target_path)
    return str(target_path.resolve())


def load_json_payload(path: str | Path) -> dict[str, Any]:
    json_path = Path(path)
    if not json_path.exists():
        raise FileNotFoundError(f"JSON file not found: {json_path}")

    try:
        payload = json.loads(json_path.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Failed to parse JSON file: {json_path}") from exc

    if not isinstance(payload, dict):
        raise ValueError(f"Top-level JSON value must be an object: {json_path}")
    return payload


def normalize_relation_map(value: Any) -> dict[str, str]:
    if not isinstance(value, dict):
        return {}

    normalized: dict[str, str] = {}
    for key, label in value.items():
        if key is None:
            continue
        normalized[str(key)] = label if isinstance(label, str) else str(label)
    return normalized


def normalize_properties(value: Any) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        pieces = [item if isinstance(item, str) else str(item) for item in value]
        return "\n\n".join(piece for piece in pieces if piece)
    if value is None:
        return ""
    return str(value)


def normalize_node_payload(key: str, node_info: Any) -> dict[str, object]:
    if not isinstance(node_info, dict):
        return dict(DEFAULT_NODE_PAYLOAD)

    normalized = dict(node_info)
    normalized["define"] = node_info.get("define", "")
    if not isinstance(normalized["define"], str):
        normalized["define"] = str(normalized["define"])

    normalized["parents"] = normalize_relation_map(node_info.get("parents", {}))
    normalized["children"] = normalize_relation_map(node_info.get("children", {}))
    normalized["properties"] = normalize_properties(node_info.get("properties", ""))

    return normalized


def load_raw_concepts(path: str | Path, *, normalize: bool = False) -> dict[str, Any]:
    payload = load_json_payload(path)
    if not normalize:
        return payload
    return {key: normalize_node_payload(key, node_info) for key, node_info in payload.items()}


def write_json_payload(payload: dict[str, Any], path: str | Path) -> str:
    text = json.dumps(payload, ensure_ascii=False, sort_keys=True, indent=2)
    write_text_atomically(path, text, encoding="utf-8")
    return text


def _mutate_json_graph(
    path: str | Path,
    mutate: Callable[[Graph], object],
) -> tuple[Path, object]:
    json_path = Path(path)
    with _acquire_graph_lock(json_path):
        graph = json_to_graph(json_path)
        result = mutate(graph)
        graph_to_json(graph, json_path)
    return json_path, result


def graph_to_json(graph: Graph, json_file: str | Path) -> str:
    json_path = Path(json_file)
    payload = serialize_graph(graph)
    return write_json_payload(payload, json_path)


def json_to_graph(
    json_file: str | Path,
    *,
    sync_relations: bool = True,
) -> Graph:
    data = load_raw_concepts(json_file, normalize=True)
    graph: Graph = {}

    for node_key, node_info in data.items():
        graph[node_key] = Node(
            key=node_key,
            define=node_info.get("define", ""),
            properties=node_info.get("properties", ""),
            children=dict(node_info.get("children", {})),
            parents=dict(node_info.get("parents", {})),
        )

    if sync_relations:
        sync_graph_relations(graph)
    return graph


def list_nodes_in_json(path: str | Path) -> dict[str, object]:
    graph = json_to_graph(path)
    return {
        "path": str(Path(path).resolve()),
        "count": len(graph),
        "keys": list_nodes_in_graph(graph),
    }


def get_node_in_json(path: str | Path, key: str) -> dict[str, object]:
    graph = json_to_graph(path)
    node = get_node_from_graph(graph, key)
    return {
        "path": str(Path(path).resolve()),
        "key": key,
        "node": node.to_dict(),
    }


def create_node_in_json(
    path: str | Path,
    key: str,
    *,
    define: str = "",
    properties: str = "",
    children: dict[str, str] | None = None,
    parents: dict[str, str] | None = None,
) -> dict[str, object]:
    json_path, node_payload = _mutate_json_graph(
        path,
        lambda graph: create_node_in_graph(
            graph,
            key,
            define=define,
            properties=properties,
            children=children,
            parents=parents,
        ).to_dict(),
    )
    return {
        "path": str(json_path.resolve()),
        "action": "create",
        "key": key,
        "node": node_payload,
    }


def update_node_in_json(
    path: str | Path,
    key: str,
    *,
    define: str | None = None,
    properties: str | None = None,
    children: dict[str, str] | None = None,
    parents: dict[str, str] | None = None,
    merge_relations: bool = False,
) -> dict[str, object]:
    json_path, node_payload = _mutate_json_graph(
        path,
        lambda graph: update_node_in_graph(
            graph,
            key,
            define=define,
            properties=properties,
            children=children,
            parents=parents,
            merge_relations=merge_relations,
        ).to_dict(),
    )
    return {
        "path": str(json_path.resolve()),
        "action": "update",
        "key": key,
        "node": node_payload,
        "merge_relations": merge_relations,
    }


def delete_node_in_json(path: str | Path, key: str) -> dict[str, object]:
    json_path, summary = _mutate_json_graph(
        path,
        lambda graph: delete_node_from_graph(graph, key),
    )
    return {
        "path": str(json_path.resolve()),
        "action": "delete",
        "key": key,
        **summary,
    }


def rename_node_in_json(path: str | Path, old_key: str, new_key: str) -> dict[str, object]:
    json_path, node_payload = _mutate_json_graph(
        path,
        lambda graph: rename_node_in_graph(graph, old_key, new_key).to_dict(),
    )
    return {
        "path": str(json_path.resolve()),
        "action": "rename",
        "old_key": old_key,
        "new_key": new_key,
        "node": node_payload,
    }


def add_child_in_json(
    path: str | Path,
    key: str,
    child_key: str,
    *,
    label: str = "",
) -> dict[str, object]:
    json_path, node_payload = _mutate_json_graph(
        path,
        lambda graph: add_child_in_graph(graph, key, child_key, label).to_dict(),
    )
    return {
        "path": str(json_path.resolve()),
        "action": "add_child",
        "key": key,
        "child_key": child_key,
        "label": label,
        "node": node_payload,
    }


def add_parent_in_json(
    path: str | Path,
    key: str,
    parent_key: str,
    *,
    label: str = "",
) -> dict[str, object]:
    json_path, node_payload = _mutate_json_graph(
        path,
        lambda graph: add_parent_in_graph(graph, key, parent_key, label).to_dict(),
    )
    return {
        "path": str(json_path.resolve()),
        "action": "add_parent",
        "key": key,
        "parent_key": parent_key,
        "label": label,
        "node": node_payload,
    }


def remove_child_in_json(path: str | Path, key: str, child_key: str) -> dict[str, object]:
    json_path, removed = _mutate_json_graph(
        path,
        lambda graph: remove_child_in_graph(graph, key, child_key),
    )
    return {
        "path": str(json_path.resolve()),
        "action": "remove_child",
        "key": key,
        "child_key": child_key,
        "removed": removed,
    }


def remove_parent_in_json(path: str | Path, key: str, parent_key: str) -> dict[str, object]:
    json_path, removed = _mutate_json_graph(
        path,
        lambda graph: remove_parent_in_graph(graph, key, parent_key),
    )
    return {
        "path": str(json_path.resolve()),
        "action": "remove_parent",
        "key": key,
        "parent_key": parent_key,
        "removed": removed,
    }
