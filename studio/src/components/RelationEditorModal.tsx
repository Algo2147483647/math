import { useEffect, useRef, useState } from "react";
import type { DagNode, NodeKey, RelationField, RelationValue } from "../graph/types";
import { DEFAULT_RELATION_VALUE } from "../graph/types";
import { uniqueKeys } from "../graph/relations";

interface RelationEditorModalProps {
  open: boolean;
  nodeKey: NodeKey | null;
  field: "parents" | "children" | null;
  fieldLabel?: string;
  node: DagNode | null;
  onSave: (relations: Record<NodeKey, RelationValue>) => void;
  onClose: () => void;
}

interface RelationRow {
  id: string;
  key: string;
  value: string;
}

export default function RelationEditorModal({ open, nodeKey, field, fieldLabel, node, onSave, onClose }: RelationEditorModalProps) {
  const [value, setValue] = useState("");
  const [rows, setRows] = useState<RelationRow[]>([]);
  const [error, setError] = useState("");
  const nextRowIdRef = useRef(0);

  function createRow(key = "", relationValue = ""): RelationRow {
    nextRowIdRef.current += 1;
    return {
      id: `relation-row-${nextRowIdRef.current}`,
      key,
      value: relationValue,
    };
  }

  useEffect(() => {
    if (open && node && field) {
      const nextRows = buildRelationRows(node[field] as RelationField, createRow);
      setRows(nextRows);
      setValue(formatRelationKeys(nextRows));
      setError("");
    }
  }, [field, node, open]);

  if (!open || !nodeKey || !field) {
    return null;
  }

  const activeNodeKey = nodeKey;
  const displayFieldName = fieldLabel || field;

  function saveRelations() {
    const normalized = normalizeRelationRows(rows, activeNodeKey);
    if (!normalized.ok) {
      setError(normalized.message);
      return;
    }
    onSave(normalized.relations);
  }

  return (
    <div id="relation-editor-modal" className="relation-editor-modal is-visible" aria-hidden="false">
      <div className="relation-editor-dialog" role="dialog" aria-modal="true" aria-labelledby="relation-editor-title">
        <h3 id="relation-editor-title">Edit {displayFieldName}</h3>
        <p id="relation-editor-description" className="relation-editor-description">Editing {displayFieldName} for node {activeNodeKey}.</p>
        <textarea
          id="relation-editor-input"
          rows={4}
          spellCheck={false}
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            setError("");
            setValue(nextValue);
            setRows((current) => reconcileRowsWithKeys(current, parseRelationInput(nextValue), createRow));
          }}
          placeholder={`Edit ${displayFieldName} keys here. Use one key per line or separate keys with commas.`}
          autoFocus
        />
        <p className="relation-editor-hint">This text box edits the {displayFieldName} key set directly. The table below stays in sync and lets you edit each relation value.</p>
        <div className="relation-editor-table-wrap">
          <table className="relation-editor-table">
            <thead>
              <tr>
                <th scope="col">Key</th>
                <th scope="col">Value</th>
                <th scope="col" aria-label="Actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      className="relation-editor-cell-input"
                      type="text"
                      spellCheck={false}
                      value={row.key}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setError("");
                        setRows((current) => {
                          const nextRows = current.map((item) => (item.id === row.id ? { ...item, key: nextValue } : item));
                          setValue(formatRelationKeys(nextRows));
                          return nextRows;
                        });
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className="relation-editor-cell-input"
                      type="text"
                      spellCheck={false}
                      value={row.value}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setError("");
                        setRows((current) => current.map((item) => (item.id === row.id ? { ...item, value: nextValue } : item)));
                      }}
                    />
                  </td>
                  <td className="relation-editor-actions-cell">
                    <button
                      className="ghost-btn relation-editor-remove-btn"
                      type="button"
                      onClick={() => {
                        setError("");
                        setRows((current) => {
                          const nextRows = current.filter((item) => item.id !== row.id);
                          setValue(formatRelationKeys(nextRows));
                          return nextRows;
                        });
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="relation-editor-empty">No {displayFieldName} added yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="relation-editor-secondary-actions">
          <button
            className="ghost-btn"
            type="button"
            onClick={() => {
              setError("");
              setRows((current) => {
                const nextRows = [...current, createRow("", "")];
                setValue(formatRelationKeys(nextRows));
                return nextRows;
              });
            }}
          >
            Add Row
          </button>
        </div>
        {error ? <p className="relation-editor-error">{error}</p> : null}
        <div className="relation-editor-actions">
          <button id="relation-editor-cancel" className="ghost-btn" type="button" onClick={onClose}>Cancel</button>
          <button id="relation-editor-apply" className="primary-btn" type="button" onClick={saveRelations}>Apply</button>
        </div>
      </div>
    </div>
  );
}

