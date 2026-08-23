from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

from graph_model import Node, build_edge_in_graph, serialize_graph
from graph_store import json_to_graph, write_json_payload
from markdown_parse import (
    parse_properties_text,
    parse_relation_entries,
    parse_section_in_markdown,
)


IGNORED_MARKDOWN_DIR_NAMES = {"__pycache__", "lib", "rules", "scripts"}
IGNORED_MARKDOWN_FILE_NAMES = {"readme.md"}


def default_index_path(json_path: str | Path) -> Path:
    path = Path(json_path)
    return path.with_name(f"{path.stem}.index.json")


def load_path_index(index_path: str | Path | None) -> dict[str, str]:
    if index_path is None:
        return {}

    path = Path(index_path)
    if not path.exists():
        return {}

    try:
        payload = json.loads(path.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Failed to parse path index file: {path}") from exc

    if not isinstance(payload, dict):
        raise ValueError(f"Path index must be a JSON object: {path}")

    return {
        str(key): str(value)
        for key, value in payload.items()
        if isinstance(key, str) and isinstance(value, str)
    }


def write_path_index(index: dict[str, str], path: str | Path) -> str:
    payload = json.dumps(dict(sorted(index.items())), ensure_ascii=False, indent=2)
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(payload + "\n", encoding="utf-8")
    return payload


def build_graph_json_from_markdown_folder(
    folder_path: str | Path,
    output_path: str | Path,
    *,
    dry_run: bool = False,
    write_index: bool = True,
    index_path: str | Path | None = None,
) -> dict[str, object]:
    graph, metadata = build_graph_from_markdown_folder(folder_path, return_metadata=True)
    payload = serialize_graph(graph)

    if not dry_run:
        write_json_payload(payload, output_path)
        if write_index:
            target_index_path = index_path or default_index_path(output_path)
            write_path_index(metadata["path_index"], target_index_path)

    return {
        "folder_path": str(Path(folder_path).resolve()),
        "output_path": str(Path(output_path).resolve()),
        "dry_run": dry_run,
        "write_index": write_index,
        "index_path": (
            str(Path(index_path or default_index_path(output_path)).resolve())
            if write_index
            else None
        ),
        "node_count": len(graph),
        "path_index_count": len(metadata["path_index"]),
        "unresolved_links": metadata["unresolved_links"],
        "mismatched_link_targets": metadata["mismatched_link_targets"],
        "source_files": metadata["source_files"],
    }


def _should_skip_directory(directory: Path, root_folder: Path) -> bool:
    try:
        relative_parts = directory.resolve().relative_to(root_folder).parts
    except ValueError:
        return True

    return any(
        part.lower() in IGNORED_MARKDOWN_DIR_NAMES
        or part.startswith(".")
        or part.lower().startswith("_tmp")
        for part in relative_parts
    )


def _is_concept_markdown(file_path: Path, root_folder: Path) -> bool:
    if file_path.suffix.lower() != ".md" or not file_path.is_file():
        return False
    if file_path.name.lower() in IGNORED_MARKDOWN_FILE_NAMES:
        return False

    try:
        relative_parts = file_path.resolve().relative_to(root_folder).parts[:-1]
    except ValueError:
        return False

    return not any(
        part.lower() in IGNORED_MARKDOWN_DIR_NAMES
        or part.startswith(".")
        or part.lower().startswith("_tmp")
        for part in relative_parts
    )


def _collect_concept_markdown_files(folder: Path) -> tuple[dict[str, Path], list[str]]:
    files_by_key: dict[str, Path] = {}
    source_files: list[str] = []

    for root, dir_names, files in os.walk(folder):
        current_dir = Path(root)
        dir_names[:] = sorted(
            name
            for name in dir_names
            if not _should_skip_directory(current_dir / name, folder)
        )
        for file_name in sorted(files):
            file_path = current_dir / file_name
            if not _is_concept_markdown(file_path, folder):
                continue

            key = file_path.stem
            if key in files_by_key:
                raise ValueError(
                    f"Duplicate concept key '{key}' found in both "
                    f"{files_by_key[key]} and {file_path}"
                )

            files_by_key[key] = file_path.resolve()
            source_files.append(str(file_path.resolve()))

    return files_by_key, source_files


def build_graph_from_markdown_folder(
    folder_path: str | Path,
    *,
    return_metadata: bool = False,
) -> dict[str, Node] | tuple[dict[str, Node], dict[str, object]]:
    folder = Path(folder_path).resolve()
    if not folder.exists():
        raise FileNotFoundError(f"Markdown folder not found: {folder}")

    files_by_key, source_files = _collect_concept_markdown_files(folder)
    graph: dict[str, Node] = {key: Node(key=key) for key in files_by_key}
    metadata: dict[str, object] = {
        "path_index": {
            key: file_path.relative_to(folder).as_posix()
            for key, file_path in files_by_key.items()
        },
        "unresolved_links": [],
        "mismatched_link_targets": [],
        "source_files": source_files,
    }

    known_keys = set(files_by_key)
    for key, file_path in files_by_key.items():
        build_graph_from_markdown_file(
            file_path,
            graph,
            folder,
            known_keys=known_keys,
            metadata=metadata,
        )

    if return_metadata:
        return graph, metadata
    return graph


def build_graph_from_markdown_file(
    file_path: str | Path,
    graph: dict[str, Node],
    root_folder: str | Path,
    *,
    known_keys: set[str] | None = None,
    metadata: dict[str, object] | None = None,
) -> Node:
    root = Path(root_folder).resolve()
    markdown_path = Path(file_path).resolve()
    key = markdown_path.stem
    node = graph.get(key)
    if node is None:
        node = Node(key=key)
        graph[key] = node

    try:
        content = markdown_path.read_text(encoding="utf-8-sig")
    except (OSError, UnicodeError) as exc:
        raise ValueError(f"Failed to read Markdown file: {markdown_path}") from exc

    define_section = parse_section_in_markdown(content, "Define")
    property_section = parse_section_in_markdown(content, "Properties")
    include_section = parse_section_in_markdown(content, "Include")
    parents_section = parse_section_in_markdown(content, "Parents")

    node.define = define_section
    node.properties = parse_properties_text(property_section)

    target_keys = known_keys or set(graph)
    unresolved_links = metadata["unresolved_links"] if metadata is not None else None
    mismatched_link_targets = (
        metadata["mismatched_link_targets"] if metadata is not None else None
    )

    for entry in parse_relation_entries(include_section):
        child_key = entry["key"]
        href_key = Path(entry["href"]).stem if entry["href"] else child_key
        if href_key and href_key != child_key and mismatched_link_targets is not None:
            mismatched_link_targets.append(
                f"{key}.children label={child_key} href={entry['href']}"
            )
        if child_key not in target_keys:
            if unresolved_links is not None:
                unresolved_links.append(
                    f"{key}.children -> {child_key} ({entry['label']})"
                )
            continue
        build_edge_in_graph(graph, key, child_key, entry["label"])

    for entry in parse_relation_entries(parents_section):
        parent_key = entry["key"]
        href_key = Path(entry["href"]).stem if entry["href"] else parent_key
        if href_key and href_key != parent_key and mismatched_link_targets is not None:
            mismatched_link_targets.append(
                f"{key}.parents label={parent_key} href={entry['href']}"
            )
        if parent_key not in target_keys:
            if unresolved_links is not None:
                unresolved_links.append(
                    f"{key}.parents -> {parent_key} ({entry['label']})"
                )
            continue
        build_edge_in_graph(graph, parent_key, key, entry["label"])

    if metadata is not None:
        metadata["path_index"][key] = markdown_path.relative_to(root).as_posix()
    return node


def diff_markdown_vs_json(
    folder_path: str | Path,
    json_path: str | Path,
) -> dict[str, object]:
    markdown_graph, metadata = build_graph_from_markdown_folder(folder_path, return_metadata=True)
    markdown_payload = serialize_graph(markdown_graph)
    json_payload = serialize_graph(json_to_graph(json_path))

    markdown_keys = set(markdown_payload)
    json_keys = set(json_payload)
    changed_nodes: list[dict[str, object]] = []

    for key in sorted(markdown_keys & json_keys):
        markdown_node = markdown_payload[key]
        json_node = json_payload[key]
        changed_fields = sorted(
            field
            for field in ("define", "properties", "children", "parents")
            if markdown_node.get(field) != json_node.get(field)
        )
        if changed_fields:
            changed_nodes.append({"key": key, "fields": changed_fields})

    return {
        "folder_path": str(Path(folder_path).resolve()),
        "json_path": str(Path(json_path).resolve()),
        "only_in_markdown": sorted(markdown_keys - json_keys),
        "only_in_json": sorted(json_keys - markdown_keys),
        "changed_nodes": changed_nodes,
        "unresolved_links": metadata["unresolved_links"],
        "mismatched_link_targets": metadata["mismatched_link_targets"],
        "path_index_count": len(metadata["path_index"]),
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Build math/lib/math.json from Markdown notes."
    )
    parser.add_argument("folder_path", help="Root folder that contains the Markdown concept notes.")
    parser.add_argument("output", help="Output path for the generated math.json file.")
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing files.")
    parser.add_argument(
        "--index-path",
        default=None,
        help="Optional output path for the Markdown path index JSON.",
    )
    parser.add_argument(
        "--no-index-write",
        action="store_true",
        help="Skip writing the Markdown path index sidecar file.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Print machine-readable JSON.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    result = build_graph_json_from_markdown_folder(
        args.folder_path,
        args.output,
        dry_run=args.dry_run,
        write_index=not args.no_index_write,
        index_path=args.index_path,
    )
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"Markdown folder: {result['folder_path']}")
        print(f"Output JSON: {result['output_path']}")
        print(f"Node count: {result['node_count']}")
        print(f"Dry run: {result['dry_run']}")
        print(f"Unresolved links: {len(result['unresolved_links'])}")
        print(f"Mismatched link targets: {len(result['mismatched_link_targets'])}")
    return 0 if not result["unresolved_links"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
