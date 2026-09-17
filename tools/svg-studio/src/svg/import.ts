import { SVG_NS } from '../model/utils';
import { makeElement } from '../model/elements';
import type { StudioDocument, StudioElement } from '../model/types';
import { editablePath } from './editablePath';

export async function parseSvg(text: string, name = 'Imported artwork'): Promise<StudioDocument> {
  const parser = new DOMParser(),
    doc = parser.parseFromString(text, 'image/svg+xml');
  if (doc.querySelector('parsererror') || doc.documentElement.tagName.toLowerCase() !== 'svg')
    throw new Error('This is not a valid SVG file');
  const root = doc.documentElement as unknown as SVGSVGElement;
  sanitizeSvg(root);
  const importToken = `imp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}_`;
  const namespace = namespaceSvgResources(root, importToken);
  const viewBoxValues = (root.getAttribute('viewBox') || '')
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  const hasViewBox = viewBoxValues.length === 4 && viewBoxValues.every(Number.isFinite);
  let width = hasViewBox ? viewBoxValues[2] : parseFloat(root.getAttribute('width') || '') || 960;
  let height = hasViewBox ? viewBoxValues[3] : parseFloat(root.getAttribute('height') || '') || 640;
  const sourceX = hasViewBox ? viewBoxValues[0] : 0,
    sourceY = hasViewBox ? viewBoxValues[1] : 0;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    width = 960;
    height = 640;
  }

  const styles = [...root.querySelectorAll('style')];
  styles.forEach((style) => {
    style.textContent = scopeCss(style.textContent || '', importToken);
  });
  const rootStyles = styles
    .filter((style) => !style.closest('defs'))
    .map((style) => style.outerHTML)
    .join('');
  const defsMarkup =
    [...root.querySelectorAll(':scope > defs')].map((defs) => defs.innerHTML).join('') + rootStyles;
  const graphicsSelector = 'path,rect,circle,ellipse,line,polyline,polygon,text,image,use';
  const sourceNodes = [...root.querySelectorAll<SVGGraphicsElement>(graphicsSelector)].filter(
    (node) => !node.closest('defs,clipPath,mask,marker,pattern,symbol'),
  );
  if (!sourceNodes.length) throw new Error('The SVG contains no editable graphic elements');

  const measureSvg = document.createElementNS(SVG_NS, 'svg');
  measureSvg.setAttribute('viewBox', `${sourceX} ${sourceY} ${width} ${height}`);
  measureSvg.setAttribute('width', String(width));
  measureSvg.setAttribute('height', String(height));
  Object.assign(measureSvg.style, {
    position: 'fixed',
    left: '-20000px',
    top: '0',
    opacity: '0',
    pointerEvents: 'none',
    overflow: 'visible',
  });
  if (defsMarkup) {
    const defs = document.createElementNS(SVG_NS, 'defs');
    defs.innerHTML = defsMarkup;
    measureSvg.appendChild(defs);
  }
  const measurementRecords = sourceNodes.slice(0, 2000).map((source, index) => {
    const { content, leaf } = cloneGraphicWithAncestors(source, root);
    const container = document.createElementNS(SVG_NS, 'g');
    container.dataset.svgScope = importToken;
    container.appendChild(content);
    measureSvg.appendChild(container);
    return { source, content, leaf, container, index };
  });
  document.body.appendChild(measureSvg);
  if (document.fonts?.ready) await document.fonts.ready;
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  const scale = 1,
    offsetX = 0,
    offsetY = 0;
  const imported: StudioElement[] = [];
  measurementRecords.forEach((record) => {
    try {
      const bbox = transformedSvgBBox(record.leaf);
      if (!bbox || ![bbox.x, bbox.y, bbox.width, bbox.height].every(Number.isFinite)) return;
      const computed = getComputedStyle(record.leaf);
      record.leaf.removeAttribute('data-import-leaf');
      const elementName = importedElementName(record.source, record.index, namespace, name);
      const nativePath = editablePath(record.leaf, elementName, sourceX, sourceY);
      if (nativePath) {
        imported.push(nativePath);
        return;
      }
      const sourceWidth = bbox.width > 0.001 ? bbox.width : 1,
        sourceHeight = bbox.height > 0.001 ? bbox.height : 1;
      const elementSourceX = bbox.width > 0.001 ? bbox.x : bbox.x - 0.5;
      const elementSourceY = bbox.height > 0.001 ? bbox.y : bbox.y - 0.5;
      imported.push(
        makeElement('raw', {
          name: elementName,
          rawTag: record.source.localName.toLowerCase(),
          x: offsetX + (elementSourceX - sourceX) * scale,
          y: offsetY + (elementSourceY - sourceY) * scale,
          width: sourceWidth * scale,
          height: sourceHeight * scale,
          sourceWidth,
          sourceHeight,
          sourceX: elementSourceX,
          sourceY: elementSourceY,
          raw: record.container.outerHTML,
          fill: computed.fill || 'none',
          stroke: computed.stroke || 'none',
          strokeWidth: parseFloat(computed.strokeWidth) || 0,
          opacity: 1,
          overrideFill: false,
          overrideStroke: false,
          overrideStrokeWidth: false,
        }),
      );
    } catch {
      /* Ignore SVG nodes that cannot produce geometry. */
    }
  });
  measureSvg.remove();
  if (!imported.length) throw new Error('Unable to parse SVG graphics');
  return {
    version: 3,
    title: name,
    canvas: { width, height, background: 'transparent' },
    elements: imported,
    sharedDefs: defsMarkup,
  };
}

