import type { NodeKey } from "../graph/types";
import { formatMappedFieldLabel, getSemanticFieldName, type FieldMapping, type MappableSystemFieldKey } from "../graph/fieldMapping";
import { normalizeRelationField } from "../graph/relations";
import { resolveMarkdownImageSource } from "../adapters/markdownImages";
import { parseRelationInput } from "./RelationEditorModal";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

export type FieldEditorKind = "plainText" | "multilineText" | "json" | "relation";
export type FieldDisplayMode = "markdown" | "text";

export interface EditableField {
  name: string;
  displayName: string;
  value: unknown;
  editorKind: FieldEditorKind;
  semanticFieldName: MappableSystemFieldKey | null;
  locked?: boolean;
  serializedValue?: unknown;
}

interface NodeFieldEditorProps {
  field: EditableField;
  value: string;
  displayMode: FieldDisplayMode;
  onChange: (value: string) => void;
}

export default function NodeFieldEditor({ field, value, displayMode, onChange }: NodeFieldEditorProps) {
  if (field.name === "key") {
    return <input className="node-detail-editor node-detail-editor--input" type="text" spellCheck={false} value={value} onChange={(event) => onChange(event.target.value)} />;
  }

  return (
    <div className="node-detail-editor-wrap">
      <textarea
        className="node-detail-editor node-detail-editor--textarea"
        rows={getEditorRows(field)}
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {displayMode === "markdown" && supportsDisplayMode(field) ? (
        <MarkdownValue value={value} previewSurface />
      ) : null}
      {getEditorHint(field) ? <p className="node-detail-editor-hint">{getEditorHint(field)}</p> : null}
    </div>
  );
}

export function MarkdownValue({
  value,
  previewSurface = false,
}: {
  value: string;
  previewSurface?: boolean;
}) {
  if (!value.trim()) {
    return <p className="node-detail-empty">(empty string)</p>;
  }

  return (
    <div
      className={[
        "node-detail-markdown",
        previewSurface ? "node-detail-markdown--preview" : "",
      ].filter(Boolean).join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          a: ({ children }) => <span>{children}</span>,
          img: ({ src, alt, ...props }) => (
            <RelativeMarkdownImage
              src={String(src || "")}
              alt={String(alt || "")}
              {...props}
            />
          ),
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
}

function RelativeMarkdownImage({
  src,
  alt,
  ...props
}: {
  src: string;
  alt: string;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [resolvedSrc, setResolvedSrc] = useState(src);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";
    setUnavailable(false);

    setResolvedSrc("");
    resolveMarkdownImageSource(src).then((result) => {
      if (cancelled) {
        if (result.ok) {
          if (result.objectUrl) {
            URL.revokeObjectURL(result.url);
          }
        }
        return;
      }
      if (!result.ok) {
        setUnavailable(true);
        return;
      }
      objectUrl = result.objectUrl ? result.url : "";
      setResolvedSrc(result.url);
    });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (unavailable) {
    return null;
  }

  if (!resolvedSrc) {
    return <span className="node-detail-image-loading">Loading image: {src}</span>;
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      {...props}
      onError={() => setUnavailable(true)}
    />
  );
}

export function buildEditableFields(nodeKey: NodeKey, node: Record<string, unknown>, fieldMapping: FieldMapping): EditableField[] {
  const clonedNode = { ...node };
  if (clonedNode.key === nodeKey) {
    delete clonedNode.key;
  }
  return [
    { name: "key", displayName: "key", value: nodeKey, editorKind: "plainText", semanticFieldName: null },
    ...Object.entries(clonedNode).map(([name, value]) => ({
      name,
      displayName: formatMappedFieldLabel(name, fieldMapping),
      value,
      editorKind: inferEditorKind(name, value, fieldMapping),
      semanticFieldName: getSemanticFieldName(name, fieldMapping),
    })),
  ];
}

export function formatEditorValue(field: EditableField): string {
  if (field.editorKind === "relation") {
    return JSON.stringify(normalizeRelationField(field.value), null, 2);
  }
  if (typeof field.value === "string") {
    return field.value;
  }
  if (typeof field.value === "number" || typeof field.value === "boolean") {
    return String(field.value);
  }
  return JSON.stringify(field.value, null, 2);
}

export function supportsDisplayMode(field: EditableField): boolean {
  return field.name !== "key"
    && typeof field.value === "string"
    && (field.editorKind === "plainText" || field.editorKind === "multilineText");
}

export function parseNodeFieldValue(field: EditableField, rawValue: string): { ok: true; value: unknown } | { ok: false; message: string } {
  const text = String(rawValue || "");
  const trimmed = text.trim();

  if (field.editorKind === "relation") {
    if (!trimmed) {
      return { ok: true, value: {} };
    }
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      return parseJsonEditorValue(field.name, trimmed);
    }
    return { ok: true, value: parseRelationInput(trimmed) };
  }

  if (field.editorKind === "plainText" || field.editorKind === "multilineText") {
    return { ok: true, value: text };
  }

  if (typeof field.value === "number") {
    const nextNumber = Number(trimmed);
    if (!trimmed || !Number.isFinite(nextNumber)) {
      return { ok: false, message: `Field "${field.displayName}" must be a valid number.` };
    }
    return { ok: true, value: nextNumber };
  }

  if (typeof field.value === "boolean") {
    if (/^true$/i.test(trimmed)) {
      return { ok: true, value: true };
    }
    if (/^false$/i.test(trimmed)) {
      return { ok: true, value: false };
    }
    return { ok: false, message: `Field "${field.displayName}" must be true or false.` };
  }

  return parseJsonEditorValue(field.displayName, trimmed || "null");
}

function parseJsonEditorValue(fieldName: string, rawJson: string): { ok: true; value: unknown } | { ok: false; message: string } {
  try {
    return { ok: true, value: JSON.parse(rawJson) };
  } catch {
    return { ok: false, message: `Field "${fieldName}" contains invalid JSON.` };
  }
}

function inferEditorKind(name: string, value: unknown, fieldMapping: FieldMapping): FieldEditorKind {
  const semanticFieldName = getSemanticFieldName(name, fieldMapping);
  if (semanticFieldName === "parents" || semanticFieldName === "children") {
    return "relation";
  }
  if (semanticFieldName === "define" || typeof value === "string" && value.length > 80) {
    return "multilineText";
  }
  if (typeof value === "string") {
    return "plainText";
  }
  return "json";
}

function getEditorRows(field: EditableField): number {
  if (field.semanticFieldName === "define") {
    return 8;
  }
  if (field.editorKind === "relation") {
    return 5;
  }
  if (field.editorKind === "json") {
    return 6;
  }
  return 3;
}

function getEditorHint(field: EditableField): string {
  if (field.editorKind === "relation") {
    return "Use a JSON object, a JSON array, or one key per line.";
  }
  if (field.editorKind === "json") {
    return "Enter valid JSON.";
  }
  if (typeof field.value === "boolean") {
    return "Use true or false.";
  }
  return "";
}
