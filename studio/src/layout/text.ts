import { getNodeTitle } from "../graph/accessors";
import type { FieldMapping } from "../graph/fieldMapping";
import type { DagNode, NodeKey } from "../graph/types";
import { sanitizeNodeLabel } from "../graph/selectors";

export function getNodeVisual(
  nodeKey: NodeKey,
  node: DagNode & { synthetic?: boolean },
  mapping: FieldMapping,
  minNodeWidth: number,
  maxNodeWidth: number,
  alignToMaxWidth = false,
): { title: string; width: number } {
  if (node.synthetic) {
    const syntheticTitle = getNodeTitle(node, mapping) || "Selected roots";
    return {
      title: syntheticTitle,
      width: alignToMaxWidth ? maxNodeWidth : clamp(232, minNodeWidth, maxNodeWidth),
    };
  }

  const title = sanitizeNodeLabel(getNodeTitle(node, mapping) || nodeKey);
  const estimatedContentWidth = estimateTextWidth(title, 15);
  const width = alignToMaxWidth ? maxNodeWidth : clamp(132 + estimatedContentWidth, minNodeWidth, maxNodeWidth);
  return { title: title || nodeKey, width };
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}...`;
}

export function truncateTitleToWidth(text: string, nodeWidth: number): string {
  const availableWidth = Math.max(nodeWidth - 74, 72);
  const estimatedMaxLength = Math.max(10, Math.floor(availableWidth / 7.1));
  return truncate(text, estimatedMaxLength);
}

export function estimateTextWidth(text: string, fontSize: number): number {
  return Array.from(String(text || "")).reduce((width, character) => width + getCharacterEmWidth(character) * fontSize, 0);
}

function getCharacterEmWidth(character: string): number {
  if (/[\u0300-\u036f]/.test(character)) {
    return 0;
  }
  if (/\s/.test(character)) {
    return 0.32;
  }
  if (isCjkCharacter(character) || /[\u3000-\u303f\uff00-\uffef]/.test(character)) {
    return 1;
  }
  if (/[MW@#%&]/.test(character)) {
    return 0.88;
  }
  if (/[A-Z0-9]/.test(character)) {
    return 0.66;
  }
  if (/[ilI|.,'`!;:]/.test(character)) {
    return 0.34;
  }
  if (/[-_/\\()[\]{}]/.test(character)) {
    return 0.46;
  }
  return 0.56;
}

function isCjkCharacter(character: string): boolean {
  return /[\u3400-\u9fff\uf900-\ufaff]/.test(character);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
