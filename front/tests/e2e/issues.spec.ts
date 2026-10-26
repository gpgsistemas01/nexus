import { expect, test } from '@playwright/test';
import { mockIssues } from './issueFixtures.js';
import { issuePermissions, issueDetailId } from '../fixtures/issues.js';
import { ids } from '../fixtures/inventory.js';
import { clientData, personData } from '../fixtures/records.js';

for (const [path, resource, title, label] of [
  ['materiales', 'materials', 'Salidas de materiales', 'Material'],
  ['consumibles', 'consumables', 'Salidas de consumibles', 'Consumible'],
  ['mermas', 'wastes', 'Salidas de merma', 'Merma'],
] as const) {
  test(`salidas ${path}: menú Vue, alta sin errores iniciales y payload de solicitud`, async ({
    page,
  }) => {
    const { writes } = await mockIssues(page);
    await page.goto(`/salidas/${path}`);
    await expect(
      page.getByRole('heading', { name: `Tabla de ${title}`, exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Nueva salida', exact: true }).click();
    const dialog = page.getByRole('dialog', {
      name: resource === 'wastes' ? 'Registrar salida de merma' : 'Registrar salida',
      exact: true,
    });
    await expect(dialog.locator('[aria-invalid="true"]')).toHaveCount(0);
    for (const [field, option] of [
      ['Cliente', clientData.name],
      ['Asesor', personData.fullName],
      ['Área', 'SISTEMAS'],
      ['Solicitante', personData.fullName],
    ]) {
      await dialog.getByRole('combobox', { name: field, exact: true }).click();
      await page.getByRole('option', { name: option, exact: true }).click();
    }
    await dialog.getByLabel('Número de proyecto', { exact: true }).fill('120010');
    await dialog.getByRole('combobox', { name: label, exact: true }).click();
    await page
      .getByRole('option')
      .filter({ hasText: resource === 'wastes' ? 'Sobrante de lona' : 'Lona' })
      .click();
    await dialog.getByLabel('Cantidad', { exact: true }).fill('2');
    await dialog.getByRole('button', { name: 'Agregar', exact: true }).click();
    await expect(dialog.getByRole('columnheader', { name: 'Salida', exact: true })).toBeVisible();
    expect(writes).toHaveLength(0);
    await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(dialog).toBeHidden();
    expect(writes).toHaveLength(1);
    expect(writes[0]!.method).toBe('POST');
    expect(writes[0]!.data.details).toEqual(
      resource === 'wastes'
        ? [{ wasteId: ids.waste, quantity: 2 }]
        : [{ materialId: ids.material, supplierId: ids.supplier, quantity: 2 }],
    );
    expect(writes[0]!.data).not.toHaveProperty('status');
  });
}

for (const [path, label, name] of [
  ['materiales', 'Material', 'Lona'],
  ['consumibles', 'Consumible', 'Lona'],
  ['mermas', 'Merma', 'Sobrante de lona'],
] as const) {
  test(`salidas ${path}: edición pendiente, surtido y devolución`, async ({ page }) => {
    const { writes } = await mockIssues(page);
    await page.goto(`/salidas/${path}`);
    await page.getByRole('button', { name: 'Editar salida', exact: true }).click();
    let dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('Observaciones', { exact: true })).toHaveValue(
      'Captura de solicitud',
    );
    await expect(dialog.getByRole('combobox', { name: label, exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Regresar', exact: true }).click();
    await page.getByRole('button', { name: 'Surtir detalle', exact: true }).click();
    dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('Cliente', { exact: true })).toBeDisabled();
    await dialog.getByRole('checkbox', { name: `Surtir: ${name}`, exact: true }).check();
    await dialog.getByRole('button', { name: 'Surtir', exact: true }).click();
    expect(writes).toHaveLength(0);
    await dialog
      .getByRole('spinbutton', { name: `Cantidad de proyecto: ${name}`, exact: true })
      .fill('180');
    await dialog.getByRole('button', { name: 'Surtir', exact: true }).click();
    await expect(dialog).toBeHidden();
    expect(writes[0]!.url.pathname).toMatch(/\/details$/);
    expect(writes[0]!.data).toEqual({
      details: [{ id: issueDetailId, isSupplied: true, projectConvertedQuantity: 180 }],
    });
    await page.getByRole('button', { name: 'Editar salida', exact: true }).click();
    dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('combobox', { name: label, exact: true })).toHaveCount(0);
    await dialog.getByLabel('Observaciones', { exact: true }).fill('Nueva nota');
    await dialog.getByRole('button', { name: 'Actualizar', exact: true }).click();
    await expect(dialog).toBeHidden();
    expect(writes[1]!.url.pathname).toMatch(/\/header$/);
    expect(writes[1]!.data).not.toHaveProperty('details');
    await page.getByRole('button', { name: 'Devolver material surtido', exact: true }).click();
    await page.getByRole('button', { name: 'Devolver detalle de salida', exact: true }).click();
    const returning = page.getByRole('dialog', { name: 'Devolver detalle de salida', exact: true });
    await expect(returning.locator('[aria-invalid="true"]')).toHaveCount(0);
    await returning.getByLabel('Cantidad a devolver', { exact: true }).fill('3');
    await returning.getByRole('button', { name: 'Devolver', exact: true }).click();
    expect(writes).toHaveLength(2);
    await returning.getByLabel('Cantidad a devolver', { exact: true }).fill('1');
    await returning.getByRole('button', { name: 'Devolver', exact: true }).click();
    await expect(returning).toBeHidden();
    expect(writes[2]!.url.pathname).toMatch(/\/returns$/);
    expect(writes[2]!.data).toEqual({ returnQuantity: 1, observations: '' });
  });
}

test('salidas: sin permiso de surtido oculta controles; acceso directo sin permiso se rechaza', async ({
  page,
}) => {
  const { writes } = await mockIssues(
    page,
    issuePermissions.filter((p) => p !== 'goods:issue-details-manage'),
  );
  await page.goto('/salidas/materiales');
  await expect(page.getByRole('button', { name: 'Surtir detalle', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Editar salida', exact: true })).toBeVisible();
  expect(writes).toHaveLength(0);
  await mockIssues(page, ['materials:read']);
  await page.goto('/salidas/materiales');
  await expect(page).toHaveURL(/sin-permiso/);
});

test('salidas: filtros aplicados y Excel; modal usable en móvil', async ({ page }) => {
  const { reads, reports } = await mockIssues(page);
  await page.goto('/salidas/mermas');
  await page.getByLabel('Observaciones contiene:', { exact: true }).fill('captura');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect.poll(() => reads.at(-1)?.searchParams.get('observationsSearch')).toBe('captura');
  await page.getByRole('button', { name: 'Exportar Excel', exact: true }).click();
  const report = page.getByRole('dialog', { name: 'Exportar reporte', exact: true });
  await report
    .getByRole('combobox', { name: 'Alcance del reporte', exact: true })
    .press('ArrowDown');
  await page.getByRole('option', { name: 'Filtros aplicados en la tabla', exact: true }).click();
  await report.getByRole('button', { name: 'Descargar Excel', exact: true }).click();
  await expect(report).toBeHidden();
  expect(reports[0]!.searchParams.get('observationsSearch')).toBe('captura');
  expect(reports[0]!.searchParams.has('length')).toBe(false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Nueva salida', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Registrar salida de merma', exact: true });
  await expect(dialog.getByRole('button', { name: 'Guardar', exact: true })).toBeVisible();
  await page.screenshot({
    path: '../work/issues-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
});

test('salidas: el menú agrupa las tres rutas Vue y conserva navegación compacta', async ({
  page,
}) => {
  await mockIssues(page);
  await page.goto('/salidas/materiales');
  const nav = page.getByRole('navigation', { name: 'Navegación principal', exact: true });
  await nav.getByRole('button', { name: 'Salidas', exact: true }).click();
  for (const [label, path] of [
    ['Materiales', 'materiales'],
    ['Consumibles', 'consumibles'],
    ['Mermas', 'mermas'],
  ])
    await expect(nav.getByRole('link', { name: label, exact: true })).toHaveAttribute(
      'href',
      `/salidas/${path}`,
    );
  await nav.getByRole('link', { name: 'Consumibles', exact: true }).click();
  await expect(page).toHaveURL(/salidas\/consumibles$/);
  await expect(
    page.getByRole('heading', { name: 'Tabla de Salidas de consumibles', exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: '../work/issues-desktop.png',
    fullPage: true,
    animations: 'disabled',
  });
});
