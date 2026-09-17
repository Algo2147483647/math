import { test, expect, type Page } from '@playwright/test';
import { makeElement } from '../../src/model/elements';
import { blankDocument } from '../../src/model/storage';
import type { Point, StudioDocument, StudioElement } from '../../src/model/types';

async function open(page: Page, elements?: StudioElement[]) {
  if (elements)
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

test('English glass workspace loads without errors; panels and export remain usable', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await open(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(await page.locator('body').innerText()).not.toMatch(/[\u4e00-\u9fff]/);
  expect(
    await page.locator('.topbar').evaluate((el) => getComputedStyle(el).backdropFilter),
  ).toContain('blur');
  await page.screenshot({ path: 'test-results/workspace.png' });
  await page.getByRole('button', { name: 'Add Rectangle', exact: true }).click();
  await expect(page.getByLabel('Position X', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/inspector.png' });
  await page.getByRole('button', { name: 'Toggle inspector', exact: true }).click();
  await expect(page.locator('.inspector')).toHaveAttribute('inert', '');
  await page.getByRole('button', { name: 'Toggle inspector', exact: true }).click();
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download SVG' }).click();
  expect((await download).suggestedFilename()).toMatch(/\.svg$/);
  await page.getByRole('button', { name: 'PNG Raster image' }).click();
  const png = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PNG' }).click();
  expect((await png).suggestedFilename()).toMatch(/@2x\.png$/);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('marquee from outside artboard, collective drag, group, ungroup, undo and reload', async ({
  page,
}) => {
  const a = makeElement('rect', { x: 70, y: 100, width: 120, height: 100 }),
    b = makeElement('ellipse', { x: 250, y: 230, width: 100, height: 100 }),
    locked = makeElement('rect', { x: 420, y: 100, locked: true });
  await open(page, [a, b, locked]);
  await drag(page, await world(page, [-15, 65]), await world(page, [390, 370]));
  await expect(page.getByText('2 layers selected', { exact: true })).toBeVisible();
  await drag(page, await world(page, [100, 140]), await world(page, [150, 170]));
  let doc = await saved(page);
  expect(doc.elements[0].x).toBeCloseTo(120, 0);
  expect(doc.elements[1].x).toBeCloseTo(300, 0);
  expect(doc.elements[2].x).toBe(420);
  await page.keyboard.press('Control+g');
  doc = await saved(page);
  expect(doc.elements.filter((e) => e.type === 'group')).toHaveLength(1);
  await page.keyboard.press('Control+Shift+g');
  doc = await saved(page);
  expect(doc.elements).toHaveLength(3);
  await page.keyboard.press('Control+z');
  doc = await saved(page);
  expect(doc.elements.some((e) => e.type === 'group')).toBe(true);
  await page.reload();
  await expect(page.locator('#artworkLayer > [data-element-id]')).toHaveCount(2);
});

test('polyline nodes move outside the original box, insert, delete and undo', async ({ page }) => {
  const e = makeElement('polyline', {
    x: 200,
    y: 200,
    width: 220,
    height: 120,
    points: [
      [0, 0],
      [100, 90],
      [220, 20],
    ],
    strokeWidth: 5,
  });
  await open(page, [e]);
  await page.mouse.click(...(await world(page, [200, 200])));
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-node-index]')).toHaveCount(3);
  const handle = page.locator('[data-node-index="1"]'),
    box = await handle.boundingBox();
  await drag(
    page,
    [box!.x + box!.width / 2, box!.y + box!.height / 2],
    await world(page, [310, 400]),
  );
  let doc = await saved(page);
  expect(doc.elements[0].height).toBeGreaterThan(190);
  await page.getByRole('button', { name: 'Add node', exact: true }).click();
  await expect(page.locator('[data-node-index]')).toHaveCount(4);
  await page.getByRole('button', { name: 'Delete node', exact: true }).click();
  await expect(page.locator('[data-node-index]')).toHaveCount(3);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.locator('[data-node-index]')).toHaveCount(4);
  doc = await saved(page);
  expect(doc.elements[0].points).toHaveLength(4);
});

test('draw a multi-segment Bézier and independently edit its control handle', async ({ page }) => {
  await open(page, []);
  await page.getByRole('button', { name: 'Bézier', exact: true }).click();
  await drag(page, await world(page, [100, 250]), await world(page, [165, 120]));
  await drag(page, await world(page, [360, 280]), await world(page, [440, 380]));
  await drag(page, await world(page, [650, 200]), await world(page, [715, 120]));
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-node-index]')).toHaveCount(7);
  const doc = await saved(page);
  expect(doc.elements[0].type).toBe('bezier');
  expect(doc.elements[0].points).toHaveLength(7);
  const original = await page.locator('#artworkLayer path').first().getAttribute('d');
  const control = page.locator('[data-node-index="4"]'),
    box = await control.boundingBox();
  await page.keyboard.down('Alt');
  await drag(
    page,
    [box!.x + box!.width / 2, box!.y + box!.height / 2],
    [box!.x + box!.width / 2 + 30, box!.y + box!.height / 2 - 35],
  );
  await page.keyboard.up('Alt');
  expect(await page.locator('#artworkLayer path').first().getAttribute('d')).not.toBe(original);
  await saved(page);
  await page.screenshot({ path: 'test-results/bezier.png' });
});

test('context menu clamps to viewport and supports keyboard commands', async ({ page }) => {
  await open(page, [makeElement('rect', { x: 100, y: 100 })]);
  await page.mouse.click(...(await world(page, [150, 140])), { button: 'right' });
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /Group selection/ })).toBeDisabled();
  await page.getByRole('menuitem', { name: /Duplicate/ }).click();
  await expect(page.locator('#artworkLayer > [data-element-id]')).toHaveCount(2);
  await page.mouse.click(1425, 985, { button: 'right' });
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  expect(box!.x + box!.width).toBeLessThanOrEqual(1433);
  expect(box!.y + box!.height).toBeLessThanOrEqual(993);
  await page.keyboard.press('End');
  await expect(page.getByRole('menuitem', { name: 'Delete', exact: false })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveCount(0);
  await expect(page.locator('#artworkLayer > [data-element-id]')).toHaveCount(1);
});

