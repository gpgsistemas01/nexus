import { expect, type Page } from '@playwright/test';
import { mockPurchases } from '../e2e/purchaseFixtures.js';
import { mockIssues } from '../e2e/issueFixtures.js';
import { lookupPages, MANUAL_LOOKUP_PAGE_SIZE } from '../../scripts/manual/preparation.mjs';
import { readManualJson } from './selectPreparation.js';

export interface DocumentCapture {
  family: 'purchases' | 'issues';
  resource: 'materiales' | 'consumibles' | 'mermas';
  state: 'mixed' | 'canceled' | 'partial' | 'returned';
}

export const DOCUMENT_STATE_CAPTURES: Record<string, DocumentCapture> = {};
for (const [index, resource] of ['materiales', 'consumibles'].entries()) {
  DOCUMENT_STATE_CAPTURES[`20${index ? 'b' : 'a'}-purchase-mixed.png`] = {
    family: 'purchases',
    resource: resource as 'materiales' | 'consumibles',
    state: 'mixed',
  };
  DOCUMENT_STATE_CAPTURES[`20${index ? 'd' : 'c'}-purchase-canceled.png`] = {
    family: 'purchases',
    resource: resource as 'materiales' | 'consumibles',
    state: 'canceled',
  };
}
for (const [index, resource] of (['materiales', 'consumibles', 'mermas'] as const).entries()) {
  const letter = String.fromCharCode(97 + index);
  DOCUMENT_STATE_CAPTURES[`24${letter}-issue-partial.png`] = {
    family: 'issues',
    resource,
    state: 'partial',
  };
  DOCUMENT_STATE_CAPTURES[`25${letter}-issue-partial-return.png`] = {
    family: 'issues',
    resource,
    state: 'returned',
  };
  DOCUMENT_STATE_CAPTURES[`25${String.fromCharCode(100 + index)}-issue-canceled.png`] = {
    family: 'issues',
    resource,
    state: 'canceled',
  };
}

export const mockDocumentCapture = (
  page: Page,
  permissions: readonly string[],
  capture: DocumentCapture,
  department = 'SISTEMAS',
) =>
  capture.family === 'purchases'
    ? mockPurchases(page, [...permissions], capture.state as 'mixed' | 'canceled')
    : mockIssues(
        page,
        [...permissions],
        capture.state === 'partial'
          ? 'Surtido parcial'
          : capture.state === 'canceled'
            ? 'Cancelado'
            : 'Surtido',
        department,
        capture.state === 'returned' ? 1 : 0,
      );

export const openDocumentCapture = async (page: Page, capture: DocumentCapture) => {
  const route = `/${capture.family === 'purchases' ? 'compras' : 'salidas'}/${capture.resource}`;
  await page.goto(route);
  await expect(page.locator('main h1')).toBeVisible({ timeout: 30_000 });
  const resource =
    capture.resource === 'materiales'
      ? 'materials'
      : capture.resource === 'consumibles'
        ? 'consumables'
        : 'wastes';
  const endpoint = `/api/warehouse/${capture.family === 'purchases' ? `goods-receipts/${resource}` : resource === 'wastes' ? 'waste-issues' : `goods-issues/${resource}`}`;
  const state =
    capture.state === 'partial'
      ? 'Surtido parcial'
      : capture.state === 'returned'
        ? 'Surtido'
        : capture.state === 'canceled'
          ? capture.family === 'purchases'
            ? 'Cancelada'
            : 'Cancelado'
          : 'Confirmada';
  let reference = '';
  for await (const rows of lookupPages(
    ({ start }: { start: number }) =>
      readManualJson(page, `${endpoint}?start=${start}&length=${MANUAL_LOOKUP_PAGE_SIZE}`),
    endpoint,
  )) {
    for (const row of rows) {
      if (
        (capture.family === 'purchases' ? row.status?.name : row.fulfillmentStatus?.name) !== state
      )
        continue;
      const body = await readManualJson(page, `${endpoint}/${row.id}`);
      const doc = body.goodsReceipt ?? body.goodsIssue ?? body.wasteIssue;
      if (!doc?.details?.length) continue;
      const matches =
        capture.state === 'mixed'
          ? doc.details.some((d: { status: string }) => d.status === 'ACTIVE') &&
            doc.details.some((d: { status: string }) => d.status === 'CANCELED')
          : capture.state === 'returned'
            ? doc.details.some(
                (d: { returnedQuantity: unknown; suppliedQuantity: unknown }) =>
                  Number(d.returnedQuantity) > 0 &&
                  Number(d.returnedQuantity) < Number(d.suppliedQuantity),
              )
            : true;
      if (matches) {
        reference = row.referenceNumber;
        break;
      }
    }
    if (reference) break;
  }
  if (!reference) {
    const description =
      capture.state === 'mixed'
        ? 'una compra Confirmada con al menos una partida activa y otra cancelada'
        : capture.state === 'returned'
          ? 'una salida Surtida con un detalle parcialmente devuelto'
          : `un documento con estado ${state} y detalles existentes`;
    throw new Error(
      `Preparación pendiente en ${capture.resource}: se requiere ${description}. Se revisaron las páginas disponibles; no se crean registros para la captura.`,
    );
  }
  if (capture.family === 'issues') {
    await page.getByRole('combobox', { name: 'Estado de surtido', exact: true }).click();
    await page.getByRole('option', { name: state, exact: true }).click();
  }
  await page.getByRole('textbox', { name: /Buscar por Folio/ }).fill(reference);
  await Promise.all([
    page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        response.request().method() === 'GET' &&
        url.pathname === endpoint &&
        url.searchParams.get('search') === reference
      );
    }),
    page.getByRole('button', { name: 'Buscar', exact: true }).click(),
  ]);
  await expect(page.locator('.v-data-table__progress .v-progress-linear')).toHaveCount(0);
  const action = capture.family === 'purchases' ? 'Ver compra' : 'Consultar salida';
  const row = page
    .getByRole('row')
    .filter({ has: page.getByRole('cell', { name: reference, exact: true }) });
  await row.getByRole('button', { name: action, exact: true }).click();
  await expect(page.getByRole('dialog', { name: /^Cargando (compra|salida)/ })).toHaveCount(0, {
    timeout: 60_000,
  });
  await expect(
    page.getByRole('heading', { name: /Consulta de|Consultar|Compra|Salida/, exact: false }).last(),
  ).toBeVisible();
  if (capture.family === 'purchases') {
    const totals = page.getByLabel('Totales de compra', { exact: true });
    await totals.evaluate((element) => element.scrollIntoView({ block: 'end' }));
    await expect(totals.locator('dd').last()).toBeInViewport();
  } else {
    await expect(
      page.getByRole('columnheader', { name: 'Estado del detalle', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('cell', { name: state, exact: true }).last()).toBeVisible();
  }
};
