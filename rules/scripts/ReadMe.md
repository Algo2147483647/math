# Math Scripts

`math/scripts` is now a reduced script library built around one main CLI, a small set of core modules, and one local service.

Compared with the previous version, the directory has been simplified by removing legacy wrappers, duplicate CLIs, and compatibility shims. The current structure keeps only the files that still carry real behavior.

## Current File Set

| File | Role | Keep Reason |
| --- | --- | --- |
| `graph.py` | Main entry | Thin executable wrapper for the unified CLI |
| `graph_cli.py` | Unified CLI | All graph, sync, diff, validate, repair, and lookup commands |
| `graph_model.py` | In-memory graph model | Core node and relation mutation logic |
| `graph_store.py` | JSON storage layer | Load, normalize, lock, backup, atomic write, JSON CRUD |
| `markdown_parse.py` | Markdown parser | Section parsing, relation parsing, property text normalization |
| `markdown_import.py` | Markdown -> JSON | Build graph from notes, write `math.json`, write `math.index.json`, diff against JSON |
| `markdown_export.py` | JSON -> Markdown | Export Markdown, support `dry-run`, `prune`, and indexed output paths |
| `concept_lookup_core.py` | Lookup module | Exact, substring, and fuzzy concept resolution |
| `graph_validate_core.py` | Validate and repair | Graph validation plus repair preview/apply |
| `service_app.py` | Flask service | HTTP API for import, export, validate, repair, diff, lookup, and CRUD |
| `sync.html` | Local UI | Manual sync page for service-driven operations |
| `ReadMe.md` | Documentation | Current module/function/command reference |

## Removed Files

The following files were deleted because they only duplicated existing behavior:

| Deleted File | Why It Was Removed | Replacement |
| --- | --- | --- |
| `build_graph_from_markdown.py` | Thin wrapper around Markdown import | `python markdown_import.py ...` or `python graph.py import-markdown ...` |
| `build_markdown_from_graph.py` | Thin wrapper around Markdown export | `python markdown_export.py ...` or `python graph.py export-markdown ...` |
| `concept_lookup_cli.py` | Separate CLI duplicated by `graph.py lookup` | `python graph.py lookup ...` |
| `graph_validate_cli.py` | Separate CLI duplicated by `graph.py validate` and `graph.py repair` | `python graph.py validate ...`, `python graph.py repair ...` |
| `lookup_concept.py` | Thin wrapper around lookup CLI | `python graph.py lookup ...` |
| `validate_math_json.py` | Thin wrapper around validate CLI | `python graph.py validate ...` |
| `markdown.py` | Parse shim with no unique logic | `markdown_parse.py` |
| `service.py` | Thin wrapper around Flask app | `python service_app.py ...` |
| `_math_json_common.py` | Helper split that duplicated lookup/data logic | merged into `concept_lookup_core.py` |

## Design After Simplification

### Main Principles

1. One primary CLI: `graph.py`
2. One validation/repair module: `graph_validate_core.py`
3. One lookup module: `concept_lookup_core.py`
4. One JSON storage module: `graph_store.py`
5. No compatibility wrappers unless they still own behavior

### Data Files

| File | Meaning |
| --- | --- |
| `math.json` | Canonical graph payload |
| `math.index.json` | Key -> relative Markdown path mapping used during export |
| `math.json.bak` | Optional backup created by repair with `--apply` |

## Capability Table

| Capability | CLI Command | Python API | Service Function |
| --- | --- | --- | --- |
| List concepts | `graph.py list` | `list_nodes_in_json()` | `list_nodes_in_json` |
| Read one concept | `graph.py get` | `get_node_in_json()` | `get_node_in_json` |
| Create concept | `graph.py create` | `create_node_in_json()` | `create_node_in_json` |
| Update concept | `graph.py update` | `update_node_in_json()` | `update_node_in_json` |
| Delete concept | `graph.py delete` | `delete_node_in_json()` | `delete_node_in_json` |
| Rename concept | `graph.py rename` | `rename_node_in_json()` | `rename_concept` |
| Add child relation | `graph.py add-child` | `add_child_in_json()` | `add_child_in_json` |
| Add parent relation | `graph.py add-parent` | `add_parent_in_json()` | `add_parent_in_json` |
| Remove child relation | `graph.py remove-child` | `remove_child_in_json()` | `remove_child_in_json` |
| Remove parent relation | `graph.py remove-parent` | `remove_parent_in_json()` | `remove_parent_in_json` |
| Import Markdown | `graph.py import-markdown` | `build_graph_json_from_markdown_folder()` | `import_markdown` |
| Export Markdown | `graph.py export-markdown` | `build_markdown_from_graph_json()` | `export_markdown` |
| Compare Markdown and JSON | `graph.py diff` | `diff_markdown_vs_json()` | `diff_graph` |
| Validate graph | `graph.py validate` | `validate_math_json()` | `validate_graph` |
| Repair graph | `graph.py repair` | `repair_math_json()` | `repair_graph` |
| Lookup concept | `graph.py lookup` | `lookup_concept()` | `lookup_concept` |

