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

for (const width of [320, 390, 768, 1440]) {
  test(`pantallas y formularios accesibles a ${width} px`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: 844 });
    for (const [route, action, prepare] of views) {
      await page.unrouteAll();
      await prepare(page, permissions);
      await page.goto(route);
      await expect(page.locator('main h1'), route).toBeVisible({ timeout: 30_000 });
      await expect(page.getByRole('table')).toBeVisible();
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
