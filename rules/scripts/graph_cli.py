from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from concept_lookup_core import lookup_concept
from graph_store import (
    add_child_in_json,
    add_parent_in_json,
    create_node_in_json,
    delete_node_in_json,
    get_node_in_json,
    list_nodes_in_json,
    remove_child_in_json,
    remove_parent_in_json,
    rename_node_in_json,
    update_node_in_json,
)
from graph_validate_core import repair_math_json, validate_math_json
from markdown_export import build_markdown_from_graph_json
from markdown_import import (
    build_graph_json_from_markdown_folder,
    default_index_path,
    diff_markdown_vs_json,
    load_path_index,
    write_path_index,
)


def _parse_relation_arg(value: str) -> tuple[str, str]:
    key, separator, label = value.partition("=")
    relation_key = key.strip()
    if not relation_key:
        raise ValueError(f"Invalid relation argument: {value!r}")
    return relation_key, label.strip() if separator else ""


def _relation_args_to_dict(values: list[str] | None) -> dict[str, str] | None:
    if values is None:
        return None

    relations: dict[str, str] = {}
    for value in values:
        key, label = _parse_relation_arg(value)
        relations[key] = label
    return relations


def _resolve_optional_properties(
    value: str | None,
    *,
    clear: bool,
) -> str | None:
    if clear and value is not None:
        raise ValueError("Cannot combine --clear-properties with --property.")
    if clear:
        return ""
    return value


def _resolve_optional_relations(
    values: list[str] | None,
    *,
    clear: bool,
    option_name: str,
) -> dict[str, str] | None:
    if clear and values:
        raise ValueError(f"Cannot combine {option_name} with relation values.")
    if clear:
        return {}
    return _relation_args_to_dict(values)


def _print_payload(payload: dict[str, object], *, as_json: bool) -> None:
    if as_json:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return

    for key, value in payload.items():
        if isinstance(value, (dict, list)):
            print(f"{key}:")
            print(json.dumps(value, ensure_ascii=False, indent=2))
        else:
            print(f"{key}: {value}")


