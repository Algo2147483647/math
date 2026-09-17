import { useEffect } from 'react';
import type { EmbeddedFont } from './types';
export const fontFamilies = {
  'Sans serif': [
    'Arial',
    'Arial Narrow',
    'Calibri',
    'Candara',
    'Century Gothic',
    'Corbel',
    'Franklin Gothic Medium',
    'Gill Sans',
    'Helvetica',
    'Impact',
    'Lucida Sans Unicode',
    'Segoe UI',
    'Tahoma',
    'Trebuchet MS',
    'Verdana',
    'Noto Sans',
    'Microsoft YaHei',
    'SimHei',
  ],
  Serif: [
    'Baskerville',
    'Book Antiqua',
    'Cambria',
    'Constantia',
    'Garamond',
    'Georgia',
    'Palatino Linotype',
    'Times New Roman',
    'Noto Serif',
    'SimSun',
  ],
  Monospace: ['Cascadia Code', 'Consolas', 'Courier New', 'Lucida Console', 'Monaco'],
  Display: [
    'Brush Script MT',
    'Comic Sans MS',
    'Copperplate',
    'Papyrus',
    'Segoe Print',
    'Segoe Script',
  ],
};
const loaded = new Map<string, Promise<FontFace>>();
export function loadFont(font: EmbeddedFont): Promise<FontFace> {
  let promise = loaded.get(font.family);
  if (!promise) {
    const face = new FontFace(font.family, `url("${font.data}")`);
    promise = face
      .load()
      .then((value) => {
        document.fonts.add(value);
        return value;
      })
      .catch((error) => {
        loaded.delete(font.family);
        throw error;
      });
    loaded.set(font.family, promise);
  }
  return promise;
}
export function useDocumentFonts(fonts: EmbeddedFont[] | undefined, onError: () => void) {
  useEffect(() => {
    let mounted = true;
    Promise.all((fonts || []).map(loadFont)).catch(() => {
      if (mounted) onError();
    });
    return () => {
      mounted = false;
    };
  }, [fonts, onError]);
}
export function fontCss(fonts: EmbeddedFont[] = []): string {
  return fonts
    .filter(
      (f) => /^Vectora_[\w-]+$/.test(f.family) && /^data:[\w.+/-]*;base64,[\w+/=]+$/.test(f.data),
    )
    .map(
      (font) =>
        `@font-face{font-family:"${font.family}";src:url("${font.data}");font-display:block;}`,
    )
    .join('\n');
}