## CLI Command Table

| Command | Purpose | Important Options |
| --- | --- | --- |
| `list PATH` | List all concept keys | `--json` |
| `get PATH KEY` | Read one concept | `--json` |
| `create PATH KEY` | Create a concept | `--define`, `--property`, `--child`, `--parent`, `--json` |
| `update PATH KEY` | Update a concept | `--define`, `--property`, `--child`, `--parent`, `--clear-*`, `--merge-relations`, `--json` |
| `delete PATH KEY` | Delete a concept | `--json` |
| `rename PATH OLD_KEY NEW_KEY` | Rename a concept and optionally rebuild Markdown | `--markdown-root`, `--index-path`, `--prune`, `--json` |
| `add-child PATH KEY CHILD_KEY` | Add one child edge | `--label`, `--json` |
| `add-parent PATH KEY PARENT_KEY` | Add one parent edge | `--label`, `--json` |
| `remove-child PATH KEY CHILD_KEY` | Remove one child edge | `--json` |
| `remove-parent PATH KEY PARENT_KEY` | Remove one parent edge | `--json` |
| `import-markdown FOLDER OUTPUT` | Build `math.json` from Markdown | `--dry-run`, `--index-path`, `--no-index-write`, `--json` |
| `export-markdown JSON_FILE OUTPUT_DIR` | Build Markdown from `math.json` | `--dry-run`, `--prune`, `--backup-dir`, `--index-path`, `--json` |
| `diff FOLDER JSON_PATH` | Compare Markdown and JSON | `--json` |
| `validate PATH` | Check shape and structural issues | `--strict`, `--json` |
| `repair PATH` | Preview or apply mirrored-edge repair | `--prefer`, `--drop-broken`, `--apply`, `--no-backup`, `--json` |
| `lookup TERM --path PATH` | Resolve one concept | `--field`, `--max-matches`, `--json` |

## Examples

```powershell
python graph.py list D:\Algo\Notes\math_physics\math\lib\math.json --json
python graph.py diff D:\Algo\Notes\math_physics\math D:\Algo\Notes\math_physics\math\lib\math.json --json
python graph.py import-markdown D:\Algo\Notes\math_physics\math D:\Algo\Notes\math_physics\math\lib\math.json --dry-run --json
python graph.py export-markdown D:\Algo\Notes\math_physics\math\lib\math.json D:\Algo\Notes\math_physics\math --dry-run --prune --json
python graph.py validate D:\Algo\Notes\math_physics\math\lib\math.json --json
python graph.py repair D:\Algo\Notes\math_physics\math\lib\math.json --prefer children --apply --json
python graph.py lookup manifold --path D:\Algo\Notes\math_physics\math\lib\math.json --field define --json
python service_app.py --host 127.0.0.1 --port 5000
```

## Module Function Tables

### `graph_model.py`

| Function / Type | Purpose |
| --- | --- |
| `Node` | In-memory node dataclass |
| `ensure_node_in_graph()` | Create or normalize a node slot |
| `sync_graph_relations()` | Rebuild mirrored relations in memory |
| `build_edge_in_graph()` | Add one child edge |
| `build_node_in_graph()` | Create a related node from an anchor |
| `replace_children()` | Replace child edges |
| `replace_parents()` | Replace parent edges |
| `get_node_from_graph()` | Read one node |
| `list_nodes_in_graph()` | List graph keys |
| `create_node_in_graph()` | Create node |
| `update_node_in_graph()` | Update node |
| `delete_node_from_graph()` | Delete node and clean mirrored links |
| `rename_node_in_graph()` | Rename node key and update mirrored links |
| `add_child_in_graph()` | Add child edge |
| `add_parent_in_graph()` | Add parent edge |
| `remove_child_in_graph()` | Remove child edge |
| `remove_parent_in_graph()` | Remove parent edge |
| `serialize_graph()` | Convert graph to JSON-safe payload |

### `graph_store.py`