def _update_path_index_for_rename(
    json_path: str | Path,
    old_key: str,
    new_key: str,
    *,
    index_path: str | Path | None = None,
) -> dict[str, object]:
    target_index_path = Path(index_path or default_index_path(json_path))
    index = load_path_index(target_index_path)
    old_relative_path = index.pop(old_key, f"{old_key}.md")
    old_path = Path(old_relative_path)
    new_relative_path = old_path.with_name(f"{new_key}.md").as_posix()
    index[new_key] = new_relative_path
    write_path_index(index, target_index_path)
    return {
        "index_path": str(target_index_path.resolve()),
        "old_relative_path": old_relative_path,
        "new_relative_path": new_relative_path,
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Manage the math.json concept graph and sync tools.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    list_parser = subparsers.add_parser("list", help="List all concept keys in math.json.")
    list_parser.add_argument("path", help="Path to math.json.")
    list_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")

    get_parser = subparsers.add_parser("get", help="Read a single concept node from math.json.")
    get_parser.add_argument("path", help="Path to math.json.")
    get_parser.add_argument("key", help="Concept key.")
    get_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")

    create_parser = subparsers.add_parser("create", help="Create a new concept node.")
    create_parser.add_argument("path", help="Path to math.json.")
    create_parser.add_argument("key", help="New concept key.")
    create_parser.add_argument("--define", default="", help="Definition text.")
    create_parser.add_argument(
        "--property",
        dest="properties",
        help="Property section Markdown text.",
    )
    create_parser.add_argument(
        "--child",
        dest="children",
        action="append",
        help="Child relation as KEY or KEY=LABEL. Repeat to add multiple edges.",
    )
    create_parser.add_argument(
        "--parent",
        dest="parents",
        action="append",
        help="Parent relation as KEY or KEY=LABEL. Repeat to add multiple edges.",
    )
    create_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")

    update_parser = subparsers.add_parser("update", help="Update an existing concept node.")
    update_parser.add_argument("path", help="Path to math.json.")
    update_parser.add_argument("key", help="Existing concept key.")
    update_parser.add_argument("--define", help="Replace the definition text.")
    update_parser.add_argument(
        "--property",
        dest="properties",
        help="Replace the property section Markdown text.",
    )
    update_parser.add_argument(
        "--child",
        dest="children",
        action="append",
        help="Child relation as KEY or KEY=LABEL. Repeat to replace or merge edges.",
    )
    update_parser.add_argument(
        "--parent",
        dest="parents",
        action="append",
        help="Parent relation as KEY or KEY=LABEL. Repeat to replace or merge edges.",
    )
    update_parser.add_argument(
        "--clear-properties",
        action="store_true",
        help="Replace properties with an empty string.",
    )
    update_parser.add_argument(
        "--clear-children",
        action="store_true",
        help="Replace child relations with an empty mapping.",
    )
    update_parser.add_argument(
        "--clear-parents",
        action="store_true",
        help="Replace parent relations with an empty mapping.",
    )
    update_parser.add_argument(
        "--merge-relations",
        action="store_true",
        help="Merge provided child/parent relations instead of replacing them.",
    )
    update_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")

    delete_parser = subparsers.add_parser("delete", help="Delete a concept node.")
    delete_parser.add_argument("path", help="Path to math.json.")
    delete_parser.add_argument("key", help="Concept key.")
    delete_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")

    rename_parser = subparsers.add_parser("rename", help="Rename a concept key.")
    rename_parser.add_argument("path", help="Path to math.json.")
    rename_parser.add_argument("old_key", help="Existing concept key.")
    rename_parser.add_argument("new_key", help="Replacement concept key.")
    rename_parser.add_argument(
        "--markdown-root",
        default=None,
        help="Optional Markdown root. When provided, rebuild Markdown after rename.",
    )
    rename_parser.add_argument(
        "--index-path",
        default=None,
        help="Optional path to the Markdown path index JSON.",
    )
    rename_parser.add_argument(
        "--prune",
        action="store_true",
        help="Prune stale Markdown files when rebuilding after rename.",
    )
    rename_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")

    add_child_parser = subparsers.add_parser("add-child", help="Add one child relation.")
    add_child_parser.add_argument("path", help="Path to math.json.")
    add_child_parser.add_argument("key", help="Existing parent concept key.")
    add_child_parser.add_argument("child_key", help="Child concept key.")
    add_child_parser.add_argument("--label", default="", help="Relation label.")
    add_child_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")

    add_parent_parser = subparsers.add_parser("add-parent", help="Add one parent relation.")
    add_parent_parser.add_argument("path", help="Path to math.json.")
    add_parent_parser.add_argument("key", help="Existing child concept key.")
    add_parent_parser.add_argument("parent_key", help="Parent concept key.")
    add_parent_parser.add_argument("--label", default="", help="Relation label.")
    add_parent_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")

    remove_child_parser = subparsers.add_parser("remove-child", help="Remove one child relation.")
    remove_child_parser.add_argument("path", help="Path to math.json.")
    remove_child_parser.add_argument("key", help="Existing parent concept key.")
    remove_child_parser.add_argument("child_key", help="Child concept key.")
    remove_child_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")

    remove_parent_parser = subparsers.add_parser("remove-parent", help="Remove one parent relation.")
    remove_parent_parser.add_argument("path", help="Path to math.json.")
    remove_parent_parser.add_argument("key", help="Existing child concept key.")
    remove_parent_parser.add_argument("parent_key", help="Parent concept key.")
    remove_parent_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")

    import_parser = subparsers.add_parser("import-markdown", help="Build JSON from Markdown notes.")
    import_parser.add_argument("folder_path", help="Root folder that contains Markdown notes.")
    import_parser.add_argument("output", help="Output path for math.json.")
    import_parser.add_argument("--dry-run", action="store_true", help="Preview without writing files.")
    import_parser.add_argument("--index-path", default=None, help="Optional path to the path index JSON.")
    import_parser.add_argument("--no-index-write", action="store_true", help="Skip writing the path index sidecar.")
    import_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")

    export_parser = subparsers.add_parser("export-markdown", help="Build Markdown notes from math.json.")
    export_parser.add_argument("json_file", help="Path to math.json.")
    export_parser.add_argument("output_dir", help="Directory where Markdown files will be written.")
    export_parser.add_argument("--dry-run", action="store_true", help="Preview without writing files.")
    export_parser.add_argument("--prune", action="store_true", help="Remove extra Markdown files.")
    export_parser.add_argument("--backup-dir", default=None, help="Optional backup directory for pruned files.")
    export_parser.add_argument("--index-path", default=None, help="Optional path to the path index JSON.")
    export_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")

    diff_parser = subparsers.add_parser("diff", help="Compare Markdown notes with math.json.")
    diff_parser.add_argument("folder_path", help="Root folder that contains Markdown notes.")
    diff_parser.add_argument("json_path", help="Path to math.json.")
    diff_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")

    validate_parser = subparsers.add_parser("validate", help="Validate math.json.")
    validate_parser.add_argument("path", help="Path to math.json.")
    validate_parser.add_argument("--strict", action="store_true", help="Exit non-zero on warnings.")
    validate_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")

    repair_parser = subparsers.add_parser("repair", help="Repair mirrored relation issues in math.json.")
    repair_parser.add_argument("path", help="Path to math.json.")
    repair_parser.add_argument("--prefer", choices=["children", "parents"], default="children")
    repair_parser.add_argument("--drop-broken", action="store_true", help="Remove broken references during repair.")
    repair_parser.add_argument("--apply", action="store_true", help="Write repaired output back to disk.")
    repair_parser.add_argument("--no-backup", action="store_true", help="Do not create a .bak file when applying.")
    repair_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")

    lookup_parser = subparsers.add_parser("lookup", help="Resolve a concept key by exact, substring, or fuzzy match.")
    lookup_parser.add_argument("term", help="Concept key or natural-language term to resolve.")
    lookup_parser.add_argument("--path", required=True, help="Path to math.json.")
    lookup_parser.add_argument(
        "--field",
        dest="fields",
        action="append",
        choices=["define", "parents", "children", "properties", "all"],
        help="Field to print. Repeat to request multiple fields.",
    )
    lookup_parser.add_argument("--max-matches", type=int, default=5, help="Number of fuzzy candidates to keep.")
    lookup_parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")

    return parser


def main() -> int:
    args = build_parser().parse_args()

    try:
        exit_code = 0
        if args.command == "list":
            payload = list_nodes_in_json(args.path)
        elif args.command == "get":
            payload = get_node_in_json(args.path, args.key)
        elif args.command == "create":
            payload = create_node_in_json(
                args.path,
                args.key,
                define=args.define,
                properties=args.properties,
                children=_relation_args_to_dict(args.children),
                parents=_relation_args_to_dict(args.parents),
            )
        elif args.command == "update":
            if args.merge_relations and (args.clear_children or args.clear_parents):
                raise ValueError(
                    "Cannot combine --merge-relations with --clear-children or --clear-parents."
                )
            payload = update_node_in_json(
                args.path,
                args.key,
                define=args.define,
                properties=_resolve_optional_properties(
                    args.properties,
                    clear=args.clear_properties,
                ),
                children=_resolve_optional_relations(
                    args.children,
                    clear=args.clear_children,
                    option_name="--clear-children",
                ),
                parents=_resolve_optional_relations(
                    args.parents,
                    clear=args.clear_parents,
                    option_name="--clear-parents",
                ),
                merge_relations=args.merge_relations,
            )
        elif args.command == "delete":
            payload = delete_node_in_json(args.path, args.key)
        elif args.command == "rename":
            payload = rename_node_in_json(args.path, args.old_key, args.new_key)
            if args.markdown_root:
                index_update = _update_path_index_for_rename(
                    args.path,
                    args.old_key,
                    args.new_key,
                    index_path=args.index_path,
                )
                export_payload = build_markdown_from_graph_json(
                    args.path,
                    args.markdown_root,
                    prune=args.prune,
                    index_path=args.index_path or default_index_path(args.path),
                )
                payload["path_index"] = index_update
                payload["markdown_export"] = export_payload
        elif args.command == "add-child":
            payload = add_child_in_json(args.path, args.key, args.child_key, label=args.label)
        elif args.command == "add-parent":
            payload = add_parent_in_json(args.path, args.key, args.parent_key, label=args.label)
        elif args.command == "remove-child":
            payload = remove_child_in_json(args.path, args.key, args.child_key)
        elif args.command == "remove-parent":
            payload = remove_parent_in_json(args.path, args.key, args.parent_key)
        elif args.command == "import-markdown":
            payload = build_graph_json_from_markdown_folder(
                args.folder_path,
                args.output,
                dry_run=args.dry_run,
                write_index=not args.no_index_write,
                index_path=args.index_path,
            )
            exit_code = 0 if not payload["unresolved_links"] else 1
        elif args.command == "export-markdown":
            payload = build_markdown_from_graph_json(
                args.json_file,
                args.output_dir,
                dry_run=args.dry_run,
                prune=args.prune,
                backup_dir=args.backup_dir,
                index_path=args.index_path,
            )
        elif args.command == "diff":
            payload = diff_markdown_vs_json(args.folder_path, args.json_path)
            exit_code = 0
            if payload["only_in_markdown"] or payload["only_in_json"] or payload["changed_nodes"]:
                exit_code = 1
        elif args.command == "validate":
            payload = validate_math_json(path=args.path, strict=args.strict)
            exit_code = payload["exit_code"]
        elif args.command == "repair":
            payload = repair_math_json(
                path=args.path,
                prefer=args.prefer,
                drop_broken=args.drop_broken,
                apply=args.apply,
                backup=not args.no_backup,
            )
            exit_code = payload["report"]["exit_code"]
        else:
            payload = lookup_concept(
                args.term,
                fields=args.fields,
                path=Path(args.path),
                max_matches=args.max_matches,
            )
            exit_code = 0 if payload.get("resolved") else 2
    except (FileNotFoundError, TimeoutError, ValueError, OSError) as exc:
        print(str(exc), file=sys.stderr)
        return 2

    _print_payload(payload, as_json=args.json)
    return exit_code