export function sanitizeSvg(root: Element) {
  root
    .querySelectorAll(
      'script, foreignObject, iframe, object, embed, animate, animateTransform, set',
    )
    .forEach((node) => node.remove());
  [root, ...root.querySelectorAll('*')].forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase(),
        value = attribute.value.trim().toLowerCase();
      if (
        name.startsWith('on') ||
        ((name === 'href' || name.endsWith(':href')) &&
          !value.startsWith('#') &&
          !/^data:image\/(png|jpeg|webp|gif);base64,/.test(value))
      )
        node.removeAttribute(attribute.name);
      if (/url\(/i.test(value) && /url\(\s*['"]?(?!#)[^)]/i.test(value)) {
        node.setAttribute(
          attribute.name,
          attribute.value.replace(
            /url\(\s*(['"]?)([^)]+)\1\s*\)/gi,
            (match: string, _quote: string, url: string) =>
              url.trim().startsWith('#') ? match : 'none',
          ),
        );
      }
    });
  });
  root.querySelectorAll('style').forEach((style) => {
    style.textContent = (style.textContent || '')
      .replace(/@import[^;]+;?/gi, '')
      .replace(/url\(\s*(['"]?)([^)]+)\1\s*\)/gi, (match: string, _quote: string, url: string) =>
        url.trim().startsWith('#') ? match : 'none',
      );
  });
}

function namespaceSvgResources(root: Element, prefix: string) {
  const ids = new Map<string, string>(),
    classes = new Map<string, string>();
  root.querySelectorAll('[id]').forEach((node) => ids.set(node.id, `${prefix}${node.id}`));
  root.querySelectorAll('[class]').forEach((node) =>
    node.classList.forEach((className) => {
      if (!classes.has(className)) classes.set(className, `${prefix}${className}`);
    }),
  );
  root.querySelectorAll('*').forEach((node) => {
    if (node.id && ids.has(node.id)) node.id = ids.get(node.id)!;
    if (node.hasAttribute('class'))
      node.setAttribute(
        'class',
        [...node.classList].map((className) => classes.get(className) || className).join(' '),
      );
    [...node.attributes].forEach((attribute) => {
      if (attribute.name === 'id' || attribute.name === 'class') return;
      let value = attribute.value;
      ids.forEach((replacement, original) => {
        value = value.replace(
          new RegExp(`url\\(\\s*(['"]?)#${escapeRegExp(original)}\\1\\s*\\)`, 'g'),
          `url(#${replacement})`,
        );
        if (
          (attribute.name === 'href' || attribute.name.endsWith(':href')) &&
          value === `#${original}`
        )
          value = `#${replacement}`;
      });
      if (attribute.name === 'aria-labelledby' || attribute.name === 'aria-describedby')
        value = value
          .split(/\s+/)
          .map((token) => ids.get(token) || token)
          .join(' ');
      if (value !== attribute.value) node.setAttribute(attribute.name, value);
    });
  });
  root.querySelectorAll('style').forEach((style) => {
    let css = style.textContent || '';
    ids.forEach((replacement, original) => {
      css = css.replace(new RegExp(`#${escapeRegExp(original)}(?![\\w-])`, 'g'), `#${replacement}`);
    });
    classes.forEach((replacement, original) => {
      css = css.replace(
        new RegExp(`\\.${escapeRegExp(original)}(?![\\w-])`, 'g'),
        `.${replacement}`,
      );
    });
    style.textContent = css;
  });
  return {
    originalId: new Map([...ids].map(([original, replacement]) => [replacement, original])),
    originalClass: new Map([...classes].map(([original, replacement]) => [replacement, original])),
  };
}

function cloneGraphicWithAncestors(source: SVGGraphicsElement, root: SVGSVGElement) {
  const leaf = source.cloneNode(true) as SVGGraphicsElement;
  leaf.setAttribute('data-import-leaf', 'true');
  let content: Element = leaf,
    ancestor: Element | null = source.parentElement;
  while (ancestor && ancestor !== root) {
    if (ancestor.localName.toLowerCase() === 'defs') break;
    const wrapper = ancestor.cloneNode(false) as Element;
    wrapper.removeAttribute('id');
    wrapper.appendChild(content);
    content = wrapper;
    ancestor = ancestor.parentElement;
  }
  if (root.attributes.length) {
    const wrapper = document.createElementNS(SVG_NS, 'g');
    [...root.attributes]
      .filter(
        (a) =>
          !['id', 'width', 'height', 'viewBox', 'xmlns', 'xmlns:xlink', 'version'].includes(a.name),
      )
      .forEach((a) => wrapper.setAttribute(a.name, a.value));
    wrapper.appendChild(content);
    content = wrapper;
  }
  return { content, leaf };
}

function transformedSvgBBox(node: SVGGraphicsElement) {
  const box = node.getBBox(),
    matrix = node.ownerSVGElement?.getCTM()?.inverse().multiply(node.getCTM()!);
  if (!matrix) return { x: box.x, y: box.y, width: box.width, height: box.height };
  const corners = [
    [box.x, box.y],
    [box.x + box.width, box.y],
    [box.x + box.width, box.y + box.height],
    [box.x, box.y + box.height],
  ].map(([x, y]) => {
    const point = new DOMPoint(x, y).matrixTransform(matrix);
    return { x: point.x, y: point.y };
  });
  const xs = corners.map((point) => point.x),
    ys = corners.map((point) => point.y);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

function importedElementName(
  node: Element,
  index: number,
  namespace: { originalId: Map<string, string>; originalClass: Map<string, string> },
  documentName: string,
) {
  const label = node.getAttribute('aria-label');
  if (label) return label.trim().slice(0, 40);
  if (node.id) return (namespace.originalId.get(node.id) || node.id).slice(0, 40);
  if (node.localName.toLowerCase() === 'text') {
    const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
    if (text) return text.slice(0, 40);
  }
  const firstClass = [...node.classList][0];
  if (firstClass) return (namespace.originalClass.get(firstClass) || firstClass).slice(0, 40);
  const names: Record<string, string> = {
    rect: 'Rectangle',
    circle: 'Circle',
    ellipse: 'Ellipse',
    line: 'Line',
    polyline: 'Polyline',
    polygon: 'Polygon',
    path: 'Path',
    image: 'Image',
    use: 'Reference',
  };
  return `${documentName} · ${names[node.localName.toLowerCase()] || 'Element'} ${index + 1}`;
}

function escapeRegExp(value: string) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Prefix all imported CSS selectors so SVG styles cannot restyle the application.
function scopeCss(css: string, token: string): string {
  const sheet = new CSSStyleSheet();
  try {
    sheet.replaceSync(css);
  } catch {
    return '';
  }
  return [...sheet.cssRules]
    .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
    .map((rule) => {
      const selectors = rule.selectorText
        .split(',')
        .map((selector) => `[data-svg-scope="${token}"] ${selector.trim()}`)
        .join(',');
      return `${selectors} { ${rule.style.cssText} }`;
    })
    .join('\n');
}
