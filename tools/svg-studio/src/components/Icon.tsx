const paths: Record<string, string> = {
  select: 'm5 3 14 8-6 2-3 6Z',
  node: 'M5 5h14v14H5ZM3 3h4v4H3Zm14 0h4v4h-4ZM3 17h4v4H3Zm14 0h4v4h-4Z',
  rect: 'M4 5h16v14H4Z',
  circle: 'M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  ellipse: 'M21 12a9 6 0 1 1-18 0 9 6 0 0 1 18 0',
  triangle: 'm12 3 10 18H2Z',
  diamond: 'm12 2 10 10-10 10L2 12Z',
  polygon: 'm7 3 10 0 5 9-5 9H7l-5-9Z',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3l-5.5 2.9 1-6.2L3 9.6l6.2-.9Z',
  line: 'M4 20 20 4',
  arrow: 'M3 12h18m-6-6 6 6-6 6',
  arc: 'M4 18a9 9 0 1 1 16 0',
  polyline: 'm3 18 6-12 6 12 6-12',
  path: 'm3 18 6-12 6 12 6-12',
  bezier: 'M3 18C5 2 19 2 21 18M3 18 6 6m15 12-3-12M4 4h4v4H4Zm12 0h4v4h-4Z',
  text: 'M4 5h16M12 5v15M8 20h8',
  hand: 'M7 11V7a1.5 1.5 0 0 1 3 0v3-6a1.5 1.5 0 0 1 3 0v6-5a1.5 1.5 0 0 1 3 0v5-2a1.5 1.5 0 0 1 3 0v6c0 4-3 7-6 7h-2c-3 0-5-4-7-6a1.5 1.5 0 0 1 2-2l1 1Z',
  group: 'M3 3h8v8H3Zm10 10h8v8h-8ZM15 4h5v5M4 15v5h5',
  ungroup: 'M3 3h8v8H3Zm10 10h8v8h-8ZM20 4h-5v5M4 20v-5h5',
  undo: 'm8 5-5 5 5 5M3 10h10a7 7 0 0 1 7 7',
  redo: 'm16 5 5 5-5 5M21 10H11a7 7 0 0 0-7 7',
  import: 'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4',
  export: 'M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5',
  layers: 'm12 3 10 6-10 6L2 9Zm-10 10 10 6 10-6M2 17l10 6 10-6',
  search: 'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0m-2 5 6 6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  close: 'm6 6 12 12M6 18 18 6',
  chevron: 'm8 5 7 7-7 7',
  lock: 'M5 10h14v11H5Zm3 0V6a4 4 0 0 1 8 0v4',
  unlock: 'M5 10h14v11H5Zm3 0V6a4 4 0 0 1 7-2',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  hidden: 'm3 3 18 18M4 8l-2 4s4 7 10 7l4-1M8 6l4-1c6 0 10 7 10 7l-2 3',
  copy: 'M8 8h13v13H8ZM16 8V3H3v13h5',
  delete: 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',
  image: 'M3 4h18v16H3Zm1 14 5-5 4 4 3-3 4 4M10 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  leftPanel: 'M3 4h18v16H3ZM9 4v16',
  rightPanel: 'M3 4h18v16H3ZM15 4v16',
  grid: 'M4 4h16v16H4ZM4 12h16M12 4v16',
  settings: 'M4 6h4m4 0h8M4 12h10m4 0h2M4 18h2m4 0h10M8 3v6m6 0v6M6 15v6',
  snap: 'M5 4v10a7 7 0 0 0 14 0V4h-4v10a3 3 0 0 1-6 0V4Z',
  fit: 'M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6',
  check: 'm5 12 4 4L19 6',
  help: 'M9 8a3 3 0 1 1 4 3l-1 3m0 4v.1',
  front: 'M4 9h11v11H4ZM9 4h11v11h-5M16 2v7m-3-4 3-3 3 3',
  back: 'M4 9h11v11H4ZM9 9V4h11v11h-5M8 12v7m-3-3 3 3 3-3',
  heart: 'M12 21 3 12a5 5 0 0 1 9-6 5 5 0 0 1 9 6Z',
  bolt: 'm13 2-9 12h8l-1 8 9-12h-8Z',
  sparkle: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
  leaf: 'M20 3C10 3 4 8 4 14c0 4 2 6 6 6 6 0 10-7 10-17ZM3 21 16 8',
  wave: 'M2 8c5-7 8 7 12 0s7 0 8 0M2 16c5-7 8 7 12 0s7 0 8 0',
  blank: 'M5 3h10l4 4v14H5ZM14 3v5h5M8 14h8m-4-4v8',
};
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.rect} />
    </svg>
  );
}
