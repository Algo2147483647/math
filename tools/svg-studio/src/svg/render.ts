import { SVG_NS } from '../model/utils';
import { iconPaths } from '../model/elements';
import { elementTransform } from '../model/geometry';
import type { Point, StudioElement } from '../model/types';

export function buildSvgElement(element: StudioElement, forExport = false, interactive = true) {
  const group = document.createElementNS(SVG_NS, 'g');
  if (interactive) group.dataset.elementId = element.id;
  group.setAttribute('transform', String(elementTransform(element)));
  group.setAttribute('opacity', String(element.opacity ?? 1));
  if (element.blendMode && element.blendMode !== 'normal')
    group.style.mixBlendMode = element.blendMode;
  if (element.hidden) group.setAttribute('display', String('none'));
  if (element.locked && !forExport) group.classList.add('locked');
  let shape: SVGElement | undefined;
  const common = <T extends SVGElement>(node: T): T => {
    node.setAttribute('fill', String(element.fill || 'none'));
    node.setAttribute('stroke', String(element.stroke || 'none'));
    node.setAttribute('stroke-width', String(element.strokeWidth || 0));
    node.setAttribute('fill-opacity', String(element.fillOpacity ?? 1));
    node.setAttribute('stroke-opacity', String(element.strokeOpacity ?? 1));
    node.setAttribute('stroke-linecap', String(element.strokeLinecap || 'round'));
    node.setAttribute('stroke-linejoin', String(element.strokeLinejoin || 'round'));
    if (element.strokeDasharray)
      node.setAttribute('stroke-dasharray', String(element.strokeDasharray));
    return node;
  };

  if (element.type === 'rect') {
    shape = common(document.createElementNS(SVG_NS, 'rect'));
    shape.setAttribute('width', String(element.width));
    shape.setAttribute('height', String(element.height));
    shape.setAttribute(
      'rx',
      String(Math.min(element.radius || 0, element.width / 2, element.height / 2)),
    );
  } else if (element.type === 'circle') {
    shape = common(document.createElementNS(SVG_NS, 'circle'));
    shape.setAttribute('cx', String(element.width / 2));
    shape.setAttribute('cy', String(element.height / 2));
    shape.setAttribute('r', String(Math.min(element.width, element.height) / 2));
  } else if (element.type === 'ellipse') {
    shape = common(document.createElementNS(SVG_NS, 'ellipse'));
    shape.setAttribute('cx', String(element.width / 2));
    shape.setAttribute('cy', String(element.height / 2));
    shape.setAttribute('rx', String(element.width / 2));
    shape.setAttribute('ry', String(element.height / 2));
  } else if (element.type === 'triangle') {
    shape = common(document.createElementNS(SVG_NS, 'polygon'));
    shape.setAttribute(
      'points',
      String(`${element.width / 2},0 ${element.width},${element.height} 0,${element.height}`),
    );
  } else if (element.type === 'diamond') {
    shape = common(document.createElementNS(SVG_NS, 'polygon'));
    shape.setAttribute(
      'points',
      String(
        `${element.width / 2},0 ${element.width},${element.height / 2} ${element.width / 2},${element.height} 0,${element.height / 2}`,
      ),
    );
  } else if (element.type === 'polygon') {
    shape = common(document.createElementNS(SVG_NS, 'polygon'));
    shape.setAttribute(
      'points',
      String(regularPolygonPoints(element.width, element.height, element.sides || 6)),
    );
  } else if (element.type === 'star') {
    shape = common(document.createElementNS(SVG_NS, 'polygon'));
    shape.setAttribute(
      'points',
      String(
        starPoints(
          element.width,
          element.height,
          element.pointsCount || 5,
          element.innerRatio ?? 0.43,
        ),
      ),
    );
  } else if (element.type === 'line') {
    shape = common(document.createElementNS(SVG_NS, 'line'));
    const pts = element.points || [
      [0, element.height],
      [element.width, 0],
    ];
    shape.setAttribute('x1', String(pts[0][0]));
    shape.setAttribute('y1', String(pts[0][1]));
    shape.setAttribute('x2', String(pts[1][0]));
    shape.setAttribute('y2', String(pts[1][1]));
  } else if (element.type === 'arrow') {
    shape = common(document.createElementNS(SVG_NS, 'path'));
    const head = Math.min(24, Math.max(10, Math.min(element.width, element.height) * 0.32));
    shape.setAttribute(
      'd',
      String(
        `M 0 ${element.height / 2} H ${element.width} M ${element.width - head} ${element.height / 2 - head * 0.65} L ${element.width} ${element.height / 2} L ${element.width - head} ${element.height / 2 + head * 0.65}`,
      ),
    );
  } else if (element.type === 'arc') {
    shape = common(document.createElementNS(SVG_NS, 'path'));
    shape.setAttribute(
      'd',
      String(
        arcPath(element.width, element.height, element.arcStart ?? 200, element.arcEnd ?? 340),
      ),
    );
  } else if (element.type === 'polyline') {
    shape = common(document.createElementNS(SVG_NS, 'polyline'));
    shape.setAttribute(
      'points',
      String((element.points || []).map((point) => point.join(',')).join(' ')),
    );
  } else if (element.type === 'bezier') {
    shape = common(document.createElementNS(SVG_NS, 'path'));
    shape.setAttribute(
      'd',
      String(bezierPath(element.points || []) + (element.closed ? ' Z' : '')),
    );
  } else if (element.type === 'text') {
    shape = common(document.createElementNS(SVG_NS, 'text'));
    const anchor = element.textAlign || 'start';
    const textX = anchor === 'middle' ? element.width / 2 : anchor === 'end' ? element.width : 0;
    shape.setAttribute('x', String(textX));
    shape.setAttribute('y', String(element.fontSize || 36));
    shape.setAttribute('text-anchor', String(anchor));
    shape.setAttribute('font-family', String(element.fontFamily || 'Manrope, Arial, sans-serif'));
    shape.setAttribute('font-size', String(element.fontSize || 36));
    shape.setAttribute('font-weight', String(element.fontWeight || 500));
    shape.setAttribute('letter-spacing', String(element.letterSpacing || 0));
    shape.setAttribute('dominant-baseline', String('auto'));
    String(element.text || 'Text')
      .split('\n')
      .forEach((line, index) => {
        const tspan = document.createElementNS(SVG_NS, 'tspan');
        tspan.textContent = line || ' ';
        tspan.setAttribute('x', String(textX));
        if (index) tspan.setAttribute('dy', String(`${element.lineHeight || 1.2}em`));
        shape!.appendChild(tspan);
      });
  } else if (element.type === 'image') {
    shape = document.createElementNS(SVG_NS, 'image');
    shape.setAttribute('href', String(element.href || ''));
    shape.setAttribute('width', String(element.width));
    shape.setAttribute('height', String(element.height));
    shape.setAttribute(
      'preserveAspectRatio',
      String(element.preserveAspectRatio || 'xMidYMid meet'),
    );
  } else if (element.type === 'path') {
    shape = common(document.createElementNS(SVG_NS, 'path'));
    shape.setAttribute('d', String(pointsToPath(element.points || [], element.smooth)));
  } else if (element.type === 'icon') {
    const inner = document.createElementNS(SVG_NS, 'g');
    inner.innerHTML = iconPaths[element.icon || 'heart'] || iconPaths.heart;
    inner.setAttribute('transform', String(`scale(${element.width / 24} ${element.height / 24})`));
    inner.setAttribute('fill', String(element.fill || 'none'));
    inner.setAttribute('stroke', String(element.stroke || '#7656EE'));
    inner.setAttribute('stroke-width', String(element.strokeWidth || 1.8));
    inner.setAttribute('stroke-linecap', String(element.strokeLinecap || 'round'));
    inner.setAttribute('stroke-linejoin', String(element.strokeLinejoin || 'round'));
    shape = inner;
  } else if (element.type === 'group') {
    const inner = document.createElementNS(SVG_NS, 'g');
    const sx = element.width / Math.max(1, element.sourceWidth || element.width),
      sy = element.height / Math.max(1, element.sourceHeight || element.height);
    inner.setAttribute('transform', String(`scale(${sx} ${sy})`));
    (element.children || []).forEach((child) => {
      const childNode = buildSvgElement(child, forExport, false);
      if (childNode) inner.appendChild(childNode);
    });
    shape = inner;
  } else if (element.type === 'raw') {
    const inner = document.createElementNS(SVG_NS, 'g');
    inner.innerHTML = element.raw || '';
    applyRawOverrides(inner, element);
    const sx = element.width / (element.sourceWidth || element.width),
      sy = element.height / (element.sourceHeight || element.height);
    inner.setAttribute(
      'transform',
      String(
        `translate(${-(element.sourceX || 0) * sx} ${-(element.sourceY || 0) * sy}) scale(${sx} ${sy})`,
      ),
    );
    shape = inner;
  }
  if (!shape) return null;
  if (
    !forExport &&
    interactive &&
    ['line', 'polyline', 'path', 'bezier', 'arc', 'arrow'].includes(element.type)
  ) {
    const hit = shape.cloneNode(true) as SVGElement;
    hit.setAttribute('fill', 'none');
    hit.setAttribute('stroke', 'transparent');
    hit.setAttribute('stroke-width', String(Math.max(12, element.strokeWidth)));
    hit.setAttribute('pointer-events', 'stroke');
    hit.setAttribute('data-hit-area', 'true');
    group.appendChild(hit);
  }
  group.appendChild(shape);
  return group;
}

