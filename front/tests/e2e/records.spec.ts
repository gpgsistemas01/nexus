import { expect, test } from '@playwright/test';
import { mockRecords, recordRoutes } from './recordsFixtures.js';
import { chooseOption } from './warehouseFixtures.js';
import { personData, accountData, supplierData, recordIds } from '../fixtures/records.js';

for (const entry of recordRoutes) {
  test(`Vue: ${entry.title} abre, se recarga y aparece en su sección del menú`, async ({
    page,
  }) => {
    await mockRecords(page);
    await page.goto(entry.path);
    await expect(
      page.getByRole('heading', { name: `Tabla de ${entry.title}`, exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole('heading', { name: `Tabla de ${entry.title}`, exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Expandir menú', exact: true }).click();
    const menu = page.getByRole('navigation', { name: 'Navegación principal' });
    await expect(
      menu.getByRole('button', {
        name: entry.path.startsWith('/identidad') ? 'Identidad y acceso' : 'Directorio comercial',
        exact: true,
      }),
    ).toHaveAttribute('aria-expanded', 'true');
    await expect(menu.getByRole('link', { name: entry.title, exact: true })).toHaveAttribute(
      'href',
      entry.path,
    );
    const links = await menu
      .locator('a[href]')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute('href')));
    expect(
      links.every((href) => /^\/(almacen|catalogos|identidad|directorio)(\/|$)/.test(href ?? '')),
    ).toBe(true);
  });
}

test('clientes: alta con validación diferida, campos propios y estado inactivo', async ({
  page,
}) => {
  const { writes } = await mockRecords(page);
  await page.goto('/directorio/clientes');
  await page.getByRole('button', { name: 'Nuevo cliente', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Registrar cliente', exact: true });
  await dialog.getByRole('textbox', { name: 'Nombre', exact: true }).focus();
  await dialog.getByRole('button', { name: 'Cerrar', exact: true }).focus();
  await expect(dialog.getByText(/valor requerido/)).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(dialog.getByText(/valor requerido/)).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Nombre', exact: true }).fill(' Cliente nuevo ');
  await dialog.getByRole('checkbox', { name: 'Activo', exact: true }).uncheck();
  await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes.at(-1)).toMatchObject({
    method: 'POST',
    resource: 'clients',
    data: { name: 'Cliente nuevo', isActive: false },
  });
  await expect(page.getByRole('cell', { name: 'Cliente nuevo', exact: true })).toBeVisible();
});

test('proveedores: crear y editar razón social y nombre comercial con la versión leída', async ({
  page,
}) => {
  const { writes } = await mockRecords(page);
  await page.goto('/directorio/proveedores');
  await page.getByRole('button', { name: 'Nuevo proveedor', exact: true }).click();
  const create = page.getByRole('dialog', { name: 'Registrar proveedor', exact: true });
  await create.getByRole('textbox', { name: 'Razón social', exact: true }).fill('Empresa nueva SA');
  await create
    .getByRole('textbox', { name: 'Nombre comercial', exact: true })
    .fill('Empresa nueva');
  await create.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(create).toBeHidden();
  await page
    .getByRole('row')
    .filter({ has: page.getByRole('cell', { name: 'Proveedor Central', exact: true }) })
    .getByRole('button', { name: 'Editar registro', exact: true })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Editar proveedor', exact: true });
  await expect(dialog.getByRole('textbox', { name: 'Razón social', exact: true })).toHaveValue(
    supplierData.legalName,
  );
  await dialog
    .getByRole('textbox', { name: 'Nombre comercial', exact: true })
    .fill('Proveedor modificado');
  await dialog.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes.at(-1)?.data).toEqual({
    legalName: supplierData.legalName,
    tradeName: 'Proveedor modificado',
    isActive: true,
    expectedVersion: 6,
  });
});

test('personas: alta con responsabilidades, rechazo de área repetida y conservación al editar', async ({
  page,
}) => {
  const { writes } = await mockRecords(page);
  await page.goto('/identidad/personas');
  await page.getByRole('button', { name: 'Nueva persona', exact: true }).click();
  const create = page.getByRole('dialog', { name: 'Registrar persona', exact: true });
  await create.getByRole('textbox', { name: 'Nombre completo', exact: true }).fill('Persona nueva');
  await chooseOption(page, 'Área', 'ALMACÉN');
  await chooseOption(page, 'Rol', 'COORDINADOR');
  await create.getByRole('combobox', { name: 'Área', exact: true }).fill('VENTAS');
  await expect(page.getByRole('option', { name: 'VENTAS', exact: true })).toBeVisible();
  await expect(page.getByRole('option', { name: 'ALMACÉN', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await create.getByRole('button', { name: 'Agregar', exact: true }).click();
  await chooseOption(page, 'Área', 'ALMACÉN');
  await chooseOption(page, 'Rol', 'OPERADOR');
  await create.getByRole('button', { name: 'Agregar', exact: true }).click();
  await expect(create.getByRole('alert')).toContainText('ya está');
  await create.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(create).toBeHidden();
  expect(writes[0]?.data).toEqual({
    fullName: 'Persona nueva',
    accesses: [{ departmentId: recordIds.department, roleId: recordIds.role }],
  });
  await page
    .getByRole('row')
    .filter({ has: page.getByRole('cell', { name: 'Ana Pérez', exact: true }) })
    .getByRole('button', { name: 'Editar registro', exact: true })
    .click();
  const edit = page.getByRole('dialog', { name: 'Editar persona', exact: true });
  await expect(
    edit.getByRole('button', { name: 'Quitar asignación de VENTAS', exact: true }),
  ).toBeVisible();
  await edit.getByRole('textbox', { name: 'Nombre completo', exact: true }).fill('Ana modificada');
  await edit.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(edit).toBeHidden();
  expect(writes.at(-1)?.data).toEqual({
    fullName: 'Ana modificada',
    expectedVersion: 4,
    accesses: personData.accesses.map((row) => ({
      departmentId: row.department.id,
      roleId: row.role.id,
    })),
  });
});

test('usuarios: alta con rol y área; edición preserva persona y no reenvía contraseña', async ({
  page,
}) => {
  const { writes } = await mockRecords(page);
  await page.goto('/identidad/usuarios');
  await page.getByRole('button', { name: 'Nuevo usuario', exact: true }).click();
  const create = page.getByRole('dialog', { name: 'Registrar usuario', exact: true });
  await create.getByRole('textbox', { name: 'Usuario', exact: true }).fill('operador');
  await create.getByLabel('Contraseña', { exact: true }).fill('ClaveNueva2026!');
  await chooseOption(page, 'Área', 'ALMACÉN');
  await chooseOption(page, 'Rol', 'OPERADOR');
  await create.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(create).toBeHidden();
  expect(writes[0]?.data).toEqual({
    name: 'operador',
    password: 'ClaveNueva2026!',
    departmentId: recordIds.department,
    roleId: recordIds.secondRole,
  });
  await page
    .getByRole('row')
    .filter({ has: page.getByRole('cell', { name: 'ana', exact: true }) })
    .getByRole('button', { name: 'Editar registro', exact: true })
    .click();
  const edit = page.getByRole('dialog', { name: 'Editar usuario', exact: true });
  await expect(edit.getByRole('textbox', { name: 'Persona vinculada', exact: true })).toHaveValue(
    'Ana Pérez',
  );
  await expect(edit.getByLabel('Contraseña', { exact: true })).toHaveCount(0);
  await edit.getByRole('textbox', { name: 'Usuario', exact: true }).fill('ana2');
  await edit.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(edit).toBeHidden();
  expect(writes.at(-1)?.data).toEqual({
    name: 'ana2',
    departmentId: recordIds.department,
    roleId: recordIds.role,
    expectedVersion: 7,
  });
});

test('usuarios: el cambio de contraseña es una operación independiente y versionada', async ({
  page,
}) => {
  const { writes } = await mockRecords(page);
  await page.goto('/identidad/usuarios');
  await page.getByRole('button', { name: 'Cambiar contraseña', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Editar contraseña', exact: true });
  await expect(dialog.getByRole('textbox', { name: 'Usuario', exact: true })).toHaveAttribute(
    'readonly',
    '',
  );
  await dialog.getByLabel('Contraseña', { exact: true }).fill('ClaveSegura2026!');
  await dialog.getByRole('button', { name: 'Actualizar contraseña', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes).toEqual([
    {
      resource: 'users',
      method: 'PATCH',
      url: `/api/admin/users/${accountData.id}/password`,
      data: { password: 'ClaveSegura2026!', expectedVersion: 7 },
    },
  ]);
});

test('directorio: lectura sin escritura, accesos exclusivos y denegación directa', async ({
  page,
}) => {
  const { reads } = await mockRecords(page, ['clients:page-view', 'clients:read']);
  await page.goto('/almacen');
  await expect(page).toHaveURL(/\/directorio\/clientes$/);
  await expect(page.getByRole('cell', { name: 'Cliente Central', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nuevo cliente', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Editar registro', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Exportar Excel', exact: true })).toHaveCount(0);
  await page.goto('/identidad/usuarios');
  await expect(
    page.getByRole('heading', { name: 'Acceso no permitido', exact: true }),
  ).toBeVisible();
  expect(reads.every((url) => url.pathname === '/api/sales/clients')).toBe(true);
});

test('directorio: conflicto conserva captura y exige recargar antes de editar otra versión', async ({
  page,
}) => {
  const { writes, store } = await mockRecords(page);
  let conflict = true;
  await page.route('**/api/warehouse/suppliers/*', (route) => {
    if (!conflict) return route.fallback();
    conflict = false;
    store.set('suppliers', [{ ...supplierData, version: 7 }]);
    return route.fulfill({ status: 409, json: { code: 'RECORD_VERSION_CONFLICT' } });
  });
  await page.goto('/directorio/proveedores');
  await page.getByRole('button', { name: 'Editar registro', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Editar proveedor', exact: true });
  await dialog.getByRole('textbox', { name: 'Razón social', exact: true }).fill('Mi razón social');
  await dialog.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('El registro cambió');
  await expect(dialog.getByRole('textbox', { name: 'Razón social', exact: true })).toHaveValue(
    'Mi razón social',
  );
  await expect(dialog.getByRole('button', { name: 'Actualizar', exact: true })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Cerrar y actualizar listado', exact: true }).click();
  await page.getByRole('button', { name: 'Editar registro', exact: true }).click();
  await dialog.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes.at(-1)?.data.expectedVersion).toBe(7);
});

test('identidad: filtros de personas y reporte por área; vista móvil sin desbordamiento', async ({
  page,
}) => {
  const { reads, reports } = await mockRecords(page);
  await page.goto('/identidad/personas');
  await chooseOption(page, 'Filtrar por área', 'ALMACÉN');
  await chooseOption(page, 'Filtrar por rol', 'COORDINADOR');
  // Buscar otras opciones reemplaza la página remota, pero no el filtro elegido.
  const area = page.getByRole('combobox', { name: 'Filtrar por área', exact: true });
  await area.fill('VENTAS');
  await expect(page.getByRole('option', { name: 'VENTAS', exact: true })).toBeVisible();
  await expect(page.getByRole('option', { name: 'ALMACÉN', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect.poll(() => reads.at(-1)?.searchParams.get('role')).toBe('COORDINADOR');
  expect(reads.at(-1)?.searchParams.get('department')).toBe('ALMACÉN');
  await expect(page.getByRole('button', { name: 'Exportar Excel', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Limpiar filtros', exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar Excel', exact: true }).click();
  await download;
  expect(reports.at(-1)?.pathname).toBe('/api/admin/reports/persons/excel');
  await page.setViewportSize({ width: 320, height: 844 });
  await page.getByRole('button', { name: 'Nueva persona', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Registrar persona', exact: true });
  await expect(dialog.getByRole('button', { name: 'Guardar', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const [path, title, reportPath, search] of [
  ['/identidad/usuarios', 'Usuarios', '/api/admin/reports/users/excel', 'ana'],
  ['/directorio/clientes', 'Clientes', '/api/sales/reports/clients/excel', 'Central'],
  ['/directorio/proveedores', 'Proveedores', '/api/warehouse/reports/suppliers/excel', 'Central'],
] as const) {
  test(`reportes ${title}: exporta filtros sin paginación y recupera una descarga fallida`, async ({
    page,
  }) => {
    const { reads, reports } = await mockRecords(page);
    await page.goto(path);
    await page.getByRole('textbox', { name: 'Buscar por nombre', exact: true }).fill(search);
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect.poll(() => reads.at(-1)?.searchParams.get('search')).toBe(search);
    await page.route(
      `**${reportPath}?**`,
      (route) => route.fulfill({ status: 503, json: { code: 'SERVER_ERROR' } }),
      { times: 1 },
    );
    const exportButton = page.getByRole('button', { name: 'Exportar Excel', exact: true });
    await exportButton.click();
    await expect(page.getByRole('alert', { name: 'Error de descarga', exact: true })).toBeVisible();
    await expect(exportButton).toBeEnabled();
    const download = page.waitForEvent('download');
    await exportButton.click();
    expect((await download).suggestedFilename()).toMatch(/\.xlsx$/);
    expect(reports).toHaveLength(1);
    expect(reports[0]!.pathname).toBe(reportPath);
    expect(reports[0]!.searchParams.get('search')).toBe(search);
    for (const parameter of ['start', 'length', 'draw'])
      expect(reports[0]!.searchParams.has(parameter)).toBe(false);
    await expect(page.getByRole('alert', { name: 'Error de descarga', exact: true })).toHaveCount(
      0,
    );
  });
}

for (const status of [401, 403]) {
  test(`directorio: revocación ${status} durante la escritura abandona la pantalla protegida`, async ({
    page,
  }) => {
    await mockRecords(page);
    await page.route('**/api/auth/refresh', (route) =>
      route.fulfill({ status: 401, json: { code: 'INVALID_AUTH' } }),
    );
    await page.goto('/directorio/clientes');
    await page.getByRole('button', { name: 'Nuevo cliente', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Registrar cliente', exact: true });
    await dialog.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Cliente nuevo');
    await page.route('**/api/sales/clients', (route) =>
      route.fulfill({ status, json: { code: 'INVALID_AUTH' } }),
    );
    await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(
      page.getByRole('heading', {
        name: status === 401 ? 'Iniciar sesión' : 'Acceso no permitido',
        exact: true,
      }),
    ).toBeVisible();
  });
}
