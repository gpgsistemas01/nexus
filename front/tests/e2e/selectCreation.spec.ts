import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { mockWarehouse, chooseOption } from './warehouseFixtures.js';
import { mockPurchases } from './purchaseFixtures.js';
import { mockIssues } from './issueFixtures.js';
import { user } from '../fixtures/inventory.js';
import { purchaseItem, purchasePermissions } from '../fixtures/purchases.js';
import { issuePermissions } from '../fixtures/issues.js';

const createdSupplierId = 'bbbbbbbb-1111-4111-8111-111111111111';
const createdItemId = 'cccccccc-1111-4111-8111-111111111111';
const openCreation = async (
  page: Page,
  scope: Locator,
  label: string,
  action: string,
  term: string,
) => {
  await scope.getByRole('combobox', { name: label, exact: true }).fill(term);
  await page.getByRole('button', { name: `${action} «${term}»`, exact: true }).click();
};

for (const [path, resource, title] of [
  ['materiales', 'materials', 'material'],
  ['consumibles', 'consumables', 'consumible'],
] as const) {
  test(`select ${resource}: proveedor precargado, cancelar, error y selección tras guardar`, async ({
    page,
  }) => {
    await mockWarehouse(page, [...user.permissions, 'suppliers:manage']);
    let attempts = 0;
    const term = `Proveedor nuevo ${resource}`;
    await page.route('**/api/warehouse/suppliers', async (route) => {
      attempts++;
      expect(route.request().postDataJSON()).toMatchObject({
        tradeName: term,
        legalName: 'Empresa nueva',
        isActive: true,
      });
      if (attempts === 1) return route.fulfill({ status: 503, json: { code: 'SERVER_ERROR' } });
      return route.fulfill({
        json: {
          code: 'CREATED_SUPPLIER',
          supplier: {
            id: createdSupplierId,
            version: 0,
            tradeName: term,
            legalName: 'Empresa nueva',
            isActive: true,
          },
        },
      });
    });
    await page.goto(`/almacen/${path}`);
    await page.getByRole('button', { name: `Nuevo ${title}`, exact: true }).click();
    const parent = page.getByRole('dialog', { name: `Crear ${title}`, exact: true });
    await parent.getByLabel('Nombre', { exact: true }).fill('Captura del artículo');
    await parent.getByLabel('Cantidad inicial', { exact: true }).fill('5');
    await openCreation(page, parent, 'Proveedor', 'Registrar proveedor', term);
    const child = page.getByRole('dialog', { name: 'Registrar proveedor', exact: true });
    await expect(child.getByLabel('Nombre comercial', { exact: true })).toHaveValue(term);
    await expect(child.locator('[aria-invalid="true"]')).toHaveCount(0);
    await child.getByRole('button', { name: 'Cerrar', exact: true }).click();
    expect(attempts).toBe(0);
    await expect(parent.getByLabel('Nombre', { exact: true })).toHaveValue('Captura del artículo');
    await openCreation(page, parent, 'Proveedor', 'Registrar proveedor', term);
    await child.getByLabel('Razón social', { exact: true }).fill('Empresa nueva');
    await child.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(child.getByRole('alert')).toBeVisible();
    await expect(child.getByLabel('Nombre comercial', { exact: true })).toHaveValue(term);
    await child.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(child).toBeHidden();
    await expect(parent.getByRole('combobox', { name: 'Proveedor', exact: true })).toHaveValue(
      term,
    );
    await expect(parent.getByLabel('Cantidad inicial', { exact: true })).toHaveValue('5');
    await expect(parent.getByLabel('Nombre', { exact: true })).toHaveValue('Captura del artículo');
    expect(attempts).toBe(2);
  });

  test(`select compras ${resource}: crea proveedor y artículo desde el desplegable con contexto de compra`, async ({
    page,
  }) => {
    const { writes } = await mockPurchases(page);
    const term = `Proveedor compra ${resource}`;
    const name = `Artículo nuevo ${resource}`;
    const captures: Record<string, unknown>[] = [];
    await page.route('**/api/warehouse/suppliers', (route) =>
      route.fulfill({
        json: {
          code: 'CREATED_SUPPLIER',
          supplier: {
            id: createdSupplierId,
            version: 0,
            tradeName: term,
            legalName: 'Empresa',
            isActive: true,
          },
        },
      }),
    );
    await page.route(`**/api/warehouse/${resource}`, (route) => {
      captures.push(route.request().postDataJSON());
      return route.fulfill({
        json: {
          code: 'CREATED_MATERIAL',
          material: {
            ...purchaseItem,
            version: 0,
            supplier: { id: createdSupplierId, tradeName: term },
            material: {
              ...purchaseItem.material,
              id: createdItemId,
              name,
              version: 0,
              type: resource === 'materials' ? 'MATERIAL' : 'CONSUMABLE',
              base: resource === 'materials' ? 2 : null,
              height: resource === 'materials' ? 50 : null,
            },
          },
        },
      });
    });
    await page.goto(`/compras/${path}`);
    await page.getByRole('button', { name: 'Nueva compra', exact: true }).click();
    const parent = page.getByRole('dialog', { name: 'Registrar compra', exact: true });
    await parent.getByLabel('Observaciones', { exact: true }).fill('Compra sin guardar');
    await openCreation(page, parent, 'Proveedor', 'Registrar proveedor', term);
    const supplier = page.getByRole('dialog', { name: 'Registrar proveedor', exact: true });
    await expect(supplier.getByLabel('Nombre comercial', { exact: true })).toHaveValue(term);
    await supplier.getByLabel('Razón social', { exact: true }).fill('Empresa');
    await supplier.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(supplier).toBeHidden();
    const label = resource === 'materials' ? 'Material' : 'Consumible';
    await openCreation(page, parent, label, `Registrar ${title}`, name);
    const item = page.getByRole('dialog', { name: `Crear ${title}`, exact: true });
    await expect(item.getByLabel('Nombre', { exact: true })).toHaveValue(name);
    await expect(item.getByLabel('Proveedor', { exact: true })).toHaveValue(term);
    await chooseOption(page, 'Presentación', 'ROLLO');
    await chooseOption(page, 'Unidad de medida', 'Metros cuadrados');
    if (resource === 'materials') {
      await item.getByLabel('Base (m)', { exact: true }).fill('2');
      await item.getByLabel('Altura (m)', { exact: true }).fill('50');
    }
    await item.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(item).toBeHidden();
    await expect(parent.getByRole('combobox', { name: label, exact: true })).toHaveValue(
      new RegExp(name),
    );
    await expect(parent.getByLabel('Observaciones', { exact: true })).toHaveValue(
      'Compra sin guardar',
    );
    expect(captures).toHaveLength(1);
    expect(captures[0]).toMatchObject({
      supplierId: createdSupplierId,
      creationContext: 'goodsReceipt',
      name,
    });
    expect(captures[0]).not.toHaveProperty('newStock');
    expect(writes).toHaveLength(0);
  });
}

