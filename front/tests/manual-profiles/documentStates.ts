import { expect, type Page } from '@playwright/test';
import { mockPurchases } from '../e2e/purchaseFixtures.js';
import { mockIssues } from '../e2e/issueFixtures.js';
import { lookupPages, MANUAL_LOOKUP_PAGE_SIZE } from '../../scripts/manual/preparation.mjs';
import { readManualJson } from './selectPreparation.js';

import {
  DOCUMENT_STATE_CAPTURES,
  ManualExampleUnavailable,
} from '../../scripts/manual/documentCaptures.mjs';
import {
  normalizePurchaseRow,
  normalizePurchaseDocument,
} from '../../src/modules/purchases/mappers/purchaseResponseMapper.js';
import { canEditPurchase } from '../../src/modules/purchases/purchaseRules.js';
import {
  normalizeIssueRow,
  normalizeIssueDocument,
} from '../../src/modules/issues/mappers/issueResponseMapper.js';
import {
  canSupplyIssue,
  canReturnIssue,
  getIssuePendingQuantity,
  getIssueReturnableQuantity,
} from '../../src/modules/issues/issueRules.js';
import type { IssueDetail } from '../../src/modules/issues/issue.js';
import { findPreparedDocument } from '../../scripts/manual/preparation.mjs';

export { DOCUMENT_STATE_CAPTURES };
export type DocumentCapture = (typeof DOCUMENT_STATE_CAPTURES)[string];

export const mockDocumentCapture = (
  page: Page,
  permissions: readonly string[],
  capture: DocumentCapture,
  department = 'SISTEMAS',
) =>
  capture.family === 'purchases'
    ? mockPurchases(page, [...permissions], capture.state === 'canceled' ? 'canceled' : 'active')
    : mockIssues(
        page,
        [...permissions],
        capture.state === 'supply'
          ? 'Pendiente'
          : capture.state === 'partial'
            ? 'Surtido parcial'
            : capture.state === 'canceled'
              ? 'Cancelado'
              : 'Surtido',
        department,
        capture.state === 'returned' ? 1 : 0,
      );

const canSupplyDetail = (detail: IssueDetail) =>
  !detail.isOriginallySupplied && !detail.isCanceled && getIssuePendingQuantity(detail) > 0;
const canReturnDetail = (detail: IssueDetail) =>
  !detail.isCanceled && getIssueReturnableQuantity(detail) > 0;

