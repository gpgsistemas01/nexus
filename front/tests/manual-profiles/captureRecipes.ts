import path from 'node:path';
import { expect, type Page, type Locator } from '@playwright/test';
import { APP_NAVIGATION_GROUPS } from '../../src/app/navigation.js';
import type { SessionUser } from '../../src/modules/auth/session.js';
import { PERMISSIONS as P } from '@nexus/permissions';

export type CaptureFamily =
  'warehouse' | 'records' | 'catalogs' | 'purchases' | 'issues' | 'movements';

export const captureFamily = (image: string, permissions: readonly string[]): CaptureFamily => {
  const number = Number.parseInt(image);
  if (number < 11) return 'warehouse';
  if (number < 13) return 'catalogs';
  if (number < 18) return 'records';
  if (number < 22) return 'purchases';
  if (number < 26) return 'issues';
  return permissions.includes(P.MOVEMENTS_READ) ? 'movements' : 'purchases';
};

const openAction = async (page: Page, name: string) => {
  for (let pageNumber = 0; pageNumber < 100; pageNumber++) {
    const action = page.getByRole('button', { name, exact: true }).first();
    if (await action.count()) {
      await action.click();
      return;
    }
    const next = page.getByRole('button', { name: 'Siguiente', exact: true }).first();
    if (!(await next.count()) || !(await next.isEnabled())) break;
    await next.click();
    await expect(page.locator('.v-data-table__progress .v-progress-linear')).toHaveCount(0);
  }
  throw new Error(
    `Preparación pendiente: se necesita un registro existente con la acción «${name}».`,
  );
};

const chooseFirst = async (page: Page, scope: Locator, label: string, matching?: RegExp) => {
  await scope.getByRole('combobox', { name: label, exact: true }).click();
  let options = page.locator('[role="option"]:visible:not([aria-disabled="true"])');
  if (matching) options = options.filter({ hasText: matching });
  await expect(options.first(), `Se necesita una opción disponible para ${label}.`).toBeVisible();
  await options.first().click();
};

const go = async (page: Page, route: string) => {
  await page.goto(route);
  await expect(page.locator('main h1')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /Acceso no permitido|Sesión no disponible/ }),
  ).toHaveCount(0);
  await expect(page.locator('.v-data-table__progress .v-progress-linear')).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: 'Cargando' })).toHaveCount(0);
};

export const verifyInventoryAccess = async (page: Page, user: SessionUser) => {
  if (!user.permissions.includes(P.INVENTORY_COSTS_READ))
    await expect(page.getByRole('columnheader', { name: /Costo/ })).toHaveCount(0);
  if (!user.permissions.includes(P.MATERIALS_WRITE))
    await expect(
      page.getByRole('button', { name: /Nuevo material|Editar|Eliminar/, exact: true }),
    ).toHaveCount(0);
  if (!user.permissions.includes(P.MATERIALS_ADJUST_STOCK))
    await expect(page.getByRole('button', { name: 'Ajustar stock', exact: true })).toHaveCount(0);
};

