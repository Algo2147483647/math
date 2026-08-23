from __future__ import annotations

import argparse
import json
import os
import shutil
import tempfile
from pathlib import Path
from typing import Any


DEFAULT_JSON_PATH = Path(__file__).resolve().parents[1] / "math.json"


def write_text_atomically(path: Path, text: str, *, encoding: str = "utf-8") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            "w",
            encoding=encoding,
            dir=path.parent,
            delete=False,
            suffix=path.suffix,
            newline="\n",
        ) as handle:
            handle.write(text)
            temp_path = Path(handle.name)
        os.replace(temp_path, path)
    except Exception:
        if temp_path is not None:
            try:
                temp_path.unlink()
            except FileNotFoundError:
                pass
        raise


def migrate_node(key: str, node: dict[str, Any]) -> tuple[dict[str, Any], bool]:
    changed = False
    migrated: dict[str, Any] = {}

    for field, value in node.items():
        if field == "properties":
            changed = True
            continue
        migrated[field] = value

    content_link = f"[{key}](./{key}.md)"
    if migrated.get("content") != content_link:
        migrated["content"] = content_link
        changed = True

    return migrated, changed


def migrate_math_json(json_path: Path, *, dry_run: bool, no_backup: bool) -> dict[str, int | str | bool]:
    payload = json.loads(json_path.read_text(encoding="utf-8-sig"))
    if not isinstance(payload, dict):
        raise ValueError(f"Expected top-level JSON object: {json_path}")

    migrated_payload: dict[str, Any] = {}
    changed_nodes = 0

    for key, node in payload.items():
        if not isinstance(node, dict):
            migrated_payload[key] = node
            continue

        migrated_node, changed = migrate_node(key, node)
        migrated_payload[key] = migrated_node
        if changed:
            changed_nodes += 1

    if changed_nodes and not dry_run:
        if not no_backup:
            shutil.copy2(json_path, json_path.with_suffix(f"{json_path.suffix}.bak"))
        output = json.dumps(migrated_payload, ensure_ascii=False, indent=2) + "\n"
        write_text_atomically(json_path, output)

    return {
        "path": str(json_path),
        "dry_run": dry_run,
        "total_nodes": len(payload),
        "changed_nodes": changed_nodes,
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description='Remove each node "properties" field and add "content": "[<Key>](./<Key>.md)".'
    )
    parser.add_argument(
        "json_path",
        nargs="?",
        type=Path,
        default=DEFAULT_JSON_PATH,
        help=f"Path to math.json. Defaults to {DEFAULT_JSON_PATH}",
    )
    parser.add_argument("--dry-run", action="store_true", help="Report changes without writing.")
    parser.add_argument("--no-backup", action="store_true", help="Do not write math.json.bak before applying.")
    args = parser.parse_args()

    result = migrate_math_json(args.json_path.resolve(), dry_run=args.dry_run, no_backup=args.no_backup)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
