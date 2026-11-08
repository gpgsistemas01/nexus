import { expect, test } from '@playwright/test';
import { mockIssues } from './issueFixtures.js';
import { chooseOption } from './warehouseFixtures.js';
import { issuePermissions, issueDetailId, departmentId, issueFor } from '../fixtures/issues.js';
import { ids, pageOf, user } from '../fixtures/inventory.js';
import { clientData, personData } from '../fixtures/records.js';

for (const [path, resource] of [
  ['materiales', 'materials'],
  ['consumibles', 'consumables'],
  ['mermas', 'wastes'],
] as const) {
  test(`salidas ${path}: PIEZA y devoluciones conservan el documento actualizado hasta quedar cancelado`, async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const { writes, docs } = await mockIssues(page, undefined, 'Surtido');
    const line = docs[resource].details[0]!;
    if (line.material) line.material.presentation.name = 'PIEZA';
    else if ('waste' in line) line.waste.presentation.name = 'PIEZA';
    await page.goto(`/salidas/${path}`);
    await page.getByRole('button', { name: 'Devolver material surtido', exact: true }).click();
    const main = page.getByRole('dialog', {
      name: /^Devolver salida( de merma)? - Folio SAL-001$/,
    });
    await main.getByRole('button', { name: 'Devolver detalle de salida', exact: true }).click();
    const detail = page.getByRole('dialog', { name: 'Devolver detalle de salida', exact: true });
    await expect(detail.getByLabel('Cantidad a devolver', { exact: true })).toHaveAttribute(
      'step',
      '1',
    );
    await detail.getByLabel('Cantidad a devolver', { exact: true }).fill('0.5');
    await detail.getByRole('button', { name: 'Devolver', exact: true }).click();
    await expect(
      detail.getByText(/Las cantidades con presentación PIEZA deben ser enteras/),
    ).toBeVisible();
    expect(writes).toHaveLength(0);
    await detail.getByLabel('Cantidad a devolver', { exact: true }).fill('1');
    await detail.getByRole('button', { name: 'Devolver', exact: true }).click();
    await expect(detail).toBeHidden();
    await expect(main).toBeVisible();
    await expect(
      main.getByRole('button', { name: 'Devolver detalle de salida', exact: true }),
    ).toBeEnabled();
    await main.getByRole('button', { name: 'Devolver detalle de salida', exact: true }).click();
    await detail.getByLabel('Cantidad a devolver', { exact: true }).fill('1');
    await detail.getByRole('button', { name: 'Devolver', exact: true }).click();
    await expect(detail).toBeHidden();
    const read = page.getByRole('dialog', {
      name: /^Consultar salida( de merma)? - Folio SAL-001$/,
    });
    await expect(read).toBeVisible();
    await expect(read.getByRole('cell', { name: 'Cancelado', exact: true })).toBeVisible();
    await expect(
      read.getByRole('button', { name: 'Devolver detalle de salida', exact: true }),
    ).toHaveCount(0);
    expect(writes).toHaveLength(2);
    expect(writes.map((write) => write.data)).toEqual([
      { returnQuantity: 1, observations: '' },
      { returnQuantity: 1, observations: '' },
    ]);
    await read.getByRole('cell', { name: 'Cancelado', exact: true }).scrollIntoViewIfNeeded();
    await read.screenshot({
      path: test.info().outputPath('piece-return-confirmed.png'),
      animations: 'disabled',
    });
  });
}