export function parseRelationInput(rawText: string): NodeKey[] {
  return uniqueKeys(String(rawText || "").split(/[\n,]/));
}

function buildRelationRows(relationField: RelationField, createRow: (key?: string, relationValue?: string) => RelationRow): RelationRow[] {
  if (Array.isArray(relationField)) {
    return relationField.map((key) => createRow(key, String(DEFAULT_RELATION_VALUE)));
  }

  return Object.entries(relationField || {}).map(([key, value]) => createRow(key, formatRelationValue(value)));
}

function reconcileRowsWithKeys(
  currentRows: RelationRow[],
  nextKeys: string[],
  createRow: (key?: string, relationValue?: string) => RelationRow,
): RelationRow[] {
  const mergedRows = currentRows.map((row) => ({ ...row }));
  const rowIndexByKey = new Map<string, number>();

  mergedRows.forEach((row, index) => {
    const key = row.key.trim();
    if (key) {
      rowIndexByKey.set(key, index);
    }
  });

  const nextRows: RelationRow[] = [];
  nextKeys.forEach((key) => {
    const existingIndex = rowIndexByKey.get(key);
    if (existingIndex !== undefined) {
      nextRows.push(mergedRows[existingIndex]);
      return;
    }
    nextRows.push(createRow(key, ""));
  });

  currentRows.forEach((row) => {
    if (!row.key.trim()) {
      nextRows.push(row);
    }
  });

  return nextRows;
}

function normalizeRelationRows(rows: RelationRow[], nodeKey: NodeKey): { ok: true; relations: Record<NodeKey, RelationValue> } | { ok: false; message: string } {
  const relations: Record<NodeKey, RelationValue> = {};

  for (const row of rows) {
    const key = row.key.trim();
    if (!key) {
      continue;
    }
    if (key === nodeKey) {
      return { ok: false, message: "A node cannot reference itself." };
    }
    if (key.includes("\n") || key.includes(",")) {
      return { ok: false, message: `Node key "${key}" cannot contain commas or line breaks.` };
    }
    if (Object.prototype.hasOwnProperty.call(relations, key)) {
      return { ok: false, message: `Duplicate relation key "${key}".` };
    }
    relations[key] = parseRelationValue(row.value);
  }

  return { ok: true, relations };
}

function parseRelationValue(rawValue: string): RelationValue {
  const trimmed = String(rawValue || "").trim();
  if (!trimmed) {
    return DEFAULT_RELATION_VALUE;
  }
  if (/^true$/i.test(trimmed)) {
    return true;
  }
  if (/^false$/i.test(trimmed)) {
    return false;
  }
  if (/^null$/i.test(trimmed)) {
    return null;
  }
  if (/^-?(?:\d+|\d*\.\d+)$/.test(trimmed)) {
    const parsedNumber = Number(trimmed);
    if (Number.isFinite(parsedNumber)) {
      return parsedNumber;
    }
  }
  return trimmed;
}

function formatRelationValue(value: RelationValue): string {
  if (value === null) {
    return "null";
  }
  if (value === undefined) {
    return String(DEFAULT_RELATION_VALUE);
  }
  return String(value);
}

function formatRelationKeys(rows: RelationRow[]): string {
  return rows.map((row) => row.key.trim()).filter(Boolean).join("\n");
}