for (const path of ['materiales', 'consumibles', 'mermas']) {
  test(`select salidas ${path}: cliente nuevo precargado y elegido sin guardar la salida`, async ({
    page,
  }) => {
    const { writes } = await mockIssues(page);
    const term = `Cliente nuevo ${path}`;
    await page.route('**/api/sales/clients', (route) =>
      route.fulfill({
        json: {
          code: 'CREATED_CLIENT',
          client: { id: createdItemId, version: 0, name: term, isActive: true },
        },
      }),
    );
    await page.goto(`/salidas/${path}`);
    await page.getByRole('button', { name: 'Nueva salida', exact: true }).click();
    const parent = page.getByRole('dialog', {
      name: path === 'mermas' ? 'Registrar salida de merma' : 'Registrar salida',
      exact: true,
    });
    await parent.getByLabel('Observaciones', { exact: true }).fill('Salida sin guardar');
    await openCreation(page, parent, 'Cliente', 'Registrar cliente', term);
    const client = page.getByRole('dialog', { name: 'Registrar cliente', exact: true });
    await expect(client.getByLabel('Nombre', { exact: true })).toHaveValue(term);
    await client.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(client).toBeHidden();
    await expect(parent.getByRole('combobox', { name: 'Cliente', exact: true })).toHaveValue(term);
    await expect(parent.getByLabel('Observaciones', { exact: true })).toHaveValue(
      'Salida sin guardar',
    );
    expect(writes).toHaveLength(0);
  });
}

