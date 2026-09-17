import { test, expect, type Page, type Locator } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { makeElement } from '../../src/model/elements';
import { blankDocument } from '../../src/model/storage';
import { apply, elementMatrix } from '../../src/model/geometry';
import type { Point, StudioDocument, StudioElement } from '../../src/model/types';

async function open(page: Page, elements: StudioElement[]) {
  await page.addInitScript(
    (doc) => {
      if (!localStorage.getItem('vectora-svg-studio-v3'))
        localStorage.setItem('vectora-svg-studio-v3', JSON.stringify(doc));
    },
    { ...blankDocument(), elements },
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Library', exact: true })).toBeVisible();
}
async function world(page: Page, p: Point): Promise<Point> {
  return page.locator('#artboard').evaluate((el, p) => {
    const a = new DOMPoint(...p).matrixTransform((el as SVGSVGElement).getScreenCTM()!);
    return [a.x, a.y];
  }, p);
}
async function center(locator: Locator): Promise<Point> {
  const b = await locator.boundingBox();
  expect(b).not.toBeNull();
  return [b!.x + b!.width / 2, b!.y + b!.height / 2];
}
async function drag(page: Page, from: Point, to: Point) {
  await page.mouse.move(...from);
  await page.mouse.down();
  await page.mouse.move(...to, { steps: 12 });
  await page.mouse.up();
}
async function saved(page: Page): Promise<StudioDocument> {
  await expect(page.getByText('Saved locally', { exact: true })).toBeVisible();
  return page.evaluate(() => JSON.parse(localStorage.getItem('vectora-svg-studio-v3')!));
}
async function field(page: Page, label: string, value: string) {
  const input = page.getByLabel(label, { exact: true });
  await input.fill(value);
  await input.press('Enter');
}
async function exportSvg(page: Page) {
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download SVG' }).click();
  const download = await downloading;
  const source = await readFile((await download.path())!, 'utf8');
  await page.keyboard.press('Escape');
  return source;
}

test('sidebars meet the header and all outer edges with no gaps', async ({ page }) => {
  await open(page, []);
  for (const size of [
    { width: 1440, height: 1000 },
    { width: 1024, height: 768 },
  ]) {
    await page.setViewportSize(size);
    const header = (await page.locator('.topbar').boundingBox())!,
      left = (await page.locator('.library').boundingBox())!,
      right = (await page.locator('.inspector').boundingBox())!;
    expect(left.x).toBe(0);
    expect(right.x + right.width).toBe(size.width);
    for (const panel of [left, right]) {
      expect(panel.y).toBe(header.y + header.height);
      expect(panel.y + panel.height).toBe(size.height);
    }
    const dock = (await page.locator('.tool-dock').boundingBox())!;
    expect(dock.x).toBeGreaterThanOrEqual(left.width);
    expect(dock.x + dock.width).toBeLessThanOrEqual(right.x);
    await page.getByRole('button', { name: 'Workspace settings', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Workspace settings' })).toBeVisible();
    await page.getByRole('button', { name: 'Close workspace settings' }).click();
  }
});

test('grid spacing, visible style, snapping and preferences survive reload', async ({ page }) => {
  await open(page, []);
  await page.getByRole('button', { name: 'Workspace settings', exact: true }).click();
  const settings = page.getByRole('region', { name: 'Workspace settings' });
  const input = settings.getByLabel('Grid size', { exact: true });
  await input.fill('32');
  await input.press('Enter');
  await settings.getByLabel('Grid style').selectOption('lines');
  await settings.getByRole('switch', { name: 'Snap to grid' }).check();
  await expect(page.locator('#workspace-grid')).toHaveAttribute('width', '32');
  await expect(page.locator('#workspace-grid path')).toHaveCount(1);
  await page.getByRole('button', { name: 'Close workspace settings' }).click();
  await page.getByRole('button', { name: 'Rectangle', exact: true }).click();
  await drag(page, await world(page, [109, 143]), await world(page, [271, 291]));
  const doc = await saved(page);
  expect(doc.elements[0].x).toBe(96);
  expect(doc.elements[0].y).toBe(128);
  expect(doc.elements[0].width).toBe(160);
  expect(doc.elements[0].height).toBe(160);
  await page.reload();
  await expect(page.locator('#workspace-grid')).toHaveAttribute('width', '32');
  await expect(page.getByLabel('Grid style')).toHaveValue('lines');
  await expect(page.getByRole('switch', { name: 'Snap to grid' })).toBeChecked();
});

test('the same marquee distinguishes touching from fully enclosed objects', async ({ page }) => {
  const e = makeElement('rect', { x: 200, y: 180, width: 200, height: 150, stroke: 'none' });
  await open(page, [e]);
  await drag(page, await world(page, [150, 150]), await world(page, [260, 260]));
  await expect(page.locator('.selection-outline')).toHaveCount(1);
  await page.getByRole('button', { name: 'Workspace settings', exact: true }).click();
  await page
    .getByRole('region', { name: 'Workspace settings' })
    .getByLabel('Marquee selection')
    .selectOption('contain');
  await page.getByRole('button', { name: 'Close workspace settings' }).click();
  await drag(page, await world(page, [150, 150]), await world(page, [260, 260]));
  await expect(page.locator('.selection-outline')).toHaveCount(0);
  await drag(page, await world(page, [150, 150]), await world(page, [450, 360]));
  await expect(page.locator('.selection-outline')).toHaveCount(1);
  await page.reload();
  await expect(page.getByLabel('Marquee selection')).toHaveValue('contain');
});

test('selected cubic anchors are directly editable, symmetric and Alt-independent', async ({
  page,
}) => {
  const e = makeElement('bezier', {
    x: 200,
    y: 160,
    width: 320,
    height: 180,
    points: [
      [0, 100],
      [60, 0],
      [100, 80],
      [160, 100],
      [220, 120],
      [280, 0],
      [320, 100],
    ],
  });
  await open(page, [e]);
  await page.mouse.click(...(await world(page, [360, 260])));
  await expect(page.locator('[data-node-index]')).toHaveCount(7);
  await page.locator('[data-node-index="3"]').click();
  await page.getByRole('button', { name: 'Symmetric', exact: true }).click();
  const before = (await saved(page)).elements[0],
    a = apply(elementMatrix(before), before.points![3]);
  await drag(
    page,
    await center(page.locator('[data-node-index="4"]')),
    await world(page, [a[0] + 55, a[1] + 65]),
  );
  let changed = (await saved(page)).elements[0],
    pts = changed.points!;
  expect(pts[2][0] + pts[4][0]).toBeCloseTo(2 * pts[3][0], 0);
  expect(pts[2][1] + pts[4][1]).toBeCloseTo(2 * pts[3][1], 0);
  const linked = apply(elementMatrix(changed), pts[2]);
  await page.keyboard.down('Alt');
  const handle = await center(page.locator('[data-node-index="4"]'));
  await drag(page, handle, [handle[0] + 35, handle[1] - 20]);
  await page.keyboard.up('Alt');
  changed = (await saved(page)).elements[0];
  const fixed = apply(elementMatrix(changed), changed.points![2]);
  expect(fixed[0]).toBeCloseTo(linked[0]);
  expect(fixed[1]).toBeCloseTo(linked[1]);
  expect(changed.anchorModes![3]).toBe('corner');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  expect((await saved(page)).elements[0].anchorModes![3]).toBe('symmetric');
  await page.screenshot({ path: 'test-results/direct-nodes.png' });
});

test('shape corner handles, canvas rotation, flipping and multi-object scaling are undoable', async ({
  page,
}) => {
  const a = makeElement('rect', { x: 180, y: 180, width: 200, height: 160, radius: 8 }),
    b = makeElement('ellipse', { x: 520, y: 220, width: 140, height: 100 });
  await open(page, [a, b]);
  await page.mouse.click(...(await world(page, [250, 250])));
  await drag(
    page,
    await center(page.locator('[data-shape-handle="radius"]')),
    await world(page, [230, 200]),
  );
  expect((await saved(page)).elements[0].radius).toBeCloseTo(50, 0);
  await page.keyboard.down('Shift');
  await drag(page, await center(page.locator('[data-rotate]')), await world(page, [430, 260]));
  await page.keyboard.up('Shift');
  expect((await saved(page)).elements[0].rotation).toBe(90);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  expect((await saved(page)).elements[0].rotation).toBe(0);
  await page.getByRole('button', { name: 'Flip horizontal', exact: true }).click();
  expect((await saved(page)).elements[0].affine![0]).toBe(-1);
  await page.locator('.canvas-workspace').focus();
  await page.keyboard.press('Control+a');
  await expect(page.locator('[data-multi-handle]')).toHaveCount(4);
  const previous = await saved(page),
    handle = await center(page.locator('[data-multi-handle="se"]'));
  await drag(page, handle, [handle[0] + 60, handle[1] + 40]);
  const changed = await saved(page);
  expect(changed.elements[1].affine![0]).toBeGreaterThan(1);
  await page.keyboard.press('Control+z');
  expect((await saved(page)).elements).toEqual(previous.elements);
});

test('sharp Bézier anchors stay selectable when their handles overlap', async ({ page }) => {
  await open(page, []);
  await page.getByRole('button', { name: 'Bézier', exact: true }).click();
  for (const p of [
    [180, 180],
    [380, 330],
    [580, 180],
  ] as Point[])
    await page.mouse.click(...(await world(page, p)));
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-node-index]')).toHaveCount(7);
  await page.mouse.click(...(await world(page, [380, 330])));
  await expect(page.getByRole('button', { name: 'Delete node', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Symmetric', exact: true }).click();
  const e = (await saved(page)).elements[0];
  expect(
    Math.hypot(e.points![4][0] - e.points![3][0], e.points![4][1] - e.points![3][1]),
  ).toBeGreaterThan(50);
});

test('double-clicking a path inserts a node directly and curve conversion preserves anchors', async ({
  page,
}) => {
  const e = makeElement('polyline', {
    x: 200,
    y: 200,
    width: 300,
    height: 120,
    points: [
      [0, 0],
      [150, 120],
      [300, 0],
    ],
  });
  await open(page, [e]);
  await page.mouse.dblclick(...(await world(page, [275, 260])));
  await expect(page.locator('[data-node-index]')).toHaveCount(4);
  let doc = await saved(page);
  expect(doc.elements[0].points).toHaveLength(4);
  await page.getByRole('button', { name: 'Convert to Bézier', exact: true }).click();
  await expect(page.locator('[data-node-index]')).toHaveCount(10);
  doc = await saved(page);
  expect(doc.elements[0].type).toBe('bezier');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.locator('[data-node-index]')).toHaveCount(4);
});

test('multi-stop fill and stroke gradients edit on canvas and export as native SVG', async ({
  page,
}) => {
  const rect = makeElement('rect', { x: 200, y: 160, width: 350, height: 260, radius: 24 });
  await open(page, [rect]);
  await page.mouse.click(...(await world(page, [300, 270])));
  await page.getByLabel('Fill type', { exact: true }).selectOption('linear');
  await page.getByRole('button', { name: 'Add fill gradient stop', exact: true }).click();
  await field(page, 'fill stop hex', '#ff7700');
  await field(page, 'fill stop position', '40');
  await field(page, 'fill stop opacity', '60');
  await field(page, 'fill gradient angle', '35');
  await page.getByLabel('fill gradient spread').selectOption('reflect');
  await page.getByRole('button', { name: 'Edit gradient on canvas', exact: true }).click();
  const handle = await center(page.locator('[data-gradient-handle="end"]'));
  await drag(page, handle, [handle[0] - 35, handle[1] + 20]);
  let doc = await saved(page);
  expect(doc.elements[0].fillGradient!.stops).toHaveLength(3);
  expect(
    doc.elements[0].fillGradient!.stops.some(
      (s) => s.color === '#ff7700' && s.opacity === 0.6 && s.offset === 0.4,
    ),
  ).toBe(true);
  const g = doc.elements[0].fillGradient!;
  expect(g.end[0]).not.toBeCloseTo(0.9096, 2);
  await page.getByRole('button', { name: 'Finish gradient editing', exact: true }).click();
  await page.screenshot({ path: 'test-results/gradient-inspector.png' });
  let source = await exportSvg(page);
  expect(source).toContain('<linearGradient');
  expect(source).toContain('stop-opacity="0.6"');
  expect(source).toContain('spreadMethod="reflect"');
  expect(source).not.toMatch(/data-gradient|workspace-grid|selectionLayer|data-hit-area/);
  await page.getByLabel('Fill type', { exact: true }).selectOption('radial');
  await field(page, 'fill gradient radius', '65');
  await page.getByLabel('Stroke type', { exact: true }).selectOption('linear');
  await field(page, 'Stroke width', '8');
  doc = await saved(page);
  expect(doc.elements[0].fillGradient!.start).toEqual([0.5, 0.5]);
  expect(doc.elements[0].strokeGradient!.type).toBe('linear');
  source = await exportSvg(page);
  expect(source).toContain('<radialGradient');
  expect(source).toContain('<linearGradient');
  await page.reload();
  await page.mouse.click(...(await world(page, [300, 270])));
  await expect(page.getByLabel('Fill type', { exact: true })).toHaveValue('radial');
  expect((await saved(page)).elements[0].fillGradient!.stops).toHaveLength(3);
});

test('gradient strokes on horizontal lines remain visible in exported pixels', async ({ page }) => {
  const line = makeElement('line', {
    x: 100,
    y: 200,
    width: 400,
    height: 1,
    points: [
      [0, 0],
      [400, 0],
    ],
    strokeWidth: 20,
  });
  await open(page, [line]);
  await page.mouse.click(...(await world(page, [300, 200])));
  await page.getByLabel('Stroke type', { exact: true }).selectOption('linear');
  const source = await exportSvg(page);
  const pixels = await page.evaluate(async (source) => {
    const img = new Image(),
      url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml' }));
    img.src = url;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 640;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const a = [...ctx.getImageData(120, 200, 1, 1).data],
      b = [...ctx.getImageData(480, 200, 1, 1).data];
    URL.revokeObjectURL(url);
    return [a, b];
  }, source);
  expect(pixels[0][3]).toBe(255);
  expect(pixels[1][3]).toBe(255);
  expect(pixels[1][0] - pixels[0][0]).toBeGreaterThan(100);
});

test('text edits in place, offers many font families, and embeds an imported font', async ({
  page,
}) => {
  const text = makeElement('text', {
    x: 180,
    y: 180,
    width: 450,
    height: 85,
    text: 'Editable lettering',
    fontSize: 45,
  });
  await open(page, [text]);
  await page.mouse.dblclick(...(await world(page, [300, 210])));
  const editor = page.getByLabel('Edit text on canvas');
  await expect(editor).toBeFocused();
  await editor.fill('Type directly here');
  await editor.press('Control+Enter');
  expect((await saved(page)).elements[0].text).toBe('Type directly here');
  const family = page.getByLabel('Font family', { exact: true });
  expect(await family.locator('option').count()).toBeGreaterThan(35);
  await family.selectOption('"Georgia"');
  expect((await saved(page)).elements[0].fontFamily).toBe('"Georgia"');
  await page.getByLabel('Font category').selectOption('Monospace');
  expect(await family.locator('option').count()).toBeLessThan(10);
  await page
    .getByLabel('Import font file', { exact: true })
    .setInputFiles('C:/Windows/Fonts/arial.ttf');
  await expect(
    page.getByText('Font imported and saved with this document', { exact: true }),
  ).toBeVisible();
  const doc = await saved(page);
  expect(doc.fonts).toHaveLength(1);
  expect(doc.elements[0].fontFamily).toBe(doc.fonts![0].family);
  const source = await exportSvg(page);
  expect(source).toContain('@font-face');
  expect(source).toContain(doc.fonts![0].family);
  expect(source).toContain('base64,');
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          [...document.fonts].filter(
            (f) => f.family.startsWith('Vectora_') && f.status === 'loaded',
          ).length,
      ),
    )
    .toBe(1);
  await page.mouse.dblclick(...(await world(page, [300, 210])));
  await expect(editor).toBeFocused();
  await editor.fill('Discard this change');
  await editor.press('Escape');
  expect((await saved(page)).elements[0].text).toBe('Type directly here');
});
