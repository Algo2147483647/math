import { SVG_NS, safeFilename } from '../model/utils';
import type { StudioDocument } from '../model/types';
import { buildSvgElement } from './render';

export function serializeSvg(doc: StudioDocument): string {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('viewBox', `0 0 ${doc.canvas.width} ${doc.canvas.height}`);
  svg.setAttribute('width', String(doc.canvas.width));
  svg.setAttribute('height', String(doc.canvas.height));
  if (doc.sharedDefs) {
    const defs = document.createElementNS(SVG_NS, 'defs');
    defs.innerHTML = doc.sharedDefs;
    svg.append(defs);
  }
  if (doc.canvas.background !== 'transparent') {
    const bg = document.createElementNS(SVG_NS, 'rect');
    bg.setAttribute('width', '100%');
    bg.setAttribute('height', '100%');
    bg.setAttribute('fill', doc.canvas.background);
    svg.append(bg);
  }
  doc.elements
    .filter((e) => !e.hidden)
    .forEach((e) => {
      const node = buildSvgElement(e, true, false);
      if (node) svg.append(node);
    });
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svg);
}
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function exportDocument(doc: StudioDocument, format: 'svg' | 'png', scale = 2) {
  const blob = new Blob([serializeSvg(doc)], { type: 'image/svg+xml;charset=utf-8' }),
    name = safeFilename(doc.title);
  if (format === 'svg') {
    downloadBlob(blob, `${name}.svg`);
    return;
  }
  if (doc.canvas.width * doc.canvas.height * scale * scale > 64_000_000)
    throw new Error('Choose a smaller PNG scale (maximum 64 megapixels).');
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = doc.canvas.width * scale;
    canvas.height = doc.canvas.height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('PNG rendering is unavailable.');
    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0);
    const png = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) => (value ? resolve(value) : reject(new Error('PNG rendering failed.'))),
        'image/png',
      ),
    );
    downloadBlob(png, `${name}@${scale}x.png`);
  } finally {
    URL.revokeObjectURL(url);
  }
}
