import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { ids } from '../fixtures/inventory.js';
import { chooseOption } from './warehouseFixtures.js';
import { mockMovements } from './movementFixtures.js';

const chooseSelect = async (page: Page, label: string, option: string) => {
  await page.getByRole('combobox', { name: label, exact: true }).press('ArrowDown');
  await page.getByRole('option', { name: option, exact: true }).click();
};

for (const [path, title, item] of [
  ['materiales', 'materiales', 'Material'],
  ['consumibles', 'consumibles', 'Consumible'],
  ['mermas', 'merma', 'Material'],
])
  test(`movimientos: ${path} conserva título, diez columnas, recarga y consulta sin edición`, async ({
    page,
  }) => {
    await mockMovements(page);
    await page.goto(`/movimientos/${path}`);
    await expect(
      page.getByRole('heading', { name: `Historial de Movimientos de ${title}`, exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('cell', { name: 'SAL-001', exact: true })).toBeVisible();
    for (const name of [
      'Fecha',
      'Tipo',
      'Folio',
      item!,
      'Base',
      'Altura',
      'Proveedor',
      'Stock anterior',
      'Movimiento',
      'Nuevo stock',
    ])
      await expect(page.getByRole('columnheader', { name, exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader')).toHaveCount(10);
    await expect(
      page.getByRole('button', { name: /Editar|Eliminar|Nuevo movimiento/ }),
    ).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('cell', { name: 'SAL-001', exact: true })).toBeVisible();
  });

test('movimientos: menú exclusivo, enlaces Vue, acceso directo y móvil', async ({ page }) => {
  const { reads } = await mockMovements(page, ['movements:read']);
  await page.goto('/almacen');
  await expect(page).toHaveURL(/\/movimientos\/materiales$/);
  await page.getByRole('button', { name: 'Expandir menú', exact: true }).click();
  const menu = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(menu.getByRole('button', { name: 'Movimientos', exact: true })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  for (const [label, path] of [
    ['Materiales', 'materiales'],
    ['Consumibles', 'consumibles'],
    ['Mermas', 'mermas'],
  ])
    await expect(menu.getByRole('link', { name: label, exact: true })).toHaveAttribute(
      'href',
      `/movimientos/${path}`,
    );
  await menu.getByRole('link', { name: 'Mermas', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Historial de Movimientos de merma', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Exportar Excel', exact: true })).toBeHidden();
  await expect(page.getByRole('combobox', { name: 'Proveedor', exact: true })).toBeDisabled();
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole('button', { name: 'Menú', exact: true }).click();
    await expect(menu.getByRole('button', { name: 'Movimientos', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar menú', exact: true }).click();
  }
  expect(reads.length).toBeGreaterThan(0);
  await page.goto('/movimientos');
  await expect(page).toHaveURL(/\/movimientos\/materiales$/);
});

test('movimientos: proveedor primero, identidad del material, filtros aplicados, paginación y limpieza', async ({
  page,
}) => {
  const { reads } = await mockMovements(page);
  await page.goto('/movimientos/materiales');
  await expect(page.getByRole('combobox', { name: 'Material', exact: true })).toBeDisabled();
  await chooseOption(page, 'Proveedor', 'Proveedor Central');
  await chooseOption(page, 'Material', 'Lona · ROLLO · 2 × 50');
  await chooseSelect(page, 'Tipo de movimiento', 'Devolución');
  await page.getByLabel('Fecha de inicio', { exact: true }).fill('2026-10-01');
  await page.getByLabel('Fecha de fin', { exact: true }).fill('2026-10-22');
  await page
    .getByRole('textbox', { name: 'Buscar por material, proveedor o folio', exact: true })
    .fill('SAL');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect.poll(() => reads.at(-1)?.searchParams.get('movementType')).toBe('RETURN');
  expect(reads.at(-1)?.searchParams.get('materialId')).toBe(ids.material);
  expect(reads.at(-1)?.searchParams.get('supplierId')).toBe(ids.supplier);
  expect(reads.at(-1)?.searchParams.get('startDate')).toBe('2026-10-01');
  expect(reads.at(-1)?.searchParams.get('endDate')).toBe('2026-10-22');
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'SAL-011', exact: true })).toBeVisible();
  expect(reads.at(-1)?.searchParams.get('start')).toBe('10');
  await page.getByRole('columnheader', { name: 'Folio', exact: true }).click();
  await expect.poll(() => reads.at(-1)?.searchParams.get('order[0][column]')).toBe('2');
  await page.getByRole('button', { name: 'Limpiar filtros', exact: true }).click();
  await expect.poll(() => reads.at(-1)?.searchParams.get('search')).toBe('');
  expect(reads.at(-1)?.searchParams.get('materialId')).toBe('');
  await expect(page.getByRole('combobox', { name: 'Material', exact: true })).toBeDisabled();
});

test('movimientos: reporte mensual, mes específico validado y filtros aplicados sin borrador', async ({
  page,
}) => {
  const { reads, reports } = await mockMovements(page);
  await page.goto('/movimientos/consumibles');
  const search = page.getByRole('textbox', {
    name: 'Buscar por consumible, proveedor o folio',
    exact: true,
  });
  await search.fill('aplicado');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect.poll(() => reads.at(-1)?.searchParams.get('search')).toBe('aplicado');
  await search.fill('borrador');
  const dialog = page.getByRole('dialog', { name: 'Exportar reporte', exact: true });
  const open = () => page.getByRole('button', { name: 'Exportar Excel', exact: true }).click();
  const download = async () => {
    const pending = page.waitForEvent('download');
    await dialog.getByRole('button', { name: 'Descargar Excel', exact: true }).click();
    await pending;
    await expect(dialog).toBeHidden();
  };
  await open();
  await expect(dialog.getByRole('alert')).toHaveCount(0);
  await download();
  expect(reports.at(-1)?.searchParams.get('monthlyReport')).toBe('true');
  expect(reports.at(-1)?.searchParams.has('search')).toBe(false);
  await open();
  await chooseSelect(page, 'Alcance del reporte', 'Mes específico');
  await dialog.getByRole('button', { name: 'Descargar Excel', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('mes válido');
  expect(reports).toHaveLength(1);
  await dialog.getByLabel('Mes del reporte', { exact: true }).fill('2026-09');
  await download();
  expect(reports.at(-1)?.searchParams.get('reportMonth')).toBe('2026-09');
  await open();
  await chooseSelect(page, 'Alcance del reporte', 'Filtros aplicados en la tabla');
  await download();
  expect(reports.at(-1)?.searchParams.get('search')).toBe('aplicado');
  expect(reports.at(-1)?.searchParams.has('start')).toBe(false);
});

test('movimientos: rechazo de ruta sin permiso y recuperación de lectura fallida', async ({
  page,
}) => {
  const { reads } = await mockMovements(page, ['materials:read']);
  await page.goto('/movimientos/mermas');
  await expect(
    page.getByRole('heading', { name: 'Acceso no permitido', exact: true }),
  ).toBeVisible();
  expect(reads).toEqual([]);
  await mockMovements(page);
  let fail = true;
  await page.route('**/api/admin/movements/wastes?**', (route) => {
    if (!fail) return route.fallback();
    fail = false;
    return route.fulfill({ status: 503, json: { code: 'UNAVAILABLE' } });
  });
  await page.reload();
  await page.goto('/movimientos/mermas');
  await expect(
    page
      .getByRole('region', { name: 'Historial de Movimientos de merma', exact: true })
      .getByRole('alert'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'SAL-001', exact: true })).toBeVisible();
});