export const openDocumentCapture = async (
  page: Page,
  capture: DocumentCapture,
  { exampleLookupTimeout = 30_000 }: { exampleLookupTimeout?: number } = {},
) => {
  const route = `/${capture.family === 'purchases' ? 'compras' : 'salidas'}/${capture.resource}`;
  await page.goto(route);
  await expect(page.locator('main h1')).toBeVisible({ timeout: 30_000 });
  const example = ['canceled', 'partial', 'returned'].includes(capture.state);
  const deadline = Date.now() + exampleLookupTimeout;
  const checkDeadline = () => {
    if (example && Date.now() >= deadline)
      throw new ManualExampleUnavailable(
        'No se encontró un ejemplo dentro del tiempo de búsqueda. Se conserva la explicación del estado en el manual.',
      );
  };
  const resource =
    capture.resource === 'materiales'
      ? 'materials'
      : capture.resource === 'consumibles'
        ? 'consumables'
        : 'wastes';
  const purchaseResource = resource === 'consumables' ? 'consumables' : 'materials';
  const endpoint = `/api/warehouse/${
    capture.family === 'purchases'
      ? `goods-receipts/${resource}`
      : resource === 'wastes'
        ? 'waste-issues'
        : `goods-issues/${resource}`
  }`;
  const matchesHeader = (row: unknown) => {
    if (capture.family === 'purchases') {
      const purchase = normalizePurchaseRow(row, purchaseResource);
      return capture.state === 'canceled'
        ? purchase.status === 'Cancelada'
        : canEditPurchase(purchase);
    }
    const issue = normalizeIssueRow(row, resource);
    if (capture.state === 'canceled') return issue.fulfillmentStatus === 'Cancelado';
    if (capture.state === 'partial')
      return canSupplyIssue(issue) && issue.fulfillmentStatus === 'Surtido parcial';
    return capture.state === 'supply' ? canSupplyIssue(issue) : canReturnIssue(issue);
  };
  let selected: { reference: string; supplyDetail?: IssueDetail } | null = null;
  for await (const rows of lookupPages(({ start }: { start: number }) => {
    checkDeadline();
    return readManualJson(page, `${endpoint}?start=${start}&length=${MANUAL_LOOKUP_PAGE_SIZE}`);
  }, endpoint)) {
    selected = await findPreparedDocument(
      rows.filter(matchesHeader),
      async (row: Record<string, unknown>) => {
        checkDeadline();
        const body = Array.isArray(row.details)
          ? null
          : await readManualJson(page, `${endpoint}/${row.id}`);
        const raw = body ? (body.goodsReceipt ?? body.goodsIssue ?? body.wasteIssue) : row;
        if (capture.family === 'purchases') {
          const doc = normalizePurchaseDocument(raw, purchaseResource);
          if (!doc.details.length) return null;
          const active = doc.details.some((detail) => detail.status === 'ACTIVE');
          const canceled = doc.details.some((detail) => detail.status === 'CANCELED');
          const matches = capture.state === 'correct' ? active : canceled;
          return matches ? { reference: doc.referenceNumber } : null;
        }
        const doc = normalizeIssueDocument(raw, resource);
        if (!doc.details.length) return null;
        const supplyDetail = doc.details.find(canSupplyDetail);
        const returnDetail = doc.details.find(canReturnDetail);
        const matches =
          capture.state === 'returned'
            ? doc.details.some((detail) => detail.returnedQuantity > 0) && !!returnDetail
            : capture.state === 'return'
              ? !!returnDetail
              : capture.state === 'supply' || capture.state === 'partial'
                ? !!supplyDetail
                : true;
        return matches ? { reference: doc.referenceNumber, supplyDetail } : null;
      },
    );
    if (selected) break;
  }
  if (!selected) {
    const descriptions = {
      canceled: 'documento cancelado',
      partial: 'salida con surtido parcial',
      returned: 'salida con devolución registrada y saldo entregado',
      correct: 'compra editable con una partida activa para corregir',
      supply: 'salida habilitada para surtir con un detalle pendiente',
      return: 'salida habilitada para devolver con saldo retornable',
    };
    const reason = `No se encontró ${descriptions[capture.state]} en ${capture.resource}.`;
    if (example) throw new ManualExampleUnavailable(reason);
    throw new Error(`Preparación pendiente: ${reason}`);
  }
  const { reference } = selected;
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
  const action =
    capture.family === 'purchases'
      ? 'Ver compra'
      : capture.state === 'supply'
        ? 'Surtir detalle'
        : capture.state === 'return'
          ? 'Devolver material surtido'
          : 'Consultar salida';
  const row = page
    .getByRole('row')
    .filter({ has: page.getByRole('cell', { name: reference, exact: true }) });
  await row.getByRole('button', { name: action, exact: true }).click();
  await expect(page.getByRole('dialog', { name: /^Cargando (compra|salida)/ })).toHaveCount(0, {
    timeout: 60_000,
  });
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  if (capture.family === 'purchases') {
    const totals = dialog.getByLabel('Totales de compra', { exact: true });
    await totals.evaluate((element) => element.scrollIntoView({ block: 'end' }));
    await expect(totals.locator('dd').last()).toBeInViewport();
  } else if (!['supply', 'return'].includes(capture.state)) {
    await expect(
      dialog.getByRole('columnheader', { name: 'Estado del detalle', exact: true }),
    ).toBeVisible();
  }
  return selected;
};
