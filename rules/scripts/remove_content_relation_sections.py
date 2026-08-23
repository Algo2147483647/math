from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import tempfile
from pathlib import Path


DEFAULT_CONTENT_DIR = Path(__file__).resolve().parents[1] / "content"
SECTION_RE = re.compile(
    r"(?ms)^##[ \t]+(?:Parents|Include)[ \t]*\r?\n.*?(?=^##[ \t]+|\Z)"
)


def detect_newline(text: str) -> str:
    return "\r\n" if "\r\n" in text else "\n"


def write_text_atomically(path: Path, text: str, *, encoding: str = "utf-8", newline: str = "\n") -> None:
    temp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            "w",
            encoding=encoding,
            dir=path.parent,
            delete=False,
            suffix=path.suffix,
            newline=newline,
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


def remove_relation_sections(text: str) -> tuple[str, int]:
    updated, count = SECTION_RE.subn("", text)
    updated = re.sub(r"\n{3,}", "\n\n", updated).rstrip() + ("\n" if updated else "")
    return updated, count


def clean_content_dir(content_dir: Path, *, dry_run: bool, no_backup: bool) -> dict[str, int | str | bool]:
    md_paths = sorted(content_dir.glob("*.md"))
    changed_files = 0
    removed_sections = 0

    backup_dir = content_dir / ".section_cleanup_backup"
    for path in md_paths:
        original = path.read_text(encoding="utf-8-sig")
        newline = detect_newline(original)
        updated, section_count = remove_relation_sections(original)
        if section_count == 0 or updated == original:
            continue

        changed_files += 1
        removed_sections += section_count

        if dry_run:
            continue

        if not no_backup:
            backup_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, backup_dir / path.name)
        write_text_atomically(path, updated, newline=newline)

    return {
        "path": str(content_dir),
        "dry_run": dry_run,
        "total_md_files": len(md_paths),
        "changed_files": changed_files,
        "removed_sections": removed_sections,
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description='Remove "## Parents" and "## Include" sections from Markdown files in math/content.'
    )
    parser.add_argument(
        "content_dir",
        nargs="?",
        type=Path,
        default=DEFAULT_CONTENT_DIR,
        help=f"Path to content directory. Defaults to {DEFAULT_CONTENT_DIR}",
    )
    parser.add_argument("--dry-run", action="store_true", help="Report changes without writing.")
    parser.add_argument("--no-backup", action="store_true", help="Do not create .section_cleanup_backup before applying.")
    args = parser.parse_args()

    result = clean_content_dir(args.content_dir.resolve(), dry_run=args.dry_run, no_backup=args.no_backup)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
