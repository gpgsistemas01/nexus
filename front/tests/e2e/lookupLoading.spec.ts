import { expect, test } from '@playwright/test';
import { mockPurchases } from './purchaseFixtures.js';
import { mockRecords } from './recordsFixtures.js';
import { pageOf } from '../fixtures/inventory.js';
import { departments, supplierData } from '../fixtures/records.js';

test('opciones: espera a abrir, recupera el error y reutiliza resultados sin perder la captura', async ({
  page,
}) => {
  const { writes } = await mockPurchases(page);
  let supplierReads = 0;
  let personReads = 0;
  let isAvailable = false;
  await page.route('**/api/warehouse/suppliers?**', (route) => {
    supplierReads++;
    return isAvailable
      ? route.fulfill({ json: pageOf([supplierData]) })
      : route.fulfill({ status: 503, json: {} });
  });
  await page.route('**/api/admin/persons?**', (route) => {
    personReads++;
    return route.fallback();
  });
  await page.goto('/compras/materiales');
  await page.getByRole('button', { name: 'Nueva compra', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Registrar compra', exact: true });
  await expect(dialog).toBeVisible();
  expect(supplierReads).toBe(0);
  expect(personReads).toBe(0);
  const supplier = dialog.getByRole('combobox', { name: 'Proveedor', exact: true });
  await supplier.click();
  await expect(page.getByText('Cargando opciones…', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await dialog
    .getByRole('textbox', { name: 'Observaciones', exact: true })
    .fill('Captura conservada');
  await supplier.click();
  const retry = page.getByRole('button', { name: 'Reintentar catálogo', exact: true });
  await expect(retry).toBeVisible();
  expect(supplierReads).toBe(3);
  await page.keyboard.press('Escape');
  await supplier.click();
  await expect(retry).toBeVisible();
  expect(supplierReads).toBe(3);
  isAvailable = true;
  await retry.click();
  await page.getByRole('option', { name: supplierData.tradeName, exact: true }).click();
  await expect(supplier).toHaveValue(supplierData.tradeName);
  await supplier.click();
  await expect(
    page.getByRole('option', { name: supplierData.tradeName, exact: true }),
  ).toBeVisible();
  expect(supplierReads).toBe(4);
  expect(personReads).toBe(0);
  await page.keyboard.press('Escape');
  await expect(dialog.getByRole('textbox', { name: 'Observaciones', exact: true })).toHaveValue(
    'Captura conservada',
  );
  expect(writes).toHaveLength(0);
});

for (const status of [503, 403]) {
  test(`editar usuario: HTTP ${status} conserva el área leída y sólo ofrece un reintento recuperable`, async ({
    page,
  }) => {
    const { writes } = await mockRecords(page);
    let attempts = 0;
    let isAvailable = false;
    await page.route('**/api/admin/departments?**', (route) => {
      attempts++;
      return isAvailable
        ? route.fulfill({ json: pageOf(departments) })
        : route.fulfill({ status, json: {} });
    });
    await page.goto('/identidad/usuarios');
    await page.getByRole('button', { name: 'Editar registro', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Editar usuario', exact: true });
    const area = dialog.getByRole('combobox', { name: 'Área', exact: true });
    await expect(area).toHaveValue('ALMACÉN');
    expect(attempts).toBe(0);
    await area.click();
    await expect(area).toHaveAttribute('aria-invalid', 'true');
    await expect(area).toHaveValue('ALMACÉN');
    const retry = page.getByRole('button', { name: 'Reintentar catálogo', exact: true });
    if (status === 503) {
      await expect(retry).toBeVisible();
      expect(attempts).toBe(3);
      isAvailable = true;
      await retry.click();
      await page.getByRole('option', { name: 'VENTAS', exact: true }).click();
      await expect(area).toHaveValue('VENTAS');
      expect(attempts).toBe(4);
    } else {
      await expect(retry).toHaveCount(0);
      expect(attempts).toBe(1);
      await page.keyboard.press('Escape');
      await expect(dialog.getByRole('button', { name: 'Actualizar', exact: true })).toBeEnabled();
    }
    expect(writes).toHaveLength(0);
  });
}
