import { access, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { captureRecipe } from '../manual-profiles/captureRecipes.js';
import { mockWarehouse } from './warehouseFixtures.js';
import { ids, template, user } from '../fixtures/inventory.js';
import { purchase } from '../fixtures/purchases.js';
import { issueFor, issue } from '../fixtures/issues.js';
import { PERMISSIONS } from '@nexus/permissions';
import { DOCUMENT_STATE_CAPTURES, mockDocumentCapture } from '../manual-profiles/documentStates.js';
import { mockIssues } from './issueFixtures.js';

const supplierWithRoll = '99999999-9999-4999-8999-999999999999';
const roots: string[] = [];
const destination = async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'nexus-manual-capture-'));
  roots.push(root);
  await mkdir(path.join(root, 'images'));
  return root;
};
test.afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const prepareCatalogs = async (page: Page, hasRoll: boolean, status = 200) => {
  await mockWarehouse(page);
  const writes: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/') && request.method() !== 'GET')
      writes.push(request.method());
  });
  await page.route('**/api/warehouse/suppliers?**', (route) => {
    const query = new URL(route.request().url()).searchParams;
    const data = [
      { id: ids.supplier, tradeName: 'Proveedor sin rollos', isActive: true },
      { id: supplierWithRoll, tradeName: 'Proveedor de rollos', isActive: true },
    ].filter(({ tradeName }) => tradeName.includes(query.get('search') || ''));
    return route.fulfill({
      json: { data, recordsFiltered: data.length, recordsTotal: data.length },
    });
  });
  await page.route('**/api/warehouse/wastes/material-templates?**', (route) => {
    if (status !== 200) return route.fulfill({ status, json: {} });
    const query = new URL(route.request().url()).searchParams;
    const pieces = Array.from({ length: 20 }, (_, index) => ({
      ...template,
      id: `pieza-${index}`,
      name: `Pieza ${index}`,
      presentation: { ...template.presentation, name: 'PLIEGO' },
    }));
    const all =
      query.get('supplierId') === supplierWithRoll && hasRoll ? [...pieces, template] : pieces;
    const matching = all.filter(({ name }) => name.includes(query.get('search') || ''));
    const start = Number(query.get('start') || 0);
    const length = Number(query.get('length') || 20);
    return route.fulfill({
      json: {
        data: matching.slice(start, start + length),
        recordsFiltered: matching.length,
        recordsTotal: matching.length,
      },
    });
  });
  return writes;
};

test('manual: captura Mermas en orden con otro proveedor y un ROLLO de la segunda página', async ({
  context,
}) => {
  const root = await destination();
  for (const filename of [
    '09-waste-create.png',
    '09a-waste-measurements.png',
    '09b-waste-stock.png',
  ]) {
    const page = await context.newPage();
    const writes = await prepareCatalogs(page, true);
    await captureRecipe(page, filename, root, user);
    await expect(page.getByRole('combobox', { name: 'Proveedor', exact: true })).toHaveValue(
      'Proveedor de rollos',
    );
    await expect(
      page.getByRole('combobox', { name: 'Material de referencia del proveedor', exact: true }),
    ).toHaveValue('Lona · ROLLO · 2 × 50');
    await access(path.join(root, 'images', filename));
    expect(writes).toEqual([]);
    await page.close();
  }
});

test('manual: informa la preparación pendiente cuando no existe ROLLO y no genera una imagen falsa', async ({
  page,
}) => {
  const root = await destination();
  const writes = await prepareCatalogs(page, false);
  await expect(captureRecipe(page, '09-waste-create.png', root, user)).rejects.toThrow(
    'proveedor activo con un material ROLLO',
  );
  await expect(access(path.join(root, 'images/09-waste-create.png'))).rejects.toMatchObject({
    code: 'ENOENT',
  });
  expect(writes).toEqual([]);
});

test('manual: una consulta fallida se informa como HTTP y no como ausencia de materiales', async ({
  page,
}) => {
  const root = await destination();
  const writes = await prepareCatalogs(page, true, 503);
  await expect(captureRecipe(page, '09-waste-create.png', root, user)).rejects.toThrow('HTTP 503');
  await expect(access(path.join(root, 'images/09-waste-create.png'))).rejects.toMatchObject({
    code: 'ENOENT',
  });
  expect(writes).toEqual([]);
});

const documentId = (index: number) =>
  `90000000-0000-4000-8000-${(index + 1).toString(16).padStart(12, '0')}`;
const operator = { ...user, permissions: Object.values(PERMISSIONS) };

const serveDocuments = async (
  page: Page,
  endpoint: string,
  documents: { id: string; referenceNumber: string; details: unknown[] }[],
  key: string,
) => {
  const reads: URL[] = [];
  const writes: string[] = [];
  await page.route(`${endpoint}**`, async (route) => {
    const request = route.request();
    if (request.method() !== 'GET') {
      writes.push(request.method());
      return route.abort('blockedbyclient');
    }
    const url = new URL(request.url());
    reads.push(url);
    if (url.pathname === endpoint) {
      const search = url.searchParams.get('search') || '';
      const filtered = documents.filter((document) => document.referenceNumber.includes(search));
      const start = Number(url.searchParams.get('start') || 0);
      const length = Number(url.searchParams.get('length') || 10);
      if (search) await new Promise((resolve) => setTimeout(resolve, 150));
      return route.fulfill({
        json: {
          data: filtered.slice(start, start + length).map((document) => {
            const row: Record<string, unknown> = { ...document };
            delete row.details;
            return row;
          }),
          recordsTotal: documents.length,
          recordsFiltered: filtered.length,
        },
      });
    }
    const document = documents.find((item) => url.pathname === `${endpoint}/${item.id}`);
    return document
      ? route.fulfill({ json: { [key]: document } })
      : route.fulfill({ status: 404, json: {} });
  });
  return { reads, writes };
};

