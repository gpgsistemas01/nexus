import { expect, test } from '@playwright/test';
import { DEMO_PROFILES, demoSession } from '../../scripts/manual/profiles.mjs';
import { material, waste } from '../fixtures/inventory.js';
import { clientData } from '../fixtures/records.js';
import { mockIssues } from './issueFixtures.js';
import { chooseOption, mockWarehouse } from './warehouseFixtures.js';

for (const profileId of ['impresion-coordinador', 'instalaciones-instalador']) {
  for (const [path, resource] of [
    ['materiales', 'materials'],
    ['consumibles', 'consumables'],
    ['mermas', 'wastes'],
  ] as const) {
    test(`${profileId}/${resource}: sólo consulta de Almacén y solicitudes, sin altas comerciales ni entregas`, async ({
      page,
    }) => {
      test.setTimeout(60_000);
      const profile = DEMO_PROFILES.find(({ id }) => id === profileId)!;
      const session = demoSession(profile);
      const { docs } = await mockIssues(
        page,
        session.permissions,
        'Pendiente',
        session.accesses[0]!.department,
      );
      await page.route('**/api/auth/me', (route) => route.fulfill({ json: { user: session } }));
      const writes: string[] = [];
      page.on('request', (request) => {
        if (new URL(request.url()).pathname.startsWith('/api/') && request.method() !== 'GET')
          writes.push(`${request.method()} ${new URL(request.url()).pathname}`);
      });

      await page.goto(`/almacen/${path}`);
      const name = resource === 'wastes' ? waste.name : material.material.name;
      await expect(page.getByRole('cell').filter({ hasText: name }).first()).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByRole('columnheader', { name: 'Acciones', exact: true })).toHaveCount(
        0,
      );
      await expect(page.getByRole('columnheader', { name: /Costo/ })).toHaveCount(0);
      await expect(
        page.getByRole('button', {
          name: /^(Nuevo material|Nuevo consumible|Nueva merma|Editar|Eliminar|Ajustar stock|Agregar stock|Importar Excel|Exportar Excel|Detalles de peso)$/,
        }),
      ).toHaveCount(0);
      const supplierLookup = page.waitForResponse((response) => {
        const url = new URL(response.url());
        return (
          url.pathname === '/api/warehouse/suppliers' &&
          [...url.searchParams.values()].includes('Proveedor no registrado')
        );
      });
      await page
        .getByRole('combobox', { name: 'Filtrar por proveedor', exact: true })
        .fill('Proveedor no registrado');
      await supplierLookup;
      await expect(
        page.getByRole('option', { name: 'Proveedor Central', exact: true }),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: /Registrar proveedor/ })).toHaveCount(0);
      await page.keyboard.press('Escape');

      await page.getByRole('button', { name: 'Menú', exact: true }).click();
      const navigation = page.getByRole('navigation', { name: 'Navegación principal' });
      const inventoryDestinations = await navigation
        .getByRole('link')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
      await expect(
        navigation.getByRole('button', {
          name: /^(Compras|Movimientos|Identidad y acceso|Directorio comercial|Catálogos)$/,
        }),
      ).toHaveCount(0);
      await navigation.getByRole('button', { name: 'Salidas', exact: true }).click();
      await expect(navigation.locator('a[href="/salidas/materiales"]')).toBeVisible();
      const issueDestinations = await navigation
        .getByRole('link')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
      const destinations = [...inventoryDestinations, ...issueDestinations];
      expect(destinations).toEqual(
        expect.arrayContaining(['/almacen/materiales', '/salidas/materiales']),
      );
      expect(
        destinations.every((to) => to?.startsWith('/almacen') || to?.startsWith('/salidas')),
      ).toBe(true);

      await page.goto(`/salidas/${path}`);
      await expect(
        page.getByRole('button', { name: 'Consultar salida', exact: true }),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: /Surtir|Devolver/ })).toHaveCount(0);
      await page.getByRole('button', { name: 'Nueva salida', exact: true }).click();
      const dialog = page.getByRole('dialog');
      const client = dialog.getByRole('combobox', { name: 'Cliente', exact: true });
      const clientLookup = page.waitForResponse((response) => {
        const url = new URL(response.url());
        return (
          url.pathname === '/api/sales/clients' &&
          [...url.searchParams.values()].includes('Cliente no registrado')
        );
      });
      await client.fill('Cliente no registrado');
      await clientLookup;
      await expect(page.getByRole('option', { name: clientData.name, exact: true })).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Registrar cliente|Registrar proveedor/ }),
      ).toHaveCount(0);
      await client.clear();
      await chooseOption(page, 'Cliente', clientData.name, dialog);
      await expect(client).toHaveValue(clientData.name);
      await dialog.getByRole('button', { name: 'Regresar', exact: true }).click();

      const delivered = docs[resource];
      delivered.fulfillmentStatus.name = 'Surtido';
      for (const detail of delivered.details) {
        detail.isSupplied = true;
        detail.suppliedQuantity = detail.quantity;
        detail.returnedQuantity = '0';
        detail.fulfillmentStatus.name = 'Surtido';
      }
      await page.reload();
      await expect(page.getByRole('cell', { name: 'Surtido', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: /Surtir|Devolver/ })).toHaveCount(0);
      await page.getByRole('button', { name: 'Consultar salida', exact: true }).click();
      const consultation = page.getByRole('dialog');
      await expect(consultation.getByRole('button', { name: /Surtir|Devolver/ })).toHaveCount(0);
      await consultation.getByRole('button', { name: 'Regresar', exact: true }).click();
      expect(writes).toEqual([]);
    });
  }
}

test('Almacén con gestión conserva la consulta adicional de pesos de merma', async ({ page }) => {
  await mockWarehouse(page);
  await page.goto('/almacen/mermas');
  await page.getByRole('button', { name: 'Detalles de peso', exact: true }).click();
  const details = page.getByRole('dialog', { name: `Pesos de ${waste.name}`, exact: true });
  await expect(details.getByText('Rollo completo con cono (kg)', { exact: true })).toBeVisible();
  await details.getByRole('button', { name: 'Cerrar detalles', exact: true }).click();
  await expect(details).toBeHidden();
});
