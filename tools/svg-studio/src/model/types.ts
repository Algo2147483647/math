export type Point = [number, number];
export type Matrix = [number, number, number, number, number, number];
export type Bounds = { x: number; y: number; width: number; height: number };
export type ElementType =
  | 'rect'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'polygon'
  | 'star'
  | 'line'
  | 'arrow'
  | 'arc'
  | 'polyline'
  | 'bezier'
  | 'text'
  | 'path'
  | 'image'
  | 'icon'
  | 'group'
  | 'raw';
export type Tool =
  'select' | 'node' | 'rect' | 'ellipse' | 'line' | 'polyline' | 'bezier' | 'text' | 'hand';
export interface StudioElement extends Bounds {
  id: string;
  type: ElementType;
  name: string;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  fillOpacity: number;
  strokeOpacity: number;
  strokeLinecap: string;
  strokeLinejoin: string;
  strokeDasharray: string;
  blendMode: string;
  radius: number;
  hidden: boolean;
  locked: boolean;
  affine?: Matrix;
  points?: Point[];
  children?: StudioElement[];
  sides?: number;
  pointsCount?: number;
  innerRatio?: number;
  smooth?: boolean;
  arcStart?: number;
  arcEnd?: number;
  closed?: boolean;
  text?: string;
  fontSize?: number;
  fontWeight?: number | string;
  fontFamily?: string;
  textAlign?: string;
  letterSpacing?: number;
  lineHeight?: number;
  href?: string;
  preserveAspectRatio?: string;
  icon?: string;
  raw?: string;
  rawTag?: string;
  sourceWidth?: number;
  sourceHeight?: number;
  sourceX?: number;
  sourceY?: number;
  overrideFill?: boolean;
  overrideStroke?: boolean;
  overrideStrokeWidth?: boolean;
  overrideStrokeStyle?: boolean;
  overrideFillOpacity?: boolean;
  overrideStrokeOpacity?: boolean;
}
export interface StudioDocument {
  version: 3;
  title: string;
  canvas: { width: number; height: number; background: string };
  elements: StudioElement[];
  sharedDefs: string;
}
export interface EditorView {
  selectedIds: string[];
  tool: Tool;
  nodeIndex: number | null;
  zoom: number;
  pan: Point;
  grid: boolean;
  snap: boolean;
  leftPanel: boolean;
  rightPanel: boolean;
  inspectorTab: 'design' | 'layers';
  assetTab: 'shapes' | 'templates';
  toast: string;
  saveStatus: 'saved' | 'saving' | 'error';
  modal: 'export' | 'shortcuts' | null;
  contextMenu: Point | null;
  revision: number;
}
