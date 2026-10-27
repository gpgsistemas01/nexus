import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { chooseOption, mockWarehouse } from '../e2e/warehouseFixtures.js';
import { mockCatalogs } from '../e2e/catalogFixtures.js';
import { mockRecords } from '../e2e/recordsFixtures.js';
import { mockPurchases } from '../e2e/purchaseFixtures.js';
import { mockIssues } from '../e2e/issueFixtures.js';
import { mockMovements } from '../e2e/movementFixtures.js';
import { user } from '../fixtures/inventory.js';
import { recordPermissions } from '../fixtures/records.js';
import { purchasePermissions } from '../fixtures/purchases.js';
import { issuePermissions } from '../fixtures/issues.js';

const imageDirectory = path.resolve('docs/user-manual/images');
const writeAttempts = new WeakMap<Page, string[]>();

const readOnly = async (page: Page) => {
  await page.route('**/api/**', (route) =>
    route.request().method() === 'GET' ? route.fallback() : route.abort('blockedbyclient'),
  );
};

const capture = async (page: Page, name: string) => {
  await page.evaluate(() => document.fonts.ready);
  const dialog = page.getByRole('dialog').last();
  const target = (await dialog.count()) ? dialog : page;
  await target.screenshot({
    path: path.join(imageDirectory, `${name}.png`),
    animations: 'disabled',
    caret: 'hide',
  });
};

// Unhandled API requests never reach an actual backend. Fixture routes are local.
test.beforeEach(async ({ context, page }) => {
  const writes: string[] = [];
  writeAttempts.set(page, writes);
  page.on('request', (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.startsWith('/api/') && request.method() !== 'GET')
      writes.push(`${request.method()} ${pathname}`);
  });
  await mkdir(imageDirectory, { recursive: true });
  await context.route('**/api/**', (route) => route.abort('blockedbyclient'));
});

test.afterEach(async ({ page }) => {
  // Captures may add draft lines locally, but must never submit a mutation.
  expect(writeAttempts.get(page)).toEqual([]);
});