| Function / Constant | Purpose |
| --- | --- |
| `STANDARD_NODE_FIELDS` | Canonical node field list |
| `DEFAULT_NODE_PAYLOAD` | Default normalized node structure |
| `GRAPH_LOCK_TIMEOUT_SECONDS` | Lock wait timeout |
| `GRAPH_LOCK_POLL_INTERVAL_SECONDS` | Lock poll interval |
| `write_text_atomically()` | Atomic file writer |
| `create_backup_file()` | Backup helper |
| `load_json_payload()` | Raw JSON object loader |
| `normalize_relation_map()` | Normalize relation maps |
| `normalize_properties()` | Normalize property text |
| `normalize_node_payload()` | Normalize raw node |
| `load_raw_concepts()` | Load raw or normalized concept payloads |
| `write_json_payload()` | Persist JSON payload |
| `graph_to_json()` | Serialize graph to file |
| `json_to_graph()` | Load graph from file |
| `list_nodes_in_json()` | JSON-backed list |
| `get_node_in_json()` | JSON-backed get |
| `create_node_in_json()` | JSON-backed create |
| `update_node_in_json()` | JSON-backed update |
| `delete_node_in_json()` | JSON-backed delete |
| `rename_node_in_json()` | JSON-backed rename |
| `add_child_in_json()` | JSON-backed add child |
| `add_parent_in_json()` | JSON-backed add parent |
| `remove_child_in_json()` | JSON-backed remove child |
| `remove_parent_in_json()` | JSON-backed remove parent |

### `markdown_parse.py`

| Function | Purpose |
| --- | --- |
| `parse_section_in_markdown()` | Extract `## Section` text |
| `parse_relation_entries()` | Parse Markdown relation lines |
| `parse_kv_links()` | Convert relation lines to `dict[key, label]` |
| `parse_properties_text()` | Normalize the `Properties` section as one Markdown string |

### `markdown_import.py`

| Function | Purpose |
| --- | --- |
| `default_index_path()` | Compute default `math.index.json` path |
| `load_path_index()` | Read path index |
| `write_path_index()` | Write path index |
| `build_graph_json_from_markdown_folder()` | Import Markdown into `math.json` |
| `build_graph_from_markdown_folder()` | Import Markdown into memory |
| `build_graph_from_markdown_file()` | Parse one Markdown file |
| `diff_markdown_vs_json()` | Compare imported Markdown graph with existing JSON |

### `markdown_export.py`

| Function | Purpose |
| --- | --- |
| `build_markdown_from_graph_json()` | Export `math.json` to Markdown |
| `build_markdown_from_graph()` | Export in-memory graph to Markdown |

### `concept_lookup_core.py`

| Function / Type | Purpose |
| --- | --- |
| `ConceptMatch` | Lookup match record |
| `load_concepts()` | Normalized concept loader for lookup |
| `render_relation_map()` | CLI-style relation rendering helper |
| `select_fields()` | Select fields from one node |
| `resolve_concept()` | Exact, substring, and fuzzy ranking |
| `lookup_concept()` | Full lookup API |

### `graph_validate_core.py`

| Function | Purpose |
| --- | --- |
| `validate_node_shape()` | Validate one raw node |
| `format_edge_issue()` | Format edge diagnostics |
| `validate_concepts_payload()` | Validate in-memory/raw payload |
| `validate_math_json()` | Validate graph file |
| `repair_concepts_payload()` | Repair mirrored edges in memory |
| `repair_math_json()` | Preview or apply repair to file |

### `service_app.py`

| Function | Purpose |
| --- | --- |
| `import_markdown()` | Service wrapper for Markdown import |
| `export_markdown()` | Service wrapper for Markdown export |
| `validate_graph()` | Service wrapper for validation |
| `repair_graph()` | Service wrapper for repair |
| `diff_graph()` | Service wrapper for diff |
| `rename_concept()` | Service wrapper for rename |
| `FUNCTIONS` | Service function registry |
| `health()` | Service health endpoint |
| `list_functions()` | List service function names |
| `service_function()` | Main RPC endpoint |
| `main()` | Flask startup entry |

## Service Table

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/health` | `GET` | Health check |
| `/functions` | `GET` | List available service functions |
| `/function` | `POST` | Execute one named function with JSON params |

### Request Example

```json
{
  "function": "import_markdown",
  "params": {
    "folder_path": "D:/Algo/Notes/math_physics/math",
    "output_path": "D:/Algo/Notes/math_physics/math/lib/math.json",
    "dry_run": true,
    "index_path": "D:/Algo/Notes/math_physics/math/lib/math.index.json"
  }
}
```

## Notes

| Topic | Current Behavior |
| --- | --- |
| Properties | Stored as one Markdown `str`; headings stay inline inside the same text block |
| Path preservation | Uses `math.index.json` when present |
| Dry-run | Supported for import and export |
| Prune | Supported for Markdown export |
| Repair strategy | `children` or `parents` can be chosen as source of truth |
| Broken references during repair | Preserved by default, removed only with `--drop-broken` |
| Compatibility wrappers | Removed |
