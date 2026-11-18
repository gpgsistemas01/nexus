import { test, expect } from '@playwright/test';
import { mockPurchases } from './purchaseFixtures.js';
import { mockIssues } from './issueFixtures.js';
import { chooseOption } from './warehouseFixtures.js';
import { material, pageOf } from '../fixtures/inventory.js';

test(
  'detalles: captura de compra alineada conserva valores al cambiar de móvil a escritorio',
  { tag: '@essential' },
  async ({ page }, info) => {
    await mockPurchases(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/compras/materiales');
    await page.getByRole('button', { name: 'Nueva compra', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Registrar compra', exact: true });
    await chooseOption(page, 'Proveedor', 'Proveedor Central', dialog);
    await chooseOption(page, 'Material', 'Lona · 2 × 50 · ROLLO', dialog);
    await dialog.getByLabel('Cantidad', { exact: true }).fill('1.5');
    await dialog.getByLabel('Costo por presentación', { exact: true }).fill('12');
    await expect(dialog.getByRole('row', { name: 'Agregar detalle', exact: true })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: info.outputPath('compra-mobile.png') });
    await page.setViewportSize({ width: 1440, height: 1000 });
    const row = dialog.getByRole('row', { name: 'Agregar detalle', exact: true });
    for (const [field, header] of [
      ['Material', 'Material'],
      ['Cantidad', 'Compra'],
      ['Costo por presentación', 'Costo por presentación'],
    ] as const) {
      const cell = row.getByRole('cell').filter({
        has: page.getByRole(field === 'Material' ? 'combobox' : 'spinbutton', {
          name: field,
          exact: true,
        }),
      });
      const column = dialog.getByRole('columnheader', { name: header, exact: true });
      const [cellBox, headerBox] = await Promise.all([cell.boundingBox(), column.boundingBox()]);
      expect(cellBox).not.toBeNull();
      expect(headerBox).not.toBeNull();
      expect(Math.abs(cellBox!.x - headerBox!.x)).toBeLessThan(2);
      expect(Math.abs(cellBox!.width - headerBox!.width)).toBeLessThan(2);
    }
    await expect(dialog.getByLabel('Cantidad', { exact: true })).toHaveValue('1.5');
    await expect(dialog.getByLabel('Costo por presentación', { exact: true })).toHaveValue('12');
    await page.screenshot({ path: info.outputPath('compra-desktop.png') });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(dialog.getByRole('combobox', { name: 'Material', exact: true })).toHaveValue(
      'Lona · 2 × 50 · ROLLO',
    );
    await dialog.getByRole('button', { name: 'Agregar', exact: true }).click();
    await expect(dialog.getByText('Lona', { exact: true }).filter({ visible: true })).toBeVisible();
    await expect(dialog.getByText(/^Proveedor:/)).toHaveCount(0);
  },
);

test(
  'detalles: salidas distingue proveedores del mismo material en tabla y fichas',
  { tag: '@essential' },
  async ({ page }, info) => {
    await mockIssues(page);
    const otherSupplier = '99999999-9999-4999-8999-999999999998';
    await page.route('**/api/warehouse/materials?**', (route) =>
      route.fulfill({
        json: pageOf([
          material,
          {
            ...material,
            id: '99999999-9999-4999-8999-999999999997',
            supplier: { id: otherSupplier, tradeName: 'Proveedor Alterno' },
          },
        ]),
      }),
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/salidas/materiales');
    await page.getByRole('button', { name: 'Editar salida', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(
      dialog.getByText('Proveedor Central', { exact: true }).filter({ visible: true }),
    ).toBeVisible();
    await chooseOption(page, 'Material', 'Lona · 2 × 50 · ROLLO · Proveedor Alterno', dialog);
    await dialog.getByLabel('Cantidad', { exact: true }).fill('0.75');
    await dialog.getByRole('button', { name: 'Agregar', exact: true }).click();
    await expect(
      dialog.getByText('Proveedor Alterno', { exact: true }).filter({ visible: true }),
    ).toBeVisible();
    await page.screenshot({ path: info.outputPath('salida-desktop.png') });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      dialog.getByText('Proveedor Central', { exact: true }).filter({ visible: true }),
    ).toBeVisible();
    await expect(
      dialog.getByText('Proveedor Alterno', { exact: true }).filter({ visible: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: info.outputPath('salida-mobile.png') });
  },
);