export const captureRecipe = async (
  page: Page,
  filename: string,
  root: string,
  user: SessionUser,
) => {
  const number = Number.parseInt(filename);
  if (number === 1) {
    await page.goto('/inicio-sesion');
    await expect(page.getByRole('heading', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  } else if (number === 2) {
    const first = APP_NAVIGATION_GROUPS.flatMap(({ links }) => links).find(({ permission }) =>
      user.permissions.includes(permission),
    );
    if (!first) throw new Error('La cuenta no tiene ninguna página de navegación disponible.');
    await go(page, first.to);
    await page.getByRole('button', { name: 'Expandir menú', exact: true }).click();
    const menu = page.getByRole('navigation', { name: 'Navegación principal' });
    for (const group of APP_NAVIGATION_GROUPS)
      if (!group.links.some(({ permission }) => user.permissions.includes(permission)))
        await expect(menu.getByRole('button', { name: group.title, exact: true })).toHaveCount(0);
  } else if (number >= 3 && number <= 10) {
    const resource = number <= 5 ? 'materiales' : number <= 7 ? 'consumibles' : 'mermas';
    await go(page, `/almacen/${resource}`);
    if (number === 3) await verifyInventoryAccess(page, user);
    const action = (
      {
        4: 'Nuevo material',
        5: 'Ajustar stock',
        7: 'Nuevo consumible',
        9: 'Nueva merma',
        10: 'Agregar stock',
      } as Record<number, string>
    )[number];
    if (action) {
      await openAction(page, action);
      const dialog = page.getByRole('dialog').last();
      await expect(dialog).toBeVisible();
      if (number === 9) {
        await chooseFirst(page, dialog, 'Proveedor');
        await chooseFirst(page, dialog, 'Material de referencia del proveedor', /ROLLO/);
        await dialog
          .getByLabel('Nombre de la merma', { exact: true })
          .fill('Ejemplo de captura sin guardar');
        for (const [label, value] of [
          ['Peso del rollo completo con cono (kg)', '21'],
          ['Peso del cono de la merma (kg)', '1'],
          ['Peso de la merma con cono (kg)', '5'],
          ['Cantidad inicial', '2'],
        ])
          await dialog.getByLabel(label!, { exact: true }).fill(value!);
        if (filename.startsWith('09a'))
          await dialog
            .getByRole('heading', { name: 'Rollo completo (muestra)', exact: true })
            .evaluate((element) => element.scrollIntoView({ block: 'start' }));
        else if (filename.startsWith('09b'))
          await dialog.getByLabel('Observaciones', { exact: true }).scrollIntoViewIfNeeded();
        else
          await dialog
            .getByRole('heading', { name: 'Material de origen', exact: true })
            .evaluate((element) => element.scrollIntoView({ block: 'start' }));
      }
    }
  } else if (number <= 12) {
    await go(page, '/catalogos/unit-measures');
    if (number === 12) await openAction(page, 'Nueva unidad de medida');
  } else if (number <= 17) {
    const [route, action] = (
      {
        13: ['/identidad/personas', 'Editar registro'],
        14: ['/identidad/usuarios', 'Nuevo usuario'],
        15: ['/identidad/usuarios', 'Cambiar contraseña'],
        16: ['/directorio/clientes', 'Nuevo cliente'],
        17: ['/directorio/proveedores', 'Nuevo proveedor'],
      } as Record<number, [string, string]>
    )[number]!;
    await go(page, route);
    await openAction(page, action);
  } else if (number <= 21) {
    await go(page, '/compras/materiales');
    if (number === 19) {
      await openAction(page, 'Nueva compra');
      const dialog = page.getByRole('dialog').last();
      await chooseFirst(page, dialog, 'Proveedor');
      await chooseFirst(page, dialog, 'Persona que recibe');
      await dialog.getByRole('radio', { name: 'Remisión', exact: true }).check();
      await chooseFirst(page, dialog, 'Material');
      await dialog.getByLabel('Cantidad', { exact: true }).fill('1');
      await dialog.getByLabel('Costo por Presentación', { exact: true }).fill('100');
      await dialog.getByRole('button', { name: 'Agregar', exact: true }).click();
    } else if (number >= 20) {
      await openAction(page, 'Ver compra');
      if (number === 21) await openAction(page, 'Corregir detalle');
    }
  } else if (number <= 25) {
    await go(page, '/salidas/materiales');
    if (!user.permissions.includes(P.GOODS_ISSUE_DETAILS_MANAGE)) {
      await expect(page.getByRole('button', { name: 'Surtir detalle', exact: true })).toHaveCount(
        0,
      );
      await expect(
        page.getByRole('button', { name: 'Devolver material surtido', exact: true }),
      ).toHaveCount(0);
    }
    if (number === 23) {
      await openAction(page, 'Nueva salida');
      const dialog = page.getByRole('dialog').last();
      for (const label of ['Cliente', 'Asesor', 'Área', 'Solicitante'])
        await chooseFirst(page, dialog, label);
      await dialog.getByLabel('Número de proyecto', { exact: true }).fill('120010');
      await chooseFirst(page, dialog, 'Material');
      await dialog.getByLabel('Cantidad', { exact: true }).fill('1');
      await dialog.getByRole('button', { name: 'Agregar', exact: true }).click();
    } else if (number === 24) {
      await openAction(page, 'Surtir detalle');
      await page
        .getByRole('checkbox', { name: /^Surtir:/ })
        .first()
        .check();
      await page
        .getByRole('spinbutton', { name: /^Cantidad de proyecto:/ })
        .first()
        .fill('1');
      await page
        .getByRole('checkbox', { name: /^Surtir:/ })
        .first()
        .scrollIntoViewIfNeeded();
    } else if (number === 25) {
      await openAction(page, 'Devolver material surtido');
      await openAction(page, 'Devolver detalle de salida');
    }
  } else {
    await go(
      page,
      user.permissions.includes(P.MOVEMENTS_READ)
        ? '/movimientos/materiales'
        : '/compras/materiales',
    );
    if (number === 27) {
      await openAction(page, 'Exportar Excel');
      await page
        .getByRole('combobox', { name: 'Alcance del reporte', exact: true })
        .press('ArrowDown');
      await page.getByRole('option', { name: 'Mes específico', exact: true }).click();
      await page.getByLabel('Mes del reporte', { exact: true }).fill('2026-10');
    }
  }
  await page.evaluate(() => document.fonts.ready);
  const dialog = page.getByRole('dialog').last();
  const target = (await dialog.count()) ? dialog : page;
  await target.screenshot({
    path: path.join(root, 'images', filename),
    animations: 'disabled',
    caret: 'hide',
  });
};
