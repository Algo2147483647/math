from __future__ import annotations

import re


RELATION_LINE_RE = re.compile(r"-\s+\[(?P<key>.*?)\]\((?P<href>.*?)\)\s*:\s*(?P<label>.*?)$")


def parse_section_in_markdown(content: str, name: str) -> str:
    pattern = r"##\s*" + re.escape(name) + r"(.*?)(\n##\s+.+|$)"
    section = re.search(pattern, content, re.DOTALL)
    return section.group(1).strip() if section else ""


def parse_relation_entries(content: str) -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []
    for line in content.splitlines():
        match = RELATION_LINE_RE.match(line.strip())
        if match:
            entries.append(
                {
                    "key": match.group("key").strip(),
                    "href": match.group("href").strip(),
                    "label": match.group("label").strip(),
                }
            )
    return entries


def parse_kv_links(content: str) -> dict[str, str]:
    return {
        entry["key"]: entry["label"]
        for entry in parse_relation_entries(content)
        if entry["key"]
    }


def parse_properties_text(content: str) -> str:
    return content.strip()