for (const filename of [
  '20a-purchase-mixed.png',
  '20d-purchase-canceled.png',
  '24c-issue-partial.png',
  '25a-issue-partial-return.png',
]) {
  test(`manual: encuentra ${filename} después de la primera página y abre el folio correcto`, async ({
    page,
  }) => {
    const root = await destination();
    const capture = DOCUMENT_STATE_CAPTURES[filename]!;
    await mockDocumentCapture(page, operator.permissions, capture);
    const resource =
      capture.resource === 'materiales'
        ? 'materials'
        : capture.resource === 'consumibles'
          ? 'consumables'
          : 'wastes';
    const endpoint =
      capture.family === 'purchases'
        ? `/api/warehouse/goods-receipts/${resource}`
        : resource === 'wastes'
          ? '/api/warehouse/waste-issues'
          : `/api/warehouse/goods-issues/${resource}`;
    const documents = Array.from({ length: 22 }, (_, index) => {
      if (capture.family === 'purchases') {
        const doc = structuredClone(purchase);
        doc.id = documentId(index);
        doc.referenceNumber = `COM-${index + 1}`;
        doc.type = resource === 'materials' ? 'MATERIAL' : 'CONSUMABLE';
        doc.details[0]!.material.type = doc.type;
        if (index === 21) {
          if (capture.state === 'mixed')
            doc.details.push({
              ...structuredClone(doc.details[0]!),
              id: documentId(100),
              status: 'CANCELED',
            });
          else {
            doc.status.name = 'Cancelada';
            doc.details[0]!.status = 'CANCELED';
          }
        }
        return doc;
      }
      const doc = issueFor(resource as 'materials' | 'consumables' | 'wastes');
      doc.id = documentId(index);
      doc.referenceNumber = `SAL-${index + 1}`;
      if (capture.state === 'returned') {
        doc.fulfillmentStatus.name = 'Surtido';
        doc.details[0]!.fulfillmentStatus.name = 'Surtido';
        doc.details[0]!.isSupplied = true;
        doc.details[0]!.suppliedQuantity = '2';
        doc.details[0]!.returnedQuantity = index === 21 ? '1' : '2';
      } else if (index === 21) {
        doc.fulfillmentStatus.name = 'Surtido parcial';
        doc.details[0]!.fulfillmentStatus.name = 'Surtido parcial';
        doc.details[0]!.suppliedQuantity = '1';
      }
      return doc;
    });
    const key =
      capture.family === 'purchases'
        ? 'goodsReceipt'
        : resource === 'wastes'
          ? 'wasteIssue'
          : 'goodsIssue';
    const { reads, writes } = await serveDocuments(page, endpoint, documents, key);
    await captureRecipe(page, filename, root, operator);
    expect(reads.some((url) => url.searchParams.get('start') === '20')).toBe(true);
    expect(reads.filter((url) => url.pathname !== endpoint).at(-1)?.pathname).toBe(
      `${endpoint}/${documentId(21)}`,
    );
    await access(path.join(root, 'images', filename));
    expect(writes).toEqual([]);
  });
}

for (const mode of ['supply', 'return'] as const) {
  test(`manual: ${mode} elige un documento posterior y un detalle disponible de otra página`, async ({
    page,
  }) => {
    const root = await destination();
    await mockIssues(page, operator.permissions);
    const doc = structuredClone(issue);
    doc.fulfillmentStatus.name = mode === 'supply' ? 'Surtido parcial' : 'Surtido';
    doc.details = Array.from({ length: 11 }, (_, index) => ({
      ...structuredClone(doc.details[0]!),
      id: documentId(100 + index),
      materialName: index === 10 ? 'Detalle disponible' : `Detalle terminado ${index}`,
      quantity: index === 10 && mode === 'supply' ? '0.25' : '2',
      suppliedQuantity: index === 10 && mode === 'supply' ? '0' : '2',
      returnedQuantity: mode === 'return' ? (index === 10 ? '1' : '2') : '0',
      isSupplied: index !== 10 || mode === 'return',
      fulfillmentStatus: { name: index === 10 && mode === 'supply' ? 'Pendiente' : 'Surtido' },
    }));
    const documents = Array.from({ length: 22 }, (_, index) => ({
      ...structuredClone(doc),
      id: documentId(index),
      referenceNumber: `SAL-${index + 1}`,
      status: { name: index === 21 ? 'Aprobada' : 'Cancelada' },
      fulfillmentStatus: { name: index === 21 ? doc.fulfillmentStatus.name : 'Cancelado' },
    }));
    const { writes } = await serveDocuments(
      page,
      '/api/warehouse/goods-issues/materials',
      documents,
      'goodsIssue',
    );
    await captureRecipe(
      page,
      mode === 'supply' ? '24-issue-supply.png' : '25-issue-return.png',
      root,
      operator,
    );
    if (mode === 'supply')
      await expect(
        page.getByRole('spinbutton', {
          name: 'Cantidad a surtir: Detalle disponible',
          exact: true,
        }),
      ).toHaveValue('0.25');
    else
      await expect(
        page.getByRole('dialog', { name: 'Devolver detalle de salida', exact: true }),
      ).toContainText('Material a devolver: Detalle disponible');
    expect(writes).toEqual([]);
  });
}
