import { expect, type Locator, type Page } from '@playwright/test';
import { ids, material, pageOf, template, user, waste } from '../fixtures/inventory.js';

export const mockWarehouse = async (page: Page, permissions = user.permissions) => {
  await page.route('**/api/auth/me', (route) =>
    route.fulfill({ json: { user: { ...user, permissions } } }),
  );
  await page.route('**/api/warehouse/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() !== 'GET')
      return route.fulfill({ status: 500, json: { code: 'UNEXPECTED_TEST_WRITE' } });
    const data = path.endsWith('/material-templates')
      ? [template]
      : path.endsWith('/materials') || path.endsWith('/consumables')
        ? [material]
        : path.endsWith('/wastes')
          ? [waste]
          : path.endsWith('/suppliers')
            ? [{ id: ids.supplier, tradeName: 'Proveedor Central' }]
            : path.endsWith('/presentations')
              ? [template.presentation]
              : path.endsWith('/unit-measures')
                ? [template.unitMeasure]
                : path.endsWith('/reasons')
                  ? [{ id: ids.reason, name: 'Conteo físico' }]
                  : [];
    return route.fulfill({ json: pageOf<unknown>(data) });
  });
};

export const chooseOption = async (
  page: Page,
  label: string,
  option: string,
  scope: Page | Locator = page,
) => {
  const field = scope.getByRole('combobox', { name: label, exact: true });
  if (await field.isDisabled()) {
    await expect(field).toHaveValue(option);
    return;
  }
  await field.click();
  await page.getByRole('option', { name: option, exact: true }).click();
};
