import path from 'node:path';
import { expect, type Page, type Locator } from '@playwright/test';
import { APP_NAVIGATION_GROUPS } from '../../src/app/navigation.js';
import type { SessionUser } from '../../src/modules/auth/session.js';
import { PERMISSIONS as P } from '@nexus/permissions';
import { selectWasteReference } from './selectPreparation.js';
import { DOCUMENT_STATE_CAPTURES, openDocumentCapture } from './documentStates.js';

export const INVENTORY_IMPORT_CAPTURES: Record<string, string> = {
  '03b-material-import.png': 'materiales',
  '06a-consumable-import.png': 'consumibles',
  '08a-waste-import.png': 'mermas',
};

export const HISTORICAL_DELIVERY_CAPTURES: Record<string, string> = {
  '25g-issue-historical.png': 'materiales',
  '25h-issue-historical-consumables.png': 'consumibles',
  '25i-issue-historical-wastes.png': 'mermas',
};
export const MOVEMENT_CAPTURES: Record<string, string> = {
  '26a-movements-consumables.png': 'consumibles',
  '26b-movements-wastes.png': 'mermas',
};

export type CaptureFamily =
  'warehouse' | 'records' | 'catalogs' | 'purchases' | 'issues' | 'movements';

export const captureFamily = (image: string, permissions: readonly string[]): CaptureFamily => {
  if (DOCUMENT_STATE_CAPTURES[image]) return DOCUMENT_STATE_CAPTURES[image].family;
  const number = Number.parseInt(image);
  if (number < 11) return 'warehouse';
  if (number < 13) return 'catalogs';
  if (number === 16 && !permissions.includes(P.CLIENTS_PAGE_VIEW)) return 'issues';
  if (number === 17 && !permissions.includes(P.SUPPLIERS_PAGE_VIEW)) return 'purchases';
  if (number < 18) return 'records';
  if (number < 22) return 'purchases';
  if (number < 26) return 'issues';
  return permissions.includes(P.MOVEMENTS_READ) ? 'movements' : 'purchases';
};

const findInTablePages = async (page: Page, target: Locator, description: string) => {
  const dialog = page.getByRole('dialog').last();
  const scope = (await dialog.count()) ? dialog : page;
  for (let pageNumber = 0; pageNumber < 100; pageNumber++) {
    if (await target.count()) return target;
    const next = scope.getByRole('button', { name: /^(Siguiente|Next page)$/ }).first();
    if (!(await next.count()) || !(await next.isEnabled())) break;
    await next.click();
    await expect(page.locator('.v-data-table__progress .v-progress-linear')).toHaveCount(0);
  }
  throw new Error(`Preparación pendiente: se necesita ${description} en las páginas disponibles.`);
};

const openAction = async (page: Page, name: string) => {
  const action = await findInTablePages(
    page,
    page.getByRole('button', { name, exact: true }).and(page.locator(':enabled:visible')).first(),
    `un registro existente con la acción «${name}»`,
  );
  await action.click();
  await expect(page.getByRole('dialog', { name: /^Cargando (compra|salida)/ })).toHaveCount(0, {
    timeout: 60_000,
  });
  if (
    await page
      .getByRole('dialog', { name: 'No se pudo completar la consulta', exact: true })
      .count()
  )
    throw new Error(
      `No se pudo preparar «${name}»: la consulta falló. Revise el servicio antes de volver a capturar.`,
    );
};

const chooseFirst = async (page: Page, scope: Locator, label: string, matching?: RegExp) => {
  const field = scope.getByRole('combobox', { name: label, exact: true });
  if (await field.isDisabled()) {
    await expect(field).not.toHaveValue('');
    return;
  }
  await field.click();
  let options = page.locator('[role="option"]:visible:not([aria-disabled="true"])');
  if (matching) options = options.filter({ hasText: matching });
  await expect(options.first(), `Se necesita una opción disponible para ${label}.`).toBeVisible();
  await options.first().click();
};

