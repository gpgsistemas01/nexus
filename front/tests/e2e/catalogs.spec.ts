import { expect, test } from '@playwright/test';
import { catalogs, entryId, mockCatalogs } from './catalogFixtures.js';

test('catálogos: navegación Vue, seis rutas y cuenta con acceso exclusivo a catálogos', async ({
  page,
}) => {
  await mockCatalogs(page, ['catalogs:manage']);
  await page.goto('/almacen');
  await expect(page).toHaveURL(/\/catalogos\/departments$/);
  await page.getByRole('button', { name: 'Expandir menú', exact: true }).click();
  const menu = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(menu.getByRole('button', { name: 'Almacén', exact: true })).toBeHidden();
  await expect(menu.getByRole('button', { name: 'Catálogos', exact: true })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  for (const catalog of catalogs) {
    await expect(menu.getByRole('link', { name: catalog.label, exact: true })).toHaveAttribute(
      'href',
      `/catalogos/${catalog.name}`,
    );
  }
  await menu.getByRole('link', { name: 'Roles', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Roles', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Roles', exact: true })).toBeVisible();
  await page.goto('/catalogos/no-existe');
  await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toBeVisible();
});

test('catálogos: alta de los seis recursos con validación, símbolo condicional y estado inactivo', async ({
  page,
}) => {
  const { writes } = await mockCatalogs(page);
  for (const catalog of catalogs) {
    await page.goto(`/catalogos/${catalog.name}`);
    await expect(page.getByRole('heading', { name: catalog.label, exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Registro existente', exact: true })).toBeVisible();
    await page.getByRole('button', { name: catalog.create, exact: true }).click();
    const dialog = page.getByRole('dialog', { name: `Registrar ${catalog.entity}`, exact: true });
    await dialog.getByRole('textbox', { name: 'Nombre', exact: true }).focus();
    await dialog.getByRole('button', { name: 'Cerrar', exact: true }).focus();
    await expect(dialog.getByText(/valor requerido/)).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(
      dialog.getByText(`El nombre de ${catalog.entity} es un valor requerido`, { exact: true }),
    ).toBeVisible();
    const name = 'Registro nuevo';
    await dialog.getByRole('textbox', { name: 'Nombre', exact: true }).fill(name);
    if (catalog.name === 'unit-measures')
      await dialog.getByRole('textbox', { name: 'Símbolo', exact: true }).fill('u');
    else await expect(dialog.getByRole('textbox', { name: 'Símbolo', exact: true })).toBeHidden();
    await dialog.getByRole('checkbox', { name: 'Activo', exact: true }).uncheck();
    await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(
      page
        .getByRole('row')
        .filter({ has: page.getByRole('cell', { name, exact: true }) })
        .getByText('No', { exact: true }),
    ).toBeVisible();
    expect(writes.at(-1)).toEqual({
      method: 'POST',
      catalog: catalog.name,
      data: { name, isActive: false, ...(catalog.name === 'unit-measures' ? { symbol: 'u' } : {}) },
    });
    await expect(page.getByRole('button', { name: 'Eliminar', exact: true })).toBeHidden();
  }
});

test('catálogos: edición usa PUT con la versión leída y conserva símbolo y estado', async ({
  page,
}) => {
  const { writes } = await mockCatalogs(page);
  await page.goto('/catalogos/unit-measures');
  await page.getByRole('button', { name: 'Editar registro', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Editar unidad de medida', exact: true });
  await expect(dialog.getByRole('textbox', { name: 'Símbolo', exact: true })).toHaveValue('m');
  await dialog.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Metro nuevo');
  await dialog.getByRole('textbox', { name: 'Símbolo', exact: true }).fill('mt');
  await dialog.getByRole('checkbox', { name: 'Activo', exact: true }).uncheck();
  await dialog.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes).toEqual([
    {
      method: 'PUT',
      catalog: 'unit-measures',
      data: { name: 'Metro nuevo', symbol: 'mt', isActive: false, expectedVersion: 7 },
    },
  ]);
  await expect(page.getByRole('cell', { name: 'Metro nuevo', exact: true })).toBeVisible();
});

test('catálogos: conflicto conserva captura, impide reenvío y exige nueva lectura', async ({
  page,
}) => {
  const { store, writes } = await mockCatalogs(page);
  let rejected = 0;
  await page.route('**/api/admin/catalogs/roles/*', async (route) => {
    if (rejected++) return route.fallback();
    expect(route.request().postDataJSON().expectedVersion).toBe(7);
    store.set('roles', [
      { id: entryId, name: 'Nombre actualizado por otra persona', isActive: true, version: 8 },
    ]);
    return route.fulfill({ status: 409, json: { code: 'RECORD_VERSION_CONFLICT' } });
  });
  await page.goto('/catalogos/roles');
  await page.getByRole('button', { name: 'Editar registro', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Editar rol', exact: true });
  await dialog.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Mi captura');
  await dialog.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('El registro cambió');
  await expect(dialog.getByRole('textbox', { name: 'Nombre', exact: true })).toHaveValue(
    'Mi captura',
  );
  await expect(dialog.getByRole('button', { name: 'Actualizar', exact: true })).toBeDisabled();
  expect(rejected).toBe(1);
  await dialog.getByRole('button', { name: 'Cerrar y actualizar catálogo', exact: true }).click();
  await expect(
    page.getByRole('cell', { name: 'Nombre actualizado por otra persona', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Editar registro', exact: true }).click();
  await dialog.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Segunda captura');
  await dialog.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes.at(-1)?.data.expectedVersion).toBe(8);
});

test('catálogos: búsqueda, paginación, recuperación de lectura y vista móvil', async ({ page }) => {
  const { store, reads } = await mockCatalogs(page);
  store.set(
    'roles',
    Array.from({ length: 21 }, (_, index) => ({
      id: `role-${index}`,
      name: `Rol ${String(index + 1).padStart(2, '0')}`,
      isActive: true,
      version: 0,
    })),
  );
  let fail = true;
  await page.route('**/api/admin/catalogs/roles?**', (route) => {
    if (!fail) return route.fallback();
    fail = false;
    return route.fulfill({ status: 503, json: { code: 'UNAVAILABLE' } });
  });
  await page.goto('/catalogos/roles');
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Rol 01', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Rol 11', exact: true })).toBeVisible();
  expect(reads.at(-1)?.searchParams.get('start')).toBe('10');
  await page.getByRole('textbox', { name: 'Buscar por nombre', exact: true }).fill('Rol 21');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Rol 21', exact: true })).toBeVisible();
  expect(reads.at(-1)?.searchParams.get('start')).toBe('0');
  expect(reads.at(-1)?.searchParams.get('search')).toBe('Rol 21');
  await page.getByRole('button', { name: 'Limpiar filtros', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Rol 01', exact: true })).toBeVisible();
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.getByRole('button', { name: 'Nuevo rol', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Registrar rol', exact: true });
    await expect(dialog.getByRole('button', { name: 'Guardar', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await dialog.getByRole('button', { name: 'Cerrar', exact: true }).click();
    await page.getByRole('button', { name: 'Menú', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Catálogos', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar menú', exact: true }).click();
  }
});

test('catálogos: acceso directo sin permiso no consulta la API administrativa', async ({
  page,
}) => {
  const { reads } = await mockCatalogs(page, ['materials:read']);
  await page.goto('/catalogos/roles');
  await expect(
    page.getByRole('heading', { name: 'Acceso no permitido', exact: true }),
  ).toBeVisible();
  expect(reads).toEqual([]);
  await page.goto('/almacen/materiales');
  await page.getByRole('button', { name: 'Expandir menú', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Catálogos', exact: true })).toBeHidden();
});

for (const status of [401, 403])
  test(`catálogos: revocación ${status} durante la escritura cierra el acceso`, async ({
    page,
  }) => {
    await mockCatalogs(page);
    await page.route('**/api/auth/refresh', (route) =>
      route.fulfill({ status: 401, json: { code: 'INVALID_AUTH' } }),
    );
    await page.goto('/catalogos/roles');
    await page.getByRole('button', { name: 'Nuevo rol', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Registrar rol', exact: true });
    await dialog.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Operador');
    await page.route('**/api/admin/catalogs/roles', (route) =>
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