function applyRawOverrides(container: SVGElement, element: StudioElement) {
  if (
    !element.overrideFill &&
    !element.overrideStroke &&
    !element.overrideStrokeWidth &&
    !element.overrideStrokeStyle &&
    !element.overrideFillOpacity &&
    !element.overrideStrokeOpacity
  )
    return;
  container
    .querySelectorAll<SVGElement>('path,rect,circle,ellipse,line,polyline,polygon,text,use,image')
    .forEach((target) => {
      if (element.overrideFill)
        target.style.setProperty('fill', element.fill || 'none', 'important');
      if (element.overrideStroke)
        target.style.setProperty('stroke', element.stroke || 'none', 'important');
      if (element.overrideStrokeWidth)
        target.style.setProperty('stroke-width', String(element.strokeWidth || 0), 'important');
      if (element.overrideStrokeStyle) {
        target.style.setProperty('stroke-linecap', element.strokeLinecap || 'round', 'important');
        target.style.setProperty('stroke-linejoin', element.strokeLinejoin || 'round', 'important');
        target.style.setProperty(
          'stroke-dasharray',
          element.strokeDasharray || 'none',
          'important',
        );
      }
      if (element.overrideFillOpacity)
        target.style.setProperty('fill-opacity', String(element.fillOpacity ?? 1), 'important');
      if (element.overrideStrokeOpacity)
        target.style.setProperty('stroke-opacity', String(element.strokeOpacity ?? 1), 'important');
    });
}

