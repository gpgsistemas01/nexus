import { createdEntryId, mockCatalogs } from './catalogFixtures.js';
import { user } from '../fixtures/inventory.js';
import { expect, test } from '@playwright/test';
import { acknowledgeFormError } from '../helpers/formFeedback.js';
import { ids, material, pageOf, waste } from '../fixtures/inventory.js';
import { chooseOption, mockWarehouse, referenceValue } from './warehouseFixtures.js';

test('presentación: m² con dos decimales en tabla y formulario conserva el envío original', async ({
  page,
}) => {
  await mockWarehouse(page);
  const writes: Record<string, unknown>[] = [];
  const row = {
    ...material,
    currentStock: '1.23',
    convertedQuantity: '1.921383',
    material: { ...material.material, base: 1.23, height: 1.27 },
  };
  await page.route('**/api/warehouse/materials?**', (route) =>
    route.fulfill({ json: pageOf([row]) }),
  );
  await page.route(`**/api/warehouse/materials/${ids.material}/stock`, (route) => {
    writes.push(route.request().postDataJSON());
    return route.fulfill({ json: { code: 'UPDATED_MATERIAL' } });
  });
  await page.goto('/almacen/materiales');
  await expect(page.getByRole('cell', { name: '1.92', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: '1.921383', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Ajustar stock', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Ajustar stock de material', exact: true });
  const converted = referenceValue(dialog, 'Cantidad convertida actual');
  await expect(converted).toHaveText('1.92');
  await expect(
    dialog.getByRole('textbox', { name: 'Cantidad convertida actual', exact: true }),
  ).toHaveCount(0);
  await dialog.getByRole('spinbutton', { name: 'Nuevo stock', exact: true }).fill('1.24');
  await chooseOption(page, 'Motivo del ajuste', 'Conteo físico');
  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.screenshot({
      path: test.info().outputPath(`area-${width}.png`),
      animations: 'disabled',
      fullPage: true,
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes).toEqual([
    {
      supplierId: ids.supplier,
      expectedVersion: 3,
      newStock: 1.24,
      reasonId: ids.reason,
      observations: '',
    },
  ]);
});

test('formularios: abrir, cargar catálogos y mover foco no muestra errores sin captura', async ({
  page,
}) => {
  await mockWarehouse(page);
  for (const [path, button, title] of [
    ['materiales', 'Nueva existencia', 'Registrar existencia de material'],
    ['consumibles', 'Nueva existencia', 'Registrar existencia de consumible'],
    ['mermas', 'Nueva merma', 'Registrar merma'],
  ] as const) {
    await page.goto(`/almacen/${path}`);
    await page.getByRole('button', { name: button, exact: true }).click();
    const dialog = page.getByRole('dialog', { name: title, exact: true });
    const supplier = dialog.getByRole('combobox', { name: 'Proveedor', exact: true });
    await supplier.focus();
    await dialog.getByRole('button', { name: 'Cerrar', exact: true }).focus();
    await expect(dialog.getByText(/es un valor requerido/)).toHaveCount(0);
    await expect(dialog.locator('[aria-invalid="true"]')).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(
      dialog.getByText('El proveedor es un valor requerido', { exact: true }),
    ).toBeVisible();
    await dialog.getByRole('button', { name: 'Cerrar', exact: true }).click();
    await page.getByRole('button', { name: button, exact: true }).click();
    await expect(dialog.getByText(/es un valor requerido/)).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Cerrar', exact: true }).click();
  }
});

test('almacén: encabezados originales, navegación Vue, recarga y móvil', async ({ page }) => {
  await mockWarehouse(page);
  await page.setViewportSize({ width: 1280, height: 844 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/almacen/materiales');
  await expect(
    page.getByRole('heading', { name: 'Tabla de Existencias de materiales', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Lona Proveedor Central' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Material', exact: true })).toHaveCSS(
    'position',
    'static',
  );
  await expect(page.locator('tbody tr').first().locator('td').first()).toHaveCSS(
    'position',
    'static',
  );
  for (const label of [
    'Medidas',
    'Base',
    'Altura',
    'Conversión',
    'Cantidad',
    'Costo máximo unitario',
  ]) {
    await expect(page.getByRole('columnheader', { name: label, exact: true })).toBeVisible();
  }
  const navigation = page.getByRole('navigation', { name: 'Navegación principal' });
  const contentX = await page
    .getByRole('heading', { name: 'Tabla de Existencias de materiales', exact: true })
    .evaluate((element) => element.getBoundingClientRect().x);
  await navigation.getByRole('button', { name: 'Almacén', exact: true }).hover();
  await expect(
    navigation.getByRole('link', { name: 'Existencias de materiales', exact: true }),
  ).toBeHidden();
  await navigation.getByRole('button', { name: 'Almacén', exact: true }).click();
  const warehouseGroup = navigation.getByRole('button', { name: 'Almacén', exact: true });
  await expect(warehouseGroup).toHaveAttribute('aria-expanded', 'true');
  expect(
    await page
      .getByRole('heading', { name: 'Tabla de Existencias de materiales', exact: true })
      .evaluate((element) => element.getBoundingClientRect().x),
  ).toBe(contentX);
  for (const name of [
    'Artículos',
    'Existencias de materiales',
    'Existencias de consumibles',
    'Mermas',
  ]) {
    const link = navigation.getByRole('link', { name, exact: true });
    await expect(link).toBeVisible();
    await expect(link.locator('svg')).toBeVisible();
  }
  await warehouseGroup.click();
  await expect(warehouseGroup).toHaveAttribute('aria-expanded', 'false');
  await expect(
    navigation.getByRole('link', { name: 'Existencias de consumibles', exact: true }),
  ).toBeHidden();
  await warehouseGroup.press('Enter');
  await expect(warehouseGroup).toHaveAttribute('aria-expanded', 'true');
  const destinations = await navigation
    .getByRole('link')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(
    destinations.every((to) => to?.startsWith('/almacen') || to?.startsWith('/catalogos')),
  ).toBe(true);
  await page.getByRole('link', { name: 'Existencias de consumibles', exact: true }).click();
  await expect(page).toHaveURL(/\/almacen\/consumibles$/);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Tabla de Existencias de consumibles', exact: true }),
  ).toBeVisible();
  for (const label of [
    'Consumible',
    'Existencia',
    'Stock mínimo',
    'Presentación',
    'Unidad de medida',
    'Costo máximo unitario',
  ])
    await expect(page.getByRole('columnheader', { name: label, exact: true })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Medidas', exact: true })).toBeVisible();
  await navigation.getByRole('button', { name: 'Almacén', exact: true }).click();
  await page.getByRole('link', { name: 'Mermas', exact: true }).click();
  await expect(
    page.getByRole('cell', { name: 'Sobrante de lona Proveedor Central' }),
  ).toBeVisible();
  await expect(page.locator('thead tr').first().getByRole('columnheader')).toHaveText([
    'Merma',
    'Medidas',
    'Presentación',
    'Pesos por unidad (kg)',
    'Existencias',
    'Conversión',
    'Costo máximo unitario',
    'Activo',
    'Acciones',
  ]);
  await expect(page.locator('thead tr').nth(1).getByRole('columnheader')).toHaveText([
    'Base',
    'Altura',
    'Cono',
    'Total con cono',
    'Neto',
    'Stock actual',
    'Stock mínimo',
    'Cantidad',
    'Unidad',
  ]);
  await page.getByRole('button', { name: 'Detalles de peso', exact: true }).click();
  await expect(page.getByText('Rollo completo con cono (kg)', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar detalles', exact: true }).click();
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.getByRole('button', { name: 'Nueva merma' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole('button', { name: 'Menú', exact: true }).click();
    await expect(
      page.getByRole('link', { name: 'Existencias de materiales', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cerrar menú', exact: true })).toHaveCount(0);
    const menuButton = page.getByRole('button', { name: 'Menú', exact: true });
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.v-navigation-drawer')).not.toHaveClass(
      /v-navigation-drawer--active/,
    );
  }
  expect(errors).toEqual([]);
});

test('almacén: sesión vencida y acceso directo sin permiso', async ({ page }) => {
  await mockWarehouse(page, ['materials:read']);
  await page.goto('/almacen/materiales');
  await expect(page.getByRole('cell', { name: 'Lona Proveedor Central' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nueva existencia' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Editar existencia', exact: true })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Ajustar stock', exact: true })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Exportar Excel', exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'Menú', exact: true }).click();
  const navigation = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(
    navigation.getByRole('link', { name: 'Existencias de materiales', exact: true }),
  ).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Mermas', exact: true })).toBeHidden();
  await navigation.getByRole('button', { name: 'Almacén', exact: true }).press('Escape');
  await expect(page.getByRole('button', { name: 'Menú', exact: true })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await expect(
    page.getByRole('columnheader', { name: 'Costo máximo unitario', exact: true }),
  ).toBeHidden();
  await expect(page.getByRole('columnheader', { name: 'Activo', exact: true })).toBeHidden();
  await page.goto('/almacen/mermas');
  await expect(page.getByRole('heading', { name: 'Acceso no permitido' })).toBeVisible();
  await page.route('**/api/auth/me', (route) =>
    route.fulfill({ status: 401, json: { code: 'INVALID_AUTH' } }),
  );
  await page.route('**/api/auth/refresh', (route) =>
    route.fulfill({ status: 401, json: { code: 'INVALID_AUTH' } }),
  );
  await page.goto('/almacen/materiales');
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  await expect(page).toHaveURL(/inicio-sesion\?returnTo=/);
});

test('consumibles: alta con artículo del catálogo y datos de inventario', async ({ page }) => {
  await mockWarehouse(page);
  const writes: unknown[] = [];
  await page.route('**/api/warehouse/consumables', async (route) => {
    writes.push(route.request().postDataJSON());
    await route.fulfill({ json: { code: 'CREATED_MATERIAL' } });
  });
  await page.goto('/almacen/consumibles');
  await page.getByRole('button', { name: 'Nueva existencia' }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Registrar existencia de consumible',
    exact: true,
  });
  await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
  expect(writes).toEqual([]);
  await chooseOption(page, 'Proveedor', 'Proveedor Central');
  await chooseOption(page, 'Consumible', 'Lona · 2 × 50 · ROLLO');
  await dialog.getByRole('spinbutton', { name: 'Costo máximo unitario' }).fill('12.5');
  await dialog.getByRole('spinbutton', { name: 'Cantidad inicial' }).fill('4');
  await expect(dialog.getByRole('spinbutton', { name: 'Base' })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes).toEqual([
    {
      materialId: ids.material,
      supplierId: ids.supplier,
      maxUnitCost: 12.5,
      newStock: 4,
      minStock: 0,
      isActive: true,
      observations: '',
    },
  ]);
});

test(
  'materiales: conflicto de stock exige actualizar y no pierde la versión original',
  { tag: '@essential' },
  async ({ page }) => {
    await mockWarehouse(page);
    const writes: Record<string, unknown>[] = [];
    await page.route(`**/api/warehouse/materials/${ids.material}/stock`, async (route) => {
      writes.push(route.request().postDataJSON());
      await route.fulfill({ status: 409, json: { code: 'RECORD_VERSION_CONFLICT' } });
    });
    await page.goto('/almacen/materiales');
    await page.getByRole('button', { name: 'Ajustar stock', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Ajustar stock de material', exact: true });
    await expect(dialog.getByRole('textbox', { name: 'Proveedor', exact: true })).toHaveValue(
      'Proveedor Central',
    );
    await expect(dialog.getByRole('textbox', { name: 'Material', exact: true })).not.toBeEditable();
    await expect(referenceValue(dialog, 'Stock actual')).toHaveText('10');
    await dialog.getByRole('spinbutton', { name: 'Nuevo stock' }).fill('8');
    await chooseOption(page, 'Motivo del ajuste', 'Conteo físico');
    await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
    await acknowledgeFormError(page, 'El registro cambió');
    await expect(dialog.getByRole('button', { name: 'Guardar', exact: true })).toBeDisabled();
    expect(writes).toEqual([
      {
        expectedVersion: 3,
        supplierId: ids.supplier,
        newStock: 8,
        reasonId: ids.reason,
        observations: '',
      },
    ]);
    await expect(dialog.getByRole('spinbutton', { name: 'Nuevo stock' })).toHaveValue('8');
    await dialog.getByRole('button', { name: 'Cerrar y actualizar inventario' }).click();
    await expect(dialog).toBeHidden();
    expect(writes).toHaveLength(1);
  },
);

test(
  'materiales: alta desde catálogo, edición versionada y baja de la relación correcta',
  { tag: '@essential' },
  async ({ page }) => {
    await mockWarehouse(page, [...user.permissions, 'suppliers:page-view', 'suppliers:update']);
    const writes: { url: string; method: string; body: unknown }[] = [];
    await page.route('**/api/warehouse/materials**', async (route) => {
      if (route.request().method() === 'GET') return route.fallback();
      const method = route.request().method();
      writes.push({
        url: new URL(route.request().url()).pathname,
        method,
        body: method === 'DELETE' ? null : route.request().postDataJSON(),
      });
      await route.fulfill({
        json: {
          code:
            method === 'POST'
              ? 'CREATED_MATERIAL'
              : method === 'DELETE'
                ? 'DELETED_MATERIAL'
                : 'UPDATED_MATERIAL',
        },
      });
    });
    await page.goto('/almacen/materiales');
    await page.route('**/api/warehouse/suppliers?**', (route) =>
      route.fulfill({
        json: pageOf([
          {
            id: ids.supplier,
            version: 4,
            isActive: true,
            legalName: 'Proveedor Central S.A.',
            tradeName: 'Proveedor Central',
          },
        ]),
      }),
    );
    await page.getByRole('button', { name: 'Nueva existencia', exact: true }).click();
    let dialog = page.getByRole('dialog', {
      name: 'Registrar existencia de material',
      exact: true,
    });
    await chooseOption(page, 'Proveedor', 'Proveedor Central');
    await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(
      dialog.getByText('El artículo es un valor requerido', { exact: true }),
    ).toBeVisible();
    expect(writes).toHaveLength(0);
    await chooseOption(page, 'Material', 'Lona · 2 × 50 · ROLLO');
    const reference = dialog.getByRole('region', { name: 'Datos del material', exact: true });
    for (const [label, value] of [
      ['Base', '2'],
      ['Altura', '50'],
      ['Presentación', 'ROLLO'],
      ['Unidad de medida', 'm²'],
    ]) {
      const field = reference.getByRole('textbox', { name: label, exact: true });
      await expect(field).toHaveValue(value);
      await expect(field).not.toBeEditable();
    }

    const minimum = dialog.getByRole('spinbutton', { name: 'Stock mínimo', exact: true });
    await expect(minimum).toHaveValue('0');
    await minimum.fill('2.5');
    const initialQuantity = dialog.getByRole('spinbutton', {
      name: 'Cantidad inicial',
      exact: true,
    });
    await initialQuantity.fill('1.5');
    await expect(referenceValue(dialog, 'Cantidad convertida inicial')).toHaveText('150.00');
    await initialQuantity.fill('0');
    await expect(referenceValue(dialog, 'Cantidad convertida inicial')).toHaveText('0.00');
    await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(dialog).toBeHidden();
    expect(writes[0]).toMatchObject({
      method: 'POST',
      body: { materialId: ids.material, supplierId: ids.supplier, newStock: 0, minStock: 2.5 },
    });
    await page.getByRole('button', { name: 'Editar existencia', exact: true }).click();
    dialog = page.getByRole('dialog', { name: 'Editar existencia de material', exact: true });
    for (const [label, value] of [
      ['Material', 'Lona'],
      ['Proveedor', 'Proveedor Central'],
      ['Presentación', 'ROLLO'],
      ['Unidad de medida', 'm²'],
      ['Base', '2'],
    ]) {
      const field = dialog.getByRole('textbox', { name: label, exact: true });
      await expect(field).toHaveValue(value);
      await expect(field).not.toBeEditable();
    }
    await page.getByRole('button', { name: 'Editar artículo', exact: true }).click();
    let relatedDialog = page.getByRole('dialog', { name: 'Editar artículo', exact: true });
    await expect(relatedDialog.getByRole('textbox', { name: 'Nombre', exact: true })).toHaveValue(
      'Lona',
    );
    await expect(page).toHaveURL(/\/almacen\/materiales$/);
    await relatedDialog.getByRole('button', { name: 'Cerrar', exact: true }).click();
    await page.getByRole('button', { name: 'Editar proveedor', exact: true }).click();
    relatedDialog = page.getByRole('dialog', { name: 'Editar proveedor', exact: true });
    await expect(
      relatedDialog.getByRole('textbox', { name: 'Razón social', exact: true }),
    ).toHaveValue('Proveedor Central S.A.');
    await relatedDialog.getByRole('button', { name: 'Cerrar', exact: true }).click();
    const editMinimum = dialog.getByRole('spinbutton', { name: 'Stock mínimo', exact: true });
    await expect(editMinimum).toHaveValue('5');
    await editMinimum.fill('6');
    await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(dialog).toBeHidden();
    expect(writes[1]).toEqual({
      method: 'PATCH',
      url: `/api/warehouse/materials/${ids.material}`,
      body: {
        minStock: 6,
        maxUnitCost: 100,
        isActive: true,
        supplierId: ids.supplier,
        expectedVersion: 3,
      },
    });
    await page.getByRole('button', { name: 'Eliminar', exact: true }).click();
    dialog = page.getByRole('dialog', {
      name: 'Eliminar existencia de material: Lona',
      exact: true,
    });
    await dialog.getByRole('button', { name: 'Confirmar eliminación' }).click();
    await expect(dialog).toBeHidden();
    expect(writes[2]).toEqual({
      method: 'DELETE',
      url: `/api/warehouse/materials/${ids.offer}`,
      body: null,
    });
  },
);

test('inventario: exportar respeta filtros y recupera una respuesta que no es Excel', async ({
  page,
}) => {
  await mockWarehouse(page);
  let query: URLSearchParams | undefined;
  let attempts = 0;
  const downloads: string[] = [];
  page.on('download', (download) => downloads.push(download.suggestedFilename()));
  await page.route('**/api/warehouse/reports/inventory/excel?**', (route) => {
    query = new URL(route.request().url()).searchParams;
    attempts += 1;
    if (attempts === 1)
      return route.fulfill({ contentType: 'text/html', body: '<h1>Servicio no disponible</h1>' });
    return route.fulfill({
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: 'archivo de prueba',
    });
  });
  await page.goto('/almacen/consumibles');
  await page.getByRole('textbox', { name: 'Buscar por nombre' }).fill('Cinta');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await page.getByRole('button', { name: 'Exportar Excel', exact: true }).click();
  await page.getByText('Activos o con stock', { exact: true }).click();
  await page.getByRole('option', { name: 'Con stock', exact: true }).click();
  await page.getByRole('button', { name: 'Descargar Excel' }).click();
  await acknowledgeFormError(page, 'Excel válido');
  expect(downloads).toEqual([]);
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar Excel', exact: true }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toMatch(
    /^reporte_inventario_consumibles_\d{2}_\d{4}\.xlsx$/,
  );
  expect(query?.get('type')).toBe('CONSUMABLE');
  expect(query?.get('search')).toBe('Cinta');
  expect(query?.get('inventoryScope')).toBe('inStock');
  expect(attempts).toBe(2);
  await expect(page.getByRole('alert', { name: 'Error de descarga' })).toBeHidden();
});

for (const initialQuantity of ['3', '0']) {
  test(`mermas: duplicado traslada cantidad ${initialQuantity} y observaciones sólo después de confirmar`, async ({
    page,
  }) => {
    await mockWarehouse(page);
    const creates: Record<string, unknown>[] = [];
    const entries: Record<string, unknown>[] = [];
    await page.route('**/api/warehouse/wastes', (route) => {
      creates.push(route.request().postDataJSON());
      return route.fulfill({
        status: 409,
        json: {
          code: 'WASTE_ALREADY_EXISTS',
          meta: { operationRejected: true, waste: { ...waste, version: undefined } },
        },
      });
    });
    await page.route(`**/api/warehouse/wastes/${ids.waste}/stock-additions`, (route) => {
      entries.push(route.request().postDataJSON());
      return route.fulfill({ json: { code: 'UPDATED_WASTE' } });
    });
    await page.goto('/almacen/mermas');
    await page.getByRole('button', { name: 'Nueva merma', exact: true }).click();
    const creating = page.getByRole('dialog', { name: 'Registrar merma', exact: true });
    await chooseOption(page, 'Proveedor', 'Proveedor Central');
    await chooseOption(page, 'Material de referencia del proveedor', 'Lona · ROLLO · 2 × 50');
    await creating
      .getByRole('textbox', { name: 'Nombre de la merma', exact: true })
      .fill(waste.name);
    await creating
      .getByLabel('Peso del rollo completo con cono (kg)', { exact: true })
      .fill('10.25');
    await creating.getByLabel('Peso del cono de la merma (kg)', { exact: true }).fill('0.25');
    await creating.getByLabel('Peso de la merma con cono (kg)', { exact: true }).fill('2.75');
    await creating.getByLabel('Cantidad inicial', { exact: true }).fill(initialQuantity);
    await creating.getByLabel('Observaciones', { exact: true }).fill('Conservar esta captura');
    await creating.getByRole('button', { name: 'Guardar', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: 'Esta merma ya existe', exact: true });
    await expect(confirmation).toBeVisible();
    expect(entries).toHaveLength(0);
    await confirmation.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(creating.getByLabel('Observaciones', { exact: true })).toHaveValue(
      'Conservar esta captura',
    );
    await expect(creating.getByLabel('Cantidad inicial', { exact: true })).toHaveValue(
      initialQuantity,
    );
    await creating.getByRole('button', { name: 'Guardar', exact: true }).click();
    await confirmation.getByRole('button', { name: 'Abrir Agregar stock', exact: true }).click();
    const adding = page.getByRole('dialog', { name: 'Agregar stock de merma', exact: true });
    await expect(creating).toHaveCount(0);
    await expect(adding.locator('[aria-invalid="true"]')).toHaveCount(0);
    await expect(adding.getByLabel('Cantidad a agregar', { exact: true })).toHaveValue(
      initialQuantity === '0' ? '' : initialQuantity,
    );
    await expect(adding.getByLabel('Observaciones', { exact: true })).toHaveValue(
      'Conservar esta captura',
    );
    expect(entries).toHaveLength(0);
    if (initialQuantity === '0') {
      await adding.getByRole('button', { name: 'Guardar', exact: true }).click();
      expect(entries).toHaveLength(0);
      await adding.getByLabel('Cantidad a agregar', { exact: true }).fill('4');
    }
    await adding.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(adding).toBeHidden();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      quantity: initialQuantity === '0' ? 4 : 3,
      observations: 'Conservar esta captura',
    });
    expect(entries[0]!.operationId).not.toBe(creates.at(-1)!.operationId);
  });
}

test(
  'mermas: referencia de rollo, peso calculado y recuperación tras recargar sin duplicar la captura',
  { tag: '@essential' },
  async ({ page }) => {
    await mockWarehouse(page);
    const writes: Record<string, unknown>[] = [];
    await page.route('**/api/warehouse/wastes', async (route) => {
      writes.push(route.request().postDataJSON());
      if (writes.length === 1) return route.abort('failed');
      return route.fulfill({ json: { code: 'CREATED_WASTE' } });
    });
    await page.goto('/almacen/mermas');
    await page.getByRole('button', { name: 'Nueva merma' }).click();
    let dialog = page.getByRole('dialog', { name: 'Registrar merma', exact: true });
    await expect(
      dialog.getByRole('combobox', { name: 'Material de referencia del proveedor', exact: true }),
    ).toBeDisabled();
    await chooseOption(page, 'Proveedor', 'Proveedor Central');
    await chooseOption(page, 'Material de referencia del proveedor', 'Lona · ROLLO · 2 × 50');
    await dialog.getByRole('textbox', { name: 'Nombre de la merma' }).fill('Sobrante nuevo');
    await dialog
      .getByRole('spinbutton', { name: 'Peso del rollo completo con cono (kg)' })
      .fill('10.25');
    await dialog.getByRole('spinbutton', { name: 'Peso del cono de la merma (kg)' }).fill('0.25');
    await dialog.getByRole('spinbutton', { name: 'Peso de la merma con cono (kg)' }).fill('2.75');
    await dialog.getByRole('spinbutton', { name: 'Cantidad inicial' }).fill('3');
    await expect(dialog.getByRole('textbox', { name: 'Presentación', exact: true })).toHaveValue(
      'ROLLO',
    );
    await expect(
      dialog.getByRole('textbox', { name: 'Unidad de medida', exact: true }),
    ).toHaveValue('m²');
    await expect(referenceValue(dialog, 'Peso neto de la merma (kg)')).toHaveText('2.5');
    await expect(dialog.getByRole('spinbutton', { name: 'Base' })).toHaveValue('2');
    await expect(dialog.getByRole('spinbutton', { name: 'Altura' })).toHaveValue('12.5');
    await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
    await acknowledgeFormError(page, 'No fue posible conectar');
    await expect(dialog.getByRole('button', { name: 'Recuperar captura' })).toBeVisible();
    const sent = writes[0]!;
    expect(sent).toMatchObject({
      name: 'Sobrante nuevo',
      base: 2,
      height: 12.5,
      coneWeightKg: 0.25,
      totalWeightKg: 2.75,
      referenceRollTotalWeightKg: 10.25,
      initialQuantity: 3,
    });
    expect(sent).not.toHaveProperty('weightKg');
    expect(sent).not.toHaveProperty('sampleLengthM');
    expect(sent.operationId).toMatch(/^[\da-f-]{36}$/);
    await page.reload();
    await page.getByRole('button', { name: 'Nueva merma' }).click();
    dialog = page.getByRole('dialog', { name: 'Registrar merma', exact: true });
    await expect(dialog).toContainText('Sobrante nuevo');
    await dialog.getByRole('button', { name: 'Recuperar captura' }).click();
    await expect(dialog).toBeHidden();
    expect(writes).toHaveLength(2);
    expect(writes[1]).toEqual(sent);
    expect(
      await page.evaluate(() =>
        localStorage.getItem(
          `nexus:waste-operation:${'88888888-8888-4888-8888-888888888888'}:create:`,
        ),
      ),
    ).toBeNull();
  },
);

test('mermas: agregar stock y editar datos usan contratos independientes', async ({ page }) => {
  await mockWarehouse(page);
  const writes: { method: string; body: Record<string, unknown> }[] = [];
  await page.route(`**/api/warehouse/wastes/${ids.waste}**`, async (route) => {
    writes.push({ method: route.request().method(), body: route.request().postDataJSON() });
    await route.fulfill({ json: { code: 'UPDATED_WASTE' } });
  });
  await page.goto('/almacen/mermas');
  await page.getByRole('button', { name: 'Agregar stock', exact: true }).click();
  let dialog = page.getByRole('dialog', { name: 'Agregar stock de merma', exact: true });
  await dialog.getByRole('spinbutton', { name: 'Cantidad a agregar' }).fill('2');
  await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes[0]?.method).toBe('POST');
  expect(writes[0]?.body).toMatchObject({ quantity: 2, observations: '' });
  expect(writes[0]?.body.operationId).toMatch(/^[\da-f-]{36}$/);
  await page.getByRole('button', { name: 'Editar merma', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Editar merma', exact: true });
  await dialog.getByRole('textbox', { name: 'Nombre de la merma' }).fill('Sobrante revisado');
  await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes[1]).toEqual({
    method: 'PATCH',
    body: {
      name: 'Sobrante revisado',
      minStock: 1,
      maxUnitCost: 40,
      isActive: true,
      expectedVersion: 2,
    },
  });
});

test(
  'almacén: filtros y paginación se envían al servidor y permiten recuperarse de un fallo',
  { tag: '@essential' },
  async ({ page }) => {
    await mockWarehouse(page);
    const queries: URLSearchParams[] = [];
    await page.route('**/api/warehouse/materials?**', async (route) => {
      const query = new URL(route.request().url()).searchParams;
      queries.push(query);
      if (query.get('search') === 'error') return route.fulfill({ status: 503, json: {} });
      await route.fulfill({
        json: {
          ...pageOf([material]),
          recordsTotal: 12,
          recordsFiltered: query.get('search') ? 1 : 12,
        },
      });
    });
    await page.goto('/almacen/materiales');
    await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
    await expect(page.getByText('Registros 11–12 de 12', { exact: true })).toBeVisible();
    expect(queries.at(-1)?.get('start')).toBe('10');
    await page.getByRole('textbox', { name: 'Buscar por nombre' }).fill('error');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    const requestError = page.getByRole('alert').filter({ hasText: 'No se pudo completar' });
    await expect(requestError).toBeVisible();
    await page.getByRole('textbox', { name: 'Buscar por nombre' }).fill('Lona');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(requestError).toBeHidden();
    expect(queries.at(-1)?.get('start')).toBe('0');
    expect(queries.at(-1)?.get('search')).toBe('Lona');
  },
);

test('selectores: carga automática al final, reintento y selección conservada', async ({
  page,
}) => {
  await mockWarehouse(page);
  const starts: number[] = [];
  let isAvailable = false;
  const suppliers = Array.from({ length: 45 }, (_, index) => ({
    id: `99999999-9999-4999-8999-${String(index + 1).padStart(12, '0')}`,
    tradeName: `Proveedor ${String(index + 1).padStart(3, '0')}`,
  }));
  await page.route('**/api/warehouse/suppliers?**', async (route) => {
    const query = new URL(route.request().url()).searchParams;
    const start = Number(query.get('start'));
    starts.push(start);
    if (start === 20 && !isAvailable) {
      return route.fulfill({ status: 503, json: {} });
    }
    return route.fulfill({
      json: { data: suppliers.slice(start, start + 20), recordsFiltered: 45, recordsTotal: 45 },
    });
  });
  await page.goto('/almacen/materiales');
  await page.getByRole('button', { name: 'Nueva existencia', exact: true }).click();
  const field = page.getByRole('combobox', { name: 'Proveedor', exact: true });
  await field.click();
  const list = page.getByRole('listbox');
  await list.hover();
  await page.mouse.wheel(0, 1500);
  await expect(
    page.getByRole('button', { name: 'Reintentar catálogo', exact: true }),
  ).toBeVisible();
  expect(starts.filter((start) => start === 20)).toHaveLength(3);
  isAvailable = true;
  await page.getByRole('button', { name: 'Reintentar catálogo', exact: true }).click();
  await expect.poll(() => starts.filter((start) => start === 20).length).toBe(4);
  await list.hover();
  await page.mouse.wheel(0, 1800);
  await expect.poll(() => starts.includes(40)).toBe(true);
  await expect(page.getByText('Desplázate para cargar más opciones', { exact: true })).toBeHidden();
  await list.hover();
  await page.mouse.wheel(0, 800);
  await page.getByRole('option', { name: 'Proveedor 045', exact: true }).click();
  await expect(field).toHaveValue('Proveedor 045');
  expect(starts.filter((start) => start === 40)).toHaveLength(1);
  await field.click();
  const selected = list.getByRole('option', { name: 'Proveedor 045', selected: true });
  await expect(selected).toBeVisible();
  expect(await selected.evaluate((option) => getComputedStyle(option, '::after').content)).not.toBe(
    'none',
  );
});

test('selectores: páginas repetidas y conteo desactualizado no duplican opciones ni prolongan las consultas', async ({
  page,
}) => {
  await mockWarehouse(page);
  const starts: number[] = [];
  const suppliers = Array.from({ length: 30 }, (_, index) => ({
    id: `supplier-${index + 1}`,
    tradeName: `Proveedor ${String(index + 1).padStart(3, '0')}`,
  }));
  await page.route('**/api/warehouse/suppliers?**', (route) => {
    const start = Number(new URL(route.request().url()).searchParams.get('start'));
    starts.push(start);
    const data = start === 0 ? suppliers.slice(0, 20) : start === 20 ? suppliers.slice(10) : [];
    return route.fulfill({ json: { data, recordsTotal: 45, recordsFiltered: 45 } });
  });
  await page.goto('/almacen/materiales');
  const field = page.getByRole('combobox', { name: 'Filtrar por proveedor', exact: true });
  await field.click();
  const list = page.getByRole('listbox');
  await list.hover();
  await page.mouse.wheel(0, 1500);
  await expect.poll(() => starts.includes(20)).toBe(true);
  await list.hover();
  await page.mouse.wheel(0, 1800);
  await expect.poll(() => starts.includes(40)).toBe(true);
  await expect(page.getByText('Desplázate para cargar más opciones', { exact: true })).toBeHidden();
  await list.hover();
  await page.mouse.wheel(0, 800);
  await expect(page.getByRole('option', { name: 'Proveedor 030', exact: true })).toHaveCount(1);
  await page.getByRole('option', { name: 'Proveedor 030', exact: true }).click();
  await expect(field).toHaveValue('Proveedor 030');
  expect(starts).toEqual([0, 20, 40]);
});

test('tabla: orden por medidas se consulta en el servidor', async ({ page }) => {
  await mockWarehouse(page);
  const queries: URLSearchParams[] = [];
  await page.route('**/api/warehouse/materials?**', (route) => {
    queries.push(new URL(route.request().url()).searchParams);
    return route.fulfill({ json: pageOf([material]) });
  });
  await page.goto('/almacen/materiales');
  const base = page.getByRole('columnheader', { name: 'Base', exact: true });
  await base.click();
  await expect.poll(() => queries.at(-1)?.get('order[0][column]')).toBe('1');
  expect(queries.at(-1)?.get('order[0][dir]')).toBe('asc');
  await base.click();
  await expect.poll(() => queries.at(-1)?.get('order[0][dir]')).toBe('desc');
});

test('eliminación: cancelar no escribe; un fallo conserva el diálogo y exige reintento', async ({
  page,
}) => {
  await mockWarehouse(page);
  let writes = 0;
  await page.route(`**/api/warehouse/materials/${ids.offer}`, (route) => {
    writes += 1;
    return route.fulfill(
      writes === 1 ? { status: 503, json: {} } : { json: { code: 'DELETED_MATERIAL' } },
    );
  });
  await page.goto('/almacen/materiales');
  await page.getByRole('button', { name: 'Eliminar', exact: true }).click();
  let dialog = page.getByRole('dialog', {
    name: 'Eliminar existencia de material: Lona',
    exact: true,
  });
  await expect(dialog.getByRole('button', { name: 'Cancelar', exact: true })).toBeFocused();
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes).toBe(0);
  await page.getByRole('button', { name: 'Eliminar', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Eliminar existencia de material: Lona', exact: true });
  await dialog.getByRole('button', { name: 'Confirmar eliminación' }).click();
  await expect(
    dialog.getByText('La eliminación no se confirmó. Puedes reintentar o cancelar.'),
  ).toBeVisible();
  expect(writes).toBe(1);
  await dialog.getByRole('button', { name: 'Confirmar eliminación' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText('La operación se guardó correctamente.')).toBeVisible();
  expect(writes).toBe(2);
});

test('materiales: cambiar a piezas limpia medidas y filtros se pueden restablecer', async ({
  page,
}) => {
  await mockWarehouse(page);
  const pieceId = '99999999-9999-4999-8999-999999999999';
  const queries: URLSearchParams[] = [];
  let payload: Record<string, unknown> | undefined;
  await page.route('**/api/warehouse/unit-measures?**', (route) =>
    route.fulfill({
      json: pageOf([
        { id: ids.unit, name: 'Metros cuadrados', symbol: 'm²' },
        { id: pieceId, name: 'Piezas', symbol: 'pz' },
      ]),
    }),
  );
  await page.route('**/api/warehouse/materials**', (route) => {
    if (route.request().method() === 'GET') {
      queries.push(new URL(route.request().url()).searchParams);
      return route.fulfill({ json: pageOf([material]) });
    }
    payload = route.request().postDataJSON();
    return route.fulfill({ json: { code: 'CREATED_MATERIAL' } });
  });
  await page.goto('/almacen/materiales');
  await page.getByRole('textbox', { name: 'Buscar por nombre' }).fill('Lona');
  await chooseOption(page, 'Filtrar por proveedor', 'Proveedor Central');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect.poll(() => queries.at(-1)?.get('search')).toBe('Lona');
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect.poll(() => queries.at(-1)?.get('search')).toBe('');
  expect(queries.at(-1)?.get('supplierId')).toBe('');
  expect(queries.at(-1)?.get('start')).toBe('0');
  await page.getByRole('button', { name: 'Nueva existencia', exact: true }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Registrar existencia de material',
    exact: true,
  });
  await dialog.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Material por pieza');
  await chooseOption(page, 'Proveedor', 'Proveedor Central');
  await chooseOption(page, 'Presentación', 'ROLLO');
  await chooseOption(page, 'Unidad de medida', 'Metros cuadrados');
  await dialog.getByRole('spinbutton', { name: 'Base' }).fill('2');
  await dialog.getByRole('spinbutton', { name: 'Altura' }).fill('3');
  await chooseOption(page, 'Unidad de medida', 'Piezas');
  await expect(dialog.getByRole('spinbutton', { name: 'Base' })).toBeHidden();
  await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(payload).toMatchObject({ unitMeasureId: pieceId, base: null, height: null });
});

test('merma histórica: conserva pesos, referencia y medidas como consulta al editar', async ({
  page,
}) => {
  await mockWarehouse(page);
  const { waste } = await import('../fixtures/inventory.js');
  await page.route('**/api/warehouse/wastes?**', (route) =>
    route.fulfill({
      json: pageOf([
        { ...waste, sampleLengthM: 10, sampleNetWeightKg: 2, referenceRollTotalWeightKg: null },
      ]),
    }),
  );
  await page.goto('/almacen/mermas');
  await page.getByRole('button', { name: 'Editar merma', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Editar merma', exact: true });
  await expect(
    dialog.getByRole('heading', { name: 'Referencia histórica', exact: true }),
  ).toBeVisible();
  await expect(referenceValue(dialog, 'Largo de referencia (m)')).toHaveText('10');
  await expect(referenceValue(dialog, 'Peso neto de referencia (kg)')).toHaveText('2');
  await expect(referenceValue(dialog, 'Peso neto de la merma (kg)')).toHaveText(/^2\.5(?:0+)?$/);
  await expect(
    dialog.getByRole('spinbutton', { name: 'Peso de la merma con cono (kg)', exact: true }),
  ).not.toBeEditable();
  await expect(dialog.getByRole('spinbutton', { name: 'Base', exact: true })).not.toBeEditable();
  await dialog.getByRole('button', { name: 'Cerrar', exact: true }).click();
});

for (const [path, resource, label, type] of [
  ['materiales', 'materials', 'Material', 'MATERIAL'],
  ['consumibles', 'consumables', 'Consumible', 'CONSUMABLE'],
] as const) {
  test(
    `almacén ${resource}: registra artículo antes del proveedor y conserva stock`,
    { tag: resource === 'materials' ? '@essential' : [] },
    async ({ page }) => {
      const { store, writes: catalogWrites } = await mockCatalogs(page, [
        ...user.permissions,
        'suppliers:manage',
      ]);
      store.set('presentations', [
        { id: ids.presentation, name: 'PIEZA', isActive: true, version: 0 },
      ]);
      store.set('unit-measures', [
        { id: ids.unit, name: 'PIEZA', symbol: 'PZA.', isActive: true, version: 0 },
      ]);
      const stockWrites: Record<string, unknown>[] = [];
      await page.route(`**/api/warehouse/${resource}`, async (route) => {
        stockWrites.push(route.request().postDataJSON());
        return route.fulfill({ json: { code: 'CREATED_MATERIAL' } });
      });
      await page.goto(`/almacen/${path}`);
      await page.getByRole('button', { name: 'Nueva existencia', exact: true }).click();
      const main = page.getByRole('dialog', {
        name: `Registrar existencia de ${label.toLowerCase()}`,
        exact: true,
      });
      await main.getByLabel('Cantidad inicial', { exact: true }).fill('4');
      const minimum = main.getByRole('spinbutton', { name: 'Stock mínimo', exact: true });
      await minimum.fill('2');
      const term = `Artículo nuevo ${resource}`;
      const picker = main.getByRole('combobox', { name: label, exact: true });
      await picker.fill(term);
      const createOption = page.getByRole('button', {
        name: `Registrar ${label.toLowerCase()} «${term}»`,
        exact: true,
      });
      await expect(createOption).toBeVisible();
      await picker.press('Enter');
      const auxiliary = page.getByRole('dialog', {
        name: `Registrar ${label.toLowerCase()}`,
        exact: true,
      });
      await expect(auxiliary.getByLabel('Nombre', { exact: true })).toHaveValue(term);
      await expect(auxiliary.getByRole('combobox', { name: 'Proveedor', exact: true })).toHaveCount(
        0,
      );
      await expect(auxiliary.getByRole('combobox', { name: 'Tipo', exact: true })).toHaveCount(0);
      await auxiliary.getByRole('button', { name: 'Cerrar', exact: true }).click();
      expect(catalogWrites).toEqual([]);
      await expect(main.getByLabel('Cantidad inicial', { exact: true })).toHaveValue('4');
      await expect(minimum).toHaveValue('2');
      await main.getByRole('combobox', { name: label, exact: true }).fill(term);
      await page
        .getByRole('button', { name: `Registrar ${label.toLowerCase()} «${term}»`, exact: true })
        .click();
      await chooseOption(page, 'Presentación', 'PIEZA', auxiliary);
      await chooseOption(page, 'Unidad de medida', 'PIEZA (PZA.)', auxiliary);
      await auxiliary.getByRole('button', { name: 'Guardar', exact: true }).click();
      await expect(auxiliary).toBeHidden();
      await expect(main.getByRole('combobox', { name: label, exact: true })).toHaveValue(
        `${term} · PIEZA`,
      );
      await expect(main.getByRole('combobox', { name: 'Proveedor', exact: true })).toHaveValue('');
      expect(catalogWrites[0]?.data).toEqual({
        name: term,
        type,
        presentationId: ids.presentation,
        unitMeasureId: ids.unit,
        base: null,
        height: null,
      });
      expect(stockWrites).toEqual([]);
      await chooseOption(page, 'Proveedor', 'Proveedor Central', main);
      await main.getByRole('button', { name: 'Guardar', exact: true }).click();
      await expect(main).toBeHidden();
      expect(stockWrites[0]).toEqual({
        materialId: createdEntryId,
        supplierId: ids.supplier,
        maxUnitCost: 0,
        newStock: 4,
        minStock: 2,
        isActive: true,
        observations: '',
      });
    },
  );
}
