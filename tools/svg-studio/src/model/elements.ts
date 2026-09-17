import { uid } from './utils';
import type { ElementType, StudioElement } from './types';

export const typeNames = {
  rect: ['Rectangle', 'RECTANGLE'],
  circle: ['Circle', 'CIRCLE'],
  ellipse: ['Ellipse', 'ELLIPSE'],
  triangle: ['Triangle', 'POLYGON'],
  diamond: ['Diamond', 'POLYGON'],
  polygon: ['Polygon', 'POLYGON'],
  star: ['Star', 'STAR'],
  line: ['Line', 'LINE'],
  arrow: ['Arrow', 'ARROW'],
  arc: ['Arc', 'ARC'],
  polyline: ['Polyline', 'POLYLINE'],
  bezier: ['Bezier curve', 'BEZIER'],
  text: ['Text', 'TEXT'],
  path: ['Path', 'PATH'],
  image: ['Image', 'IMAGE'],
  icon: ['Icon', 'ICON'],
  group: ['Group', 'GROUP'],
  raw: ['Imported artwork', 'IMPORTED SVG'],
};

export const palettes = [
  ['#7656EE', '#FF7B72', '#FFCA68', '#F7F5FF'],
  ['#155E75', '#67E8F9', '#FB7185', '#FFF7ED'],
  ['#111827', '#A3E635', '#E2E8F0', '#FFFFFF'],
  ['#B45309', '#FBBF24', '#7C3AED', '#F5F3FF'],
  ['#0F766E', '#5EEAD4', '#FDE68A', '#F0FDFA'],
  ['#9F1239', '#FDA4AF', '#312E81', '#EEF2FF'],
];

export const iconPaths: Record<string, string> = {
  heart:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z"/>',
  bolt: '<path d="m13 2-9 12h8l-1 8 9-12h-8z"/>',
  sparkle:
    '<path d="m12 3-1.5 5.5L5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5Z"/><path d="m19 16-.6 2.4L16 19l2.4.6L19 22l.6-2.4L22 19l-2.4-.6Z"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  leaf: '<path d="M20 4C12 4 5 7 5 14c0 3 2 5 5 5 7 0 10-7 10-15Z"/><path d="M4 20c3-5 7-8 12-10"/>',
  wave: '<path d="M3 9c3-4 5 4 9 0s6 4 9 0M3 15c3-4 5 4 9 0s6 4 9 0"/>',
};

export function makeElement(
  type: ElementType,
  overrides: Partial<StudioElement> = {},
): StudioElement {
  const strokeOnly = ['line', 'path', 'arrow', 'arc', 'polyline', 'bezier'].includes(type);
  const defaults: StudioElement = {
    id: uid(),
    type,
    name: typeNames[type]?.[0] || 'Shape',
    x: 320,
    y: 220,
    width: 180,
    height: 120,
    rotation: 0,
    fill: strokeOnly ? 'none' : '#7656EE',
    stroke: strokeOnly ? '#1C1A21' : 'none',
    strokeWidth: strokeOnly ? 3 : 0,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeDasharray: '',
    fillOpacity: 1,
    strokeOpacity: 1,
    opacity: 1,
    blendMode: 'normal',
    radius: 0,
    hidden: false,
    locked: false,
  };
  if (type === 'circle' || type === 'ellipse') Object.assign(defaults, { width: 150, height: 150 });
  if (['triangle', 'diamond', 'polygon', 'star'].includes(type))
    Object.assign(defaults, { width: 150, height: 150 });
  if (type === 'polygon') Object.assign(defaults, { sides: 6 });
  if (type === 'star') Object.assign(defaults, { pointsCount: 5, innerRatio: 0.43 });
  if (['line', 'arrow', 'polyline', 'bezier'].includes(type))
    Object.assign(defaults, { width: 180, height: 80 });
  if (type === 'line')
    Object.assign(defaults, {
      points: [
        [0, 80],
        [180, 0],
      ],
    });
  if (type === 'polyline')
    Object.assign(defaults, {
      points: [
        [0, 58],
        [50, 14],
        [104, 66],
        [180, 18],
      ],
    });
  if (type === 'bezier')
    Object.assign(defaults, {
      points: [
        [0, 64],
        [48, 0],
        [132, 80],
        [180, 16],
      ],
    });
  if (type === 'arc')
    Object.assign(defaults, { width: 160, height: 160, arcStart: 200, arcEnd: 340 });
  if (type === 'text')
    Object.assign(defaults, {
      width: 220,
      height: 50,
      text: 'Double-click to edit',
      fontSize: 36,
      fontWeight: 700,
      fontFamily: 'Manrope, Arial, sans-serif',
      textAlign: 'start',
      letterSpacing: 0,
      lineHeight: 1.2,
    });
  if (type === 'image')
    Object.assign(defaults, {
      width: 240,
      height: 160,
      fill: 'none',
      stroke: 'none',
      href: '',
      preserveAspectRatio: 'xMidYMid meet',
    });
  if (type === 'icon')
    Object.assign(defaults, {
      width: 100,
      height: 100,
      fill: 'none',
      stroke: '#7656EE',
      strokeWidth: 1.8,
      icon: 'heart',
    });
  if (type === 'path') Object.assign(defaults, { points: [], smooth: false });
  if (type === 'group')
    Object.assign(defaults, {
      children: [],
      sourceWidth: 180,
      sourceHeight: 120,
      fill: 'mixed',
      stroke: 'mixed',
    });
  return Object.assign(defaults, overrides);
}

export const defaultElements = () => [
  makeElement('rect', {
    name: 'Background card',
    x: 100,
    y: 80,
    width: 760,
    height: 480,
    radius: 34,
    fill: '#F4F1FF',
    stroke: 'none',
  }),
  makeElement('ellipse', {
    name: 'Sun circle',
    x: 655,
    y: 114,
    width: 144,
    height: 144,
    fill: '#FFCA68',
    stroke: 'none',
  }),
  makeElement('star', {
    name: 'Accent star',
    x: 714,
    y: 390,
    width: 92,
    height: 92,
    fill: '#FF716A',
    stroke: 'none',
    rotation: 12,
  }),
  makeElement('path', {
    name: 'Flowing line',
    x: 474,
    y: 326,
    width: 205,
    height: 96,
    fill: 'none',
    stroke: '#7656EE',
    strokeWidth: 15,
    points: [
      [0, 63],
      [37, 6],
      [91, 79],
      [139, 13],
      [205, 55],
    ],
    smooth: true,
  }),
  makeElement('text', {
    name: 'Headline',
    x: 160,
    y: 180,
    width: 430,
    height: 82,
    fill: '#1C1A21',
    stroke: 'none',
    text: 'Shape ideas',
    fontSize: 68,
    fontWeight: 800,
  }),
  makeElement('text', {
    name: 'Subtitle',
    x: 165,
    y: 286,
    width: 280,
    height: 46,
    fill: '#6F697B',
    stroke: 'none',
    text: 'Make something remarkable.',
    fontSize: 22,
    fontWeight: 500,
  }),
  makeElement('rect', {
    name: 'Pill',
    x: 165,
    y: 376,
    width: 166,
    height: 44,
    radius: 22,
    fill: '#1C1A21',
    stroke: 'none',
  }),
  makeElement('text', {
    name: 'Pill label',
    x: 191,
    y: 385,
    width: 125,
    height: 25,
    fill: '#FFFFFF',
    stroke: 'none',
    text: 'VECTOR STUDY',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 2,
  }),
];
