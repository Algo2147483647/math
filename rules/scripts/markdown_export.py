from __future__ import annotations

import argparse
import json
import os
import shutil
from pathlib import Path
from typing import Any

from graph_store import json_to_graph
from markdown_import import default_index_path, load_path_index


def _render_node_markdown(key: str, node: Any) -> str:
    lines = [
        f"# {key.replace('_', ' ')}",
        "",
        "[TOC]",
        "",
        "## Define",
        "",
        node.define,
        "",
        "## Properties",
        "",
    ]

    lines.extend([node.properties, ""])

    lines.extend(["## Include", ""])
    for child, label in sorted(node.children.items()):
        if child == "root":
            continue
        lines.extend([f"- [{child}](./{child}.md): {label}", ""])

    lines.extend(["## Parents", ""])
    for parent, label in sorted(node.parents.items()):
        if parent == "root":
            continue
        lines.extend([f"- [{parent}](./{parent}.md): {label}", ""])

    return "\n".join(lines).rstrip() + "\n"


def _resolve_relative_markdown_path(key: str, path_index: dict[str, str]) -> Path:
    relative_path = path_index.get(key, f"{key}.md")
    path = Path(relative_path)
    if path.suffix.lower() != ".md":
        path = path.with_suffix(".md")
    return path


def _collect_existing_markdown_files(output_dir: Path) -> set[Path]:
    files: set[Path] = set()
    for root, _, names in os.walk(output_dir):
        current_dir = Path(root)
        for name in names:
            file_path = current_dir / name
            if file_path.suffix.lower() == ".md":
                files.add(file_path.resolve())
    return files


def _backup_and_remove_file(
    path: Path,
    backup_dir: Path | None,
    *,
    base_dir: Path,
) -> str:
    if backup_dir is not None:
        backup_dir.mkdir(parents=True, exist_ok=True)
        target_path = backup_dir / path.relative_to(base_dir)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(path), str(target_path))
        return str(target_path.resolve())
    path.unlink()
    return str(path.resolve())


def build_markdown_from_graph_json(
    json_file: str | Path,
    output_dir: str | Path,
    *,
    dry_run: bool = False,
    prune: bool = False,
    backup_dir: str | Path | None = None,
    index_path: str | Path | None = None,
) -> dict[str, object]:
    graph = json_to_graph(json_file)
    resolved_index_path = index_path or default_index_path(json_file)
    path_index = load_path_index(resolved_index_path)
    return build_markdown_from_graph(
        graph,
        output_dir,
        path_index=path_index,
        dry_run=dry_run,
        prune=prune,
        backup_dir=backup_dir,
        index_path=resolved_index_path,
    )


def build_markdown_from_graph(
    graph,
    output_dir: str | Path,
    *,
    path_index: dict[str, str] | None = None,
    dry_run: bool = False,
    prune: bool = False,
    backup_dir: str | Path | None = None,
    index_path: str | Path | None = None,
) -> dict[str, object]:
    target_dir = Path(output_dir).resolve()
    target_dir.mkdir(parents=True, exist_ok=True)

    path_map = dict(path_index or {})
    expected_files: set[Path] = set()
    created_files: list[str] = []
    updated_files: list[str] = []
    unchanged_files: list[str] = []

    for key, node in sorted(graph.items()):
        if key == "root":
            continue

        markdown_path = (target_dir / _resolve_relative_markdown_path(key, path_map)).resolve()
        expected_files.add(markdown_path)
        content = _render_node_markdown(key, node)
        existing_text = markdown_path.read_text(encoding="utf-8-sig") if markdown_path.exists() else None

        if existing_text == content:
            unchanged_files.append(str(markdown_path))
            continue

        if markdown_path.exists():
            updated_files.append(str(markdown_path))
        else:
            created_files.append(str(markdown_path))

        if not dry_run:
            markdown_path.parent.mkdir(parents=True, exist_ok=True)
            markdown_path.write_text(content, encoding="utf-8")

    pruned_files: list[str] = []
    if prune:
        existing_files = _collect_existing_markdown_files(target_dir)
        extra_files = sorted(existing_files - expected_files)
        backup_root = Path(backup_dir).resolve() if backup_dir is not None else None
        for extra_file in extra_files:
            pruned_files.append(str(extra_file))
            if not dry_run:
                _backup_and_remove_file(extra_file, backup_root, base_dir=target_dir)

    return {
        "output_dir": str(target_dir),
        "node_count": len(graph),
        "dry_run": dry_run,
        "prune": prune,
        "index_path": str(Path(index_path).resolve()) if index_path is not None else None,
        "created_files": created_files,
        "updated_files": updated_files,
        "unchanged_files": unchanged_files,
        "pruned_files": pruned_files,
        "written_files": len(created_files) + len(updated_files),
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Generate Markdown notes from math.json."
    )
    parser.add_argument("json_file", help="Path to math.json.")
    parser.add_argument("output_dir", help="Directory where Markdown files will be written.")
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing files.")
    parser.add_argument("--prune", action="store_true", help="Remove extra Markdown files.")
    parser.add_argument("--backup-dir", default=None, help="Optional backup directory for pruned files.")
    parser.add_argument("--index-path", default=None, help="Optional path to the Markdown path index JSON.")
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    result = build_markdown_from_graph_json(
        args.json_file,
        args.output_dir,
        dry_run=args.dry_run,
        prune=args.prune,
        backup_dir=args.backup_dir,
        index_path=args.index_path,
    )

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        for key, value in result.items():
            print(f"{key}: {value}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
