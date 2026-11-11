import { expect, test } from '@playwright/test';
import { mockIssues } from './issueFixtures.js';
import { issuePermissions } from '../fixtures/issues.js';
import { ids } from '../fixtures/inventory.js';
import { historicalPreview, historicalReceipt } from '../fixtures/historicalDelivery.js';

for (const width of [1280, 600, 599, 390]) {
  test(`entregas históricas: selección, declaración y recuperación a ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockIssues(page, [...issuePermissions, 'issues:reconcile']);
    const writes: Record<string, unknown>[] = [];
    let previewCutoffDate = '';
    await page.route('**/api/warehouse/historical-deliveries/materials/**', async (route) => {
      if (route.request().method() === 'GET') {
        previewCutoffDate = new URL(route.request().url()).searchParams.get('cutoffDate') ?? '';
        return route.fulfill({
          json: { preview: { ...historicalPreview(), cutoffDate: previewCutoffDate } },
        });
      }
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
    await expect(dialog.getByLabel('Fecha y hora de corte')).toHaveCount(0);
    await expect(dialog.getByLabel('Fecha real de entrega (opcional)')).toHaveCount(0);
    await expect(
      dialog.getByRole('checkbox', {
        name: 'Seleccionar todas las salidas de todas las páginas',
      }),
    ).toHaveCount(1);
    if (width < 600) {
      const cards = dialog.locator('.responsive-table-cards');
      await expect(cards).toBeVisible();
      await expect(dialog.getByRole('table')).toBeHidden();
      await expect(cards.getByText(/Lona: 3 por registrar/)).toBeVisible();
    } else {
      const table = dialog.getByRole('table', {
        name: 'Salidas pendientes y parcialmente surtidas',
      });
      await expect(table).toBeVisible();
      await expect(dialog.locator('.responsive-table-cards')).toBeHidden();
      await expect(table.getByText(/Lona: 3 por registrar/)).toBeVisible();
      if (width < 900) {
        await expect(
          dialog.getByRole('button', { name: 'Desplazar tabla a la derecha' }),
        ).toBeVisible();
        await expect(dialog.locator('.table-frame__scroll-controls')).toBeVisible();
      }
    }
    const selectAll = dialog.getByRole('checkbox', {
      name: 'Seleccionar todas las salidas de todas las páginas',
    });
    await selectAll.check();
    const rowCheckbox = dialog.getByRole('checkbox', {
      name: 'Seleccionar salida SMA-HIST-001',
      exact: true,
    });
    await expect(rowCheckbox).toBeChecked();
    await expect(dialog.getByText('1 salida seleccionada en todas las páginas')).toBeVisible();
    await selectAll.uncheck();
    await expect(rowCheckbox).not.toBeChecked();
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
      cutoffDate: previewCutoffDate,
      deliveredAt: null,
      declaredDelivered: true,
      documents: [{ id: historicalPreview().documents[0]!.id, revision: 'a'.repeat(64) }],
    });
  });
}

test('seleccionar todo abarca todas las páginas y conserva selecciones al navegar', async ({
  page,
}) => {
  await mockIssues(page, [...issuePermissions, 'issues:reconcile']);
  const firstPage = { ...historicalPreview(), hasMore: true };
  const secondPage = {
    ...historicalPreview(),
    page: 2,
    hasMore: false,
    documents: [
      {
        ...historicalPreview().documents[0]!,
        id: ids.material,
        revision: 'b'.repeat(64),
        referenceNumber: 'SMA-HIST-002',
      },
    ],
  };
  await page.route('**/api/warehouse/historical-deliveries/materials/**', async (route) => {
    const requestUrl = new URL(route.request().url());
    const requestedPage = Number(requestUrl.searchParams.get('page') ?? 1);
    const cutoffDate = requestUrl.searchParams.get('cutoffDate') ?? '';
    return route.fulfill({
      json: {
        preview: {
          ...(requestedPage === 1 ? firstPage : secondPage),
          cutoffDate,
        },
      },
    });
  });
  await page.goto('/salidas/materiales');
  await page.getByRole('button', { name: 'Registrar entregas históricas', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Registrar entregas históricas', exact: true });
  await expect(dialog.getByLabel('Fecha y hora de corte')).toHaveCount(0);
  const selectAll = dialog.getByRole('checkbox', {
    name: 'Seleccionar todas las salidas de todas las páginas',
  });
  await expect(selectAll).toHaveCount(1);
  await selectAll.check();
  await expect(dialog.getByText('2 salidas seleccionadas en todas las páginas')).toBeVisible();
  await expect(
    dialog.getByRole('checkbox', { name: 'Seleccionar salida SMA-HIST-001', exact: true }),
  ).toBeChecked();
  await dialog.getByRole('button', { name: 'Página siguiente', exact: true }).click();
  const secondRow = dialog.getByRole('checkbox', {
    name: 'Seleccionar salida SMA-HIST-002',
    exact: true,
  });
  await expect(secondRow).toBeChecked();
  await selectAll.uncheck();
  await expect(secondRow).not.toBeChecked();
  await expect(dialog.getByText('0 salidas seleccionadas en todas las páginas')).toBeVisible();
  await dialog.getByRole('button', { name: 'Página anterior', exact: true }).click();
  const firstRow = dialog.getByRole('checkbox', {
    name: 'Seleccionar salida SMA-HIST-001',
    exact: true,
  });
  await firstRow.check();
  await dialog.getByRole('button', { name: 'Página siguiente', exact: true }).click();
  await expect(dialog.getByText('1 salida seleccionada en todas las páginas')).toBeVisible();
  await expect(secondRow).not.toBeChecked();
  await secondRow.check();
  await dialog.getByRole('button', { name: 'Página anterior', exact: true }).click();
  await expect(firstRow).toBeChecked();
  await expect(dialog.getByText('2 salidas seleccionadas en todas las páginas')).toBeVisible();
});

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
