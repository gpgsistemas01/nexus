import { expect, test } from '@playwright/test';
import { mockIssues } from './issueFixtures.js';
import { mockPurchases } from './purchaseFixtures.js';
import { issueFor } from '../fixtures/issues.js';
import { purchase } from '../fixtures/purchases.js';

const scenarios = [
  ...(['materials', 'consumables'] as const).map((resource) => ({
    name: `salidas ${resource}`,
    path: `/salidas/${resource === 'materials' ? 'materiales' : 'consumibles'}`,
    setup: mockIssues,
    source: issueFor(resource),
    responseKey: 'goodsIssue',
    endpoint: `/api/warehouse/goods-issues/${resource}/${issueFor(resource).id}`,
    openLabel: 'Consultar salida',
    loadingLabel: 'Cargando salida…',
    viewTitle: 'Consultar salida - Folio SAL-001',
    createLabel: 'Nueva salida',
    createTitle: 'Registrar salida',
  })),
  {
    name: 'compras materiales',
    path: '/compras/materiales',
    setup: mockPurchases,
    source: purchase,
    responseKey: 'goodsReceipt',
    endpoint: `/api/warehouse/goods-receipts/materials/${purchase.id}`,
    openLabel: 'Ver compra',
    loadingLabel: 'Cargando compra…',
    viewTitle: 'Ver compra - Folio COM-001',
    createLabel: 'Nueva compra',
    createTitle: 'Registrar compra',
  },
];

for (const scenario of scenarios) {
  test(`${scenario.name}: la carga bloquea el fondo y cancelar impide abrir una respuesta tardía`, async ({
    page,
  }) => {
    const { writes } = await scenario.setup(page);
    let release!: () => void;
    let hasFinished = false;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(`**${scenario.endpoint}`, async (route) => {
      await pending;
      await route.fulfill({ json: { [scenario.responseKey]: scenario.source } });
      hasFinished = true;
    });
    await page.goto(scenario.path);
    await page.getByRole('button', { name: scenario.openLabel, exact: true }).first().click();
    const loading = page.getByRole('dialog', { name: scenario.loadingLabel, exact: true });
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute('aria-modal', 'true');
    await expect(loading.getByRole('progressbar')).toBeVisible();
    await loading.screenshot({ path: test.info().outputPath('document-read-loading.png') });
    await page.keyboard.press('Escape');
    await expect(loading).toBeVisible();
    await loading.getByRole('button', { name: 'Cancelar consulta', exact: true }).click();
    await expect(loading).toBeHidden();
    await page.getByRole('button', { name: scenario.createLabel, exact: true }).click();
    release();
    await expect.poll(() => hasFinished).toBe(true);
    await expect(
      page.getByRole('dialog', { name: scenario.createTitle, exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('dialog', { name: scenario.viewTitle, exact: true })).toHaveCount(
      0,
    );
    expect(writes).toHaveLength(0);
  });

  test(`${scenario.name}: una respuesta incompleta mantiene el diálogo hasta reintentar o cancelar`, async ({
    page,
  }) => {
    const { writes } = await scenario.setup(page);
    let isValid = false;
    let attempts = 0;
    await page.route(`**${scenario.endpoint}`, (route) => {
      attempts++;
      const source = isValid
        ? scenario.source
        : {
            ...scenario.source,
            details: [{ ...scenario.source.details[0], quantity: 'dato-invalido' }],
          };
      return route.fulfill({ json: { [scenario.responseKey]: source } });
    });
    await page.goto(scenario.path);
    await page.getByRole('button', { name: scenario.openLabel, exact: true }).first().click();
    const error = page.getByRole('dialog', {
      name: 'No se pudo completar la consulta',
      exact: true,
    });
    await expect(error).toBeVisible();
    await expect(error.getByRole('alert')).toBeVisible();
    await error.screenshot({ path: test.info().outputPath('document-read-error.png') });
    expect(attempts).toBe(1);
    await page.keyboard.press('Escape');
    await expect(error).toBeVisible();
    isValid = true;
    await error.getByRole('button', { name: 'Reintentar consulta', exact: true }).click();
    await expect(page.getByRole('dialog', { name: scenario.viewTitle, exact: true })).toBeVisible();
    expect(attempts).toBe(2);
    expect(writes).toHaveLength(0);
  });
}

for (const [action, state, title] of [
  ['Editar salida', 'Pendiente', 'Editar salida - Folio SAL-001'],
  ['Surtir detalle', 'Pendiente', 'Surtir salida - Folio SAL-001'],
  ['Devolver material surtido', 'Surtido', 'Devolver salida - Folio SAL-001'],
] as const) {
  test(`salidas: ${action} comparte la lectura y el reintento antes de abrir`, async ({ page }) => {
    const { writes } = await mockIssues(page, undefined, state);
    let isAvailable = false;
    let attempts = 0;
    await page.route(
      `**/api/warehouse/goods-issues/materials/${issueFor('materials').id}`,
      (route) => {
        attempts++;
        return isAvailable
          ? route.fallback()
          : route.fulfill({ status: 500, json: { code: 'SERVER_ERROR' } });
      },
    );
    await page.goto('/salidas/materiales');
    await page.getByRole('button', { name: action, exact: true }).click();
    const error = page.getByRole('dialog', {
      name: 'No se pudo completar la consulta',
      exact: true,
    });
    await expect(error).toBeVisible();
    await expect(page.getByRole('dialog', { name: title, exact: true })).toHaveCount(0);
    isAvailable = true;
    await error.getByRole('button', { name: 'Reintentar consulta', exact: true }).click();
    await expect(page.getByRole('dialog', { name: title, exact: true })).toBeVisible();
    expect(attempts).toBe(2);
    expect(writes).toHaveLength(0);
  });
}

test('compra: editar consulta el documento antes de abrir y conserva el reintento', async ({
  page,
}) => {
  const { writes } = await mockPurchases(page);
  let isAvailable = false;
  await page.route(`**/api/warehouse/goods-receipts/materials/${purchase.id}`, (route) =>
    isAvailable ? route.fallback() : route.fulfill({ status: 500, json: {} }),
  );
  await page.goto('/compras/materiales');
  await page.getByRole('button', { name: 'Editar compra', exact: true }).first().click();
  const error = page.getByRole('dialog', { name: 'No se pudo completar la consulta', exact: true });
  await expect(error).toBeVisible();
  isAvailable = true;
  await error.getByRole('button', { name: 'Reintentar consulta', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Editar compra - Folio COM-001', exact: true }),
  ).toBeVisible();
  expect(writes).toHaveLength(0);
});

test('salida eliminada: informa el rechazo sin ofrecer reintentar el mismo ID', async ({
  page,
}) => {
  const { writes } = await mockIssues(page);
  let attempts = 0;
  await page.route(
    `**/api/warehouse/goods-issues/materials/${issueFor('materials').id}`,
    (route) => {
      attempts++;
      return route.fulfill({ status: 404, json: {} });
    },
  );
  await page.goto('/salidas/materiales');
  await page.getByRole('button', { name: 'Consultar salida', exact: true }).click();
  const error = page.getByRole('dialog', { name: 'No se pudo completar la consulta', exact: true });
  await expect(error).toBeVisible();
  await expect(error.getByRole('button', { name: 'Reintentar consulta', exact: true })).toHaveCount(
    0,
  );
  await error.getByRole('button', { name: 'Cancelar consulta', exact: true }).click();
  await expect(error).toBeHidden();
  expect(attempts).toBe(1);
  expect(writes).toHaveLength(0);
});
