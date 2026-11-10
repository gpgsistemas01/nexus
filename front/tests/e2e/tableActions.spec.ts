import { expect, test } from '@playwright/test';
import { mockWarehouse } from './warehouseFixtures.js';

for (const width of [390, 960]) {
  test(`acciones de inventario accesibles al desplazar la tabla a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockWarehouse(page);
    await page.goto('/almacen/materiales');
    const action = page.getByRole('button', { name: 'Editar', exact: true });
    await expect(action).toBeVisible();
    await expect(action).toHaveClass(/bg-filter-action/);
    const deleteAction = page.getByRole('button', { name: 'Eliminar', exact: true });
    await expect(deleteAction).toBeVisible();
    await expect(deleteAction).toHaveClass(/bg-error/);
    const table = page.locator('.v-table__wrapper').first();

    for (const fraction of [0, 0.5, 1]) {
      await action.scrollIntoViewIfNeeded();
      await table.evaluate((element, fraction) => {
        element.scrollLeft = (element.scrollWidth - element.clientWidth) * fraction;
      }, fraction);
      const bounds = await action.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      if (width === 390) {
        expect(bounds!.width).toBeGreaterThanOrEqual(44);
        expect(bounds!.height).toBeGreaterThanOrEqual(44);
        const cardActions = page.locator('.responsive-table-card__actions').first();
        await expect(cardActions).toBeVisible();
        await expect(cardActions).toHaveCSS('justify-content', 'center');
        await expect(cardActions).toHaveCSS('align-items', 'center');
        const buttons = cardActions.locator('button.table-action');
        expect(await buttons.count()).toBeGreaterThan(1);
        for (const button of await buttons.all()) {
          const buttonBounds = await button.boundingBox();
          expect(buttonBounds?.width).toBeGreaterThanOrEqual(44);
          expect(buttonBounds?.height).toBeGreaterThanOrEqual(44);
        }
      }

      await page.mouse.click(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
      const dialog = page.getByRole('dialog', { name: 'Editar material', exact: true });
      await expect(dialog).toBeVisible();
      await dialog.getByRole('button', { name: 'Cerrar formulario', exact: true }).click();
      await expect(dialog).toBeHidden();
    }
  });
}