test('select: permisos y catálogos de consulta no ofrecen altas', async ({ page }) => {
  await mockWarehouse(page);
  await page.goto('/almacen/materiales');
  await page.getByRole('button', { name: 'Nuevo material', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Proveedor', exact: true })
    .fill('Proveedor sin permiso');
  await expect(page.getByRole('button', { name: /Registrar proveedor «/ })).toHaveCount(0);
  await mockPurchases(
    page,
    purchasePermissions.filter((permission) => permission !== 'materials:write'),
  );
  await page.goto('/compras/materiales');
  await page.getByRole('button', { name: 'Nueva compra', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Registrar compra', exact: true })
    .getByRole('combobox', { name: 'Proveedor', exact: true })
    .click();
  await page.getByRole('option', { name: 'Proveedor Central', exact: true }).click();
  await page.getByRole('combobox', { name: 'Material', exact: true }).fill('Artículo sin permiso');
  await expect(page.getByRole('button', { name: /Registrar material/ })).toHaveCount(0);
  await mockIssues(
    page,
    issuePermissions.filter((permission) => permission !== 'clients:create'),
  );
  await page.goto('/salidas/materiales');
  await page.getByRole('button', { name: 'Nueva salida', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Registrar salida', exact: true })
    .getByRole('combobox', { name: 'Cliente', exact: true })
    .fill('Cliente sin permiso');
  await expect(page.getByRole('button', { name: /Registrar cliente/ })).toHaveCount(0);
});

test('select: permite abrir el alta con teclado cuando la búsqueda no tiene resultados', async ({
  page,
}) => {
  await mockWarehouse(page, [...user.permissions, 'suppliers:manage']);
  await page.route('**/api/warehouse/suppliers?**', (route) =>
    route.fulfill({ json: { data: [], recordsTotal: 0, recordsFiltered: 0 } }),
  );
  await page.goto('/almacen/materiales');
  await page.getByRole('button', { name: 'Nuevo material', exact: true }).click();
  const input = page.getByRole('combobox', { name: 'Proveedor', exact: true });
  await input.fill('Proveedor teclado');
  const action = page.getByRole('button', {
    name: 'Registrar proveedor «Proveedor teclado»',
    exact: true,
  });
  await expect(action).toBeVisible();
  await input.press('ArrowDown');
  await expect(action).toBeFocused();
  await action.press('Enter');
  const child = page.getByRole('dialog', { name: 'Registrar proveedor', exact: true });
  await expect(child.getByLabel('Nombre comercial', { exact: true })).toHaveValue(
    'Proveedor teclado',
  );
});

test('select: coincidencias existentes, filtros y catálogos sólo consultables no ofrecen altas', async ({
  page,
}) => {
  await mockWarehouse(page, [...user.permissions, 'suppliers:manage']);
  await page.goto('/almacen/materiales');
  await page
    .getByRole('combobox', { name: 'Filtrar por proveedor', exact: true })
    .fill('Filtro nuevo');
  await expect(page.getByRole('button', { name: /Registrar proveedor «/ })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Nuevo material', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Crear material', exact: true });
  await dialog.getByRole('combobox', { name: 'Proveedor', exact: true }).fill('Proveedor Central');
  await expect(page.getByRole('option', { name: 'Proveedor Central', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Registrar proveedor «/ })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await dialog
    .getByRole('combobox', { name: 'Presentación', exact: true })
    .fill('Presentación nueva');
  await expect(page.getByRole('button', { name: /Registrar presentación/ })).toHaveCount(0);
  await page.goto('/almacen/mermas');
  await page.getByRole('button', { name: 'Nueva merma', exact: true }).click();
  await page.getByRole('combobox', { name: 'Proveedor', exact: true }).fill('Proveedor merma');
  await expect(page.getByRole('button', { name: /Registrar proveedor «/ })).toHaveCount(0);
});