for (const [path, resource, title, label] of [
  ['materiales', 'materials', 'Salidas de materiales', 'Material'],
  ['consumibles', 'consumables', 'Salidas de consumibles', 'Consumible'],
  ['mermas', 'wastes', 'Salidas de merma', 'Merma'],
] as const) {
  test(`salidas ${path}: menú Vue, alta sin errores iniciales y payload de solicitud`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(crypto, 'randomUUID', { value: undefined });
    });
    const { writes, reads } = await mockIssues(page);
    await page.goto(`/salidas/${path}`);
    await expect(
      page.getByRole('heading', { name: `Tabla de ${title}`, exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('columnheader')).toHaveText([
      'Folio',
      'Solicitud',
      'Área',
      'Proyecto',
      'Cliente',
      'Estado surtido',
      'Acciones',
    ]);
    await expect(page.getByRole('combobox', { name: 'Área', exact: true })).toHaveValue('SISTEMAS');
    await expect(page.getByRole('combobox', { name: 'Área', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Nueva salida', exact: true }).click();
    const dialog = page.getByRole('dialog', {
      name: resource === 'wastes' ? 'Registrar salida de merma' : 'Registrar salida',
      exact: true,
    });
    await expect(dialog.locator('[aria-invalid="true"]')).toHaveCount(0);
    await expect(
      dialog.getByRole('button', { name: 'Registrar cliente', exact: true }),
    ).toHaveCount(0);
    await dialog.getByLabel('Observaciones', { exact: true }).fill('A'.repeat(501));
    await expect(dialog.getByLabel('Observaciones', { exact: true })).toHaveValue('A'.repeat(500));
    await dialog.getByLabel('Observaciones', { exact: true }).fill('');
    await expect(dialog.getByRole('combobox', { name: 'Área', exact: true })).toBeDisabled();
    await expect(dialog.getByRole('combobox', { name: 'Área', exact: true })).toHaveValue(
      'SISTEMAS',
    );
    await expect(dialog.getByRole('combobox', { name: 'Solicitante', exact: true })).toBeEnabled();
    for (const [field, option] of [
      ['Cliente', clientData.name],
      ['Asesor', personData.fullName],
      ['Área', 'SISTEMAS'],
      ['Solicitante', personData.fullName],
    ]) {
      await chooseOption(page, field!, option!, dialog);
    }
    await dialog.getByLabel('Número de proyecto', { exact: true }).fill('12345678901');
    await expect(dialog.getByLabel('Número de proyecto', { exact: true })).toHaveValue(
      '1234567890',
    );
    await dialog.getByLabel('Número de proyecto', { exact: true }).fill('120010');
    await dialog.getByRole('combobox', { name: label, exact: true }).click();
    await page
      .getByRole('option')
      .filter({ hasText: resource === 'wastes' ? 'Sobrante de lona' : 'Lona' })
      .click();
    await expect(dialog.getByLabel('Presentación', { exact: true })).toHaveValue('ROLLO');
    await expect(dialog.getByLabel('Presentación', { exact: true })).toHaveAttribute(
      'readonly',
      '',
    );
    await dialog.getByLabel('Cantidad', { exact: true }).fill('2');
    await dialog.getByRole('button', { name: 'Agregar', exact: true }).click();
    await expect(dialog.getByLabel('Presentación', { exact: true })).toHaveValue('');
    await expect(dialog.getByRole('columnheader', { name: 'Salida', exact: true })).toBeVisible();
    await expect(dialog.getByRole('columnheader')).toHaveText([
      label,
      'Medidas',
      'Salida',
      'Presentación',
      'Conversión',
      'Acciones',
      'Base',
      'Altura',
      'Cantidad',
      'Unidad',
    ]);
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
    expect(writes[0]!.data.departmentId).toBe(departmentId);
    await page.getByLabel('Observaciones contiene:', { exact: true }).fill('otro filtro');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect
      .poll(() => reads.at(-1)?.searchParams.get('observationsSearch'))
      .toBe('otro filtro');
    await page.getByRole('button', { name: 'Limpiar filtros', exact: true }).click();
    await expect.poll(() => reads.at(-1)?.searchParams.get('departmentId')).toBe(departmentId);
    await expect(page.getByRole('combobox', { name: 'Área', exact: true })).toBeDisabled();
    await expect(page.getByRole('combobox', { name: 'Área', exact: true })).toHaveValue('SISTEMAS');
    await expect(page.getByText('Todos los registros', { exact: true })).toBeVisible();
  });

  test(`salidas ${path}: las partidas canceladas no muestran acciones de edición`, async ({
    page,
  }) => {
    const { writes } = await mockIssues(page);
    const doc = issueFor(resource);
    const endpoint =
      resource === 'wastes'
        ? '/api/warehouse/waste-issues'
        : `/api/warehouse/goods-issues/${resource}`;
    await page.route(`${endpoint}/${doc.id}`, (route) =>
      route.fulfill({
        json: {
          [resource === 'wastes' ? 'wasteIssue' : 'goodsIssue']: {
            ...doc,
            details: [
              ...doc.details,
              {
                ...doc.details[0]!,
                id: 'dddddddd-2222-4222-8222-222222222222',
                materialName: 'Detalle cancelado',
                fulfillmentStatus: { name: 'Cancelado' },
              },
            ],
          },
        },
      }),
    );
    await page.goto(`/salidas/${path}`);
    await page.getByRole('button', { name: 'Editar salida', exact: true }).click();
    const dialog = page.getByRole('dialog');
    const canceled = dialog.getByRole('row').filter({
      has: page.getByRole('cell', { name: 'Detalle cancelado', exact: true }),
    });
    await expect(canceled).toBeVisible();
    await expect(canceled.getByRole('button')).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Eliminar detalle', exact: true }).click();
    await expect(dialog.getByRole('button', { name: 'Eliminar detalle', exact: true })).toHaveCount(
      0,
    );
    await expect(canceled).toBeVisible();
    expect(writes).toHaveLength(0);
  });
}

for (const [path, label] of [
  ['materiales', 'Lona'],
  ['consumibles', 'Lona'],
  ['mermas', 'Sobrante de lona'],
] as const) {
  test(`salidas ${path}: entregas parciales conservan proyecto y diferencia negativa`, async ({
    page,
  }) => {
    const { writes } = await mockIssues(page);
    await page.goto(`/salidas/${path}`);
    for (const [quantity, expected] of [
      [0.5, 0],
      [0.5, 0.5],
      [1, 1],
    ] as const) {
      await page.getByRole('button', { name: 'Surtir detalle', exact: true }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByRole('checkbox', { name: `Surtir: ${label}`, exact: true }).check();
      await dialog
        .getByRole('spinbutton', { name: `Cantidad de proyecto: ${label}`, exact: true })
        .fill('250');
      const field = dialog.getByRole('spinbutton', {
        name: `Cantidad a surtir: ${label}`,
        exact: true,
      });
      await expect(field).toHaveAttribute('max', String(2 - expected));
      if (expected === 0) {
        await field.fill('3');
        await dialog.getByRole('button', { name: 'Surtir', exact: true }).click();
        await expect(
          dialog.getByRole('alert').filter({
            hasText: 'no puede superar el saldo pendiente',
          }),
        ).toBeVisible();
        expect(writes).toHaveLength(0);
      }
      await field.fill(String(quantity));
      await expect(dialog.getByRole('cell', { name: '-50.00', exact: true })).toBeVisible();
      await dialog.getByRole('button', { name: 'Surtir', exact: true }).click();
      await expect(dialog).toBeHidden();
      expect(writes.at(-1)!.data.details).toEqual([
        {
          id: issueDetailId,
          isSupplied: true,
          projectConvertedQuantity: 250,
          quantityToSupply: quantity,
          expectedSuppliedQuantity: expected,
        },
      ]);
      if (expected < 1)
        await expect(
          page.getByRole('cell', { name: 'Surtido parcial', exact: true }),
        ).toBeVisible();
    }
    expect(writes).toHaveLength(3);
    await expect(page.getByRole('button', { name: 'Surtir detalle', exact: true })).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Devolver material surtido', exact: true }),
    ).toBeVisible();
  });
}

test('salidas: varias áreas autorizadas conservan la selección y una búsqueda no bloquea el selector', async ({
  page,
}) => {
  await mockIssues(page);
  await page.route('**/api/admin/departments?**', (route) => {
    const search = new URL(route.request().url()).searchParams.get('search') ?? '';
    const areas = [
      { id: departmentId, name: 'SISTEMAS' },
      { id: 'router-id', name: 'ROUTER' },
    ];
    return route.fulfill({
      json: pageOf(areas.filter(({ name }) => name.includes(search.toUpperCase()))),
    });
  });
  await page.goto('/salidas/materiales');
  await page.getByRole('button', { name: 'Nueva salida', exact: true }).click();
  const dialog = page.getByRole('dialog');
  const area = dialog.getByRole('combobox', { name: 'Área', exact: true });
  await expect(area).toBeEnabled();
  await expect(area).toHaveValue('');
  await area.fill('ROUT');
  await page.getByRole('option', { name: 'ROUTER', exact: true }).click();
  await expect(area).toHaveValue('ROUTER');
  await expect(area).toBeEnabled();
});

for (const [path, label, name] of [
  ['materiales', 'Material', 'Lona'],
  ['consumibles', 'Consumible', 'Lona'],
  ['mermas', 'Merma', 'Sobrante de lona'],
] as const) {
  test(`salidas ${path}: edición pendiente, surtido y devolución`, async ({ page }) => {
    const { writes } = await mockIssues(page);
    await page.goto(`/salidas/${path}`);
    const row = page.getByRole('row').filter({
      has: page.getByRole('cell', { name: 'SAL-001', exact: true }),
    });
    await expect
      .poll(() =>
        row
          .getByRole('button')
          .evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-label'))),
      )
      .toEqual(['Editar salida', 'Surtir detalle', 'Consultar salida']);
    await page.getByRole('button', { name: 'Editar salida', exact: true }).click();
    let dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('Observaciones', { exact: true })).toHaveValue(
      'Captura de solicitud',
    );
    await expect(dialog.getByRole('combobox', { name: label, exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Regresar', exact: true }).click();
    await page.getByRole('button', { name: 'Surtir detalle', exact: true }).click();
    dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('columnheader')).toHaveText([
      label,
      'Medidas',
      'Salida',
      'Cantidad surtida',
      'Presentación',
      'Conversión',
      'Costo unitario de Conversión',
      'Cantidad a surtir',
      'Cantidad de proyecto',
      'Diferencia',
      'Surtir',
      'Base',
      'Altura',
      'Cantidad',
      'Unidad',
    ]);
    await expect(dialog.getByLabel('Cliente', { exact: true })).toBeDisabled();
    await dialog.getByRole('checkbox', { name: `Surtir: ${name}`, exact: true }).check();
    await dialog.getByRole('button', { name: 'Surtir', exact: true }).click();
    expect(writes).toHaveLength(0);
    await dialog
      .getByRole('spinbutton', { name: `Cantidad de proyecto: ${name}`, exact: true })
      .fill('180');
    await dialog
      .getByRole('spinbutton', { name: `Cantidad a surtir: ${name}`, exact: true })
      .fill('2');
    await dialog.getByRole('button', { name: 'Surtir', exact: true }).click();
    await expect(dialog).toBeHidden();
    expect(writes[0]!.url.pathname).toMatch(/\/details$/);
    expect(writes[0]!.data).toEqual({
      details: [
        {
          id: issueDetailId,
          isSupplied: true,
          quantityToSupply: 2,
          expectedSuppliedQuantity: 0,
          projectConvertedQuantity: 180,
        },
      ],
    });
    await page.getByRole('button', { name: 'Editar salida', exact: true }).click();
    dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('combobox', { name: label, exact: true })).toHaveCount(0);
    await dialog.getByLabel('Observaciones', { exact: true }).fill('Nueva nota');
    await dialog.getByRole('button', { name: 'Actualizar', exact: true }).click();
    await expect(dialog).toBeHidden();
    expect(writes[1]!.url.pathname).toMatch(/\/header$/);
    expect(writes[1]!.data).not.toHaveProperty('details');
    await expect
      .poll(() =>
        row
          .getByRole('button')
          .evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-label'))),
      )
      .toEqual(['Editar salida', 'Devolver material surtido', 'Consultar salida']);
    await page.getByRole('button', { name: 'Devolver material surtido', exact: true }).click();
    await expect(page.getByRole('dialog').getByRole('columnheader')).toHaveText([
      label,
      'Medidas',
      'Salida',
      'Cantidad surtida',
      'Cantidad devuelta',
      'Presentación',
      'Conversión',
      'Acciones',
      'Base',
      'Altura',
      'Cantidad',
      'Unidad',
    ]);
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
  const permissions = issuePermissions.filter((p) => p !== 'goods:issue-details-manage');
  const { writes } = await mockIssues(page, permissions);
  await page.route('**/api/auth/me', (route) =>
    route.fulfill({
      json: {
        user: { ...user, permissions, organization: { isWarehouse: false, isSystem: false } },
      },
    }),
  );
  await page.goto('/salidas/materiales');
  await expect(page.getByRole('columnheader')).toHaveText([
    'Folio',
    'Solicitud',
    'Proyecto',
    'Cliente',
    'Estado surtido',
    'Acciones',
  ]);
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
    path: test.info().outputPath('issues-mobile.png'),
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
    path: test.info().outputPath('issues-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
});
