import { expect, test, type Page } from '@playwright/test';
import { chooseOption, mockWarehouse } from './warehouseFixtures.js';
import { inventoryImportDraft } from '../fixtures/inventoryImport.js';
import { ids, user } from '../fixtures/inventory.js';

const selectOperation = async (page: Page, title: string) => {
  const select = page.getByRole('combobox', { name: 'Operación del archivo', exact: true });
  await select.focus();
  await select.press('Enter');
  await page.getByRole('option', { name: title, exact: true }).click();
  await expect(select).toHaveValue(title);
};

test('un archivo de otra operación muestra el rechazo y permite elegir otra plantilla sin confirmar', async ({
  page,
}) => {
  await mockWarehouse(page);
  let confirmations = 0;
  await page.route('**/api/warehouse/inventory-imports/**', (route) => {
    if (route.request().url().includes('/preview'))
      return route.fulfill({
        status: 400,
        json: { code: 'INVENTORY_IMPORT_FILE' },
      });
    confirmations++;
    return route.fulfill({ status: 500, json: { code: 'UNEXPECTED_TEST_WRITE' } });
  });
  await page.goto('/almacen/materiales');
  await page.getByRole('button', { name: 'Importar Excel', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Importar Excel de materiales', exact: true });
  await dialog.locator('input[type=file]').setInputFiles({
    name: 'otra-operacion.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from('fixture: operación cruzada'),
  });
  await dialog.getByRole('button', { name: 'Validar archivo', exact: true }).click();
  await expect(
    dialog.getByText(/Utiliza una plantilla XLSX válida del módulo y operación seleccionados/),
  ).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Confirmar importación', exact: true }),
  ).toHaveCount(0);
  await selectOperation(page, 'Editar datos');
  await expect(dialog.getByRole('button', { name: 'Validar archivo', exact: true })).toBeDisabled();
  expect(confirmations).toBe(0);
});

test('un operador de conteo sólo dispone de Ajustar existencias y conserva las referencias necesarias', async ({
  page,
}) => {
  await mockWarehouse(
    page,
    user.permissions.filter(
      (permission) => !['inventory:costs-read', 'materials:write'].includes(permission),
    ),
  );
  await page.goto('/almacen/materiales');
  await page.getByRole('button', { name: 'Importar Excel', exact: true }).click();
  const select = page.getByRole('combobox', { name: 'Operación del archivo', exact: true });
  await expect(select).toHaveValue('Ajustar existencias');
  await select.focus();
  await select.press('Enter');
  await expect(
    page.getByRole('option', { name: 'Ajustar existencias', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('option', { name: 'Alta', exact: true })).toHaveCount(0);
  await expect(page.getByRole('option', { name: 'Editar datos', exact: true })).toHaveCount(0);
});

test('el selector asigna una operación a todo el Excel y cambiarla retira el archivo anterior', async ({
  page,
}) => {
  await mockWarehouse(page);
  const batch = inventoryImportDraft();
  batch.mode = 'adjust';
  batch.preview!.summary = { total: 1, creates: 0, updates: 1, unchanged: 0, errors: 0 };
  batch.preview!.rows = [
    {
      row: 2,
      id: ids.material,
      name: 'Artículo contado',
      action: 'update',
      before: { currentStock: 2 },
      after: { currentStock: 0 },
      details: { difference: -2, reason: 'Conteo físico', observations: 'Conteo comprobado' },
      errors: [],
      warnings: [],
    },
  ];
  let uploads = 0;
  const writes: unknown[] = [];
  await page.route('**/api/warehouse/inventory-imports/**', (route) => {
    if (route.request().url().includes('/preview?mode=adjust')) {
      uploads++;
      return route.fulfill({ json: { code: 'INVENTORY_IMPORT_PREVIEW', batch } });
    }
    writes.push(route.request().postDataJSON());
    return route.fulfill({
      json: {
        code: 'INVENTORY_IMPORT_COMPLETED',
        batch: { ...batch, status: 'COMPLETED', preview: null, result: batch.preview },
      },
    });
  });
  await page.goto('/almacen/materiales');
  await page.getByRole('button', { name: 'Importar Excel', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Importar Excel de materiales', exact: true });
  await expect(
    dialog.getByRole('combobox', { name: 'Operación del archivo', exact: true }),
  ).toHaveValue('Alta');
  const file = {
    name: 'inventario.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from('fixture: conteo'),
  };
  await dialog.locator('input[type=file]').setInputFiles(file);
  await selectOperation(page, 'Ajustar existencias');
  expect(
    await dialog
      .locator('input[type=file]')
      .evaluate((input: HTMLInputElement) => input.files?.length),
  ).toBe(0);
  await expect(dialog.getByRole('button', { name: 'Validar archivo', exact: true })).toBeDisabled();
  await dialog.locator('input[type=file]').setInputFiles(file);
  await dialog.getByRole('button', { name: 'Validar archivo', exact: true }).click();
  await expect(dialog.getByText('Artículo contado', { exact: false })).toBeVisible();
  await expect(
    dialog.getByRole('combobox', { name: 'Operación del archivo', exact: true }),
  ).toHaveCount(0);
  await expect(dialog.getByText('Ajustar existencias', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Confirmar importación', exact: true }).click();
  await expect(
    dialog.getByText('Importación confirmada. El inventario se actualizó.'),
  ).toBeVisible();
  expect(uploads).toBe(1);
  expect(writes).toHaveLength(1);
});

test('plantillas: actualización de consumibles y altas de merma con proveedor', async ({
  page,
}) => {
  await mockWarehouse(page);
  await page.route('**/api/warehouse/inventory-imports/**/template?**', (route) =>
    route.fulfill({
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: Buffer.from('fixture: descarga simulada'),
    }),
  );
  for (const [path, resource, update] of [
    ['consumibles', 'consumables', true],
    ['mermas', 'wastes', false],
  ] as const) {
    await page.goto(`/almacen/${path}`);
    await page.getByRole('button', { name: 'Importar Excel', exact: true }).click();
    await chooseOption(page, 'Proveedor de la plantilla', 'Proveedor Central');
    if (update) {
      await selectOperation(page, 'Editar datos');
      await page
        .getByRole('spinbutton', { name: 'Página de la plantilla (100 filas)', exact: true })
        .fill('2');
      await page
        .getByRole('textbox', { name: 'Buscar registros de la plantilla', exact: true })
        .fill('Lona');
    }
    const requested = page.waitForRequest((request) =>
      request.url().includes(`/inventory-imports/${resource}/template`),
    );
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Descargar plantilla', exact: true }).click(),
    ]);
    const params = new URL((await requested).url()).searchParams;
    expect(params.get('mode')).toBe(update ? 'update' : 'create');
    expect(download.suggestedFilename()).toContain(
      `plantilla_${resource}_${update ? 'update' : 'create'}_`,
    );
    expect(params.get('supplierId')).toBe(ids.supplier);
    expect(params.get('page')).toBe(update ? '2' : '1');
    if (update) expect(params.get('search')).toBe('Lona');
    await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  }
});

test('importación: revisa el stock y confirma en escritorio y móvil', async ({ page }) => {
  await mockWarehouse(page);
  const batch = inventoryImportDraft();
  const writes: Record<string, unknown>[] = [];
  await page.route('**/api/warehouse/inventory-imports/**', (route) => {
    if (route.request().url().includes('/preview')) {
      expect(route.request().headers()['content-type']).toContain('multipart/form-data; boundary=');
      return route.fulfill({ json: { code: 'INVENTORY_IMPORT_PREVIEW', batch } });
    }
    writes.push(route.request().postDataJSON());
    return route.fulfill({
      json: {
        code: 'INVENTORY_IMPORT_COMPLETED',
        batch: { ...batch, version: 1, status: 'COMPLETED', preview: null, result: batch.preview },
      },
    });
  });
  await page.goto('/almacen/materiales');
  await page.getByRole('button', { name: 'Importar Excel', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Importar Excel de materiales', exact: true });
  await dialog.locator('input[type=file]').setInputFiles({
    name: 'materiales.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from('fixture: API simulada'),
  });
  await dialog.getByRole('button', { name: 'Validar archivo', exact: true }).click();
  await expect(dialog.getByText('Cantidad inicial', { exact: true })).toBeVisible();
  await expect(dialog.getByText('Proveedor Central', { exact: true })).toBeVisible();
  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(
      dialog.getByRole('button', { name: 'Confirmar importación', exact: true }),
    ).toBeVisible();
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await dialog.getByRole('button', { name: 'Confirmar importación', exact: true }).click();
  await expect(
    dialog.getByText('Importación confirmada. El inventario se actualizó.'),
  ).toBeVisible();
  expect(writes).toHaveLength(1);
  expect(writes[0]).toEqual({
    expectedVersion: 0,
    operationId: expect.stringMatching(/^[a-f0-9-]{36}$/),
  });
});

test('recupera la confirmación tras perder la respuesta y recargar sin enviar otra alta', async ({
  page,
}) => {
  await mockWarehouse(page);
  const batch = inventoryImportDraft();
  let confirmations = 0;
  await page.route('**/api/warehouse/inventory-imports/**', (route) => {
    if (route.request().url().includes('/preview'))
      return route.fulfill({ json: { code: 'INVENTORY_IMPORT_PREVIEW', batch } });
    if (route.request().method() === 'POST') {
      confirmations++;
      return route.abort('connectionfailed');
    }
    return route.fulfill({
      json: {
        batch: { ...batch, status: 'COMPLETED', version: 1, preview: null, result: batch.preview },
      },
    });
  });
  await page.goto('/almacen/materiales');
  await page.getByRole('button', { name: 'Importar Excel', exact: true }).click();
  await page.locator('input[type=file]').setInputFiles({
    name: 'materiales.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from('fixture: API simulada'),
  });
  await page.getByRole('button', { name: 'Validar archivo', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar importación', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Revisar y reintentar confirmación', exact: true }),
  ).toBeEnabled();
  await expect(page.getByText(/Todavía no se ha guardado ningún cambio/)).toHaveCount(0);
  await expect(page.getByText(/No se ha guardado ninguna fila/)).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Importar Excel', exact: true }).click();
  await page
    .getByRole('button', { name: 'Revisar y reintentar confirmación', exact: true })
    .click();
  await expect(page.getByText('Importación confirmada. El inventario se actualizó.')).toBeVisible();
  expect(confirmations).toBe(1);
});

test('los errores bloquean el lote y el permiso de costos controla el acceso al botón', async ({
  page,
}) => {
  await mockWarehouse(page);
  const batch = inventoryImportDraft();
  batch.preview!.summary.errors = 1;
  batch.preview!.rows[0]!.action = 'error';
  batch.preview!.rows[0]!.errors = [
    {
      column: 'Cantidad inicial',
      code: 'INVENTORY_PIECE_QUANTITY_REQUIRED',
      message: 'Las cantidades con presentación PIEZA deben ser enteras.',
    },
  ];
  await page.route('**/api/warehouse/inventory-imports/materials/preview?mode=create', (route) =>
    route.fulfill({ json: { code: 'INVENTORY_IMPORT_PREVIEW', batch } }),
  );
  await page.goto('/almacen/materiales');
  await page.getByRole('button', { name: 'Importar Excel', exact: true }).click();
  await page.locator('input[type=file]').setInputFiles({
    name: 'materiales.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from('fixture'),
  });
  await page.getByRole('button', { name: 'Validar archivo', exact: true }).click();
  await expect(
    page.getByText('Cantidad inicial: Las cantidades con presentación PIEZA deben ser enteras.'),
  ).toBeVisible();
  await expect(
    page.getByRole('alert').filter({ hasText: 'No se ha guardado ninguna fila.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Confirmar importación', exact: true }),
  ).toHaveCount(0);
  await mockWarehouse(
    page,
    user.permissions.filter(
      (permission) => !['inventory:costs-read', 'materials:adjust-stock'].includes(permission),
    ),
  );
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Tabla de Existencias', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Importar Excel', exact: true })).toHaveCount(0);
});

test('un duplicado informa el bloqueo completo y permite descargar los errores', async ({
  page,
}) => {
  await mockWarehouse(page);
  const batch = inventoryImportDraft();
  const original = batch.preview!.rows[0]!;
  batch.preview!.summary = { total: 2, creates: 1, updates: 0, unchanged: 0, errors: 1 };
  batch.preview!.rows.push({
    ...original,
    row: 3,
    action: 'error',
    errors: [
      {
        column: 'Material',
        code: 'INVENTORY_IMPORT_VALIDATION',
        message: 'El registro está repetido: coincide con la fila 2 del archivo.',
      },
    ],
  });
  let confirmations = 0;
  await page.route('**/api/warehouse/inventory-imports/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/preview'))
      return route.fulfill({ json: { code: 'INVENTORY_IMPORT_PREVIEW', batch } });
    if (path.endsWith('/errors/excel'))
      return route.fulfill({
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: Buffer.from('fixture: informe de errores'),
      });
    confirmations++;
    return route.fulfill({ status: 500, json: { code: 'UNEXPECTED_TEST_WRITE' } });
  });
  await page.goto('/almacen/materiales');
  await page.getByRole('button', { name: 'Importar Excel', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Importar Excel de materiales', exact: true });
  await expect(
    dialog.getByText('Todas las filas realizan la operación seleccionada.', { exact: false }),
  ).toBeVisible();
  await dialog.locator('input[type=file]').setInputFiles({
    name: 'materiales.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from('fixture: API simulada'),
  });
  await dialog.getByRole('button', { name: 'Validar archivo', exact: true }).click();
  await expect(
    dialog.getByRole('alert').filter({ hasText: 'No se ha guardado ninguna fila.' }),
  ).toBeVisible();
  await expect(
    dialog.getByText('Material: El registro está repetido: coincide con la fila 2 del archivo.'),
  ).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Confirmar importación', exact: true }),
  ).toHaveCount(0);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: 'Descargar errores', exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^errores_importacion_.*\.xlsx$/);
  expect(confirmations).toBe(0);
});