test('SVG import preserves gradients, transforms and CSS without styling the app', async ({
  page,
}) => {
  await open(page, []);
  const source =
    '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300" fill="#ff0000"><defs><linearGradient id="paint"><stop stop-color="#ff0000"/><stop offset="1" stop-color="#0000ff"/></linearGradient></defs><style>.shape{fill:url(#paint);stroke:#00aa00;stroke-width:4} button{display:none}</style><g transform="translate(30 40)"><rect class="shape" x="10" y="10" width="100" height="80"/><circle cx="200" cy="80" r="30"/></g></svg>';
  await page
    .locator('header input[type=file]')
    .setInputFiles({ name: 'test.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(source) });
  await expect(page.locator('#artworkLayer > [data-element-id]')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Export', exact: true })).toBeVisible();
  const fill = await page
    .locator('#artworkLayer rect')
    .first()
    .evaluate((el) => getComputedStyle(el).fill);
  expect(fill).toContain('url(');
  const stroke = await page
    .locator('#artworkLayer rect')
    .first()
    .evaluate((el) => getComputedStyle(el).stroke);
  expect(stroke).toBe('rgb(0, 170, 0)');
  expect(
    await page.locator('#artworkLayer circle').evaluate((el) => getComputedStyle(el).fill),
  ).toBe('rgb(255, 0, 0)');
  await page.reload();
  await expect(page.locator('#artworkLayer > [data-element-id]')).toHaveCount(2);
});

test('imported polylines and cubic paths retain editable nodes, including viewBox origins', async ({
  page,
}) => {
  await open(page, []);
  const source =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 50 600 400" fill="none" stroke="#334455"><g transform="translate(20 30)"><polyline id="route" points="110,60 200,120 300,80"/><path id="curve" d="M120 180 C180 100 240 250 320 180 C360 120 400 210 450 180"/></g></svg>';
  await page
    .locator('header input[type=file]')
    .setInputFiles({ name: 'paths.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(source) });
  await expect(page.locator('#artworkLayer > [data-element-id]')).toHaveCount(2);
  const doc = await saved(page);
  expect(doc.elements.map((e) => e.type)).toEqual(['polyline', 'bezier']);
  expect(doc.elements[0].x).toBeCloseTo(30);
  expect(doc.elements[0].y).toBeCloseTo(40);
  expect(doc.elements.every((e) => !e.hidden)).toBe(true);
  await page.getByRole('button', { name: 'Layers 2' }).click();
  await page.locator('.layer-name').filter({ hasText: 'route' }).click();
  await page.getByRole('button', { name: 'Design', exact: true }).click();
  await page.getByRole('button', { name: 'Edit nodes Enter' }).click();
  await expect(page.locator('[data-node-index]')).toHaveCount(3);
});

test('reverse-direction line drawing, cancelling a gesture, and Shift-additive selection', async ({
  page,
}) => {
  await open(page, []);
  await page.getByRole('button', { name: 'Line', exact: true }).click();
  await drag(page, await world(page, [400, 350]), await world(page, [180, 140]));
  let doc = await saved(page);
  expect(doc.elements[0].points![0][0]).toBeGreaterThan(doc.elements[0].points![1][0]);
  await page.getByRole('button', { name: 'Add Circle', exact: true }).click();
  await saved(page);
  await page.keyboard.down('Shift');
  await drag(page, await world(page, [160, 120]), await world(page, [420, 370]));
  await page.keyboard.up('Shift');
  await expect(page.getByText('2 layers selected', { exact: true })).toBeVisible();
  const previous = await saved(page);
  await page.mouse.move(...(await world(page, [290, 245])));
  await page.mouse.down();
  await page.mouse.move(...(await world(page, [330, 285])), { steps: 5 });
  await page.keyboard.press('Escape');
  await page.mouse.up();
  doc = await saved(page);
  expect(doc.elements).toEqual(previous.elements);
});

test('compact desktop has reachable panels, numeric inputs and menus', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await open(page);
  await page.getByRole('button', { name: 'Add Rectangle', exact: true }).click();
  await expect(page.getByLabel('Width', { exact: true })).toBeVisible();
  await page.getByLabel('Width', { exact: true }).fill('220');
  await page.getByLabel('Width', { exact: true }).press('Enter');
  expect((await saved(page)).elements.at(-1)!.width).toBe(220);
  await page.screenshot({ path: 'test-results/compact.png' });
});

test('legacy v2 document migrates and remains editable', async ({ page }) => {
  const e = makeElement('polyline');
  await page.addInitScript(
    (doc) => localStorage.setItem('vectora-svg-studio-v2', JSON.stringify(doc)),
    { ...blankDocument(), elements: [e], title: 'Legacy artwork' },
  );
  await open(page);
  await expect(page.getByLabel('Document title')).toHaveValue('Legacy artwork');
  await page.getByRole('button', { name: 'Layers 1' }).click();
  await page.locator('.layers .layer-name').click();
  await page.getByRole('button', { name: 'Design', exact: true }).click();
  await page.getByLabel('Width', { exact: true }).fill('360');
  await page.getByLabel('Width', { exact: true }).press('Enter');
  const doc = await saved(page);
  expect(doc.version).toBe(3);
  expect(doc.elements[0].width).toBe(360);
  expect(doc.elements[0].points![3][0]).toBe(360);
});
