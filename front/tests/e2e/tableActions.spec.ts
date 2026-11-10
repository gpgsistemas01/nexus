import { expect, test } from '@playwright/test';
import { mockWarehouse } from './warehouseFixtures.js';

for (const width of [390, 960]) {
  test(`acciones de inventario accesibles en fichas móviles o tabla compacta a ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockWarehouse(page);
    await page.goto('/almacen/materiales');
    const action = page.getByRole('button', { name: 'Editar', exact: true });
    await expect(action).toBeVisible();
    await expect(action).toHaveClass(/bg-filter-action/);
    const deleteAction = page.getByRole('button', { name: 'Eliminar', exact: true });
    await expect(deleteAction).toBeVisible();
    await expect(deleteAction).toHaveClass(/bg-error/);
    if (width === 390) {
      const actions = page.locator('.responsive-table-card__actions').first();
      await expect(actions).toBeVisible();
      await expect(page.locator('.v-table__wrapper').first()).toBeHidden();
      const buttons = actions.locator('button.table-action');
      expect(await buttons.count()).toBeGreaterThan(1);
      for (const button of await buttons.all()) {
        const buttonBounds = await button.boundingBox();
        expect(buttonBounds?.width).toBeGreaterThanOrEqual(44);
        expect(buttonBounds?.height).toBeGreaterThanOrEqual(44);
      }
      await actions.getByRole('button', { name: 'Editar', exact: true }).click();
    } else {
      const table = page.locator('.table-frame--fit-columns .v-table__wrapper').first();
      await expect(table).toBeVisible();
      expect(await table.evaluate((element) => element.scrollWidth)).toBeLessThanOrEqual(
        await table.evaluate((element) => element.clientWidth),
      );
      await action.click();
    }
    const dialog = page.getByRole('dialog', { name: 'Editar material', exact: true });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cerrar formulario', exact: true }).click();
    await expect(dialog).toBeHidden();
  });
}
