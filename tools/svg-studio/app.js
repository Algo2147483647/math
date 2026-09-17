(() => {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const STORAGE_KEY = 'vectora-svg-studio-v1';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const round = (value, precision = 1) => Math.round(value / precision) * precision;
  const uid = () => `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const deepCopy = value => JSON.parse(JSON.stringify(value));
  const escapeXml = value => String(value).replace(/[<>&'\"]/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char]);

  const typeNames = {
    rect: ['矩形', 'RECTANGLE'], circle: ['圆形', 'CIRCLE'], ellipse: ['椭圆', 'ELLIPSE'], triangle: ['三角形', 'POLYGON'],
    diamond: ['菱形', 'POLYGON'], polygon: ['多边形', 'POLYGON'], star: ['星形', 'STAR'],
    line: ['直线', 'LINE'], arrow: ['箭头', 'ARROW'], arc: ['圆弧', 'ARC'], polyline: ['折线', 'POLYLINE'],
    text: ['文本', 'TEXT'], path: ['路径', 'PATH'], image: ['图片', 'IMAGE'], icon: ['图标', 'ICON'], group: ['组合', 'GROUP'], raw: ['导入图稿', 'IMPORTED SVG']
  };

  const palettes = [
    ['#7656EE', '#FF7B72', '#FFCA68', '#F7F5FF'],
    ['#155E75', '#67E8F9', '#FB7185', '#FFF7ED'],
    ['#111827', '#A3E635', '#E2E8F0', '#FFFFFF'],
    ['#B45309', '#FBBF24', '#7C3AED', '#F5F3FF'],
    ['#0F766E', '#5EEAD4', '#FDE68A', '#F0FDFA'],
    ['#9F1239', '#FDA4AF', '#312E81', '#EEF2FF']
  ];

  const iconPaths = {
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z"/>',
    bolt: '<path d="m13 2-9 12h8l-1 8 9-12h-8z"/>',
    sparkle: '<path d="m12 3-1.5 5.5L5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5Z"/><path d="m19 16-.6 2.4L16 19l2.4.6L19 22l.6-2.4L22 19l-2.4-.6Z"/>',
    arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    leaf: '<path d="M20 4C12 4 5 7 5 14c0 3 2 5 5 5 7 0 10-7 10-15Z"/><path d="M4 20c3-5 7-8 12-10"/>',
    wave: '<path d="M3 9c3-4 5 4 9 0s6 4 9 0M3 15c3-4 5 4 9 0s6 4 9 0"/>'
  };

  const defaultElements = () => [
    makeElement('rect', { name: '背景卡片', x: 100, y: 80, width: 760, height: 480, radius: 34, fill: '#F4F1FF', stroke: 'none' }),
    makeElement('ellipse', { name: '日光圆', x: 655, y: 114, width: 144, height: 144, fill: '#FFCA68', stroke: 'none' }),
    makeElement('star', { name: '装饰星', x: 714, y: 390, width: 92, height: 92, fill: '#FF716A', stroke: 'none', rotation: 12 }),
    makeElement('path', { name: '动态曲线', x: 474, y: 326, width: 205, height: 96, fill: 'none', stroke: '#7656EE', strokeWidth: 15, points: [[0, 63], [37, 6], [91, 79], [139, 13], [205, 55]], smooth: true }),
    makeElement('text', { name: '主标题', x: 160, y: 180, width: 430, height: 82, fill: '#1C1A21', stroke: 'none', text: 'Shape ideas', fontSize: 68, fontWeight: 800 }),
    makeElement('text', { name: '副标题', x: 165, y: 286, width: 280, height: 46, fill: '#6F697B', stroke: 'none', text: 'Make something remarkable.', fontSize: 22, fontWeight: 500 }),
    makeElement('rect', { name: '标签', x: 165, y: 376, width: 166, height: 44, radius: 22, fill: '#1C1A21', stroke: 'none' }),
    makeElement('text', { name: '标签文字', x: 191, y: 385, width: 125, height: 25, fill: '#FFFFFF', stroke: 'none', text: 'VECTOR STUDY', fontSize: 14, fontWeight: 700, letterSpacing: 2 })
  ];

  function makeElement(type, overrides = {}) {
    const strokeOnly = ['line', 'path', 'arrow', 'arc', 'polyline'].includes(type);
    const defaults = {
      id: uid(), type, name: typeNames[type]?.[0] || '图形', x: 320, y: 220, width: 180, height: 120,
      rotation: 0, fill: strokeOnly ? 'none' : '#7656EE', stroke: strokeOnly ? '#1C1A21' : 'none',
      strokeWidth: strokeOnly ? 3 : 0, strokeLinecap: 'round', strokeLinejoin: 'round', strokeDasharray: '',
      fillOpacity: 1, strokeOpacity: 1, opacity: 1, blendMode: 'normal', radius: 0, hidden: false, locked: false
    };
    if (type === 'circle' || type === 'ellipse') Object.assign(defaults, { width: 150, height: 150 });
    if (['triangle', 'diamond', 'polygon', 'star'].includes(type)) Object.assign(defaults, { width: 150, height: 150 });
    if (type === 'polygon') Object.assign(defaults, { sides: 6 });
    if (type === 'star') Object.assign(defaults, { pointsCount: 5, innerRatio: .43 });
    if (['line', 'arrow', 'polyline'].includes(type)) Object.assign(defaults, { width: 180, height: 80 });
    if (type === 'arc') Object.assign(defaults, { width: 160, height: 160, arcStart: 200, arcEnd: 340 });
    if (type === 'text') Object.assign(defaults, { width: 220, height: 50, text: '双击编辑文本', fontSize: 36, fontWeight: 700, fontFamily: 'Manrope, Arial, sans-serif', textAlign: 'start', letterSpacing: 0, lineHeight: 1.2 });
    if (type === 'image') Object.assign(defaults, { width: 240, height: 160, fill: 'none', stroke: 'none', href: '', preserveAspectRatio: 'xMidYMid meet' });
    if (type === 'icon') Object.assign(defaults, { width: 100, height: 100, fill: 'none', stroke: '#7656EE', strokeWidth: 1.8, icon: 'heart' });
    if (type === 'path') Object.assign(defaults, { points: [], smooth: false });
    if (type === 'group') Object.assign(defaults, { children: [], sourceWidth: 180, sourceHeight: 120, fill: 'mixed', stroke: 'mixed' });
    return Object.assign(defaults, overrides);
  }

  const state = {
    canvas: { width: 960, height: 640, background: 'transparent' },
    elements: [], selectedId: null, selectedIds: [], tool: 'select', zoom: .84, panX: 0, panY: 0,
    grid: true, snap: true, history: [], historyIndex: -1, drawing: null, interaction: null,
    penPoints: [], penHover: null, exportFormat: 'svg', spaceDown: false, dirty: false, clipboard: [], sharedDefs: ''
  };

  const dom = {};

  function init() {
    cacheDom();
    loadDocument();
    bindUI();
    renderPalettes();
    renderAll();
    requestAnimationFrame(fitCanvas);
  }

  function cacheDom() {
    ['artboard', 'artworkLayer', 'selectionLayer', 'penPreview', 'canvasViewport', 'canvasStage', 'artboardLabel',
      'zoomValue', 'objectCount', 'cursorPosition', 'layerCount', 'layersList', 'emptyInspector', 'propertiesPanel',
      'selectedName', 'selectedType', 'selectedTypeIcon', 'cornerSection', 'undoBtn', 'redoBtn', 'documentTitle',
      'saveState', 'fileInput', 'exportModal', 'shortcutModal', 'exportPreview', 'downloadBtn', 'exportScale',
      'toast', 'toastText', 'toastIcon', 'paletteList'].forEach(id => dom[id] = document.getElementById(id));
  }

  function loadDocument() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved?.elements) && saved.canvas) {
        state.canvas = saved.canvas;
        state.elements = saved.elements;
        state.sharedDefs = saved.sharedDefs || '';
        dom.documentTitle.value = saved.title || 'Untitled artwork';
      } else state.elements = defaultElements();
    } catch { state.elements = defaultElements(); }
    pushHistory('打开文档');
  }

  function bindUI() {
    $$('[data-panel-tab]').forEach(button => button.addEventListener('click', () => switchTabs(button, 'panel')));
    $$('[data-inspector-tab]').forEach(button => button.addEventListener('click', () => switchTabs(button, 'inspector')));
    $$('[data-tool]').forEach(button => button.addEventListener('click', () => setTool(button.dataset.tool)));
    $$('[data-add-shape]').forEach(button => button.addEventListener('click', () => addCenteredElement(button.dataset.addShape)));
    $$('.icon-asset').forEach(button => button.addEventListener('click', () => addCenteredElement('icon', { icon: button.dataset.icon, name: `${button.title}图标` })));
    $$('.template-card').forEach(button => button.addEventListener('click', () => applyTemplate(button.dataset.template)));
    $$('.modal-close').forEach(button => button.addEventListener('click', () => closeModal(button.dataset.closeModal)));
    $$('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('pointerdown', event => { if (event.target === backdrop) closeModal(backdrop.id); }));

    $('#collapseShapes').addEventListener('click', event => {
      $('#shapeGrid').classList.toggle('collapsed');
      event.currentTarget.textContent = $('#shapeGrid').classList.contains('collapsed') ? '展开' : '收起';
    });
    $('#assetSearch').addEventListener('input', filterAssets);
    $('#shufflePalette').addEventListener('click', shufflePalettes);
    $('#shortcutsBtn').addEventListener('click', () => openModal('shortcutModal'));
    $('#homeBtn').addEventListener('click', newDocument);
    $('#importBtn').addEventListener('click', () => dom.fileInput.click());
    dom.fileInput.addEventListener('change', importSvgFile);
    $('#exportBtn').addEventListener('click', showExportModal);
    $('#copySvgBtn').addEventListener('click', copySvg);
    dom.downloadBtn.addEventListener('click', downloadExport);
    $$('.export-option').forEach(button => button.addEventListener('click', () => setExportFormat(button.dataset.format)));
    dom.documentTitle.addEventListener('input', scheduleSave);

    $('#gridToggle').addEventListener('click', event => {
      state.grid = !state.grid; event.currentTarget.classList.toggle('active', state.grid); dom.canvasViewport.classList.toggle('grid-off', !state.grid);
    });
    $('#snapToggle').addEventListener('click', event => { state.snap = !state.snap; event.currentTarget.classList.toggle('active', state.snap); showToast(state.snap ? '已开启网格吸附' : '已关闭网格吸附', '⌁'); });
    $('#zoomIn').addEventListener('click', () => setZoom(state.zoom + .1));
    $('#zoomOut').addEventListener('click', () => setZoom(state.zoom - .1));
    $('#zoomValue').addEventListener('click', fitCanvas);
    $('#fitBtn').addEventListener('click', fitCanvas);
    $('#undoBtn').addEventListener('click', undo);
    $('#redoBtn').addEventListener('click', redo);
    $('#toggleLeftPanel').addEventListener('click', () => togglePanel('left'));
    $('#toggleRightPanel').addEventListener('click', () => togglePanel('right'));

    $('#duplicateBtn').addEventListener('click', duplicateSelected);
    $('#groupBtn').addEventListener('click', groupSelected);
    $('#ungroupBtn').addEventListener('click', ungroupSelected);
    $('#inspectorGroupBtn').addEventListener('click', groupSelected);
    $('#inspectorUngroupBtn').addEventListener('click', ungroupSelected);
    $('#resetTransform').addEventListener('click', () => updateSelected({ rotation: 0 }, true));
    $('#swapColors').addEventListener('click', swapColors);
    $('#bringFront').addEventListener('click', () => reorderSelected('front'));
    $('#bringForward').addEventListener('click', () => reorderSelected('forward'));
    $('#sendBackward').addEventListener('click', () => reorderSelected('backward'));
    $('#sendBack').addEventListener('click', () => reorderSelected('back'));
    $('#selectAllBtn').addEventListener('click', selectAll);
    $('#newShapeBtn').addEventListener('click', () => addCenteredElement('rect'));
    $('#imageImportBtn').addEventListener('click', () => $('#imageFileInput').click());
    $('#imageFileInput').addEventListener('change', importRasterImage);
    $('#canvasBackground').addEventListener('input', event => {
      $('#canvasTransparent').checked = false;
      state.canvas.background = event.target.value.toUpperCase();
      renderCanvas(); renderInspector(); scheduleSave();
    });
    $('#canvasBackground').addEventListener('change', () => commitChange('修改画布背景'));
    $('#canvasTransparent').addEventListener('change', event => {
      state.canvas.background = event.target.checked ? 'transparent' : $('#canvasBackground').value.toUpperCase();
      commitChange(event.target.checked ? '画布设为透明' : '设置画布背景');
    });
    bindPropertyInputs();

    dom.artboard.addEventListener('pointerdown', onCanvasPointerDown);
    dom.artboard.addEventListener('pointermove', onCanvasPointerMove);
    dom.artboard.addEventListener('pointerup', onCanvasPointerUp);
    dom.artboard.addEventListener('pointercancel', onCanvasPointerUp);
    dom.artboard.addEventListener('dblclick', onCanvasDoubleClick);
    dom.canvasViewport.addEventListener('wheel', onWheel, { passive: false });
    dom.canvasViewport.addEventListener('pointermove', updateCursorPosition);
    dom.canvasViewport.addEventListener('dragover', event => { event.preventDefault(); dom.canvasStage.classList.add('drag-over'); });
    dom.canvasViewport.addEventListener('dragleave', () => dom.canvasStage.classList.remove('drag-over'));
    dom.canvasViewport.addEventListener('drop', handleDrop);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', debounce(fitCanvas, 150));
    window.addEventListener('beforeunload', persistDocument);
  }

  function bindPropertyInputs() {
    const numberBindings = {
      propX: ['x', Number], propY: ['y', Number], propW: ['width', value => Math.max(1, Number(value))],
      propH: ['height', value => Math.max(1, Number(value))], propRotation: ['rotation', Number],
      propStrokeWidth: ['strokeWidth', value => Math.max(0, Number(value))], propRadius: ['radius', value => Math.max(0, Number(value))],
      propSides: ['sides', value => clamp(Math.round(Number(value)), 3, 24)],
      propInnerRatio: ['innerRatio', value => clamp(Number(value) / 100, .05, .95)],
      propArcStart: ['arcStart', Number], propArcEnd: ['arcEnd', Number],
      propFontSize: ['fontSize', value => Math.max(1, Number(value))], propLetterSpacing: ['letterSpacing', Number],
      propFillOpacity: ['fillOpacity', value => clamp(Number(value) / 100, 0, 1)],
      propStrokeOpacity: ['strokeOpacity', value => clamp(Number(value) / 100, 0, 1)]
    };
    Object.entries(numberBindings).forEach(([id, [property, parser]]) => {
      const input = document.getElementById(id);
      input.addEventListener('input', () => { const targetProperty = id === 'propSides' ? input.dataset.property || property : property; updateSelected({ [targetProperty]: parser(input.value) }, false); });
      input.addEventListener('change', () => commitChange(`修改${id === 'propSides' ? input.dataset.property || property : property}`));
    });
    const connectColor = (colorId, textId, property) => {
      const color = document.getElementById(colorId), text = document.getElementById(textId);
      color.addEventListener('input', () => { text.value = color.value.toUpperCase(); updateSelected({ [property]: color.value }, false); });
      color.addEventListener('change', () => commitChange('修改颜色'));
      text.addEventListener('change', () => {
        if (text.value.trim().toLowerCase() === 'none') { updateSelected({ [property]: 'none' }, true); return; }
        const normalized = normalizeColor(text.value);
        if (!normalized) return renderInspector();
        color.value = normalized; updateSelected({ [property]: normalized }, true);
      });
    };
    connectColor('propFill', 'propFillText', 'fill');
    connectColor('propStroke', 'propStrokeText', 'stroke');
    ['propFillText', 'propStrokeText'].forEach(id => {
      document.getElementById(id).addEventListener('input', event => {
        if (event.target.value.trim().toLowerCase() === 'none') { updateSelected({ [id === 'propFillText' ? 'fill' : 'stroke']: 'none' }, false); return; }
        const color = normalizeColor(event.target.value);
        if (color) updateSelected({ [id === 'propFillText' ? 'fill' : 'stroke']: color }, false);
      });
    });
    $('#propOpacity').addEventListener('input', event => updateSelected({ opacity: clamp(Number(event.target.value) / 100, 0, 1) }, false));
    $('#propOpacity').addEventListener('change', () => commitChange('修改透明度'));
    $('#opacityRange').addEventListener('input', event => updateSelected({ opacity: Number(event.target.value) / 100 }, false));
    $('#opacityRange').addEventListener('change', () => commitChange('修改透明度'));
    $('#propRadiusRange').addEventListener('input', event => updateSelected({ radius: Number(event.target.value) }, false));
    $('#propRadiusRange').addEventListener('change', () => commitChange('修改圆角'));
    const propertyBindings = {
      propFontFamily: 'fontFamily', propFontWeight: 'fontWeight', propTextAlign: 'textAlign',
      propLineCap: 'strokeLinecap', propLineJoin: 'strokeLinejoin', propDash: 'strokeDasharray', propBlendMode: 'blendMode'
    };
    Object.entries(propertyBindings).forEach(([id, property]) => {
      const input = document.getElementById(id);
      input.addEventListener('input', () => updateSelected({ [property]: input.value }, false));
      input.addEventListener('change', () => commitChange(`修改${property}`));
    });
    $('#propText').addEventListener('input', event => updateSelected({ text: event.target.value }, false));
    $('#propText').addEventListener('change', () => commitChange('修改文本'));
  }

  function renderAll() {
    renderCanvas();
    renderSelection();
    renderLayers();
    renderInspector();
    renderStatus();
    updateTransform();
    updateHistoryButtons();
  }

  function renderCanvas() {
    dom.artboard.setAttribute('viewBox', `0 0 ${state.canvas.width} ${state.canvas.height}`);
    dom.artboard.setAttribute('width', state.canvas.width);
    dom.artboard.setAttribute('height', state.canvas.height);
    const canvasBackground = state.canvas.background || 'transparent';
    dom.artboard.style.background = canvasBackground === 'transparent' ? 'transparent' : canvasBackground;
    dom.canvasStage.classList.toggle('solid-background', canvasBackground !== 'transparent');
    dom.canvasStage.style.backgroundColor = canvasBackground === 'transparent' ? 'transparent' : canvasBackground;
    dom.canvasStage.style.width = `${state.canvas.width}px`;
    dom.canvasStage.style.height = `${state.canvas.height}px`;
    dom.artworkLayer.replaceChildren();
    if (state.sharedDefs) {
      const defs = document.createElementNS(SVG_NS, 'defs');
      defs.dataset.importedDefs = 'true';
      defs.innerHTML = state.sharedDefs;
      dom.artworkLayer.appendChild(defs);
    }
    state.elements.forEach(element => {
      const node = buildSvgElement(element);
      if (node) dom.artworkLayer.appendChild(node);
    });
    dom.artboardLabel.textContent = `画板 1 · ${state.canvas.width} × ${state.canvas.height}`;
  }

  function buildSvgElement(element, forExport = false, interactive = true) {
    const group = document.createElementNS(SVG_NS, 'g');
    if (interactive) group.dataset.elementId = element.id;
    group.setAttribute('transform', elementTransform(element));
    group.setAttribute('opacity', element.opacity ?? 1);
    if (element.blendMode && element.blendMode !== 'normal') group.style.mixBlendMode = element.blendMode;
    if (element.hidden) group.setAttribute('display', 'none');
    if (element.locked && !forExport) group.classList.add('locked');
    let shape;
    const common = node => {
      node.setAttribute('fill', element.fill || 'none');
      node.setAttribute('stroke', element.stroke || 'none');
      node.setAttribute('stroke-width', element.strokeWidth || 0);
      node.setAttribute('fill-opacity', element.fillOpacity ?? 1);
      node.setAttribute('stroke-opacity', element.strokeOpacity ?? 1);
      node.setAttribute('stroke-linecap', element.strokeLinecap || 'round');
      node.setAttribute('stroke-linejoin', element.strokeLinejoin || 'round');
      if (element.strokeDasharray) node.setAttribute('stroke-dasharray', element.strokeDasharray);
      node.setAttribute('vector-effect', 'non-scaling-stroke');
      return node;
    };

    if (element.type === 'rect') {
      shape = common(document.createElementNS(SVG_NS, 'rect'));
      shape.setAttribute('width', element.width); shape.setAttribute('height', element.height);
      shape.setAttribute('rx', Math.min(element.radius || 0, element.width / 2, element.height / 2));
    } else if (element.type === 'circle') {
      shape = common(document.createElementNS(SVG_NS, 'circle'));
      shape.setAttribute('cx', element.width / 2); shape.setAttribute('cy', element.height / 2); shape.setAttribute('r', Math.min(element.width, element.height) / 2);
    } else if (element.type === 'ellipse') {
      shape = common(document.createElementNS(SVG_NS, 'ellipse'));
      shape.setAttribute('cx', element.width / 2); shape.setAttribute('cy', element.height / 2);
      shape.setAttribute('rx', element.width / 2); shape.setAttribute('ry', element.height / 2);
    } else if (element.type === 'triangle') {
      shape = common(document.createElementNS(SVG_NS, 'polygon'));
      shape.setAttribute('points', `${element.width / 2},0 ${element.width},${element.height} 0,${element.height}`);
    } else if (element.type === 'diamond') {
      shape = common(document.createElementNS(SVG_NS, 'polygon'));
      shape.setAttribute('points', `${element.width / 2},0 ${element.width},${element.height / 2} ${element.width / 2},${element.height} 0,${element.height / 2}`);
    } else if (element.type === 'polygon') {
      shape = common(document.createElementNS(SVG_NS, 'polygon'));
      shape.setAttribute('points', regularPolygonPoints(element.width, element.height, element.sides || 6));
    } else if (element.type === 'star') {
      shape = common(document.createElementNS(SVG_NS, 'polygon'));
      shape.setAttribute('points', starPoints(element.width, element.height, element.pointsCount || 5, element.innerRatio ?? .43));
    } else if (element.type === 'line') {
      shape = common(document.createElementNS(SVG_NS, 'line'));
      shape.setAttribute('x1', 0); shape.setAttribute('y1', element.height); shape.setAttribute('x2', element.width); shape.setAttribute('y2', 0);
    } else if (element.type === 'arrow') {
      shape = common(document.createElementNS(SVG_NS, 'path'));
      const head = Math.min(24, Math.max(10, Math.min(element.width, element.height) * .32));
      shape.setAttribute('d', `M 0 ${element.height / 2} H ${element.width} M ${element.width - head} ${element.height / 2 - head * .65} L ${element.width} ${element.height / 2} L ${element.width - head} ${element.height / 2 + head * .65}`);
    } else if (element.type === 'arc') {
      shape = common(document.createElementNS(SVG_NS, 'path'));
      shape.setAttribute('d', arcPath(element.width, element.height, element.arcStart ?? 200, element.arcEnd ?? 340));
    } else if (element.type === 'polyline') {
      shape = common(document.createElementNS(SVG_NS, 'polyline'));
      shape.setAttribute('points', `0,${element.height * .72} ${element.width * .28},${element.height * .18} ${element.width * .58},${element.height * .82} ${element.width},${element.height * .22}`);
    } else if (element.type === 'text') {
      shape = common(document.createElementNS(SVG_NS, 'text'));
      const anchor = element.textAlign || 'start';
      const textX = anchor === 'middle' ? element.width / 2 : anchor === 'end' ? element.width : 0;
      shape.setAttribute('x', textX); shape.setAttribute('y', element.fontSize || 36); shape.setAttribute('text-anchor', anchor);
      shape.setAttribute('font-family', element.fontFamily || 'Manrope, Arial, sans-serif'); shape.setAttribute('font-size', element.fontSize || 36);
      shape.setAttribute('font-weight', element.fontWeight || 500); shape.setAttribute('letter-spacing', element.letterSpacing || 0);
      shape.setAttribute('dominant-baseline', 'auto');
      const lines = String(element.text || '文本').split('\n');
      lines.forEach((line, index) => {
        const tspan = document.createElementNS(SVG_NS, 'tspan'); tspan.textContent = line || ' ';
        tspan.setAttribute('x', textX); if (index) tspan.setAttribute('dy', `${element.lineHeight || 1.2}em`);
        shape.appendChild(tspan);
      });
    } else if (element.type === 'image') {
      shape = document.createElementNS(SVG_NS, 'image'); shape.setAttribute('href', element.href || '');
      shape.setAttribute('width', element.width); shape.setAttribute('height', element.height); shape.setAttribute('preserveAspectRatio', element.preserveAspectRatio || 'xMidYMid meet');
    } else if (element.type === 'path') {
      shape = common(document.createElementNS(SVG_NS, 'path'));
      shape.setAttribute('d', pointsToPath(element.points || [], element.smooth));
    } else if (element.type === 'icon') {
      const inner = document.createElementNS(SVG_NS, 'g');
      inner.innerHTML = iconPaths[element.icon] || iconPaths.heart;
      inner.setAttribute('transform', `scale(${element.width / 24} ${element.height / 24})`);
      inner.setAttribute('fill', element.fill || 'none'); inner.setAttribute('stroke', element.stroke || '#7656EE');
      inner.setAttribute('stroke-width', element.strokeWidth || 1.8); inner.setAttribute('stroke-linecap', element.strokeLinecap || 'round'); inner.setAttribute('stroke-linejoin', element.strokeLinejoin || 'round');
      shape = inner;
    } else if (element.type === 'group') {
      const inner = document.createElementNS(SVG_NS, 'g');
      const sx = element.width / Math.max(1, element.sourceWidth || element.width), sy = element.height / Math.max(1, element.sourceHeight || element.height);
      inner.setAttribute('transform', `scale(${sx} ${sy})`);
      (element.children || []).forEach(child => {
        const childNode = buildSvgElement(child, forExport, false);
        if (childNode) inner.appendChild(childNode);
      });
      shape = inner;
    } else if (element.type === 'raw') {
      const inner = document.createElementNS(SVG_NS, 'g');
      inner.innerHTML = element.raw || '';
      applyRawOverrides(inner, element);
      const sx = element.width / (element.sourceWidth || element.width), sy = element.height / (element.sourceHeight || element.height);
      inner.setAttribute('transform', `translate(${-element.sourceX * sx || 0} ${-element.sourceY * sy || 0}) scale(${sx} ${sy})`);
      shape = inner;
    }
    if (!shape) return null;
    group.appendChild(shape);
    return group;
  }

  function applyRawOverrides(container, element) {
    if (!element.overrideFill && !element.overrideStroke && !element.overrideStrokeWidth && !element.overrideStrokeStyle && !element.overrideFillOpacity && !element.overrideStrokeOpacity) return;
    const targets = container.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon,text,use,image');
    targets.forEach(target => {
      if (element.overrideFill) target.style.setProperty('fill', element.fill || 'none', 'important');
      if (element.overrideStroke) target.style.setProperty('stroke', element.stroke || 'none', 'important');
      if (element.overrideStrokeWidth) target.style.setProperty('stroke-width', String(element.strokeWidth || 0), 'important');
      if (element.overrideStrokeStyle) {
        target.style.setProperty('stroke-linecap', element.strokeLinecap || 'round', 'important');
        target.style.setProperty('stroke-linejoin', element.strokeLinejoin || 'round', 'important');
        target.style.setProperty('stroke-dasharray', element.strokeDasharray || 'none', 'important');
      }
      if (element.overrideFillOpacity) target.style.setProperty('fill-opacity', String(element.fillOpacity ?? 1), 'important');
      if (element.overrideStrokeOpacity) target.style.setProperty('stroke-opacity', String(element.strokeOpacity ?? 1), 'important');
    });
  }

  function elementTransform(element) {
    const cx = element.width / 2, cy = element.height / 2;
    return `translate(${element.x} ${element.y}) rotate(${element.rotation || 0} ${cx} ${cy})`;
  }

  function starPoints(width, height, points = 5, innerRatio = .43) {
    const cx = width / 2, cy = height / 2, outer = Math.min(width, height) / 2, inner = outer * innerRatio;
    return Array.from({ length: points * 2 }, (_, index) => {
      const angle = -Math.PI / 2 + index * Math.PI / points, radius = index % 2 ? inner : outer;
      return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
    }).join(' ');
  }

  function regularPolygonPoints(width, height, sides = 6) {
    const cx = width / 2, cy = height / 2, radiusX = width / 2, radiusY = height / 2;
    return Array.from({ length: sides }, (_, index) => {
      const angle = -Math.PI / 2 + index * Math.PI * 2 / sides;
      return `${cx + Math.cos(angle) * radiusX},${cy + Math.sin(angle) * radiusY}`;
    }).join(' ');
  }

  function arcPath(width, height, startDegrees, endDegrees) {
    const cx = width / 2, cy = height / 2, rx = width / 2, ry = height / 2;
    const pointAt = degrees => { const angle = (degrees - 90) * Math.PI / 180; return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)]; };
    const start = pointAt(startDegrees), end = pointAt(endDegrees);
    let sweep = ((endDegrees - startDegrees) % 360 + 360) % 360; if (!sweep) sweep = 359.999;
    return `M ${start[0]} ${start[1]} A ${rx} ${ry} 0 ${sweep > 180 ? 1 : 0} 1 ${end[0]} ${end[1]}`;
  }

  function pointsToPath(points, smooth = false) {
    if (!points.length) return '';
    if (!smooth || points.length < 3) return `M ${points.map(point => point.join(' ')).join(' L ')}`;
    let path = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i], next = points[i + 1];
      const midX = (current[0] + next[0]) / 2, midY = (current[1] + next[1]) / 2;
      path += ` Q ${current[0]} ${current[1]} ${midX} ${midY}`;
    }
    const last = points[points.length - 1];
    return `${path} T ${last[0]} ${last[1]}`;
  }

  function renderSelection() {
    dom.selectionLayer.replaceChildren();
    const elements = getSelectedElements().filter(element => !element.hidden);
    if (!elements.length) return;
    elements.forEach(element => {
      const group = document.createElementNS(SVG_NS, 'g'); group.setAttribute('transform', elementTransform(element));
      const outline = document.createElementNS(SVG_NS, 'rect'); outline.classList.add('selection-outline');
      if (elements.length > 1) outline.classList.add('secondary');
      outline.setAttribute('x', 0); outline.setAttribute('y', 0); outline.setAttribute('width', Math.max(1, element.width)); outline.setAttribute('height', Math.max(1, element.height));
      group.appendChild(outline); dom.selectionLayer.appendChild(group);
    });
    if (elements.length > 1) {
      const bounds = selectionBounds(elements), collective = document.createElementNS(SVG_NS, 'rect');
      collective.classList.add('selection-outline', 'collective'); collective.setAttribute('x', bounds.x); collective.setAttribute('y', bounds.y);
      collective.setAttribute('width', Math.max(1, bounds.width)); collective.setAttribute('height', Math.max(1, bounds.height)); dom.selectionLayer.appendChild(collective);
      return;
    }
    const element = elements[0], group = dom.selectionLayer.lastElementChild;
    if (!element.locked) {
      const positions = { nw: [0, 0], n: [element.width / 2, 0], ne: [element.width, 0], e: [element.width, element.height / 2], se: [element.width, element.height], s: [element.width / 2, element.height], sw: [0, element.height], w: [0, element.height / 2] };
      Object.entries(positions).filter(([name]) => element.type !== 'circle' || ['nw', 'ne', 'se', 'sw'].includes(name)).forEach(([name, [x, y]]) => {
        const handle = document.createElementNS(SVG_NS, 'rect');
        handle.classList.add('selection-handle'); handle.dataset.handle = name;
        const size = 8 / state.zoom; handle.setAttribute('x', x - size / 2); handle.setAttribute('y', y - size / 2);
        handle.setAttribute('width', size); handle.setAttribute('height', size); handle.setAttribute('rx', 1.5 / state.zoom);
        group.appendChild(handle);
      });
    }
  }

  function renderLayers() {
    dom.layersList.replaceChildren();
    [...state.elements].reverse().forEach(element => {
      const row = document.createElement('div'); row.className = `layer-row${state.selectedIds.includes(element.id) ? ' selected' : ''}${element.id === state.selectedId ? ' active' : ''}`;
      row.dataset.id = element.id; row.draggable = true;
      row.innerHTML = `
        <button class="layer-visibility ${element.hidden ? 'off' : ''}" title="${element.hidden ? '显示' : '隐藏'}图层" aria-label="切换图层可见性">
          <svg viewBox="0 0 24 24">${element.hidden ? '<path d="m3 3 18 18"/><path d="M10.5 10.7a2 2 0 0 0 2.8 2.8"/><path d="M9.8 4.4A10.7 10.7 0 0 1 12 4c5.5 0 9 6 9 8a13 13 0 0 1-2.1 3.3M6.5 6.5C4.3 8 3 10.5 3 12c0 2 3.5 8 9 8 1.2 0 2.2-.3 3.2-.7"/>' : '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.5"/>'}</svg>
        </button>
        <span class="layer-thumb">${layerThumbnail(element)}</span>
        <span class="layer-name" title="双击重命名">${escapeXml(element.name)}</span>
        <button class="layer-lock ${element.locked ? 'locked' : ''}" title="${element.locked ? '解锁' : '锁定'}图层" aria-label="切换图层锁定">
          <svg viewBox="0 0 24 24">${element.locked ? '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>' : '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.6-1.7"/>'}</svg>
        </button>`;
      row.addEventListener('click', event => { if (!event.target.closest('button')) selectElement(element.id, event.shiftKey || event.metaKey || event.ctrlKey); });
      $('.layer-visibility', row).addEventListener('click', event => { event.stopPropagation(); element.hidden = !element.hidden; commitChange(element.hidden ? '隐藏图层' : '显示图层'); });
      $('.layer-lock', row).addEventListener('click', event => { event.stopPropagation(); element.locked = !element.locked; commitChange(element.locked ? '锁定图层' : '解锁图层'); });
      $('.layer-name', row).addEventListener('dblclick', event => { event.stopPropagation(); renameLayer(element); });
      row.addEventListener('dragstart', () => row.classList.add('dragging'));
      row.addEventListener('dragend', () => row.classList.remove('dragging'));
      row.addEventListener('dragover', event => { event.preventDefault(); row.classList.add('drag-target'); });
      row.addEventListener('dragleave', () => row.classList.remove('drag-target'));
      row.addEventListener('drop', event => { event.preventDefault(); row.classList.remove('drag-target'); reorderLayerFromDrag(element.id); });
      dom.layersList.appendChild(row);
    });
  }

  function layerThumbnail(element) {
    const fill = element.fill === 'none' ? 'transparent' : element.fill;
    const stroke = element.stroke === 'none' || element.stroke === 'mixed' ? '#77727f' : element.stroke;
    const visualType = element.type === 'raw' ? element.rawTag : element.type;
    if (visualType === 'ellipse' || visualType === 'circle') return `<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="8" ry="7" fill="${fill}" stroke="${stroke}"/></svg>`;
    if (visualType === 'text') return `<svg viewBox="0 0 24 24"><text x="6" y="18" font-family="Georgia" font-size="17" fill="${fill || stroke}">T</text></svg>`;
    if (element.type === 'triangle') return `<svg viewBox="0 0 24 24"><path d="m12 4 9 16H3Z" fill="${fill}" stroke="${stroke}"/></svg>`;
    if (element.type === 'star') return `<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.7L21 9.5l-4.6 4.4 1.2 6.2-5.6-3-5.6 3 1.2-6.2L3 9.5l6.3-.8Z" fill="${fill}" stroke="${stroke}"/></svg>`;
    if (visualType === 'line' || visualType === 'path' || visualType === 'polyline') return `<svg viewBox="0 0 24 24"><path d="m4 17 5-8 5 7 6-10" fill="none" stroke="${stroke}" stroke-width="2"/></svg>`;
    if (element.type === 'icon') return `<svg viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="1.5">${iconPaths[element.icon]}</svg>`;
    if (element.type === 'image') return `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="#77727f"/><circle cx="9" cy="10" r="2" fill="none" stroke="#77727f"/><path d="m4 18 5-5 4 4 3-3 4 4" fill="none" stroke="#77727f"/></svg>`;
    if (element.type === 'group') return `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="12" height="11" rx="1" fill="none" stroke="${stroke}"/><rect x="9" y="9" width="12" height="11" rx="1" fill="${fill === 'mixed' ? 'none' : fill}" stroke="${stroke}"/></svg>`;
    return `<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2" fill="${fill}" stroke="${stroke}"/></svg>`;
  }

  function renderInspector() {
    const elements = getSelectedElements(), element = getSelected();
    dom.emptyInspector.classList.toggle('hidden', Boolean(element));
    dom.propertiesPanel.classList.toggle('hidden', !element);
    const background = normalizeColor(state.canvas.background) || '#FFFFFF';
    $('#canvasBackground').value = background; $('#canvasBackgroundPreview').style.background = background; $('#canvasTransparent').checked = state.canvas.background === 'transparent';
    if (!element) {
      $('#groupBtn').disabled = true; $('#inspectorGroupBtn').disabled = true; $('#ungroupBtn').disabled = true; $('#inspectorUngroupBtn').disabled = true;
      return;
    }
    const multi = elements.length > 1;
    dom.selectedName.textContent = multi ? `${elements.length} 个对象` : element.name;
    dom.selectedType.textContent = multi ? 'MULTI SELECTION' : element.type === 'raw' && element.rawTag ? `SVG ${element.rawTag.toUpperCase()}` : typeNames[element.type]?.[1] || element.type.toUpperCase();
    dom.selectedTypeIcon.className = `layer-type-icon ${multi ? 'group' : element.type === 'raw' ? element.rawTag || 'raw' : element.type}`;
    const commonValue = (property, fallback = '') => elements.every(item => (item[property] ?? fallback) === (elements[0][property] ?? fallback)) ? elements[0][property] ?? fallback : '';
    const values = { propX: commonValue('x'), propY: commonValue('y'), propW: commonValue('width'), propH: commonValue('height'), propRotation: commonValue('rotation', 0), propStrokeWidth: commonValue('strokeWidth', 0), propRadius: commonValue('radius', 0), propFillOpacity: commonValue('fillOpacity', 1), propStrokeOpacity: commonValue('strokeOpacity', 1) };
    Object.entries(values).forEach(([id, value]) => { const input = document.getElementById(id); input.value = value === '' ? '' : round(value, .1); input.placeholder = value === '' ? '混合' : ''; });
    if (values.propFillOpacity !== '') $('#propFillOpacity').value = Math.round(values.propFillOpacity * 100);
    if (values.propStrokeOpacity !== '') $('#propStrokeOpacity').value = Math.round(values.propStrokeOpacity * 100);
    const fillValue = commonValue('fill', 'none'), strokeValue = commonValue('stroke', 'none');
    const fill = normalizeColor(fillValue) || '#FFFFFF', stroke = normalizeColor(strokeValue) || '#1C1A21';
    $('#propFill').value = fill; $('#propFillText').value = fillValue === '' ? 'MIXED' : fillValue === 'none' ? 'NONE' : normalizeColor(fillValue) ? fill.toUpperCase() : fillValue || 'MIXED';
    $('#fillPreview').style.background = fillValue === 'none' ? 'linear-gradient(135deg,white 44%,#ec5371 45%,#ec5371 55%,white 56%)' : normalizeColor(fillValue) ? fill : 'linear-gradient(135deg,#7656ee,#ff7b72,#ffca68)';
    $('#propStroke').value = stroke; $('#propStrokeText').value = strokeValue === '' ? 'MIXED' : strokeValue === 'none' ? 'NONE' : normalizeColor(strokeValue) ? stroke.toUpperCase() : strokeValue || 'MIXED';
    $('#strokePreview').style.borderColor = strokeValue === 'none' ? '#d6d3dc' : stroke;
    const opacityValue = commonValue('opacity', 1), opacity = opacityValue === '' ? 100 : Math.round(opacityValue * 100);
    $('#propOpacity').value = opacity; $('#opacityRange').value = opacity; $('#opacityOutput').value = `${opacity}%`; setRangeFill($('#opacityRange'), opacity);
    const radius = commonValue('radius', 0); $('#propRadiusRange').value = radius === '' ? 0 : radius; setRangeFill($('#propRadiusRange'), radius === '' ? 0 : radius);
    dom.cornerSection.classList.toggle('hidden', multi || element.type !== 'rect');
    const isPolygon = !multi && element.type === 'polygon', isStar = !multi && element.type === 'star', isArc = !multi && element.type === 'arc';
    $('#geometrySection').classList.toggle('hidden', !isPolygon && !isStar && !isArc);
    $('#sidesProperty').classList.toggle('hidden', !isPolygon && !isStar); $('#innerRatioProperty').classList.toggle('hidden', !isStar);
    $('#arcStartProperty').classList.toggle('hidden', !isArc); $('#arcEndProperty').classList.toggle('hidden', !isArc);
    $('#propSides').value = isStar ? element.pointsCount || 5 : element.sides || 6; $('#propSides').dataset.property = isStar ? 'pointsCount' : 'sides';
    $('#propInnerRatio').value = Math.round((element.innerRatio ?? .43) * 100); $('#propArcStart').value = element.arcStart ?? 200; $('#propArcEnd').value = element.arcEnd ?? 340;
    $('#textSection').classList.toggle('hidden', multi || element.type !== 'text');
    if (!multi && element.type === 'text') {
      $('#propText').value = element.text || ''; $('#propFontFamily').value = element.fontFamily || 'Manrope, Arial, sans-serif';
      $('#propFontSize').value = element.fontSize || 36; $('#propFontWeight').value = String(element.fontWeight || 500);
      $('#propLetterSpacing').value = element.letterSpacing || 0; $('#propTextAlign').value = element.textAlign || 'start';
    }
    $('#propLineCap').value = commonValue('strokeLinecap', 'round') || 'round'; $('#propLineJoin').value = commonValue('strokeLinejoin', 'round') || 'round'; $('#propDash').value = commonValue('strokeDasharray', '');
    $('#propBlendMode').value = commonValue('blendMode', 'normal') || 'normal';
    const canGroup = elements.length > 1 && elements.some(item => !item.locked), canUngroup = elements.some(item => item.type === 'group' && !item.locked);
    $('#groupBtn').disabled = !canGroup; $('#inspectorGroupBtn').disabled = !canGroup; $('#ungroupBtn').disabled = !canUngroup; $('#inspectorUngroupBtn').disabled = !canUngroup;
  }

  function renderStatus() {
    const visibleCount = state.elements.filter(element => !element.hidden).length;
    dom.objectCount.textContent = `${visibleCount} 个图层`;
    dom.layerCount.textContent = state.elements.length;
    dom.zoomValue.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  function renderPalettes() {
    dom.paletteList.replaceChildren();
    palettes.slice(0, 4).forEach(colors => {
      const button = document.createElement('button'); button.className = 'palette'; button.title = '应用第一个颜色到所选对象';
      button.innerHTML = colors.map(color => `<span style="background:${color}"></span>`).join('');
      button.addEventListener('click', () => {
        if (getSelected()) updateSelected({ fill: colors[0] }, true);
        else { state.canvas.background = colors[3]; commitChange('应用画布配色'); }
        showToast('已应用配色', '✦');
      });
      dom.paletteList.appendChild(button);
    });
  }

  function switchTabs(button, group) {
    if (group === 'panel') {
      $$('[data-panel-tab]').forEach(item => item.classList.toggle('active', item === button));
      $$('[data-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === button.dataset.panelTab));
    } else {
      $$('[data-inspector-tab]').forEach(item => item.classList.toggle('active', item === button));
      $$('[data-inspector]').forEach(panel => panel.classList.toggle('active', panel.dataset.inspector === button.dataset.inspectorTab));
    }
  }

  function setTool(tool) {
    if (state.penPoints.length && tool !== 'pen') finishPenPath();
    state.tool = tool;
    $$('[data-tool]').forEach(button => button.classList.toggle('active', button.dataset.tool === tool));
    dom.canvasViewport.className = `canvas-viewport${state.grid ? '' : ' grid-off'} tool-${tool}`;
  }

  function addCenteredElement(type, overrides = {}) {
    const point = viewportCenterInCanvas();
    if (type === 'ellipse-wide') { type = 'ellipse'; overrides = { width: 190, height: 120, name: '椭圆', ...overrides }; }
    const element = makeElement(type, overrides);
    element.x = clamp(point.x - element.width / 2, 0, state.canvas.width - element.width);
    element.y = clamp(point.y - element.height / 2, 0, state.canvas.height - element.height);
    state.elements.push(element); state.selectedId = element.id; state.selectedIds = [element.id];
    setTool('select'); commitChange(`添加${element.name}`); showToast(`${element.name}已添加`, '＋');
  }

  function viewportCenterInCanvas() {
    const rect = dom.canvasViewport.getBoundingClientRect();
    return screenToSvg(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  function selectElement(id, additive = false) {
    const element = state.elements.find(item => item.id === id);
    if (!element) return;
    if (additive) {
      state.selectedIds = state.selectedIds.includes(id) ? state.selectedIds.filter(item => item !== id) : [...state.selectedIds, id];
      state.selectedId = state.selectedIds.at(-1) || null;
    } else { state.selectedId = id; state.selectedIds = [id]; }
    renderSelection(); renderLayers(); renderInspector();
  }

  function deselect() {
    state.selectedId = null; state.selectedIds = []; renderSelection(); renderLayers(); renderInspector();
  }

  function selectAll() {
    state.selectedIds = state.elements.filter(item => !item.hidden).map(item => item.id);
    state.selectedId = state.selectedIds.at(-1) || null;
    renderSelection(); renderLayers(); renderInspector(); showToast(`已选择 ${state.selectedIds.length} 个对象`, '✓');
  }

  function getSelected() { return state.elements.find(item => item.id === state.selectedId) || null; }

  function getSelectedElements() {
    const ids = new Set(state.selectedIds.length ? state.selectedIds : state.selectedId ? [state.selectedId] : []);
    return state.elements.filter(item => ids.has(item.id));
  }

  function elementBounds(element) {
    const angle = (element.rotation || 0) * Math.PI / 180, cx = element.x + element.width / 2, cy = element.y + element.height / 2;
    const corners = [[element.x, element.y], [element.x + element.width, element.y], [element.x + element.width, element.y + element.height], [element.x, element.y + element.height]].map(([x, y]) => ({
      x: cx + (x - cx) * Math.cos(angle) - (y - cy) * Math.sin(angle),
      y: cy + (x - cx) * Math.sin(angle) + (y - cy) * Math.cos(angle)
    }));
    const xs = corners.map(point => point.x), ys = corners.map(point => point.y);
    return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
  }

  function selectionBounds(elements = getSelectedElements()) {
    const boxes = elements.map(elementBounds), left = Math.min(...boxes.map(box => box.x)), top = Math.min(...boxes.map(box => box.y));
    const right = Math.max(...boxes.map(box => box.x + box.width)), bottom = Math.max(...boxes.map(box => box.y + box.height));
    return { x: left, y: top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
  }

  function groupSelected() {
    const elements = getSelectedElements().filter(element => !element.locked);
    if (elements.length < 2) return showToast('请至少选择两个未锁定对象', '!');
    const ids = new Set(elements.map(element => element.id)), bounds = selectionBounds(elements);
    const children = elements.map(element => { const child = deepCopy(element); child.x -= bounds.x; child.y -= bounds.y; return child; });
    const group = makeElement('group', { name: `组合 ${elements.length}`, x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height, sourceWidth: bounds.width, sourceHeight: bounds.height, children });
    const insertIndex = Math.min(...elements.map(element => state.elements.indexOf(element)));
    state.elements = state.elements.filter(element => !ids.has(element.id)); state.elements.splice(insertIndex, 0, group);
    state.selectedIds = [group.id]; state.selectedId = group.id; commitChange('组合对象'); showToast(`已组合 ${elements.length} 个对象`, '⌘');
  }

  function ungroupSelected() {
    const groups = getSelectedElements().filter(element => element.type === 'group' && !element.locked);
    if (!groups.length) return showToast('所选对象中没有可取消的组合', '!');
    const newSelection = [];
    groups.forEach(group => {
      const index = state.elements.findIndex(element => element.id === group.id); if (index < 0) return;
      const sx = group.width / Math.max(1, group.sourceWidth || group.width), sy = group.height / Math.max(1, group.sourceHeight || group.height);
      const angle = (group.rotation || 0) * Math.PI / 180, gcx = group.width / 2, gcy = group.height / 2;
      const children = (group.children || []).map(source => {
        const child = deepCopy(source), width = child.width * sx, height = child.height * sy;
        const localX = (child.x + child.width / 2) * sx, localY = (child.y + child.height / 2) * sy;
        const rotatedX = gcx + (localX - gcx) * Math.cos(angle) - (localY - gcy) * Math.sin(angle);
        const rotatedY = gcy + (localX - gcx) * Math.sin(angle) + (localY - gcy) * Math.cos(angle);
        child.x = group.x + rotatedX - width / 2; child.y = group.y + rotatedY - height / 2; child.width = width; child.height = height;
        child.rotation = (child.rotation || 0) + (group.rotation || 0); return child;
      });
      state.elements.splice(index, 1, ...children); newSelection.push(...children.map(child => child.id));
    });
    state.selectedIds = newSelection; state.selectedId = newSelection.at(-1) || null; commitChange('取消组合'); showToast(`已释放 ${newSelection.length} 个对象`, '↗');
  }

  function onCanvasPointerDown(event) {
    if (event.button !== 0 && event.button !== 1) return;
    const point = screenToSvg(event.clientX, event.clientY);
    const handle = event.target.closest?.('.selection-handle')?.dataset.handle;
    const targetGroup = event.target.closest?.('[data-element-id]');
    const handMode = state.tool === 'hand' || state.spaceDown || event.button === 1;
    if (handMode) {
      state.interaction = { type: 'pan', startClientX: event.clientX, startClientY: event.clientY, panX: state.panX, panY: state.panY };
      dom.canvasViewport.classList.add('panning'); dom.artboard.setPointerCapture(event.pointerId); return;
    }
    if (handle && getSelected()) {
      state.interaction = { type: 'resize', handle, start: point, before: deepCopy(getSelected()) };
      dom.artboard.setPointerCapture(event.pointerId); return;
    }
    if (state.tool === 'select') {
      if (targetGroup) {
        const element = state.elements.find(item => item.id === targetGroup.dataset.elementId);
        if (!element) return;
        selectElement(element.id, event.shiftKey);
        if (!element.locked && state.selectedIds.includes(element.id)) {
          state.interaction = { type: 'move', start: point, before: state.selectedIds.map(id => deepCopy(state.elements.find(item => item.id === id))).filter(Boolean) };
          dom.artboard.setPointerCapture(event.pointerId);
        }
      } else deselect();
      return;
    }
    if (state.tool === 'pen') {
      addPenPoint(point);
      return;
    }
    if (state.tool === 'text') {
      const element = makeElement('text', { x: snap(point.x), y: snap(point.y), text: '输入文字', width: 150, height: 45 });
      state.elements.push(element); state.selectedId = element.id; state.selectedIds = [element.id];
      setTool('select'); commitChange('添加文本'); setTimeout(() => editText(element), 0); return;
    }
    if (['rect', 'ellipse', 'line'].includes(state.tool)) {
      const element = makeElement(state.tool, { x: snap(point.x), y: snap(point.y), width: 1, height: 1 });
      state.elements.push(element); state.selectedId = element.id; state.selectedIds = [element.id];
      state.drawing = { element, start: point };
      dom.artboard.setPointerCapture(event.pointerId); renderAll();
    }
  }

  function onCanvasPointerMove(event) {
    const point = screenToSvg(event.clientX, event.clientY);
    if (state.tool === 'pen' && state.penPoints.length) { state.penHover = point; renderPenPreview(); }
    if (state.drawing) {
      const { element, start } = state.drawing;
      let x = snap(Math.min(start.x, point.x)), y = snap(Math.min(start.y, point.y));
      let width = Math.max(1, snap(Math.abs(point.x - start.x))), height = Math.max(1, snap(Math.abs(point.y - start.y)));
      if (event.shiftKey && element.type !== 'line') { const size = Math.max(width, height); width = height = size; if (point.x < start.x) x = snap(start.x - size); if (point.y < start.y) y = snap(start.y - size); }
      Object.assign(element, { x, y, width, height }); renderCanvas(); renderSelection(); renderInspector(); return;
    }
    if (!state.interaction) return;
    if (state.interaction.type === 'pan') {
      state.panX = state.interaction.panX + event.clientX - state.interaction.startClientX;
      state.panY = state.interaction.panY + event.clientY - state.interaction.startClientY; updateTransform(); return;
    }
    if (state.interaction.type === 'move') {
      const dx = point.x - state.interaction.start.x, dy = point.y - state.interaction.start.y;
      state.interaction.before.forEach(before => {
        const element = state.elements.find(item => item.id === before.id); if (!element || element.locked) return;
        element.x = snap(before.x + dx); element.y = snap(before.y + dy);
      });
      renderCanvas(); renderSelection(); renderInspector(); return;
    }
    if (state.interaction.type === 'resize') resizeSelected(point, event.shiftKey);
  }

  function onCanvasPointerUp(event) {
    if (state.drawing) {
      const element = state.drawing.element;
      if (element.width < 5 && element.height < 5) { element.width = element.type === 'line' ? 160 : 120; element.height = element.type === 'line' ? 60 : 120; }
      state.drawing = null; setTool('select'); commitChange(`绘制${element.name}`);
    } else if (state.interaction) {
      const type = state.interaction.type; state.interaction = null; dom.canvasViewport.classList.remove('panning');
      if (type === 'move' || type === 'resize') commitChange(type === 'move' ? '移动对象' : '缩放对象');
    }
    if (dom.artboard.hasPointerCapture?.(event.pointerId)) dom.artboard.releasePointerCapture(event.pointerId);
  }

  function onCanvasDoubleClick(event) {
    const target = event.target.closest?.('[data-element-id]');
    if (!target) { if (state.tool === 'pen') finishPenPath(); return; }
    const element = state.elements.find(item => item.id === target.dataset.elementId);
    if (element?.type === 'text') editText(element);
    else if (element?.type === 'raw' && element.rawTag === 'text') editImportedText(element);
  }

  function resizeSelected(point, keepRatio) {
    const element = getSelected(), { handle, start, before } = state.interaction;
    if (!element) return;
    const dx = point.x - start.x, dy = point.y - start.y;
    let { x, y, width, height } = before;
    if (handle.includes('e')) width = Math.max(4, before.width + dx);
    if (handle.includes('s')) height = Math.max(4, before.height + dy);
    if (handle.includes('w')) { width = Math.max(4, before.width - dx); x = before.x + before.width - width; }
    if (handle.includes('n')) { height = Math.max(4, before.height - dy); y = before.y + before.height - height; }
    if ((keepRatio || element.type === 'circle') && ['nw','ne','se','sw'].includes(handle)) {
      const ratio = before.width / Math.max(1, before.height);
      if (width / height > ratio) height = width / ratio; else width = height * ratio;
      if (handle.includes('w')) x = before.x + before.width - width;
      if (handle.includes('n')) y = before.y + before.height - height;
    }
    Object.assign(element, { x: snap(x), y: snap(y), width: snap(width), height: snap(height) });
    if (element.type === 'path' && before.points?.length) {
      const sx = element.width / Math.max(1, before.width), sy = element.height / Math.max(1, before.height);
      element.points = before.points.map(([px, py]) => [px * sx, py * sy]);
    }
    renderCanvas(); renderSelection(); renderInspector();
  }

  function addPenPoint(point) {
    const local = { x: snap(point.x), y: snap(point.y) };
    state.penPoints.push(local); state.penHover = local; renderPenPreview();
  }

  function renderPenPreview() {
    if (!state.penPoints.length) { dom.penPreview.setAttribute('d', ''); return; }
    const points = [...state.penPoints, ...(state.penHover ? [state.penHover] : [])];
    dom.penPreview.setAttribute('d', `M ${points.map(point => `${point.x} ${point.y}`).join(' L ')}`);
  }

  function finishPenPath() {
    if (state.penPoints.length >= 2) {
      const minX = Math.min(...state.penPoints.map(point => point.x)), minY = Math.min(...state.penPoints.map(point => point.y));
      const maxX = Math.max(...state.penPoints.map(point => point.x)), maxY = Math.max(...state.penPoints.map(point => point.y));
      const points = state.penPoints.map(point => [point.x - minX, point.y - minY]);
      const element = makeElement('path', { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY), points, name: '钢笔路径' });
      state.elements.push(element); state.selectedId = element.id; state.selectedIds = [element.id]; commitChange('绘制钢笔路径');
    }
    state.penPoints = []; state.penHover = null; dom.penPreview.setAttribute('d', ''); setTool('select');
  }

  function onWheel(event) {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      const direction = event.deltaY > 0 ? -.08 : .08; setZoom(state.zoom + direction);
    } else {
      state.panX -= event.deltaX; state.panY -= event.deltaY; updateTransform();
    }
  }

  function updateCursorPosition(event) {
    const point = screenToSvg(event.clientX, event.clientY);
    dom.cursorPosition.innerHTML = `X ${Math.round(point.x)}&nbsp;&nbsp;Y ${Math.round(point.y)}`;
  }

  function screenToSvg(clientX, clientY) {
    const point = dom.artboard.createSVGPoint(); point.x = clientX; point.y = clientY;
    const matrix = dom.artboard.getScreenCTM();
    return matrix ? point.matrixTransform(matrix.inverse()) : { x: 0, y: 0 };
  }

  function snap(value) { return state.snap ? round(value, 8) : round(value, .1); }

  function setZoom(zoom) {
    state.zoom = clamp(zoom, .1, 4); updateTransform(); renderSelection(); renderStatus();
  }

  function fitCanvas() {
    const rect = dom.canvasViewport.getBoundingClientRect();
    const leftInset = $('.app-shell').classList.contains('left-collapsed') ? 50 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--left-w')) + 56;
    const rightInset = $('.app-shell').classList.contains('right-collapsed') ? 50 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--right-w')) + 56;
    state.zoom = clamp(Math.min((rect.width - leftInset - rightInset) / state.canvas.width, (rect.height - 185) / state.canvas.height), .1, 1.25);
    state.panX = (leftInset - rightInset) / 2; state.panY = 36; updateTransform(); renderSelection(); renderStatus();
  }

  function togglePanel(side) {
    const shell = $('.app-shell'), className = `${side}-collapsed`, collapsed = shell.classList.toggle(className);
    const button = document.getElementById(side === 'left' ? 'toggleLeftPanel' : 'toggleRightPanel');
    button.classList.toggle('active', collapsed); button.setAttribute('aria-pressed', String(collapsed));
    button.title = collapsed ? `展开${side === 'left' ? '素材' : '属性'}栏` : `折叠${side === 'left' ? '素材' : '属性'}栏`;
    requestAnimationFrame(fitCanvas);
  }

  function updateTransform() {
    dom.canvasStage.style.transform = `translate(-50%, -50%) translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
  }

  function updateSelected(changes, commit = false) {
    const elements = getSelectedElements().filter(element => !element.locked); if (!elements.length) return;
    elements.forEach(element => {
      const elementChanges = { ...changes };
      if (element.type === 'circle' && (Object.hasOwn(elementChanges, 'width') || Object.hasOwn(elementChanges, 'height'))) {
        const size = Object.hasOwn(elementChanges, 'width') ? elementChanges.width : elementChanges.height; elementChanges.width = size; elementChanges.height = size;
      }
      if (element.type === 'raw') {
        if (Object.hasOwn(elementChanges, 'fill')) elementChanges.overrideFill = true;
        if (Object.hasOwn(elementChanges, 'stroke')) elementChanges.overrideStroke = true;
        if (Object.hasOwn(elementChanges, 'strokeWidth')) elementChanges.overrideStrokeWidth = true;
        if (['strokeLinecap', 'strokeLinejoin', 'strokeDasharray'].some(property => Object.hasOwn(elementChanges, property))) elementChanges.overrideStrokeStyle = true;
        if (Object.hasOwn(elementChanges, 'fillOpacity')) elementChanges.overrideFillOpacity = true;
        if (Object.hasOwn(elementChanges, 'strokeOpacity')) elementChanges.overrideStrokeOpacity = true;
      }
      if (element.type === 'group' && ['fill', 'stroke', 'strokeWidth', 'strokeLinecap', 'strokeLinejoin', 'strokeDasharray'].some(property => Object.hasOwn(elementChanges, property))) applyChangesToChildren(element.children || [], elementChanges);
      Object.assign(element, elementChanges);
    });
    renderCanvas(); renderSelection(); renderLayers(); renderInspector(); renderStatus();
    if (commit) commitChange('修改属性'); else scheduleSave();
  }

  function applyChangesToChildren(children, changes) {
    children.forEach(child => { Object.assign(child, changes); if (child.type === 'group') applyChangesToChildren(child.children || [], changes); });
  }

  function duplicateSelected() {
    const selected = state.selectedIds.length ? state.selectedIds : [state.selectedId];
    const copies = selected.map(id => state.elements.find(item => item.id === id)).filter(Boolean).map(element => {
      const copy = { ...deepCopy(element), name: `${element.name} 副本`, x: element.x + 20, y: element.y + 20, locked: false }; regenerateElementIds(copy); return copy;
    });
    if (!copies.length) return;
    state.elements.push(...copies); state.selectedIds = copies.map(item => item.id); state.selectedId = copies.at(-1).id;
    commitChange('复制对象'); showToast(`已创建 ${copies.length} 个副本`, '⧉');
  }

  function copySelected(cut = false) {
    const ids = new Set(state.selectedIds.length ? state.selectedIds : state.selectedId ? [state.selectedId] : []);
    state.clipboard = state.elements.filter(item => ids.has(item.id)).map(deepCopy);
    if (!state.clipboard.length) return;
    showToast(cut ? '已剪切对象' : '已复制对象', cut ? '✂' : '⧉');
    if (cut) deleteSelected();
  }

  function pasteClipboard() {
    if (!state.clipboard.length) return;
    const copies = state.clipboard.map(item => { const copy = { ...deepCopy(item), name: `${item.name} 副本`, x: item.x + 24, y: item.y + 24, locked: false }; regenerateElementIds(copy); return copy; });
    state.clipboard = copies.map(deepCopy);
    state.elements.push(...copies); state.selectedIds = copies.map(item => item.id); state.selectedId = copies.at(-1).id;
    commitChange('粘贴对象'); showToast(`已粘贴 ${copies.length} 个对象`, '＋');
  }

  function regenerateElementIds(element) {
    element.id = uid(); (element.children || []).forEach(regenerateElementIds); return element;
  }

  function deleteSelected() {
    if (!state.selectedIds.length && !state.selectedId) return;
    const ids = new Set(state.selectedIds.length ? state.selectedIds : [state.selectedId]);
    const deletable = state.elements.filter(item => ids.has(item.id) && !item.locked).map(item => item.id);
    if (!deletable.length) return showToast('锁定的对象无法删除', '!');
    state.elements = state.elements.filter(item => !deletable.includes(item.id)); state.selectedId = null; state.selectedIds = [];
    commitChange('删除对象'); showToast(`已删除 ${deletable.length} 个对象`, '✓');
  }

  function swapColors() {
    const elements = getSelectedElements().filter(element => !element.locked); if (!elements.length) return;
    elements.forEach(element => {
      const fill = element.fill, stroke = element.stroke; element.fill = stroke; element.stroke = fill;
      if (element.stroke !== 'none' && !element.strokeWidth) element.strokeWidth = 2;
    });
    commitChange('交换填充与描边');
  }

  function reorderSelected(action) {
    const index = state.elements.findIndex(item => item.id === state.selectedId); if (index < 0) return;
    const [element] = state.elements.splice(index, 1);
    if (action === 'front') state.elements.push(element);
    else if (action === 'back') state.elements.unshift(element);
    else if (action === 'forward') state.elements.splice(Math.min(index + 1, state.elements.length), 0, element);
    else state.elements.splice(Math.max(index - 1, 0), 0, element);
    commitChange('调整图层顺序');
  }

  let draggedLayerId = null;
  document.addEventListener('dragstart', event => { draggedLayerId = event.target.closest?.('.layer-row')?.dataset.id || null; });
  function reorderLayerFromDrag(targetId) {
    if (!draggedLayerId || draggedLayerId === targetId) return;
    const from = state.elements.findIndex(item => item.id === draggedLayerId), to = state.elements.findIndex(item => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [element] = state.elements.splice(from, 1); state.elements.splice(to, 0, element); draggedLayerId = null; commitChange('调整图层顺序');
  }

  function renameLayer(element) {
    const name = window.prompt('图层名称', element.name);
    if (name?.trim()) { element.name = name.trim().slice(0, 60); commitChange('重命名图层'); }
  }

  function editText(element) {
    const text = window.prompt('编辑文本内容', element.text || '');
    if (text === null) return;
    element.text = text; element.width = Math.max(40, text.length * (element.fontSize || 36) * .62); commitChange('编辑文本');
  }

  function editImportedText(element) {
    const holder = document.createElementNS(SVG_NS, 'svg'); holder.innerHTML = element.raw || '';
    const textNode = holder.querySelector('text'); if (!textNode) return;
    const current = textNode.textContent || '';
    const text = window.prompt('编辑文本内容', current);
    if (text === null) return;
    textNode.replaceChildren(document.createTextNode(text));
    element.raw = holder.innerHTML; element.name = text.trim().slice(0, 28) || element.name;
    commitChange('编辑导入文本');
  }

  function pushHistory(label) {
    const snapshot = JSON.stringify({ canvas: state.canvas, elements: state.elements, sharedDefs: state.sharedDefs, title: dom.documentTitle?.value || 'Untitled artwork', label });
    if (state.history[state.historyIndex] === snapshot) return;
    state.history = state.history.slice(0, state.historyIndex + 1); state.history.push(snapshot);
    if (state.history.length > 80) state.history.shift();
    state.historyIndex = state.history.length - 1; updateHistoryButtons(); scheduleSave();
  }

  function commitChange(label) { pushHistory(label); renderAll(); }

  function undo() {
    if (state.historyIndex <= 0) return;
    state.historyIndex--; restoreHistory(); showToast('已撤销', '↶');
  }

  function redo() {
    if (state.historyIndex >= state.history.length - 1) return;
    state.historyIndex++; restoreHistory(); showToast('已重做', '↷');
  }

  function restoreHistory() {
    const snapshot = JSON.parse(state.history[state.historyIndex]);
    state.canvas = snapshot.canvas; state.elements = snapshot.elements; state.sharedDefs = snapshot.sharedDefs || ''; dom.documentTitle.value = snapshot.title;
    state.selectedId = null; state.selectedIds = []; renderAll(); scheduleSave();
  }

  function updateHistoryButtons() {
    dom.undoBtn.disabled = state.historyIndex <= 0; dom.redoBtn.disabled = state.historyIndex >= state.history.length - 1;
  }

  let saveTimer;
  function scheduleSave() {
    state.dirty = true; dom.saveState?.classList.add('saving'); if (dom.saveState) dom.saveState.lastChild.textContent = '保存中…';
    clearTimeout(saveTimer); saveTimer = setTimeout(persistDocument, 450);
  }

  function persistDocument() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ canvas: state.canvas, elements: state.elements, sharedDefs: state.sharedDefs, title: dom.documentTitle.value }));
      state.dirty = false; dom.saveState.classList.remove('saving'); dom.saveState.lastChild.textContent = '已自动保存';
    } catch { dom.saveState.lastChild.textContent = '无法保存'; }
  }

  function newDocument() {
    if (state.elements.length && !window.confirm('创建新文档？当前作品已自动保存，之后仍可从浏览器本地恢复。')) return;
    state.canvas = { width: 960, height: 640, background: 'transparent' }; state.elements = []; state.sharedDefs = ''; state.selectedId = null; state.selectedIds = [];
    dom.documentTitle.value = 'Untitled artwork'; commitChange('新建文档'); fitCanvas(); showToast('已创建空白文档', '＋');
  }

  function applyTemplate(name) {
    const templates = {
      social: { width: 1080, height: 1080, elements: [
        makeElement('rect', { name: '背景', x: 70, y: 70, width: 940, height: 940, radius: 64, fill: '#EEE9FF', stroke: 'none' }),
        makeElement('ellipse', { name: '暖阳', x: 700, y: 120, width: 240, height: 240, fill: '#FFCA68', stroke: 'none' }),
        makeElement('text', { name: '标题', x: 150, y: 300, width: 700, height: 220, text: 'Build\nbeautiful.', fontSize: 108, fontWeight: 800, fill: '#201D27', stroke: 'none' }),
        makeElement('rect', { name: '色块', x: 150, y: 700, width: 360, height: 120, radius: 60, fill: '#7656EE', stroke: 'none', rotation: -6 })
      ]},
      poster: { width: 720, height: 960, elements: [
        makeElement('rect', { name: '底色', x: 0, y: 0, width: 720, height: 960, fill: '#19171F', stroke: 'none' }),
        makeElement('ellipse', { name: '红日', x: 350, y: 460, width: 410, height: 410, fill: '#FF655E', stroke: 'none' }),
        makeElement('text', { name: '编号', x: 70, y: 90, width: 500, height: 180, text: 'NO. 04', fontSize: 104, fontWeight: 800, fill: '#FFFFFF', stroke: 'none' }),
        makeElement('text', { name: '说明', x: 78, y: 315, width: 350, height: 70, text: 'FORM / SPACE / COLOR', fontSize: 20, fontWeight: 600, letterSpacing: 3, fill: '#B6B1C1', stroke: 'none' })
      ]},
      logo: { width: 800, height: 800, elements: [
        makeElement('rect', { name: '金色背景', x: 70, y: 70, width: 660, height: 660, radius: 170, fill: '#FFCA68', stroke: 'none' }),
        makeElement('rect', { name: '标志底板', x: 230, y: 230, width: 340, height: 340, radius: 100, fill: '#201E24', stroke: 'none', rotation: 8 }),
        makeElement('text', { name: '字母标志', x: 325, y: 280, width: 190, height: 200, text: 'V', fontSize: 190, fontWeight: 800, fill: '#FFFFFF', stroke: 'none' })
      ]}
    };
    const template = templates[name]; if (!template) return;
    state.canvas = { width: template.width, height: template.height, background: 'transparent' }; state.elements = template.elements; state.sharedDefs = '';
    state.selectedId = null; state.selectedIds = []; dom.documentTitle.value = name === 'social' ? 'Social launch' : name === 'poster' ? 'Edition 04' : 'Vectora mark';
    commitChange('应用模板'); fitCanvas(); showToast('模板已应用', '✦');
  }

  function serializeSvg() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('xmlns', SVG_NS); svg.setAttribute('viewBox', `0 0 ${state.canvas.width} ${state.canvas.height}`);
    svg.setAttribute('width', state.canvas.width); svg.setAttribute('height', state.canvas.height);
    if (state.sharedDefs) {
      const defs = document.createElementNS(SVG_NS, 'defs'); defs.innerHTML = state.sharedDefs; svg.appendChild(defs);
    }
    if (state.canvas.background && state.canvas.background !== 'transparent') {
      const background = document.createElementNS(SVG_NS, 'rect'); background.setAttribute('width', '100%'); background.setAttribute('height', '100%'); background.setAttribute('fill', state.canvas.background); background.dataset.canvasBackground = 'true'; svg.appendChild(background);
    }
    state.elements.filter(element => !element.hidden).forEach(element => { const node = buildSvgElement(element, true); if (node) { node.removeAttribute('data-element-id'); svg.appendChild(node); } });
    return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(svg)}`;
  }

  function showExportModal() {
    dom.exportPreview.innerHTML = serializeSvg().replace(/^<\?xml[^>]+>\s*/, '');
    openModal('exportModal'); setExportFormat(state.exportFormat);
  }

  function setExportFormat(format) {
    state.exportFormat = format; $$('.export-option').forEach(button => button.classList.toggle('active', button.dataset.format === format));
    dom.downloadBtn.textContent = `下载 .${format.toUpperCase()}`;
  }

  async function copySvg() {
    try { await navigator.clipboard.writeText(serializeSvg()); showToast('SVG 代码已复制', '✓'); }
    catch { fallbackCopy(serializeSvg()); showToast('SVG 代码已复制', '✓'); }
  }

  function fallbackCopy(text) {
    const area = document.createElement('textarea'); area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
  }

  function downloadExport() {
    const name = safeFilename(dom.documentTitle.value || 'vectora-artwork');
    if (state.exportFormat === 'svg') {
      downloadBlob(new Blob([serializeSvg()], { type: 'image/svg+xml;charset=utf-8' }), `${name}.svg`); showToast('SVG 已开始下载', '↓'); return;
    }
    const scale = Number(dom.exportScale.value) || 2, svg = serializeSvg(), blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob), image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas'); canvas.width = state.canvas.width * scale; canvas.height = state.canvas.height * scale;
      const context = canvas.getContext('2d'); context.scale(scale, scale); context.drawImage(image, 0, 0);
      canvas.toBlob(pngBlob => { downloadBlob(pngBlob, `${name}@${scale}x.png`); URL.revokeObjectURL(url); showToast('PNG 已开始下载', '↓'); }, 'image/png');
    };
    image.onerror = () => { URL.revokeObjectURL(url); showToast('PNG 渲染失败', '!'); };
    image.src = url;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importSvgFile(event) {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    await importSvgText(await file.text(), file.name.replace(/\.svg$/i, ''), { replaceDocument: true });
  }

  function importRasterImage(event) {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image(); image.onload = () => {
        const max = 420, scale = Math.min(1, max / Math.max(image.naturalWidth || max, image.naturalHeight || max));
        addCenteredElement('image', { name: file.name.replace(/\.[^.]+$/, '').slice(0, 50) || '图片', href: reader.result, width: Math.max(1, (image.naturalWidth || 240) * scale), height: Math.max(1, (image.naturalHeight || 160) * scale) });
      };
      image.onerror = () => showToast('图片无法读取', '!'); image.src = reader.result;
    };
    reader.onerror = () => showToast('图片无法读取', '!'); reader.readAsDataURL(file);
  }

  async function handleDrop(event) {
    event.preventDefault(); dom.canvasStage.classList.remove('drag-over');
    const file = [...event.dataTransfer.files].find(item => item.type === 'image/svg+xml' || item.name.toLowerCase().endsWith('.svg'));
    if (file) await importSvgText(await file.text(), file.name.replace(/\.svg$/i, ''), { replaceDocument: false });
  }

  async function importSvgText(text, name = '导入图稿', { replaceDocument = false } = {}) {
    const parser = new DOMParser(), doc = parser.parseFromString(text, 'image/svg+xml');
    if (doc.querySelector('parsererror') || doc.documentElement.tagName.toLowerCase() !== 'svg') return showToast('这不是有效的 SVG 文件', '!');
    const root = doc.documentElement;
    sanitizeSvg(root);
    const importToken = `imp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}_`;
    const namespace = namespaceSvgResources(root, importToken);
    const viewBoxValues = (root.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
    const hasViewBox = viewBoxValues.length === 4 && viewBoxValues.every(Number.isFinite);
    let width = hasViewBox ? viewBoxValues[2] : parseFloat(root.getAttribute('width')) || 960;
    let height = hasViewBox ? viewBoxValues[3] : parseFloat(root.getAttribute('height')) || 640;
    const sourceX = hasViewBox ? viewBoxValues[0] : 0, sourceY = hasViewBox ? viewBoxValues[1] : 0;
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) { width = 960; height = 640; }

    const defsMarkup = [...root.querySelectorAll(':scope > defs')].map(defs => defs.innerHTML).join('');
    const graphicsSelector = 'path,rect,circle,ellipse,line,polyline,polygon,text,image,use';
    const sourceNodes = [...root.querySelectorAll(graphicsSelector)].filter(node => !node.closest('defs,clipPath,mask,marker,pattern,symbol'));
    if (!sourceNodes.length) return showToast('SVG 中没有可编辑的图形元素', '!');

    const measureSvg = document.createElementNS(SVG_NS, 'svg');
    measureSvg.setAttribute('viewBox', `${sourceX} ${sourceY} ${width} ${height}`);
    measureSvg.setAttribute('width', width); measureSvg.setAttribute('height', height);
    Object.assign(measureSvg.style, { position: 'fixed', left: '-20000px', top: '0', visibility: 'hidden', pointerEvents: 'none', overflow: 'visible' });
    if (defsMarkup) {
      const defs = document.createElementNS(SVG_NS, 'defs'); defs.innerHTML = defsMarkup; measureSvg.appendChild(defs);
    }
    const measurementRecords = sourceNodes.slice(0, 2000).map((source, index) => {
      const { content, leaf } = cloneGraphicWithAncestors(source, root);
      const container = document.createElementNS(SVG_NS, 'g'); container.appendChild(content); measureSvg.appendChild(container);
      return { source, content, leaf, container, index };
    });
    document.body.appendChild(measureSvg);
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(resolve));

    const targetWidth = replaceDocument ? width : state.canvas.width, targetHeight = replaceDocument ? height : state.canvas.height;
    const maxW = replaceDocument ? width : targetWidth * .78, maxH = replaceDocument ? height : targetHeight * .78;
    const scale = replaceDocument ? 1 : Math.min(1, maxW / width, maxH / height);
    const offsetX = replaceDocument ? 0 : (targetWidth - width * scale) / 2;
    const offsetY = replaceDocument ? 0 : (targetHeight - height * scale) / 2;
    const imported = [];
    measurementRecords.forEach(record => {
      try {
        const bbox = transformedSvgBBox(record.leaf);
        if (!bbox || ![bbox.x, bbox.y, bbox.width, bbox.height].every(Number.isFinite)) return;
        const computed = getComputedStyle(record.leaf);
        record.leaf.removeAttribute('data-import-leaf');
        const sourceWidth = bbox.width > .001 ? bbox.width : 1, sourceHeight = bbox.height > .001 ? bbox.height : 1;
        const elementSourceX = bbox.width > .001 ? bbox.x : bbox.x - .5;
        const elementSourceY = bbox.height > .001 ? bbox.y : bbox.y - .5;
        imported.push(makeElement('raw', {
          name: importedElementName(record.source, record.index, namespace, name), rawTag: record.source.localName.toLowerCase(),
          x: offsetX + (elementSourceX - sourceX) * scale, y: offsetY + (elementSourceY - sourceY) * scale,
          width: sourceWidth * scale, height: sourceHeight * scale,
          sourceWidth, sourceHeight, sourceX: elementSourceX, sourceY: elementSourceY,
          raw: record.container.innerHTML, fill: computed.fill || 'none', stroke: computed.stroke || 'none',
          strokeWidth: parseFloat(computed.strokeWidth) || 0, opacity: 1,
          overrideFill: false, overrideStroke: false, overrideStrokeWidth: false
        }));
      } catch { /* Ignore SVG nodes that cannot produce geometry. */ }
    });
    measureSvg.remove();
    if (!imported.length) return showToast('SVG 图形无法解析', '!');
    if (replaceDocument) {
      state.canvas = { width, height, background: 'transparent' };
      state.elements = []; state.sharedDefs = ''; dom.documentTitle.value = name;
    }
    if (defsMarkup) state.sharedDefs += defsMarkup;
    if (!replaceDocument) state.elements = state.elements.filter(element => !(element.type === 'raw' && !element.rawTag && element.name === name));
    state.elements.push(...imported);
    state.selectedId = imported.at(-1).id; state.selectedIds = [state.selectedId];
    commitChange(`拆分导入 ${name}`);
    if (replaceDocument) fitCanvas();
    showToast(`已拆分为 ${imported.length} 个可编辑图层`, '✓');
  }

  function sanitizeSvg(root) {
    root.querySelectorAll('script, foreignObject, iframe, object, embed').forEach(node => node.remove());
    root.querySelectorAll('*').forEach(node => {
      [...node.attributes].forEach(attribute => {
        const name = attribute.name.toLowerCase(), value = attribute.value.trim().toLowerCase();
        if (name.startsWith('on') || ((name === 'href' || name.endsWith(':href')) && /^(javascript:|https?:)/.test(value))) node.removeAttribute(attribute.name);
      });
    });
    root.querySelectorAll('style').forEach(style => {
      style.textContent = style.textContent.replace(/@import[^;]+;?/gi, '').replace(/url\(\s*['"]?https?:[^)]+\)/gi, 'none');
    });
  }

  function namespaceSvgResources(root, prefix) {
    const ids = new Map(), classes = new Map();
    root.querySelectorAll('[id]').forEach(node => ids.set(node.id, `${prefix}${node.id}`));
    root.querySelectorAll('[class]').forEach(node => node.classList.forEach(className => {
      if (!classes.has(className)) classes.set(className, `${prefix}${className}`);
    }));
    root.querySelectorAll('*').forEach(node => {
      if (node.id && ids.has(node.id)) node.id = ids.get(node.id);
      if (node.hasAttribute('class')) node.setAttribute('class', [...node.classList].map(className => classes.get(className) || className).join(' '));
      [...node.attributes].forEach(attribute => {
        if (attribute.name === 'id' || attribute.name === 'class') return;
        let value = attribute.value;
        ids.forEach((replacement, original) => {
          value = value.replace(new RegExp(`url\\(\\s*(['"]?)#${escapeRegExp(original)}\\1\\s*\\)`, 'g'), `url(#${replacement})`);
          if ((attribute.name === 'href' || attribute.name.endsWith(':href')) && value === `#${original}`) value = `#${replacement}`;
        });
        if (attribute.name === 'aria-labelledby' || attribute.name === 'aria-describedby') value = value.split(/\s+/).map(token => ids.get(token) || token).join(' ');
        if (value !== attribute.value) node.setAttribute(attribute.name, value);
      });
    });
    root.querySelectorAll('style').forEach(style => {
      let css = style.textContent;
      ids.forEach((replacement, original) => { css = css.replace(new RegExp(`#${escapeRegExp(original)}(?![\\w-])`, 'g'), `#${replacement}`); });
      classes.forEach((replacement, original) => { css = css.replace(new RegExp(`\\.${escapeRegExp(original)}(?![\\w-])`, 'g'), `.${replacement}`); });
      style.textContent = css;
    });
    return {
      originalId: new Map([...ids].map(([original, replacement]) => [replacement, original])),
      originalClass: new Map([...classes].map(([original, replacement]) => [replacement, original]))
    };
  }

  function cloneGraphicWithAncestors(source, root) {
    const leaf = source.cloneNode(true); leaf.setAttribute('data-import-leaf', 'true');
    let content = leaf, ancestor = source.parentElement;
    while (ancestor && ancestor !== root) {
      if (ancestor.localName.toLowerCase() === 'defs') break;
      const wrapper = ancestor.cloneNode(false);
      wrapper.removeAttribute('id');
      wrapper.appendChild(content); content = wrapper; ancestor = ancestor.parentElement;
    }
    if (root.hasAttribute('class') || root.hasAttribute('style') || root.hasAttribute('transform')) {
      const wrapper = document.createElementNS(SVG_NS, 'g');
      ['class', 'style', 'transform'].forEach(attribute => { if (root.hasAttribute(attribute)) wrapper.setAttribute(attribute, root.getAttribute(attribute)); });
      wrapper.appendChild(content); content = wrapper;
    }
    return { content, leaf };
  }

  function transformedSvgBBox(node) {
    const box = node.getBBox(), matrix = node.getCTM();
    if (!matrix) return { x: box.x, y: box.y, width: box.width, height: box.height };
    const corners = [[box.x, box.y], [box.x + box.width, box.y], [box.x + box.width, box.y + box.height], [box.x, box.y + box.height]].map(([x, y]) => {
      const point = new DOMPoint(x, y).matrixTransform(matrix); return { x: point.x, y: point.y };
    });
    const xs = corners.map(point => point.x), ys = corners.map(point => point.y);
    return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
  }

  function importedElementName(node, index, namespace, documentName) {
    const label = node.getAttribute('aria-label'); if (label) return label.trim().slice(0, 40);
    if (node.id) return (namespace.originalId.get(node.id) || node.id).slice(0, 40);
    if (node.localName.toLowerCase() === 'text') {
      const text = (node.textContent || '').replace(/\s+/g, ' ').trim(); if (text) return text.slice(0, 40);
    }
    const firstClass = [...node.classList][0];
    if (firstClass) return (namespace.originalClass.get(firstClass) || firstClass).slice(0, 40);
    const names = { rect: '矩形', circle: '圆形', ellipse: '椭圆', line: '直线', polyline: '折线', polygon: '多边形', path: '路径', image: '图像', use: '引用' };
    return `${documentName} · ${names[node.localName.toLowerCase()] || '元素'} ${index + 1}`;
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function filterAssets(event) {
    const query = event.target.value.trim().toLowerCase();
    $$('.asset-card').forEach(card => { const text = `${card.textContent} ${card.title}`.toLowerCase(); card.style.display = !query || text.includes(query) ? '' : 'none'; });
    $$('.icon-asset').forEach(card => { card.style.display = !query || card.title.toLowerCase().includes(query) ? '' : 'none'; });
  }

  function shufflePalettes() {
    palettes.push(palettes.shift()); renderPalettes();
  }

  function onKeyDown(event) {
    const editing = /INPUT|TEXTAREA|SELECT/.test(event.target.tagName);
    if (event.code === 'Space' && !editing) { event.preventDefault(); state.spaceDown = true; dom.canvasViewport.classList.add('space-hand'); }
    if (editing) return;
    const modifier = event.ctrlKey || event.metaKey;
    if (modifier && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); return; }
    if (modifier && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); return; }
    if (modifier && event.key.toLowerCase() === 'd') { event.preventDefault(); duplicateSelected(); return; }
    if (modifier && event.key.toLowerCase() === 'c') { event.preventDefault(); copySelected(false); return; }
    if (modifier && event.key.toLowerCase() === 'x') { event.preventDefault(); copySelected(true); return; }
    if (modifier && event.key.toLowerCase() === 'v') { event.preventDefault(); pasteClipboard(); return; }
    if (modifier && event.key.toLowerCase() === 'a') { event.preventDefault(); selectAll(); return; }
    if (modifier && event.key.toLowerCase() === 'g') { event.preventDefault(); event.shiftKey ? ungroupSelected() : groupSelected(); return; }
    if (modifier && event.key.toLowerCase() === 's') { event.preventDefault(); showExportModal(); return; }
    if (modifier && event.key === '/') { event.preventDefault(); openModal('shortcutModal'); return; }
    if (event.key === 'Escape') { $$('.modal-backdrop:not(.hidden)').forEach(modal => closeModal(modal.id)); if (state.penPoints.length) { state.penPoints = []; renderPenPreview(); } else deselect(); return; }
    if (event.key === 'Enter' && state.penPoints.length) { finishPenPath(); return; }
    if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); deleteSelected(); return; }
    if (event.key === '1') { fitCanvas(); return; }
    if (event.key === '+' || event.key === '=') { setZoom(state.zoom + .1); return; }
    if (event.key === '-') { setZoom(state.zoom - .1); return; }
    const toolKeys = { v: 'select', r: 'rect', o: 'ellipse', l: 'line', p: 'pen', t: 'text', h: 'hand' };
    if (toolKeys[event.key.toLowerCase()]) setTool(toolKeys[event.key.toLowerCase()]);
    const elements = getSelectedElements().filter(element => !element.locked);
    if (elements.length && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
      event.preventDefault(); const amount = event.shiftKey ? 10 : 1;
      elements.forEach(element => {
        if (event.key === 'ArrowLeft') element.x -= amount; if (event.key === 'ArrowRight') element.x += amount;
        if (event.key === 'ArrowUp') element.y -= amount; if (event.key === 'ArrowDown') element.y += amount;
      });
      renderAll(); debounceCommitNudge();
    }
  }

  function onKeyUp(event) {
    if (event.code === 'Space') { state.spaceDown = false; dom.canvasViewport.classList.remove('space-hand'); }
  }

  const debounceCommitNudge = debounce(() => pushHistory('微调对象'), 300);

  function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
  function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

  let toastTimer;
  function showToast(message, icon = '✓') {
    dom.toastText.textContent = message; dom.toastIcon.textContent = icon; dom.toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => dom.toast.classList.remove('show'), 1800);
  }

  function setRangeFill(input, value) {
    const percent = ((value - Number(input.min || 0)) / (Number(input.max || 100) - Number(input.min || 0))) * 100;
    input.style.setProperty('--range', `${clamp(percent, 0, 100)}%`);
  }

  function normalizeColor(value) {
    if (!value || String(value).toLowerCase() === 'none') return null;
    if (window.CSS?.supports && !CSS.supports('color', String(value).trim())) return null;
    const context = document.createElement('canvas').getContext('2d');
    try { context.fillStyle = '#000000'; context.fillStyle = String(value).trim(); const normalized = context.fillStyle; return normalized.startsWith('#') ? normalized : rgbToHex(normalized); } catch { return null; }
  }

  function rgbToHex(rgb) {
    const numbers = rgb.match(/\d+/g); if (!numbers || numbers.length < 3) return '#000000';
    return `#${numbers.slice(0, 3).map(value => Number(value).toString(16).padStart(2, '0')).join('')}`;
  }

  function safeFilename(value) { return value.trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-').slice(0, 80) || 'vectora-artwork'; }

  function debounce(fn, delay) {
    let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  }

  init();
})();
