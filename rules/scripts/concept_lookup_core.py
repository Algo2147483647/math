from __future__ import annotations

from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any

from graph_store import DEFAULT_NODE_PAYLOAD, load_raw_concepts, normalize_node_payload


@dataclass
class ConceptMatch:
    key: str
    match_type: str
    score: float

    def to_dict(self) -> dict[str, object]:
        return {
            "key": self.key,
            "match_type": self.match_type,
            "score": self.score,
        }


def load_concepts(path: str | Path) -> dict[str, Any]:
    return load_raw_concepts(path, normalize=True)


def render_relation_map(relations: dict[str, str]) -> list[str]:
    if not relations:
        return ["- <empty>"]
    return [f"- {key}: {label}" for key, label in sorted(relations.items())]


def select_fields(node: dict[str, Any], fields: list[str] | None) -> dict[str, Any]:
    normalized = normalize_node_payload("<inline>", node)
    if not fields or "all" in fields:
        names = tuple(DEFAULT_NODE_PAYLOAD.keys())
    else:
        names = tuple(dict.fromkeys(fields))
    return {name: normalized.get(name, DEFAULT_NODE_PAYLOAD[name]) for name in names}


def resolve_concept(
    term: str,
    concepts: dict[str, Any],
    *,
    max_matches: int = 5,
) -> tuple[ConceptMatch | None, list[ConceptMatch]]:
    if not concepts:
        return None, []

    normalized = term.strip().lower()
    if not normalized:
        return None, []

    scored: list[ConceptMatch] = []
    for key in concepts:
        key_lower = key.lower()
        words_lower = key.replace("_", " ").lower()
        if normalized == key_lower or normalized == words_lower:
            score = 1.0
            match_type = "exact"
        elif normalized in key_lower or normalized in words_lower:
            score = 0.95
            match_type = "substring"
        else:
            score = max(
                SequenceMatcher(None, normalized, key_lower).ratio(),
                SequenceMatcher(None, normalized, words_lower).ratio(),
            )
            match_type = "fuzzy"
        scored.append(ConceptMatch(key=key, match_type=match_type, score=score))

    scored.sort(key=lambda item: (-item.score, item.key))
    candidates = scored[:max_matches]
    if not candidates:
        return None, []

    best = candidates[0]
    if best.score < 0.4:
        return None, candidates
    return best, candidates


def lookup_concept(
    term: str,
    *,
    fields: list[str] | None = None,
    path: str | Path,
    max_matches: int = 5,
) -> dict[str, object]:
    concepts = load_concepts(path)
    match, candidates = resolve_concept(term, concepts, max_matches=max_matches)
    payload = {
        "query": term,
        "resolved": match.to_dict() if match else None,
        "candidates": [candidate.to_dict() for candidate in candidates],
    }

    if not match:
        payload["error"] = "No concept passed the fuzzy-match cutoff."
        return payload

    payload["fields"] = select_fields(concepts[match.key], fields)
    return payload
