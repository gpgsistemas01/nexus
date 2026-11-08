import { expect, test } from '@playwright/test';
import { mockIssues } from './issueFixtures.js';
import { issuePermissions } from '../fixtures/issues.js';
import { ids } from '../fixtures/inventory.js';
import { historicalPreview, historicalReceipt } from '../fixtures/historicalDelivery.js';

for (const width of [1280, 390]) {
  test(`entregas históricas: selección, declaración y recuperación a ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockIssues(page, [...issuePermissions, 'issues:reconcile']);
    const writes: Record<string, unknown>[] = [];
    await page.route('**/api/warehouse/historical-deliveries/materials/**', async (route) => {
      if (route.request().method() === 'GET')
        return route.fulfill({ json: { preview: historicalPreview() } });
      writes.push(route.request().postDataJSON());
      if (writes.length === 1) return route.abort('failed');
      return route.fulfill({
        json: {
          code: 'HISTORICAL_DELIVERY_COMPLETED',
          receipt: historicalReceipt(),
          replayed: true,
        },
      });
    });
    await page.goto('/salidas/materiales');
    await page.getByRole('button', { name: 'Registrar entregas históricas', exact: true }).click();
    let dialog = page.getByRole('dialog', { name: 'Registrar entregas históricas', exact: true });
    await dialog.getByLabel('Fecha y hora de corte', { exact: true }).fill('2026-10-31T12:00');
    await dialog
      .getByRole('button', { name: 'Buscar salidas pendientes al corte', exact: true })
      .click();
    await expect(dialog.getByText(/Lona: 3 por registrar/)).toBeVisible();
    await dialog.getByRole('checkbox', { name: /SMA-HIST-001/ }).check();
    await dialog
      .getByLabel('Motivo y evidencia de la entrega histórica', { exact: true })
      .fill('Entrega física comprobada');
    const submit = dialog.getByRole('button', {
      name: 'Registrar entregas seleccionadas',
      exact: true,
    });
    await expect(submit).toBeDisabled();
    await dialog.getByRole('checkbox', { name: /Confirmo que todas las partidas/ }).check();
    await expect(submit).toBeEnabled();
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    await dialog.screenshot({
      path: test.info().outputPath('historical-delivery-review.png'),
      animations: 'disabled',
    });
    await submit.click();
    await expect(
      dialog.getByRole('button', { name: 'Revisar y reintentar registro', exact: true }),
    ).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: 'Registrar entregas históricas', exact: true }).click();
    dialog = page.getByRole('dialog', { name: 'Registrar entregas históricas', exact: true });
    await dialog
      .getByRole('button', { name: 'Revisar y reintentar registro', exact: true })
      .click();
    await expect(dialog.getByText(/Se registraron 1 entregas/)).toBeVisible();
    expect(writes).toHaveLength(2);
    expect(writes[1]).toEqual(writes[0]);
    expect(writes[0]).toMatchObject({
      cutoffDate: historicalPreview().cutoffDate,
      deliveredAt: null,
      declaredDelivered: true,
      documents: [{ id: historicalPreview().documents[0]!.id, revision: 'a'.repeat(64) }],
    });
  });
}

test('surtir no concede el permiso de regularización histórica', async ({ page }) => {
  await mockIssues(page);
  await page.goto('/salidas/materiales');
  await expect(page.getByRole('button', { name: 'Surtir detalle', exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Registrar entregas históricas', exact: true }),
  ).toHaveCount(0);
});

test('la devolución de una entrega histórica exige declarar la entrada física actual', async ({
  page,
}) => {
  const { docs, writes } = await mockIssues(page, issuePermissions, 'Surtido');
  Object.assign(docs.materials, {
    historicalDeliveryBatch: {
      id: ids.offer,
      reason: 'Entrega antigua comprobada',
      cutoffDate: '2026-10-31T18:00:00Z',
      deliveredAt: null,
      createdAt: '2026-11-01T18:00:00Z',
      user: { name: 'Sistemas' },
    },
  });
  await page.goto('/salidas/materiales');
  await page.getByRole('button', { name: 'Devolver material surtido', exact: true }).click();
  await expect(
    page
      .getByRole('dialog', { name: /^Devolver salida - Folio SAL-001$/ })
      .getByText('Regularizada por entrega histórica', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Devolver detalle de salida', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Devolver detalle de salida', exact: true });
  await dialog.getByLabel('Cantidad a devolver', { exact: true }).fill('1');
  await dialog.getByRole('button', { name: 'Devolver', exact: true }).click();
  await expect(
    dialog.getByText('Confirma la entrada física actual al almacén.', { exact: true }),
  ).toBeVisible();
  expect(writes).toHaveLength(0);
  await dialog
    .getByRole('checkbox', {
      name: 'Confirmo que esta cantidad está entrando físicamente al almacén ahora.',
      exact: true,
    })
    .check();
  await dialog.getByRole('button', { name: 'Devolver', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(writes[0]!.data).toMatchObject({ returnQuantity: 1, physicalReturnConfirmed: true });
});
