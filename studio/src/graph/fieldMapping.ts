export const MAPPABLE_SYSTEM_FIELD_KEYS = ["children", "parents", "define", "title", "type"] as const;

export type MappableSystemFieldKey = typeof MAPPABLE_SYSTEM_FIELD_KEYS[number];

export type FieldMapping = Record<MappableSystemFieldKey, string>;

const MAPPABLE_FIELD_SET = new Set<string>(MAPPABLE_SYSTEM_FIELD_KEYS);
const FIELD_ALIAS_CANDIDATES: Record<MappableSystemFieldKey, string[]> = {
  children: ["children", "child", "next", "nexts", "downstream", "outputs", "targets"],
  parents: ["parents", "parent", "prev", "previous", "upstream", "inputs", "sources"],
  define: ["define", "description", "desc", "summary", "details", "detail", "content"],
  title: ["title", "label"],
  type: ["type", "kind", "category", "nodeType", "node_type"],
};

export function getDefaultFieldMapping(): FieldMapping {
  return {
    children: "children",
    parents: "parents",
    define: "define",
    title: "title",
    type: "type",
  };
}

export function sanitizeFieldMapping(input: unknown): FieldMapping {
  const defaults = getDefaultFieldMapping();
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return defaults;
  }

  const candidate = input as Partial<Record<MappableSystemFieldKey, unknown>>;
  const next: FieldMapping = { ...defaults };
  const usedValues = new Set<string>();

  MAPPABLE_SYSTEM_FIELD_KEYS.forEach((systemKey) => {
    const rawValue = candidate[systemKey];
    const trimmedValue = typeof rawValue === "string" ? rawValue.trim() : "";
    const finalValue = trimmedValue && !usedValues.has(trimmedValue) ? trimmedValue : defaults[systemKey];
    next[systemKey] = finalValue;
    usedValues.add(finalValue);
  });

  return next;
}

export function validateFieldMapping(mapping: FieldMapping): { ok: true } | { ok: false; message: string } {
  const usedValues = new Set<string>();

  for (const systemKey of MAPPABLE_SYSTEM_FIELD_KEYS) {
    const displayName = String(mapping[systemKey] || "").trim();
    if (!displayName) {
      return { ok: false, message: `Field display name for "${systemKey}" cannot be empty.` };
    }
    if (usedValues.has(displayName)) {
      return { ok: false, message: `Field display name "${displayName}" is duplicated.` };
    }
    usedValues.add(displayName);
  }

  return { ok: true };
}

export function inferFieldMapping(input: unknown, fallback: FieldMapping = getDefaultFieldMapping()): FieldMapping {
  const samples = collectNodeLikeSamples(input);
  if (!samples.length) {
    return fallback;
  }

  const resolved = new Set<string>();
  const next: Partial<FieldMapping> = {};

  MAPPABLE_SYSTEM_FIELD_KEYS.forEach((systemKey) => {
    const explicitFieldName = findBestExplicitFieldName(samples, systemKey);
    if (explicitFieldName && !resolved.has(explicitFieldName)) {
      next[systemKey] = explicitFieldName;
      resolved.add(explicitFieldName);
      return;
    }

    const fallbackFieldName = fallback[systemKey];
    if (samples.some((sample) => Object.prototype.hasOwnProperty.call(sample, fallbackFieldName)) && !resolved.has(fallbackFieldName)) {
      next[systemKey] = fallbackFieldName;
      resolved.add(fallbackFieldName);
    }
  });

  return sanitizeFieldMapping({
    ...fallback,
    ...next,
  });
}

export function getDisplayFieldName(fieldName: string, mapping: FieldMapping): string {
  return isMappableSystemFieldKey(fieldName) ? mapping[fieldName] : fieldName;
}

export function getMappedFieldName(mapping: FieldMapping, fieldName: MappableSystemFieldKey): string {
  return mapping[fieldName];
}

export function getSemanticFieldName(fieldName: string, mapping: FieldMapping): MappableSystemFieldKey | null {
  for (const systemKey of MAPPABLE_SYSTEM_FIELD_KEYS) {
    if (mapping[systemKey] === fieldName) {
      return systemKey;
    }
  }
  return isMappableSystemFieldKey(fieldName) ? fieldName : null;
}

export function formatMappedFieldLabel(fieldName: string, mapping: FieldMapping): string {
  const semanticFieldName = getSemanticFieldName(fieldName, mapping);
  if (!semanticFieldName) {
    return fieldName;
  }
  return fieldName === semanticFieldName
    ? fieldName
    : `${fieldName} (${semanticFieldName})`;
}

export function isMappableSystemFieldKey(fieldName: string): fieldName is MappableSystemFieldKey {
  return MAPPABLE_FIELD_SET.has(fieldName);
}

function collectNodeLikeSamples(input: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(input)) {
    return input.filter(isNodeLikeRecord);
  }

  if (input && typeof input === "object") {
    const record = input as Record<string, unknown>;
    if (Array.isArray(record.nodes)) {
      return record.nodes.filter(isNodeLikeRecord);
    }
    return Object.values(record).filter(isNodeLikeRecord);
  }

  return [];
}

function isNodeLikeRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function findBestExplicitFieldName(samples: Array<Record<string, unknown>>, systemKey: MappableSystemFieldKey): string | null {
  const candidates = FIELD_ALIAS_CANDIDATES[systemKey];
  let bestFieldName: string | null = null;
  let bestScore = 0;

  candidates.forEach((fieldName, index) => {
    const score = samples.reduce((total, sample) => {
      if (!Object.prototype.hasOwnProperty.call(sample, fieldName)) {
        return total;
      }
      const value = sample[fieldName];
      return total + 10 + getValueShapeScore(systemKey, value);
    }, 0) + (candidates.length - index) * 0.01;

    if (score > bestScore) {
      bestScore = score;
      bestFieldName = fieldName;
    }
  });

  return bestFieldName;
}

function getValueShapeScore(systemKey: MappableSystemFieldKey, value: unknown): number {
  if (systemKey === "children" || systemKey === "parents") {
    return isRelationLikeValue(value) ? 4 : 0;
  }
  if (systemKey === "title" || systemKey === "define" || systemKey === "type") {
    return typeof value === "string" ? 3 : 0;
  }
  return 0;
}

function isRelationLikeValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.every((item) => typeof item === "string");
  }
  if (!value || typeof value !== "object") {
    return false;
  }
  return Object.keys(value as Record<string, unknown>).length >= 0;
}