const go = async (page: Page, route: string) => {
  await page.goto(route);
  await expect(page.locator('main h1')).toBeVisible({ timeout: 30_000 });
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
  await page.setViewportSize({ width: 1600, height: 1400 });
  const number = Number.parseInt(filename);
  const documentState = DOCUMENT_STATE_CAPTURES[filename];
  const importResource = INVENTORY_IMPORT_CAPTURES[filename];
  if (importResource) {
    await go(page, `/almacen/${importResource}`);
    await openAction(page, 'Importar Excel');
    const dialog = page.getByRole('dialog', {
      name: `Importar Excel de ${importResource}`,
      exact: true,
    });
    await expect(
      dialog.getByRole('combobox', { name: 'Operación del archivo', exact: true }),
    ).not.toHaveValue('');
    await expect(
      dialog.getByRole('button', { name: 'Descargar plantilla', exact: true }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Validar archivo', exact: true }),
    ).toBeDisabled();
  } else if (HISTORICAL_DELIVERY_CAPTURES[filename]) {
    const resource =
      filename === '25g-issue-historical.png' &&
      !user.permissions.includes(P.GOODS_ISSUES_PAGE_VIEW)
        ? 'mermas'
        : HISTORICAL_DELIVERY_CAPTURES[filename];
    await go(page, `/salidas/${resource}`);
    await openAction(page, 'Registrar entregas históricas');
    const dialog = page.getByRole('dialog', { name: 'Registrar entregas históricas', exact: true });
    await expect(
      dialog.getByRole('status').filter({ hasText: /registros? en esta página/ }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      dialog.getByRole('combobox', { name: 'Registros por página:', exact: true }),
    ).toHaveValue('100');
    await expect(
      dialog.getByRole('button', { name: 'Registrar entregas seleccionadas', exact: true }),
    ).toBeDisabled();
  } else if (MOVEMENT_CAPTURES[filename]) {
    await go(page, `/movimientos/${MOVEMENT_CAPTURES[filename]}`);
  } else if (documentState) {
    await openDocumentCapture(page, documentState);
  } else if (number === 1) {
    await page.goto('/inicio-sesion');
    await expect(page.getByRole('heading', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  } else if (number === 2) {
    const first = APP_NAVIGATION_GROUPS.flatMap(({ links }) => links).find(({ permission }) =>
      user.permissions.includes(permission),
    );
    if (!first) throw new Error('La cuenta no tiene ninguna página de navegación disponible.');
    await go(page, first.to);
    await page.getByRole('button', { name: 'Menú', exact: true }).click();
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
        await selectWasteReference(page, dialog);
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
  } else if (number === 16 && !user.permissions.includes(P.CLIENTS_PAGE_VIEW)) {
    await go(page, '/salidas/materiales');
    await openAction(page, 'Nueva salida');
    const term = 'Cliente de ejemplo';
    await page
      .getByRole('dialog')
      .last()
      .getByRole('combobox', { name: 'Cliente', exact: true })
      .fill(term);
    await page.getByRole('button', { name: `Registrar cliente «${term}»`, exact: true }).click();
    await expect(
      page.getByRole('dialog', { name: 'Registrar cliente', exact: true }),
    ).toBeVisible();
  } else if (number === 17 && !user.permissions.includes(P.SUPPLIERS_PAGE_VIEW)) {
    await go(page, '/compras/materiales');
    await openAction(page, 'Nueva compra');
    const term = 'Proveedor de ejemplo';
    await page
      .getByRole('dialog')
      .last()
      .getByRole('combobox', { name: 'Proveedor', exact: true })
      .fill(term);
    await page.getByRole('button', { name: `Registrar proveedor «${term}»`, exact: true }).click();
    await expect(
      page.getByRole('dialog', { name: 'Registrar proveedor', exact: true }),
    ).toBeVisible();
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
    if (number !== 21) await go(page, '/compras/materiales');
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
      if (number === 21) {
        await openDocumentCapture(page, {
          family: 'purchases',
          resource: 'materiales',
          state: 'correct',
        });
        await openAction(page, 'Corregir detalle');
      } else await openAction(page, 'Ver compra');
    }
  } else if (number <= 25) {
    const needsSupply = number === 24 || number === 25;
    const materials =
      user.permissions.includes(P.GOODS_ISSUES_PAGE_VIEW) &&
      (!needsSupply || user.permissions.includes(P.GOODS_ISSUE_DETAILS_MANAGE));
    const resource = materials ? 'materiales' : 'mermas';
    if (number <= 23) await go(page, `/salidas/${resource}`);
    if (
      !user.permissions.includes(materials ? P.GOODS_ISSUE_DETAILS_MANAGE : P.WASTE_ISSUES_SUPPLY)
    ) {
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
      await chooseFirst(page, dialog, materials ? 'Material' : 'Merma');
      await dialog.getByLabel('Cantidad', { exact: true }).fill('1');
      await dialog.getByRole('button', { name: 'Agregar', exact: true }).click();
    } else if (number === 24) {
      const { supplyDetail } = await openDocumentCapture(page, {
        family: 'issues',
        resource,
        state: 'supply',
      });
      const row = await findInTablePages(
        page,
        page
          .getByRole('row')
          .filter({
            has: page.getByRole('checkbox', { name: /^Surtir:/ }).and(page.locator(':enabled')),
          })
          .first(),
        'un detalle pendiente de surtir',
      );
      const checkbox = row.getByRole('checkbox', { name: /^Surtir:/ });
      await checkbox.check();
      const quantity = row.getByRole('spinbutton', { name: /^Cantidad a surtir:/ });
      const pending = Number(await quantity.getAttribute('max'));
      await quantity.fill(String(pending));
      const project = row.getByRole('spinbutton', { name: /^Cantidad de proyecto:/ });
      if (!(await project.inputValue()))
        await project.fill(String(supplyDetail!.convertedQuantity));
      await checkbox.scrollIntoViewIfNeeded();
    } else if (number === 25) {
      await openDocumentCapture(page, { family: 'issues', resource, state: 'return' });
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
