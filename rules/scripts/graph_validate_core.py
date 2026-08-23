from __future__ import annotations

from collections import Counter
from pathlib import Path
from typing import Any

from graph_store import (
    DEFAULT_NODE_PAYLOAD,
    create_backup_file,
    load_raw_concepts,
    normalize_node_payload,
    write_json_payload,
)


def validate_node_shape(key: str, node: Any) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    standard_fields = tuple(DEFAULT_NODE_PAYLOAD.keys())

    if not isinstance(node, dict):
        errors.append(f"{key}: node is {type(node).__name__}, expected object")
        return errors, warnings

    missing = [field for field in standard_fields if field not in node]
    extra = [field for field in node if field not in standard_fields]
    if missing:
        errors.append(f"{key}: missing fields {missing}")
    if extra:
        warnings.append(f"{key}: extra fields {extra}")

    if "define" in node and not isinstance(node["define"], str):
        errors.append(f"{key}: define is {type(node['define']).__name__}, expected string")
    if "parents" in node and not isinstance(node["parents"], dict):
        errors.append(f"{key}: parents is {type(node['parents']).__name__}, expected object")
    if "children" in node and not isinstance(node["children"], dict):
        errors.append(f"{key}: children is {type(node['children']).__name__}, expected object")
    if "properties" in node and not isinstance(node["properties"], str):
        errors.append(f"{key}: properties is {type(node['properties']).__name__}, expected string")

    return errors, warnings


def format_edge_issue(
    source: str,
    field: str,
    target: str,
    label: str,
    reverse_field: str,
    reverse_label: str | None = None,
) -> str:
    base = f"{source}.{field} -> {target} ({label})"
    if reverse_label is None:
        return f"{base}; reverse {reverse_field}=<missing>"
    return f"{base}; reverse {reverse_field}={reverse_label}"


def validate_concepts_payload(
    concepts: dict[str, Any],
    *,
    strict: bool = False,
    path: str | Path | None = None,
) -> dict[str, object]:
    errors: list[str] = []
    warnings: list[str] = []
    parent_labels: Counter[str] = Counter()
    child_labels: Counter[str] = Counter()
    property_lengths: Counter[int] = Counter()
    broken_references: list[str] = []
    mirrored_parent_edges = 0
    one_sided_parent_edges: list[str] = []
    mismatched_parent_edges: list[str] = []
    mirrored_child_edges = 0
    one_sided_child_edges: list[str] = []
    mismatched_child_edges: list[str] = []

    if not isinstance(concepts, dict):
        errors.append("Top-level JSON value is not an object.")
    else:
        for key, node in concepts.items():
            node_errors, node_warnings = validate_node_shape(key, node)
            errors.extend(node_errors)
            warnings.extend(node_warnings)

            if not isinstance(node, dict):
                continue

            parents = node.get("parents", {})
            children = node.get("children", {})
            properties = node.get("properties", "")

            if isinstance(parents, dict):
                parent_labels.update(
                    label if isinstance(label, str) else str(label) for label in parents.values()
                )
                for target, label in parents.items():
                    if target not in concepts:
                        broken_references.append(f"{key}.parents -> {target} ({label})")
                        continue
                    target_node = concepts[target]
                    if not isinstance(target_node, dict):
                        broken_references.append(f"{key}.parents -> {target} ({label})")
                        continue

                    reverse_value = target_node.get("children", {})
                    reverse_label = reverse_value.get(key) if isinstance(reverse_value, dict) else None
                    if reverse_label is None:
                        one_sided_parent_edges.append(
                            format_edge_issue(key, "parents", target, str(label), "children")
                        )
                    elif reverse_label == label:
                        mirrored_parent_edges += 1
                    else:
                        mismatched_parent_edges.append(
                            format_edge_issue(
                                key,
                                "parents",
                                target,
                                str(label),
                                "children",
                                str(reverse_label),
                            )
                        )

            if isinstance(children, dict):
                child_labels.update(
                    label if isinstance(label, str) else str(label) for label in children.values()
                )
                for target, label in children.items():
                    if target not in concepts:
                        broken_references.append(f"{key}.children -> {target} ({label})")
                        continue
                    target_node = concepts[target]
                    if not isinstance(target_node, dict):
                        broken_references.append(f"{key}.children -> {target} ({label})")
                        continue

                    reverse_value = target_node.get("parents", {})
                    reverse_label = reverse_value.get(key) if isinstance(reverse_value, dict) else None
                    if reverse_label is None:
                        one_sided_child_edges.append(
                            format_edge_issue(key, "children", target, str(label), "parents")
                        )
                    elif reverse_label == label:
                        mirrored_child_edges += 1
                    else:
                        mismatched_child_edges.append(
                            format_edge_issue(
                                key,
                                "children",
                                target,
                                str(label),
                                "parents",
                                str(reverse_label),
                            )
                        )

            if isinstance(properties, str):
                property_lengths[len(properties)] += 1

    structural_issues = (
        one_sided_parent_edges
        + mismatched_parent_edges
        + one_sided_child_edges
        + mismatched_child_edges
    )
    has_blocking_issue = bool(errors or broken_references or structural_issues)
    has_strict_issue = bool(strict and warnings)

    return {
        "path": str(Path(path).resolve()) if path is not None else None,
        "concept_count": len(concepts) if isinstance(concepts, dict) else 0,
        "parent_edge_count": sum(parent_labels.values()),
        "child_edge_count": sum(child_labels.values()),
        "property_string_lengths": dict(sorted(property_lengths.items())),
        "parent_relation_labels": dict(parent_labels.most_common()),
        "child_relation_labels": dict(child_labels.most_common()),
        "mirrored_parent_edges": mirrored_parent_edges,
        "one_sided_parent_edges": one_sided_parent_edges,
        "mismatched_parent_edges": mismatched_parent_edges,
        "mirrored_child_edges": mirrored_child_edges,
        "one_sided_child_edges": one_sided_child_edges,
        "mismatched_child_edges": mismatched_child_edges,
        "broken_references": broken_references,
        "structural_issues": structural_issues,
        "errors": errors,
        "warnings": warnings,
        "strict": strict,
        "exit_code": 1 if (has_blocking_issue or has_strict_issue) else 0,
    }


