import { expect, test } from '@playwright/test';
import { ids, material, pageOf } from '../fixtures/inventory.js';
import { chooseOption, mockWarehouse } from './warehouseFixtures.js';

test('formularios: abrir, cargar catálogos y mover foco no muestra errores sin captura', async ({
  page,
}) => {
  await mockWarehouse(page);
  for (const [path, button, title] of [
    ['materiales', 'Nuevo material', 'Crear material'],
    ['consumibles', 'Nuevo consumible', 'Crear consumible'],
    ['mermas', 'Nueva merma', 'Crear merma'],
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
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/almacen/materiales');
  await expect(
    page.getByRole('heading', { name: 'Tabla de Existencias', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Lona Proveedor Central' })).toBeVisible();
  for (const label of [
    'Medidas',
    'Base',
    'Altura',
    'Conversión',
    'Cantidad',
    'Costo Unitario de Conversión',
  ]) {
    await expect(page.getByRole('columnheader', { name: label, exact: true })).toBeVisible();
  }
  const navigation = page.getByRole('navigation', { name: 'Navegación principal' });
  const contentX = await page
    .getByRole('heading', { name: 'Tabla de Existencias', exact: true })
    .evaluate((element) => element.getBoundingClientRect().x);
  await navigation.getByRole('button', { name: 'Almacén', exact: true }).hover();
  await expect(navigation.getByRole('link', { name: 'Materiales', exact: true })).toBeHidden();
  await navigation.getByRole('button', { name: 'Almacén', exact: true }).click();
  const warehouseGroup = navigation.getByRole('button', { name: 'Almacén', exact: true });
  await expect(warehouseGroup).toHaveAttribute('aria-expanded', 'true');
  expect(
    await page
      .getByRole('heading', { name: 'Tabla de Existencias', exact: true })
      .evaluate((element) => element.getBoundingClientRect().x),
  ).toBe(contentX);
  for (const name of ['Materiales', 'Consumibles', 'Mermas']) {
    const link = navigation.getByRole('link', { name, exact: true });
    await expect(link).toBeVisible();
    await expect(link.locator('svg')).toBeVisible();
  }
  await warehouseGroup.click();
  await expect(warehouseGroup).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation.getByRole('link', { name: 'Consumibles', exact: true })).toBeHidden();
  await warehouseGroup.press('Enter');
  await expect(warehouseGroup).toHaveAttribute('aria-expanded', 'true');
  const destinations = await navigation
    .getByRole('link')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(
    destinations.every((to) => to?.startsWith('/almacen') || to?.startsWith('/catalogos')),
  ).toBe(true);
  await page.mouse.click(page.viewportSize()!.width - 16, 70);
  await expect(page.getByRole('button', { name: 'Expandir menú', exact: true })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Materiales', exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'Expandir menú', exact: true }).click();
  await page.getByRole('link', { name: 'Consumibles', exact: true }).click();
  await expect(page).toHaveURL(/\/almacen\/consumibles$/);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Tabla de Consumibles', exact: true }),
  ).toBeVisible();
  for (const label of [
    'Consumible',
    'Existencia',
    'Stock Mínimo',
    'Presentación',
    'Unidad de medida',
    'Costo Unitario',
  ])
    await expect(page.getByRole('columnheader', { name: label, exact: true })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Medidas', exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'Expandir menú', exact: true }).click();
  await page.getByRole('link', { name: 'Mermas', exact: true }).click();
  await expect(
    page.getByRole('cell', { name: 'Sobrante de lona Proveedor Central' }),
  ).toBeVisible();
  await expect(
    page.getByRole('columnheader', { name: 'Pesos por unidad (kg)', exact: true }),
  ).toBeVisible();
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
    await expect(page.getByRole('link', { name: 'Materiales', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar menú', exact: true }).click();
  }
  expect(errors).toEqual([]);
});

test('almacén: sesión vencida y acceso directo sin permiso', async ({ page }) => {
  await mockWarehouse(page, ['materials:read']);
  await page.goto('/almacen/materiales');
  await expect(page.getByRole('cell', { name: 'Lona Proveedor Central' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nuevo material' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Editar', exact: true })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Ajustar stock', exact: true })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Descargar Excel' })).toBeHidden();
  await page.getByRole('button', { name: 'Expandir menú', exact: true }).click();
  const navigation = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(navigation.getByRole('link', { name: 'Materiales', exact: true })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Mermas', exact: true })).toBeHidden();
  await navigation.getByRole('button', { name: 'Almacén', exact: true }).press('Escape');
  await expect(page.getByRole('button', { name: 'Expandir menú', exact: true })).toBeVisible();
  await expect(
    page.getByRole('columnheader', { name: 'Costo Unitario de Conversión', exact: true }),
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

test('consumibles: alta validada con catálogos y sin medidas', async ({ page }) => {
  await mockWarehouse(page);
  const writes: unknown[] = [];
  await page.route('**/api/warehouse/consumables', async (route) => {
    writes.push(route.request().postDataJSON());
    await route.fulfill({ json: { code: 'CREATED_MATERIAL' } });
  });
  await page.goto('/almacen/consumibles');
  await page.getByRole('button', { name: 'Nuevo consumible' }).click();
  const dialog = page.getByRole('dialog', { name: 'Crear consumible', exact: true });
  await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
  expect(writes).toEqual([]);
  await dialog.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Cinta adhesiva');
  await chooseOption(page, 'Proveedor', 'Proveedor Central');
  await chooseOption(page, 'Presentación', 'ROLLO');
  await chooseOption(page, 'Unidad de medida', 'Metros cuadrados');
  await dialog.getByRole('spinbutton', { name: 'Costo máximo unitario' }).fill('12.5');
  await dialog.getByRole('spinbutton', { name: 'Cantidad inicial' }).fill('4');
  await expect(dialog.getByRole('spinbutton', { name: 'Base (m)' })).toBeHidden();
  await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes).toEqual([
    {
      name: 'Cinta adhesiva',
      supplierId: ids.supplier,
      presentationId: ids.presentation,
      unitMeasureId: ids.unit,
      maxUnitCost: 12.5,
      newStock: 4,
      isActive: true,
      observations: '',
    },
  ]);
});

test('materiales: conflicto de stock exige actualizar y no pierde la versión original', async ({
  page,
}) => {
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
  await expect(dialog.getByRole('textbox', { name: 'Nombre', exact: true })).not.toBeEditable();
  await expect(dialog.getByRole('textbox', { name: 'Stock actual', exact: true })).toHaveValue(
    '10',
  );
  await dialog.getByRole('spinbutton', { name: 'Nuevo stock' }).fill('8');
  await chooseOption(page, 'Motivo del ajuste', 'Conteo físico');
  await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(dialog.getByRole('alert').filter({ hasText: 'El registro cambió' })).toBeVisible();
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
});

test('materiales: alta con medidas, edición versionada y baja de la relación correcta', async ({
  page,
}) => {
  await mockWarehouse(page);
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
  await page.getByRole('button', { name: 'Nuevo material', exact: true }).click();
  let dialog = page.getByRole('dialog', { name: 'Crear material', exact: true });
  await chooseOption(page, 'Proveedor', 'Proveedor Central');
  await chooseOption(page, 'Presentación', 'ROLLO');
  await chooseOption(page, 'Unidad de medida', 'Metros cuadrados');
  await dialog.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Lona nueva');
  await dialog.getByRole('spinbutton', { name: 'Base (m)' }).fill('2');
  await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(
    dialog.getByRole('alert').filter({ hasText: 'altura', hasNotText: 'base' }),
  ).toBeVisible();
  expect(writes).toHaveLength(0);
  await dialog.getByRole('spinbutton', { name: 'Altura (m)' }).fill('50');
  await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes[0]).toMatchObject({
    method: 'POST',
    body: { name: 'Lona nueva', base: 2, height: 50, newStock: 0 },
  });
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Editar material', exact: true });
  await expect(dialog.getByRole('textbox', { name: 'Proveedor', exact: true })).toHaveValue(
    'Proveedor Central',
  );
  await expect(dialog.getByRole('textbox', { name: 'Presentación', exact: true })).toHaveValue(
    'ROLLO',
  );
  await expect(dialog.getByRole('textbox', { name: 'Unidad de medida', exact: true })).toHaveValue(
    'm²',
  );
  await expect(dialog.getByRole('spinbutton', { name: 'Base (m)' })).not.toBeEditable();
  await dialog.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Lona revisada');
  await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes[1]).toEqual({
    method: 'PATCH',
    url: `/api/warehouse/materials/${ids.material}`,
    body: {
      name: 'Lona revisada',
      minStock: 5,
      maxUnitCost: 100,
      isActive: true,
      supplierId: ids.supplier,
      expectedVersion: 3,
      expectedMaterialVersion: 7,
    },
  });
  await page.getByRole('button', { name: 'Eliminar', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Eliminar material: Lona', exact: true });
  await dialog.getByRole('button', { name: 'Confirmar eliminación' }).click();
  await expect(dialog).toBeHidden();
  expect(writes[2]).toEqual({
    method: 'DELETE',
    url: `/api/warehouse/materials/${ids.offer}`,
    body: null,
  });
});

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
  await page.getByText('Activos o con stock', { exact: true }).click();
  await page.getByRole('option', { name: 'Con stock', exact: true }).click();
  await page.getByRole('button', { name: 'Descargar Excel' }).click();
  await expect(page.getByRole('alert', { name: 'Error de descarga' })).toContainText(
    'Excel válido',
  );
  expect(downloads).toEqual([]);
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Reintentar descarga' }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe('inventario_consumables.xlsx');
  expect(query?.get('type')).toBe('CONSUMABLE');
  expect(query?.get('search')).toBe('Cinta');
  expect(query?.get('inventoryScope')).toBe('inStock');
  expect(attempts).toBe(2);
  await expect(page.getByRole('alert', { name: 'Error de descarga' })).toBeHidden();
});

test('mermas: referencia de rollo, peso calculado y recuperación tras recargar sin duplicar la captura', async ({
  page,
}) => {
  await mockWarehouse(page);
  const writes: Record<string, unknown>[] = [];
  await page.route('**/api/warehouse/wastes', async (route) => {
    writes.push(route.request().postDataJSON());
    if (writes.length === 1) return route.abort('failed');
    return route.fulfill({ json: { code: 'CREATED_WASTE' } });
  });
  await page.goto('/almacen/mermas');
  await page.getByRole('button', { name: 'Nueva merma' }).click();
  let dialog = page.getByRole('dialog', { name: 'Crear merma', exact: true });
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
  await expect(dialog.getByRole('textbox', { name: 'Unidad de medida', exact: true })).toHaveValue(
    'm²',
  );
  await expect(dialog.getByRole('textbox', { name: 'Peso neto de la merma (kg)' })).toHaveValue(
    '2.5',
  );
  await expect(dialog.getByRole('spinbutton', { name: 'Base (m)' })).toHaveValue('2');
  await expect(dialog.getByRole('spinbutton', { name: 'Altura (m)' })).toHaveValue('12.5');
  await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
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
  dialog = page.getByRole('dialog', { name: 'Crear merma', exact: true });
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
});

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
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
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

test('almacén: filtros y paginación se envían al servidor y permiten recuperarse de un fallo', async ({
  page,
}) => {
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
  await expect(page.getByText('11–12 de 12', { exact: true })).toBeVisible();
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
});

test('selectores: carga automática al final, reintento y selección conservada', async ({
  page,
}) => {
  await mockWarehouse(page);
  const starts: number[] = [];
  let hasFailed = false;
  const suppliers = Array.from({ length: 45 }, (_, index) => ({
    id: `99999999-9999-4999-8999-${String(index + 1).padStart(12, '0')}`,
    tradeName: `Proveedor ${String(index + 1).padStart(3, '0')}`,
  }));
  await page.route('**/api/warehouse/suppliers?**', async (route) => {
    const query = new URL(route.request().url()).searchParams;
    const start = Number(query.get('start'));
    starts.push(start);
    if (start === 20 && !hasFailed) {
      hasFailed = true;
      return route.fulfill({ status: 503, json: {} });
    }
    return route.fulfill({
      json: { data: suppliers.slice(start, start + 20), recordsFiltered: 45, recordsTotal: 45 },
    });
  });
  await page.goto('/almacen/materiales');
  await page.getByRole('button', { name: 'Nuevo material', exact: true }).click();
  const field = page.getByRole('combobox', { name: 'Proveedor', exact: true });
  await field.click();
  const list = page.getByRole('listbox');
  await list.hover();
  await page.mouse.wheel(0, 1500);
  await expect(
    page.getByRole('button', { name: 'Reintentar catálogo', exact: true }),
  ).toBeVisible();
  expect(starts.filter((start) => start === 20)).toHaveLength(1);
  await page.getByRole('button', { name: 'Reintentar catálogo', exact: true }).click();
  await expect.poll(() => starts.filter((start) => start === 20).length).toBe(2);
  await list.hover();
  await page.mouse.wheel(0, 1800);
  await expect.poll(() => starts.includes(40)).toBe(true);
  await expect(page.getByText('Desplázate para cargar más opciones', { exact: true })).toBeHidden();
  await list.hover();
  await page.mouse.wheel(0, 800);
  await page.getByRole('option', { name: 'Proveedor 045', exact: true }).click();
  await expect(field).toHaveValue('Proveedor 045');
  expect(starts.filter((start) => start === 40)).toHaveLength(1);
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
  let dialog = page.getByRole('dialog', { name: 'Eliminar material: Lona', exact: true });
  await expect(dialog.getByRole('button', { name: 'Cancelar', exact: true })).toBeFocused();
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes).toBe(0);
  await page.getByRole('button', { name: 'Eliminar', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Eliminar material: Lona', exact: true });
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
  await page.getByRole('button', { name: 'Nuevo material', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Crear material', exact: true });
  await dialog.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Material por pieza');
  await chooseOption(page, 'Proveedor', 'Proveedor Central');
  await chooseOption(page, 'Presentación', 'ROLLO');
  await chooseOption(page, 'Unidad de medida', 'Metros cuadrados');
  await dialog.getByRole('spinbutton', { name: 'Base (m)' }).fill('2');
  await dialog.getByRole('spinbutton', { name: 'Altura (m)' }).fill('3');
  await chooseOption(page, 'Unidad de medida', 'Piezas');
  await expect(dialog.getByRole('spinbutton', { name: 'Base (m)' })).toBeHidden();
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
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Editar merma', exact: true });
  await expect(
    dialog.getByRole('heading', { name: 'Referencia histórica', exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole('textbox', { name: 'Largo de referencia (m)', exact: true }),
  ).toHaveValue('10');
  await expect(
    dialog.getByRole('textbox', { name: 'Peso neto de referencia (kg)', exact: true }),
  ).toHaveValue('2');
  await expect(
    dialog.getByRole('textbox', { name: 'Peso neto de la merma (kg)', exact: true }),
  ).toHaveValue('2.50');
  await expect(
    dialog.getByRole('spinbutton', { name: 'Peso de la merma con cono (kg)', exact: true }),
  ).not.toBeEditable();
  await expect(
    dialog.getByRole('spinbutton', { name: 'Base (m)', exact: true }),
  ).not.toBeEditable();
  await dialog.getByRole('button', { name: 'Cerrar', exact: true }).click();
});
