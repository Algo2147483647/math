import { SVG_NS } from '../model/utils';
export function readImportedText(raw: string): string {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.innerHTML = raw;
  return svg.querySelector('text')?.textContent || '';
}
export function writeImportedText(raw: string, text: string): string {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.innerHTML = raw;
  const node = svg.querySelector('text');
  if (node) {
    node.replaceChildren();
    text.split('\n').forEach((line, i) => {
      const span = document.createElementNS(SVG_NS, 'tspan');
      span.setAttribute('x', node.getAttribute('x') || '0');
      if (i) span.setAttribute('dy', '1.2em');
      span.textContent = line || ' ';
      node.append(span);
    });
  }
  return svg.innerHTML;
}