test('acceso y navegación', async ({ page }) => {
  await page.route('**/api/auth/me', (route) =>
    route.fulfill({ status: 401, json: { code: 'INVALID_AUTH' } }),
  );
  await readOnly(page);
  await page.goto('/inicio-sesion');
  await expect(page.getByRole('heading', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  await capture(page, '01-login');
});

test('menú de una cuenta con acceso a todas las secciones', async ({ page }) => {
  await mockWarehouse(page, [
    ...new Set([
      ...user.permissions,
      ...recordPermissions,
      ...purchasePermissions,
      ...issuePermissions,
      'movements:read',
    ]),
  ]);
  await readOnly(page);
  await page.goto('/almacen/materiales');
  await expect(page.getByRole('cell', { name: /^Lona(?: Proveedor Central)?$/ })).toBeVisible();
  await page.getByRole('button', { name: 'Expandir menú', exact: true }).click();
  await expect(
    page.getByRole('navigation').getByRole('button', { name: 'Almacén', exact: true }),
  ).toHaveAttribute('aria-expanded', 'true');
  await capture(page, '02-navigation');
});

test('materiales y consumibles: consulta, alta y ajuste', async ({ page }) => {
  await mockWarehouse(page);
  await readOnly(page);
  await page.goto('/almacen/materiales');
  await expect(page.getByRole('cell', { name: /^Lona(?: Proveedor Central)?$/ })).toBeVisible();
  await capture(page, '03-materials-list');
  await page.getByRole('button', { name: 'Nuevo material', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Crear material', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1400 });
  await page.getByLabel('Nombre', { exact: true }).fill('Lona de demostración');
  await chooseOption(page, 'Proveedor', 'Proveedor Central');
  await chooseOption(page, 'Presentación', 'ROLLO');
  await page.getByRole('combobox', { name: 'Unidad de medida', exact: true }).click();
  await page.getByRole('option', { name: /Metros cuadrados/ }).click();
  await page.getByLabel('Base (m)', { exact: true }).fill('2');
  await page.getByLabel('Altura (m)', { exact: true }).fill('50');
  await capture(page, '04-material-create');
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.getByRole('button', { name: 'Ajustar stock', exact: true }).click();
  await chooseOption(page, 'Motivo del ajuste', 'Conteo físico');
  await capture(page, '05-material-stock');
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await page.goto('/almacen/consumibles');
  await expect(
    page.getByRole('heading', { name: 'Tabla de Consumibles', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('cell', { name: /^Lona(?: Proveedor Central)?$/ })).toBeVisible();
  await capture(page, '06-consumables-list');
  await page.getByRole('button', { name: 'Nuevo consumible', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Crear consumible', exact: true })).toBeVisible();
  await capture(page, '07-consumable-create');
});

test('mermas: consulta, pesos de una captura y entrada adicional', async ({ page }) => {
  await mockWarehouse(page);
  await readOnly(page);
  await page.goto('/almacen/mermas');
  await expect(
    page.getByRole('cell', { name: /^Sobrante de lona Proveedor Central/ }),
  ).toBeVisible();
  await capture(page, '08-wastes-list');
  await page.setViewportSize({ width: 1440, height: 1400 });
  await page.getByRole('button', { name: 'Nueva merma', exact: true }).click();
  await chooseOption(page, 'Proveedor', 'Proveedor Central');
  await chooseOption(page, 'Material de referencia del proveedor', 'Lona · ROLLO · 2 × 50');
  const dialog = page.getByRole('dialog', { name: 'Crear merma', exact: true });
  await dialog.getByLabel('Nombre de la merma', { exact: true }).fill('Sobrante de lona');
  await dialog.getByLabel('Peso del rollo completo con cono (kg)', { exact: true }).fill('21');
  await dialog.getByLabel('Peso del cono de la merma (kg)', { exact: true }).fill('1');
  await dialog.getByLabel('Peso de la merma con cono (kg)', { exact: true }).fill('5');
  await dialog.getByLabel('Cantidad inicial', { exact: true }).fill('2');
  await expect(dialog.getByLabel('Peso neto de la merma (kg)', { exact: true })).toHaveValue('4');
  await dialog
    .getByRole('heading', { name: 'Material de origen', exact: true })
    .evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await capture(page, '09-waste-create');
  await dialog
    .getByRole('heading', { name: 'Rollo completo (muestra)', exact: true })
    .evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await capture(page, '09a-waste-measurements');
  await dialog.getByLabel('Observaciones', { exact: true }).scrollIntoViewIfNeeded();
  await capture(page, '09b-waste-stock');
  await dialog.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.getByRole('button', { name: 'Agregar stock', exact: true }).click();
  await expect(page.getByLabel('Cantidad a agregar', { exact: true })).toBeVisible();
  await capture(page, '10-waste-add-stock');
});

test('catálogos: listado y formulario propio de unidades', async ({ page }) => {
  const { store } = await mockCatalogs(page);
  store.get('unit-measures')![0]!.name = 'Metro';
  await readOnly(page);
  await page.goto('/catalogos/unit-measures');
  await expect(page.getByRole('cell', { name: 'Metro', exact: true })).toBeVisible();
  await capture(page, '11-catalog-list');
  await page.getByRole('button', { name: 'Nueva unidad de medida', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Registrar unidad de medida', exact: true });
  await dialog.getByLabel('Nombre', { exact: true }).fill('Pieza');
  await dialog.getByLabel('Símbolo', { exact: true }).fill('pza');
  await capture(page, '12-catalog-form');
});

test('personas, usuarios y directorio', async ({ page }) => {
  await mockRecords(page);
  await readOnly(page);
  await page.goto('/identidad/personas');
  await page.getByRole('button', { name: 'Editar registro', exact: true }).click();
  await expect(page.getByLabel('Nombre completo', { exact: true })).toHaveValue('Ana Pérez');
  await capture(page, '13-person-form');
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await page.goto('/identidad/usuarios');
  await page.getByRole('button', { name: 'Nuevo usuario', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Registrar usuario', exact: true })).toBeVisible();
  await capture(page, '14-user-create');
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await page.getByRole('button', { name: 'Cambiar contraseña', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Editar contraseña', exact: true })).toBeVisible();
  await capture(page, '15-user-password');
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  for (const [url, button, title, image] of [
    ['/directorio/clientes', 'Nuevo cliente', 'Registrar cliente', '16-client-form'],
    ['/directorio/proveedores', 'Nuevo proveedor', 'Registrar proveedor', '17-supplier-form'],
  ]) {
    await page.goto(url!);
    await page.getByRole('button', { name: button, exact: true }).click();
    await expect(page.getByRole('dialog', { name: title, exact: true })).toBeVisible();
    await capture(page, image!);
    await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  }
});

test('compras: consulta, borrador local y corrección sin confirmar', async ({ page }) => {
  await mockPurchases(page);
  await readOnly(page);
  await page.goto('/compras/materiales');
  await expect(page.getByRole('cell', { name: 'COM-001', exact: true })).toBeVisible();
  await capture(page, '18-purchases-list');
  await page.setViewportSize({ width: 1440, height: 1400 });
  await page.getByRole('button', { name: 'Nueva compra', exact: true }).click();
  await chooseOption(page, 'Proveedor', 'Proveedor Central', page.getByRole('dialog'));
  await chooseOption(page, 'Persona que recibe', 'Ana Pérez', page.getByRole('dialog'));
  await page.getByRole('radio', { name: 'Remisión', exact: true }).check();
  await chooseOption(page, 'Material', 'Lona · 2 × 50 · ROLLO');
  const creating = page.getByRole('dialog', { name: 'Registrar compra', exact: true });
  await creating.getByLabel('Cantidad', { exact: true }).fill('2');
  await creating.getByLabel('Costo por Presentación', { exact: true }).fill('100');
  await creating.getByRole('button', { name: 'Agregar', exact: true }).click();
  await expect(creating.getByRole('cell', { name: /^Lona(?: Proveedor Central)?$/ })).toBeVisible();
  await capture(page, '19-purchase-create');
  await creating.getByRole('button', { name: 'Regresar', exact: true }).click();
  await page.getByRole('button', { name: 'Ver compra', exact: true }).first().click();
  await expect(
    page.getByRole('dialog', { name: 'Ver compra - Folio COM-001', exact: true }),
  ).toBeVisible();
  await capture(page, '20-purchase-view');
  await page.getByRole('button', { name: 'Corregir detalle', exact: true }).click();
  const correction = page.getByRole('dialog', { name: 'Corregir detalle de compra', exact: true });
  await expect(correction.getByLabel('Cantidad correcta', { exact: true })).toHaveValue('2');
  await capture(page, '21-purchase-correction');
});

test('salidas: consulta, borrador local y selección de surtido', async ({ page }) => {
  await mockIssues(page);
  await readOnly(page);
  await page.goto('/salidas/materiales');
  await expect(page.getByRole('cell', { name: 'SAL-001', exact: true })).toBeVisible();
  await capture(page, '22-issues-list');
  await page.setViewportSize({ width: 1440, height: 1400 });
  await page.getByRole('button', { name: 'Nueva salida', exact: true }).click();
  for (const [label, option] of [
    ['Cliente', 'Cliente Central'],
    ['Asesor', 'Ana Pérez'],
    ['Área', 'SISTEMAS'],
    ['Solicitante', 'Ana Pérez'],
  ])
    await chooseOption(page, label!, option!, page.getByRole('dialog'));
  const creating = page.getByRole('dialog', { name: 'Registrar salida', exact: true });
  await creating.getByLabel('Número de proyecto', { exact: true }).fill('120010');
  await creating.getByRole('combobox', { name: 'Material', exact: true }).click();
  await page.getByRole('option').filter({ hasText: 'Lona' }).click();
  await creating.getByLabel('Cantidad', { exact: true }).fill('2');
  await creating.getByRole('button', { name: 'Agregar', exact: true }).click();
  await expect(creating.getByRole('cell', { name: /^Lona(?: Proveedor Central)?$/ })).toBeVisible();
  await capture(page, '23-issue-create');
  await creating.getByRole('button', { name: 'Regresar', exact: true }).click();
  await page.getByRole('button', { name: 'Surtir detalle', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Surtir: Lona', exact: true }).check();
  await page
    .getByRole('spinbutton', { name: 'Cantidad de proyecto: Lona', exact: true })
    .fill('180');
  await capture(page, '24-issue-supply');
});

test('salidas: devolución de un detalle existente ya surtido', async ({ page }) => {
  await mockIssues(page, issuePermissions, 'Surtido');
  await readOnly(page);
  await page.goto('/salidas/materiales');
  await page.getByRole('button', { name: 'Devolver material surtido', exact: true }).click();
  await page.getByRole('button', { name: 'Devolver detalle de salida', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Devolver detalle de salida', exact: true });
  await dialog.getByLabel('Cantidad a devolver', { exact: true }).fill('1');
  await capture(page, '25-issue-return');
});

test('movimientos y alcance del reporte', async ({ page }) => {
  await mockMovements(page);
  await readOnly(page);
  await page.goto('/movimientos/materiales');
  await expect(page.getByRole('cell', { name: 'SAL-001', exact: true })).toBeVisible();
  await capture(page, '26-movements');
  await page.getByRole('button', { name: 'Exportar Excel', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Exportar reporte', exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Alcance del reporte', exact: true }).press('ArrowDown');
  await page.getByRole('option', { name: 'Mes específico', exact: true }).click();
  await page.getByLabel('Mes del reporte', { exact: true }).fill('2026-10');
  await capture(page, '27-report');
});
