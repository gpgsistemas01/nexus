import { expect, test } from '@playwright/test';
import { PERMISSIONS } from '@nexus/permissions';
import { mockWarehouse } from './warehouseFixtures.js';
import { mockRecords } from './recordsFixtures.js';
import { mockPurchases } from './purchaseFixtures.js';
import { mockIssues } from './issueFixtures.js';
import { mockMovements } from './movementFixtures.js';
import { mockCatalogs } from './catalogFixtures.js';

const permissions = Object.values(PERMISSIONS);
const views = [
  ['/almacen/materiales', 'Nuevo material', mockWarehouse],
  ['/almacen/consumibles', 'Nuevo consumible', mockWarehouse],
  ['/almacen/mermas', 'Nueva merma', mockWarehouse],
  ['/compras/materiales', 'Nueva compra', mockPurchases],
  ['/compras/consumibles', 'Nueva compra', mockPurchases],
  ['/salidas/materiales', 'Nueva salida', mockIssues],
  ['/salidas/consumibles', 'Nueva salida', mockIssues],
  ['/salidas/mermas', 'Nueva salida', mockIssues],
  ['/identidad/personas', 'Nueva persona', mockRecords],
  ['/identidad/usuarios', 'Nuevo usuario', mockRecords],
  ['/directorio/clientes', 'Nuevo cliente', mockRecords],
  ['/directorio/proveedores', 'Nuevo proveedor', mockRecords],
  ['/movimientos/materiales', '', mockMovements],
  ['/movimientos/consumibles', '', mockMovements],
  ['/movimientos/mermas', '', mockMovements],
  ['/catalogos/roles', '', mockCatalogs],
  ['/catalogos/unit-measures', '', mockCatalogs],
] as const;

for (const width of [320, 390, 599, 600, 768, 880, 900, 1024, 1440, 1920]) {
  test(`pantallas y formularios accesibles a ${width} px`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: 844 });
    for (const [route, action, prepare] of views) {
      await page.unrouteAll();
      await prepare(page, permissions);
      await page.goto(route);
      await expect(page.locator('main h1'), route).toBeVisible({ timeout: 30_000 });
      const cards = page.locator('.responsive-table-cards').first();
      const tableWrapper = page.locator('.table-frame--fit-columns .v-table__wrapper').first();
      if (width < 600) {
        await expect(cards).toBeVisible();
        await expect(tableWrapper).toBeHidden();
      } else {
        await expect(page.getByRole('table').first()).toBeVisible();
        await expect(cards).toBeHidden();
        await expect(tableWrapper).toBeVisible();
        if (width >= 600 && width < 900) {
          await expect(tableWrapper).toHaveCSS('overflow-x', 'auto');
          await expect(
            page.getByRole('button', { name: 'Desplazar tabla a la derecha' }).first(),
          ).toBeVisible();
        } else if (width < 1600) {
          await expect(tableWrapper).toHaveCSS('overflow-x', 'hidden');
        }
      }
      await expect(page.locator('.v-data-table__progress .v-progress-linear')).toHaveCount(0);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        route,
      ).toBeLessThanOrEqual(width);
      if (action) {
        await page.getByRole('button', { name: action, exact: true }).click();
        const dialog = page.getByRole('dialog').last();
        await expect(dialog).toBeVisible();
        const close = dialog.getByRole('button', { name: 'Cerrar formulario', exact: true });
        await expect(close).toBeInViewport();
        const box = await dialog.boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
        await close.click();
      }
    }
  });
}

test('inventario entre 600 y 899 px desplaza la tabla dentro de su contenedor', async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 844 });
  await mockWarehouse(page, permissions);
  await page.goto('/almacen/materiales');

  const wrapper = page.locator('.table-frame--fit-columns .v-table__wrapper').first();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.locator('.responsive-table-cards')).toBeHidden();
  await expect(wrapper).toHaveCSS('overflow-x', 'auto');
  const dimensions = await wrapper.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    firstHeaderPosition: getComputedStyle(element.querySelector('thead th')!).position,
    firstCellPosition: getComputedStyle(element.querySelector('tbody td')!).position,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
  expect(dimensions.firstHeaderPosition).toBe('sticky');
  expect(dimensions.firstCellPosition).toBe('sticky');
  await page.getByRole('button', { name: 'Desplazar tabla a la derecha' }).first().click();
  await expect.poll(() => wrapper.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
});

