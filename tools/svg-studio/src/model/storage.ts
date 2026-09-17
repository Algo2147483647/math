import { makeElement, defaultElements } from './elements';
import type { StudioDocument, StudioElement } from './types';

export const STORAGE_KEY = 'vectora-svg-studio-v3';
export const blankDocument = (): StudioDocument => ({
  version: 3,
  title: 'Untitled artwork',
  canvas: { width: 960, height: 640, background: 'transparent' },
  elements: [],
  sharedDefs: '',
});
export function hydrateElement(e: StudioElement): StudioElement {
  const result = { ...makeElement(e.type), ...e };
  if (result.children) result.children = result.children.map(hydrateElement);
  return result;
}
export function loadDocument(): StudioDocument {
  for (const key of [STORAGE_KEY, 'vectora-svg-studio-v2', 'vectora-svg-studio-v1']) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      if (
        value &&
        Array.isArray(value.elements) &&
        value.canvas?.width > 0 &&
        value.canvas?.height > 0
      ) {
        return {
          ...blankDocument(),
          ...value,
          version: 3,
          elements: value.elements.map(hydrateElement),
        };
      }
    } catch {
      /* A damaged or inaccessible snapshot must not prevent opening the editor. */
    }
  }
  return { ...blankDocument(), title: 'Shape ideas', elements: defaultElements() };
}
export function persistDocument(doc: StudioDocument): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
}
