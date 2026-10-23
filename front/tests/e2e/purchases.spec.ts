import { expect, test } from '@playwright/test';
import { mockPurchases } from './purchaseFixtures.js';
import { ids } from '../fixtures/inventory.js';
import { personData } from '../fixtures/records.js';
import { purchaseItem } from '../fixtures/purchases.js';

for (const [path, title, item] of [
  ['materiales', 'Materiales', 'Material'],
  ['consumibles', 'Consumibles', 'Consumible'],
]) {
  test(`compras ${path}: alta con partidas, validación diferida y payload sin totales`, async ({
    page,
  }) => {
    const { writes } = await mockPurchases(page);
    await page.goto(`/compras/${path}`);
    await expect(
      page.getByRole('heading', { name: `Tabla de Compras de ${title}`, exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Nueva compra', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Registrar compra', exact: true });
    await expect(dialog.locator('[aria-invalid="true"]')).toHaveCount(0);
    await dialog.getByRole('combobox', { name: 'Proveedor', exact: true }).click();
    await page.getByRole('option', { name: 'Proveedor Central', exact: true }).click();
    await dialog.getByRole('combobox', { name: 'Persona que recibe', exact: true }).click();
    await page.getByRole('option', { name: personData.fullName, exact: true }).click();
    await dialog.getByRole('radio', { name: 'Remisión', exact: true }).check();
    await dialog.getByRole('combobox', { name: item, exact: true }).click();
    await page.getByRole('option', { name: 'Lona · 2 × 50 · ROLLO', exact: true }).click();
    await dialog.getByLabel('Cantidad', { exact: true }).fill('2');
    await dialog.getByLabel('Costo por Presentación', { exact: true }).fill('100');
    await dialog.getByRole('button', { name: 'Agregar', exact: true }).click();
    await expect(dialog.getByRole('cell', { name: 'Lona', exact: true })).toBeVisible();
    await expect(dialog.getByLabel('Totales de compra')).toContainText('$232');
    expect(writes).toHaveLength(0);
    await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(
      page.getByText('¡Entrada de mercancía creada exitosamente!', { exact: true }),
    ).toBeVisible();
    expect(writes).toHaveLength(1);
    expect(writes[0]!.data).toMatchObject({
      supplierId: ids.supplier,
      receivedById: personData.id,
      isInvoiced: false,
      details: [{ materialId: ids.material, quantity: 2, costPerUnitType: 100 }],
    });
    expect(writes[0]!.data).not.toHaveProperty('invoice');
    expect(writes[0]!.data).not.toHaveProperty('totalGrossPurchaseAmount');
  });
}

test('compras: edición de encabezado conserva proveedor, observaciones y partidas existentes', async ({
  page,
}) => {
  const { writes } = await mockPurchases(page);
  await page.goto('/compras/materiales');
  await page.getByRole('button', { name: 'Editar compra', exact: true }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Editar compra - Folio COM-001', exact: true });
  await expect(dialog.getByLabel('Proveedor', { exact: true })).toHaveAttribute('readonly', '');
  await expect(dialog.getByLabel('Observaciones', { exact: true })).toHaveValue(
    'Conservar esta observación',
  );
  await expect(dialog.getByLabel('Fecha y hora de recepción:', { exact: true })).toHaveValue(
    '2026-10-22T12:30',
  );
  await dialog.getByLabel('Observaciones', { exact: true }).fill('Encabezado actualizado');
  await dialog.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes).toHaveLength(1);
  expect(writes[0]!.method).toBe('PATCH');
  expect(writes[0]!.data).toMatchObject({
    supplierId: ids.supplier,
    observations: 'Encabezado actualizado',
  });
  expect(writes[0]!.data).not.toHaveProperty('details');
});

test('compras: rechazar una edición conserva captura y exige otro envío explícito', async ({
  page,
}) => {
  const { writes } = await mockPurchases(page);
  let attempts = 0;
  await page.route('**/api/warehouse/goods-receipts/materials/*', (route) => {
    if (route.request().method() !== 'PATCH') return route.fallback();
    ++attempts;
    if (attempts > 1) return route.fallback();
    return route.fulfill({ status: 409, json: { code: 'GOODS_RECEIPT_INVOICE_ALREADY_EXISTS' } });
  });
  await page.goto('/compras/materiales');
  await page.getByRole('button', { name: 'Editar compra', exact: true }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Editar compra - Folio COM-001', exact: true });
  await dialog.getByLabel('Observaciones', { exact: true }).fill('Conservar mi captura');
  await dialog.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(dialog.getByRole('alert').filter({ hasText: /factura/i })).toBeVisible();
  await expect(dialog.getByLabel('Observaciones', { exact: true })).toHaveValue(
    'Conservar mi captura',
  );
  await expect(dialog.getByRole('cell', { name: 'Lona', exact: true })).toBeVisible();
  expect(attempts).toBe(1);
  expect(writes).toHaveLength(0);
  await dialog.getByLabel('Número de Factura', { exact: true }).fill('FAC-OTRA');
  await dialog.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(attempts).toBe(2);
  expect(writes).toHaveLength(1);
  expect(writes[0]!.data?.observations).toBe('Conservar mi captura');
});

test('compras: consulta, corrección y cancelación explícita conservan el historial', async ({
  page,
}) => {
  const { writes, reads } = await mockPurchases(page);
  await page.goto('/compras/materiales');
  await page.getByRole('button', { name: 'Ver compra', exact: true }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Ver compra - Folio COM-001', exact: true });
  await expect(dialog.getByRole('button', { name: 'Guardar', exact: true })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Corregir detalle', exact: true }).click();
  const correction = page.getByRole('dialog', { name: 'Corregir detalle de compra', exact: true });
  await expect(correction.getByRole('alert')).toHaveCount(0);
  await correction.getByLabel('Cantidad correcta', { exact: true }).fill('1');
  await expect(correction.getByLabel('Nuevos totales estimados')).toContainText('$116');
  await correction.getByRole('button', { name: 'Corregir detalle', exact: true }).click();
  const confirmation = page.getByRole('dialog', {
    name: '¿Corregir detalle de compra?',
    exact: true,
  });
  expect(writes).toHaveLength(0);
  await confirmation.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(correction).toBeVisible();
  expect(writes).toHaveLength(0);
  await correction.getByRole('button', { name: 'Corregir detalle', exact: true }).click();
  await confirmation.getByRole('button', { name: 'Corregir detalle', exact: true }).click();
  await expect(correction).toBeHidden();
  await expect(page.getByText('¡Compra actualizada exitosamente!', { exact: true })).toBeVisible();
  await expect(dialog).toBeVisible();
  expect(writes[0]!.url.pathname).toMatch(/\/details\/.*\/corrections$/);
  expect(writes[0]!.data).toEqual({ quantity: 1, costPerUnitType: 100 });
  await dialog.getByRole('button', { name: 'Cancelar detalle', exact: true }).click();
  const confirm = page.getByRole('dialog', { name: '¿Cancelar detalle de compra?', exact: true });
  expect(writes).toHaveLength(1);
  await confirm.getByRole('button', { name: 'Cancelar', exact: true }).click();
  expect(writes).toHaveLength(1);
  await dialog.getByRole('button', { name: 'Cancelar detalle', exact: true }).click();
  await confirm.getByRole('button', { name: 'Cancelar detalle', exact: true }).click();
  await expect(dialog.getByRole('cell', { name: 'Cancelada', exact: true })).toBeVisible();
  expect(writes).toHaveLength(2);
  expect(writes[1]!.data).toBeNull();
  await expect(dialog.getByRole('button', { name: 'Corregir detalle', exact: true })).toHaveCount(
    0,
  );
  expect(reads.filter((url) => !url.search)).toHaveLength(3);
});

test('compras: filtros aplicados, paginación y reporte filtrado sin límites', async ({ page }) => {
  const { reads, reports } = await mockPurchases(page);
  await page.goto('/compras/consumibles');
  await page
    .getByRole('textbox', { name: 'Buscar por Folio o N° Factura', exact: true })
    .fill('aplicado');
  await page.getByLabel('Fecha de inicio', { exact: true }).fill('2026-10-01');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect.poll(() => reads.at(-1)?.searchParams.get('search')).toBe('aplicado');
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'COM-011', exact: true })).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Buscar por Folio o N° Factura', exact: true })
    .fill('borrador');
  await page.getByRole('button', { name: 'Exportar Excel', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Exportar reporte', exact: true });
  await dialog
    .getByRole('combobox', { name: 'Alcance del reporte', exact: true })
    .press('ArrowDown');
  await page.getByRole('option', { name: 'Filtros aplicados en la tabla', exact: true }).click();
  const pending = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Descargar Excel', exact: true }).click();
  await pending;
  expect(reports[0]!.searchParams.get('search')).toBe('aplicado');
  expect(reports[0]!.searchParams.get('startDate')).toBe('2026-10-01');
  expect(reports[0]!.searchParams.has('start')).toBe(false);
});

test('compras: altas rápidas reutilizan editores y seleccionan registros fuera de la página actual', async ({
  page,
}) => {
  await mockPurchases(page);
  const newSupplier = 'bbbbbbbb-1111-4111-8111-111111111111';
  const newItem = 'cccccccc-1111-4111-8111-111111111111';
  const captures: Record<string, unknown>[] = [];
  await page.route('**/api/warehouse/suppliers', (route) =>
    route.fulfill({
      json: {
        code: 'CREATED_SUPPLIER',
        supplier: {
          id: newSupplier,
          version: 0,
          tradeName: 'Proveedor nuevo',
          legalName: 'Empresa nueva',
          isActive: true,
        },
      },
    }),
  );
  await page.route('**/api/warehouse/materials', (route) => {
    captures.push(route.request().postDataJSON() as Record<string, unknown>);
    return route.fulfill({
      json: {
        code: 'CREATED_MATERIAL',
        material: {
          ...purchaseItem,
          version: 0,
          supplier: { id: newSupplier, tradeName: 'Proveedor nuevo' },
          material: { ...purchaseItem.material, id: newItem, name: 'Material nuevo', version: 0 },
        },
      },
    });
  });
  await page.goto('/compras/materiales');
  await page.getByRole('button', { name: 'Nueva compra', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Registrar compra', exact: true });
  await dialog.getByRole('button', { name: 'Registrar proveedor', exact: true }).click();
  const supplier = page.getByRole('dialog', { name: 'Registrar proveedor', exact: true });
  await supplier.getByLabel('Razón social', { exact: true }).fill('Empresa nueva');
  await supplier.getByLabel('Nombre comercial', { exact: true }).fill('Proveedor nuevo');
  await supplier.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(supplier).toBeHidden();
  await expect(dialog.getByRole('combobox', { name: 'Proveedor', exact: true })).toHaveValue(
    'Proveedor nuevo',
  );
  await dialog.getByRole('button', { name: 'Registrar material', exact: true }).click();
  const item = page.getByRole('dialog', { name: 'Crear material', exact: true });
  await item.getByLabel('Nombre', { exact: true }).fill('Material nuevo');
  await item.getByRole('combobox', { name: 'Presentación', exact: true }).click();
  await page.getByRole('option', { name: 'ROLLO', exact: true }).click();
  await item.getByRole('combobox', { name: 'Unidad de medida', exact: true }).click();
  await page.getByRole('option', { name: /Metros cuadrados/ }).click();
  await item.getByLabel('Base (m)', { exact: true }).fill('2');
  await item.getByLabel('Altura (m)', { exact: true }).fill('50');
  await expect(item.getByLabel('Stock inicial', { exact: true })).toHaveCount(0);
  await item.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(item).toBeHidden();
  await expect(dialog.getByRole('combobox', { name: 'Material', exact: true })).toHaveValue(
    'Material nuevo · 2 × 50 · ROLLO',
  );
  expect(captures).toHaveLength(1);
  expect(captures[0]).toMatchObject({ supplierId: newSupplier, creationContext: 'goodsReceipt' });
  expect(captures[0]).not.toHaveProperty('newStock');
  await page.setViewportSize({ width: 1280, height: 900 });
  await dialog
    .getByLabel('Observaciones', { exact: true })
    .fill('Compra con alta rápida de proveedor y material');
  await dialog
    .getByRole('heading', { name: 'Datos de la compra', exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: '../work/purchases-desktop.png', fullPage: true });
});

test('compras: acceso, menú Vue y diálogo móvil sin desbordamiento global', async ({ page }) => {
  const { reads } = await mockPurchases(page, [
    'goods:receipts-page-view',
    'goods:receipts-manage',
  ]);
  await page.goto('/compras');
  await expect(page).toHaveURL(/\/compras\/materiales$/);
  await expect(page.getByRole('cell', { name: 'COM-001', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Exportar Excel', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Expandir menú', exact: true }).click();
  const menu = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(menu.getByRole('link', { name: 'Consumibles', exact: true })).toHaveAttribute(
    'href',
    '/compras/consumibles',
  );
  await menu.getByRole('link', { name: 'Consumibles', exact: true }).click();
  await expect(page).toHaveURL(/\/compras\/consumibles$/);
  await page.getByRole('button', { name: 'Nueva compra', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Registrar compra', exact: true });
  await expect(dialog.getByRole('combobox', { name: 'Proveedor', exact: true })).toBeDisabled();
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  expect(reads.length).toBeGreaterThan(0);
  await page.screenshot({ path: '../work/purchases-mobile.png', fullPage: true });
  await mockPurchases(page, ['materials:read']);
  await page.goto('/compras/materiales');
  await expect(
    page.getByRole('heading', { name: 'Acceso no permitido', exact: true }),
  ).toBeVisible();
});