def validate_math_json(
    *,
    path: str | Path,
    strict: bool = False,
) -> dict[str, object]:
    concepts = load_raw_concepts(path, normalize=False)
    return validate_concepts_payload(concepts, strict=strict, path=path)


def repair_concepts_payload(
    concepts: dict[str, Any],
    *,
    prefer: str = "children",
    drop_broken: bool = False,
) -> tuple[dict[str, dict[str, object]], dict[str, object]]:
    if prefer not in {"children", "parents"}:
        raise ValueError("prefer must be 'children' or 'parents'")

    normalized: dict[str, dict[str, object]] = {}
    for key, node in concepts.items():
        repaired_node = normalize_node_payload(key, node)
        if isinstance(node, dict):
            extras = {
                extra_key: value
                for extra_key, value in node.items()
                if extra_key not in DEFAULT_NODE_PAYLOAD
            }
            repaired_node.update(extras)
        normalized[key] = repaired_node

    removed_broken_edges: list[str] = []

    if drop_broken:
        for key, node in normalized.items():
            for field in ("children", "parents"):
                relation_map = dict(node[field])
                cleaned: dict[str, str] = {}
                for target, label in relation_map.items():
                    if target in normalized:
                        cleaned[target] = label
                    else:
                        removed_broken_edges.append(f"{key}.{field} -> {target} ({label})")
                node[field] = cleaned

    if prefer == "children":
        for node in normalized.values():
            node["parents"] = {}
        for source, node in normalized.items():
            for target, label in node["children"].items():
                if target in normalized:
                    normalized[target]["parents"][source] = label
    else:
        for node in normalized.values():
            node["children"] = {}
        for target, node in normalized.items():
            for source, label in node["parents"].items():
                if source in normalized:
                    normalized[source]["children"][target] = label

    report = validate_concepts_payload(normalized, strict=False)
    report.update(
        {
            "prefer": prefer,
            "drop_broken": drop_broken,
            "removed_broken_edges": removed_broken_edges,
        }
    )
    return normalized, report


def repair_math_json(
    *,
    path: str | Path,
    prefer: str = "children",
    drop_broken: bool = False,
    apply: bool = False,
    backup: bool = True,
    backup_path: str | Path | None = None,
) -> dict[str, object]:
    concepts = load_raw_concepts(path, normalize=False)
    repaired_payload, report = repair_concepts_payload(
        concepts,
        prefer=prefer,
        drop_broken=drop_broken,
    )

    result = {
        "path": str(Path(path).resolve()),
        "apply": apply,
        "backup": backup,
        "backup_path": None,
        "report": {**report, "path": str(Path(path).resolve())},
    }

    if apply:
        if backup:
            result["backup_path"] = create_backup_file(path, backup_path=backup_path)
        write_json_payload(repaired_payload, path)

    return result
