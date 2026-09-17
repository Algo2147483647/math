import { test, expect, type Page, type Locator } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { makeElement } from '../../src/model/elements';
import { blankDocument } from '../../src/model/storage';
import { apply, elementMatrix } from '../../src/model/geometry';
import type { Point, StudioDocument, StudioElement } from '../../src/model/types';
async function open(page: Page, elements: StudioElement[] = []) {
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
  const b = (await locator.boundingBox())!;
  return [b.x + b.width / 2, b.y + b.height / 2];
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
function endpoint(e: StudioElement, index: number) {
  return apply(elementMatrix(e), e.points![index]);
}
function near(actual: Point, expected: Point) {
  expect(actual[0]).toBeCloseTo(expected[0], 1);
  expect(actual[1]).toBeCloseTo(expected[1], 1);
}

test('white workspace and artboard, with canvas controls integrated into the topbar at all desktop sizes', async ({
  page,
}) => {
  await open(page);
  for (const selector of ['.app-shell', '.canvas-workspace', '.artboard-stage', '#artboard'])
    expect(
      await page.locator(selector).evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe('rgb(255, 255, 255)');
  expect(
    await page.locator('.artboard-stage').evaluate((el) => getComputedStyle(el).backgroundImage),
  ).toBe('none');
  await expect(page.locator('#workspace-grid')).toHaveCount(0);
  await expect(page.locator('header .view-controls')).toHaveCount(1);
  for (const width of [1440, 1024, 800]) {
    await page.setViewportSize({ width, height: 900 });
    const header = (await page.locator('header').boundingBox())!,
      controls = (await page.locator('.view-controls').boundingBox())!;
    expect(controls.y).toBeGreaterThanOrEqual(header.y);
    expect(controls.y + controls.height).toBeLessThanOrEqual(header.y + header.height);
    expect(controls.x + controls.width).toBeLessThan(width);
    await page.getByRole('button', { name: 'Workspace settings', exact: true }).click();
    const popup = (await page.getByRole('region', { name: 'Workspace settings' }).boundingBox())!;
    expect(popup.x + popup.width).toBeLessThanOrEqual(width);
    await page.getByRole('button', { name: 'Close workspace settings' }).click();
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'test-results/white-workspace.png' });
});

test('buttons, keyboard and wheel zoom use matching fine increments and retain the pointer position', async ({
  page,
}) => {
  await open(page);
  await field(page, 'Zoom percentage', '100');
  expect((await page.locator('#artboard').boundingBox())!.width).toBeCloseTo(960);
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect(page.getByLabel('Zoom percentage')).toHaveValue('105');
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
  await expect(page.getByLabel('Zoom percentage')).toHaveValue('100');
  const p: Point = [400, 320],
    position = await world(page, p);
  await page.mouse.move(...position);
  await page.keyboard.down('Control');
  await page.mouse.wheel(0, -100);
  await page.keyboard.up('Control');
  await expect(page.getByLabel('Zoom percentage')).toHaveValue('105');
  near(await world(page, p), position);
  await page.locator('.canvas-workspace').focus();
  await page.keyboard.press('-');
  await expect(page.getByLabel('Zoom percentage')).toHaveValue('100');
  await field(page, 'Zoom percentage', '133.3');
  expect((await page.locator('#artboard').boundingBox())!.width).toBeCloseTo(1279.68, 1);
  await page.getByLabel('Zoom percentage').fill('300');
  await page.getByLabel('Zoom percentage').press('Escape');
  await expect(page.getByLabel('Zoom percentage')).toHaveValue('133.3');
  await field(page, 'Zoom percentage', '9999');
  await expect(page.getByLabel('Zoom percentage')).toHaveValue('133.3');
  await page.getByRole('button', { name: 'Fit artboard', exact: true }).click();
  expect((await page.locator('#artboard').boundingBox())!.width).toBeLessThan(900);
});

test('Shift-scroll pans horizontally in both directions while ordinary scrolling stays vertical', async ({
  page,
}) => {
  await open(page);
  const p: Point = [400, 320],
    position = await world(page, p),
    zoom = await page.getByLabel('Zoom percentage').inputValue();
  await page.mouse.move(...position);
  await page.keyboard.down('Shift');
  await page.mouse.wheel(0, 80);
  await expect.poll(async () => (await world(page, p))[0]).toBeCloseTo(position[0] - 80, 1);
  near(await world(page, p), [position[0] - 80, position[1]]);
  await page.mouse.wheel(0, -80);
  await expect.poll(async () => (await world(page, p))[0]).toBeCloseTo(position[0], 1);
  near(await world(page, p), position);
  await page.mouse.wheel(50, 0);
  await expect.poll(async () => (await world(page, p))[0]).toBeCloseTo(position[0] - 50, 1);
  near(await world(page, p), [position[0] - 50, position[1]]);
  await page.keyboard.up('Shift');
  await page.mouse.wheel(0, 60);
  await expect.poll(async () => (await world(page, p))[1]).toBeCloseTo(position[1] - 60, 1);
  near(await world(page, p), [position[0] - 50, position[1] - 60]);
  await expect(page.getByLabel('Zoom percentage')).toHaveValue(zoom);
});

test('legacy arrows migrate to two endpoints and dragging either end preserves the other', async ({
  page,
}) => {
  const e = makeElement('arrow', { x: 200, y: 180, width: 330, height: 80 });
  delete e.points;
  await open(page, [e]);
  await page.mouse.click(...(await world(page, [350, 220])));
  await expect(page.locator('[data-node-index]')).toHaveCount(2);
  await expect(page.locator('[data-handle],[data-rotate]')).toHaveCount(0);
  await drag(
    page,
    await center(page.locator('[data-node-index="1"]')),
    await world(page, [570, 380]),
  );
  let changed = (await saved(page)).elements[0];
  near(endpoint(changed, 0), [200, 220]);
  near(endpoint(changed, 1), [570, 380]);
  await drag(
    page,
    await center(page.locator('[data-node-index="0"]')),
    await world(page, [250, 300]),
  );
  changed = (await saved(page)).elements[0];
  near(endpoint(changed, 0), [250, 300]);
  near(endpoint(changed, 1), [570, 380]);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  changed = (await saved(page)).elements[0];
  near(endpoint(changed, 0), [200, 220]);
  await page.reload();
  await page.mouse.click(...(await world(page, [385, 300])));
  await expect(page.locator('[data-node-index]')).toHaveCount(2);
});

test('arrow head styles, opening, fill and endpoint values survive reload and SVG export', async ({
  page,
}) => {
  const e = makeElement('arrow', {
    x: 180,
    y: 180,
    width: 400,
    height: 140,
    points: [
      [0, 140],
      [400, 0],
    ],
    stroke: '#2266dd',
    strokeWidth: 4,
  });
  await open(page, [e]);
  await page.mouse.click(...(await world(page, [380, 250])));
  await page.getByLabel('Start head', { exact: true }).selectOption('circle');
  await page.getByLabel('End head', { exact: true }).selectOption('triangle');
  await field(page, 'Head size', '36');
  await field(page, 'Head opening', '90');
  await field(page, 'Head fill', '35');
  const heads = page.locator('#artworkLayer [data-arrow-head]');
  await expect(heads).toHaveCount(2);
  await expect(heads.nth(1)).toHaveAttribute('fill-opacity', '0.35');
  const d = await heads.nth(1).getAttribute('d');
  await field(page, 'Head opening', '45');
  expect(await heads.nth(1).getAttribute('d')).not.toBe(d);
  await page.getByLabel('Start head', { exact: true }).selectOption('square');
  await field(page, 'End X', '640');
  await field(page, 'End Y', '240');
  near(endpoint((await saved(page)).elements[0], 1), [640, 240]);
  await page.screenshot({ path: 'test-results/arrow-heads.png' });
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const promise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download SVG' }).click();
  const download = await promise,
    source = await readFile((await download.path())!, 'utf8');
  expect(source).toContain('fill-opacity="0.35"');
  expect(source).not.toMatch(/data-arrow-head|data-node-index|data-snap-guide|data-hit-area/);
  await page.keyboard.press('Escape');
  await page.reload();
  await page.mouse.click(...(await world(page, [410, 280])));
  await expect(page.getByLabel('Start head', { exact: true })).toHaveValue('square');
  await expect(page.getByLabel('End head', { exact: true })).toHaveValue('triangle');
  await expect(page.getByLabel('Head fill', { exact: true })).toHaveValue('35');
});

test('arrow drawing snaps to rectangle edge midpoints and snapping can be turned off independently', async ({
  page,
}) => {
  const a = makeElement('rect', { x: 180, y: 200, width: 140, height: 100 }),
    b = makeElement('rect', { x: 600, y: 300, width: 160, height: 120 });
  await open(page, [a, b]);
  await page.mouse.click(...(await world(page, [250, 250])));
  await page.getByRole('button', { name: 'Snap to elements', exact: true }).click();
  await page.getByRole('button', { name: 'Arrow', exact: true }).click();
  await page.mouse.move(...(await world(page, [318, 252])));
  await page.mouse.down();
  await page.mouse.move(...(await world(page, [604, 357])), { steps: 12 });
  await expect(page.locator('[data-snap-guide]')).not.toHaveCount(0);
  await page.screenshot({ path: 'test-results/element-snapping.png' });
  await page.mouse.up();
  await expect(page.locator('[data-snap-guide]')).toHaveCount(0);
  let doc = await saved(page),
    arrow = doc.elements.find((e) => e.type === 'arrow')!;
  expect(doc.elements).toHaveLength(3);
  near(endpoint(arrow, 0), [320, 250]);
  near(endpoint(arrow, 1), [600, 360]);
  expect(doc.elements[0]).toEqual(a);
  await expect(page.getByRole('button', { name: 'Snap to grid', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.getByRole('button', { name: 'Snap to elements', exact: true }).click();
  await drag(
    page,
    await center(page.locator('[data-node-index="1"]')),
    await world(page, [605, 356]),
  );
  arrow = (await saved(page)).elements.find((e) => e.type === 'arrow')!;
  near(endpoint(arrow, 1), [605, 356]);
  await page.getByRole('button', { name: 'Snap to grid', exact: true }).click();
  await drag(
    page,
    await center(page.locator('[data-node-index="1"]')),
    await world(page, [606, 347]),
  );
  arrow = (await saved(page)).elements.find((e) => e.type === 'arrow')!;
  near(endpoint(arrow, 1), [608, 344]);
  await page.getByRole('button', { name: 'Snap to elements', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Snap to elements', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Snap to grid', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('an arrow endpoint snaps exactly to a rotated rectangle corner and the gesture undoes once', async ({
  page,
}) => {
  const rect = makeElement('rect', { x: 520, y: 160, width: 150, height: 160, rotation: 32 }),
    arrow = makeElement('arrow', { x: 200, y: 330, width: 220, height: 1 });
  await open(page, [rect, arrow]);
  await page.mouse.click(...(await world(page, [300, 330])));
  await page.getByRole('button', { name: 'Snap to elements', exact: true }).click();
  const corner = apply(elementMatrix(rect), [0, 0]);
  await drag(
    page,
    await center(page.locator('[data-node-index="1"]')),
    await world(page, [corner[0] + 3, corner[1] - 2]),
  );
  near(endpoint((await saved(page)).elements[1], 1), corner);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  near(endpoint((await saved(page)).elements[1], 1), [420, 330]);
});

test('moving and resizing objects align their key points without selecting the snap target', async ({
  page,
}) => {
  const a = makeElement('rect', { x: 150, y: 180, width: 100, height: 100 }),
    b = makeElement('rect', { x: 450, y: 300, width: 140, height: 120, locked: true });
  await open(page, [a, b]);
  await page.getByRole('button', { name: 'Snap to elements', exact: true }).click();
  await drag(page, await world(page, [200, 230]), await world(page, [398, 357]));
  let doc = await saved(page);
  expect(doc.elements[0].x).toBeCloseTo(350);
  expect(doc.elements[0].y).toBeCloseTo(310);
  expect(doc.elements[1]).toEqual(b);
  await expect(page.locator('[data-handle="se"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await drag(page, await center(page.locator('[data-handle="se"]')), await world(page, [447, 297]));
  doc = await saved(page);
  expect(doc.elements[0].width).toBeCloseTo(300);
  expect(doc.elements[0].height).toBeCloseTo(120);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  expect((await saved(page)).elements[0]).toEqual(a);
  await page.getByRole('button', { name: 'Snap to grid', exact: true }).click();
  await drag(page, await center(page.locator('[data-handle="se"]')), await world(page, [447, 297]));
  doc = await saved(page);
  expect(doc.elements[0].x + doc.elements[0].width).toBeCloseTo(450);
  expect(doc.elements[0].y + doc.elements[0].height).toBeCloseTo(300);
});