test('inventario desde 900 px muestra todas las columnas sin desplazamiento horizontal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 844 });
  await mockWarehouse(page, permissions);
  await page.goto('/almacen/materiales');

  const table = page.getByRole('table');
  await expect(table).toBeVisible();
  await expect(table.getByRole('row').filter({ hasText: 'Lona' }).first()).toBeVisible();
  for (const column of [
    'Base',
    'Altura',
    'Stock actual',
    'Stock Mínimo',
    'Presentación',
    'Cantidad',
    'Unidad',
    'Costo Unitario de Conversión',
    'Activo',
  ]) {
    await expect(table.locator('thead')).toContainText(column);
  }
  await expect(table.getByRole('button', { name: 'Editar', exact: true }).first()).toBeVisible();
  const wrapper = page.locator('.table-frame--fit-columns .v-table__wrapper').first();
  expect(await wrapper.evaluate((element) => element.scrollWidth)).toBeLessThanOrEqual(
    await wrapper.evaluate((element) => element.clientWidth),
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(900);
});

test('mantiene la agrupación y el estilo de subcolumnas en tabla y fichas', async ({ page }) => {
  await mockWarehouse(page, permissions);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/almacen/materiales');

  const cards = page.locator('.responsive-table-card').first();
  const groupedFields = cards.locator('.responsive-table-card__field--subcolumn');
  await expect(cards).toBeVisible();
  await expect(groupedFields.filter({ hasText: 'Medidas' })).toHaveCount(2);
  await expect(groupedFields.first()).toHaveCSS('background-color', 'rgb(255, 243, 217)');
  await expect(groupedFields.first().locator('.responsive-table-card__group')).toHaveText(
    'Medidas',
  );

  for (const width of [600, 768, 900, 1024, 1599, 1600, 1920]) {
    await page.setViewportSize({ width, height: 844 });
    const table = page.getByRole('table').first();
    const subcolumn = table.locator('thead tr').nth(1).locator('th').filter({ hasText: 'Base' });
    await expect(table).toBeVisible();
    await expect(subcolumn).toHaveCSS('background-color', 'rgb(255, 243, 217)');
    await expect(subcolumn).toHaveCSS('color', 'rgb(51, 45, 45)');
    await expect(subcolumn).toHaveCSS('border-bottom-color', 'rgb(216, 133, 0)');
  }
});

test('el texto largo se ajusta al ancho de su celda en tabla y ficha móvil', async ({ page }) => {
  const longName = 'MaterialConNombreMuyLargoSinEspaciosParaProbarElAjuste';
  await mockWarehouse(page, permissions, { materialName: longName });
  await page.setViewportSize({ width: 1024, height: 844 });
  await page.goto('/almacen/materiales');

  const table = page.getByRole('table');
  const nameCell = table
    .getByRole('row')
    .filter({ hasText: longName })
    .first()
    .locator('td')
    .first();
  await expect(nameCell).toContainText(longName);
  const tableCell = await nameCell.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    lineHeight: Number.parseFloat(getComputedStyle(element).lineHeight),
  }));
  expect(tableCell.scrollWidth).toBeLessThanOrEqual(tableCell.clientWidth);
  expect(tableCell.clientHeight).toBeGreaterThan(tableCell.lineHeight);

  await page.setViewportSize({ width: 390, height: 844 });
  const cardTitle = page.locator('.responsive-table-card__title-value').first();
  await expect(cardTitle).toContainText(longName);
  const cardText = await cardTitle.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    lineHeight: Number.parseFloat(getComputedStyle(element).lineHeight),
  }));
  expect(cardText.scrollWidth).toBeLessThanOrEqual(cardText.clientWidth);
  expect(cardText.clientHeight).toBeGreaterThan(cardText.lineHeight);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