function starPoints(width: number, height: number, points = 5, innerRatio = 0.43) {
  const cx = width / 2,
    cy = height / 2,
    outer = Math.min(width, height) / 2,
    inner = outer * innerRatio;
  return Array.from({ length: points * 2 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / points,
      radius = index % 2 ? inner : outer;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(' ');
}

function regularPolygonPoints(width: number, height: number, sides = 6) {
  const cx = width / 2,
    cy = height / 2,
    radiusX = width / 2,
    radiusY = height / 2;
  return Array.from({ length: sides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
    return `${cx + Math.cos(angle) * radiusX},${cy + Math.sin(angle) * radiusY}`;
  }).join(' ');
}

function arcPath(width: number, height: number, startDegrees: number, endDegrees: number) {
  const cx = width / 2,
    cy = height / 2,
    rx = width / 2,
    ry = height / 2;
  const pointAt = (degrees: number) => {
    const angle = ((degrees - 90) * Math.PI) / 180;
    return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)];
  };
  const start = pointAt(startDegrees),
    end = pointAt(endDegrees);
  let sweep = (((endDegrees - startDegrees) % 360) + 360) % 360;
  if (!sweep) sweep = 359.999;
  return `M ${start[0]} ${start[1]} A ${rx} ${ry} 0 ${sweep > 180 ? 1 : 0} 1 ${end[0]} ${end[1]}`;
}

export function bezierPath(points: Point[]) {
  if (points.length < 4) return '';
  let d = `M ${points[0].join(' ')}`;
  for (let i = 1; i + 2 < points.length; i += 3)
    d += ` C ${points
      .slice(i, i + 3)
      .map((p) => p.join(' '))
      .join(' ')}`;
  return d;
}

export function pointsToPath(points: Point[], smooth = false) {
  if (!points.length) return '';
  if (!smooth || points.length < 3)
    return `M ${points.map((point) => point.join(' ')).join(' L ')}`;
  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i],
      next = points[i + 1];
    path += ` Q ${current[0]} ${current[1]} ${(current[0] + next[0]) / 2} ${(current[1] + next[1]) / 2}`;
  }
  const last = points[points.length - 1];
  return `${path} T ${last[0]} ${last[1]}`;
}
