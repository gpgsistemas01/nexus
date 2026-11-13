import type { Page } from '@playwright/test';
import { mockWarehouse } from './warehouseFixtures.js';
import { issueFor, issuePermissions, departmentId } from '../fixtures/issues.js';
import { material, waste, pageOf } from '../fixtures/inventory.js';
import { historicalPreview } from '../fixtures/historicalDelivery.js';
import { clientData, personData } from '../fixtures/records.js';

export const mockIssues = async (
  page: Page,
  permissions = issuePermissions,
  state = 'Pendiente',
  departmentName = 'SISTEMAS',
  returnedQuantity = 0,
) => {
  await mockWarehouse(page, permissions);
  const reads: URL[] = [];
  const reports: URL[] = [];
  const writes: { url: URL; method: string; data: Record<string, unknown> }[] = [];
  const docs = {
    materials: issueFor('materials'),
    consumables: issueFor('consumables'),
    wastes: issueFor('wastes'),
  };
  for (const doc of Object.values(docs)) {
    doc.departmentName = departmentName;
    doc.fulfillmentStatus.name = state;
    if (state === 'Surtido' || state === 'Cancelado') {
      doc.details[0]!.isSupplied = true;
      doc.details[0]!.suppliedQuantity = '2';
      doc.details[0]!.returnedQuantity = state === 'Cancelado' ? '2' : String(returnedQuantity);
      doc.details[0]!.fulfillmentStatus.name = state;
      if (state === 'Cancelado') doc.status.name = 'Cancelada';
    } else if (state === 'Surtido parcial') {
      doc.details[0]!.suppliedQuantity = '1';
      doc.details[0]!.fulfillmentStatus.name = state;
    }
  }
  await page.route('**/api/sales/clients?**', (route) =>
    route.fulfill({ json: pageOf([clientData]) }),
  );
  await page.route('**/api/admin/departments?**', (route) =>
    route.fulfill({ json: pageOf([{ id: departmentId, name: departmentName }]) }),
  );
  await page.route('**/api/admin/persons?**', (route) =>
    route.fulfill({ json: pageOf([personData]) }),
  );
  await page.route('**/api/warehouse/fulfillment-statuses?**', (route) =>
    route.fulfill({
      json: pageOf(
        ['Pendiente', 'Surtido parcial', 'Surtido', 'Cancelado'].map((name, index) => ({
          id: index ? `${departmentId.slice(0, -1)}${index + 1}` : departmentId,
          name,
        })),
      ),
    }),
  );
  await page.route(/\/api\/warehouse\/(materials|consumables|wastes)\?/, (route) => {
    const resource = new URL(route.request().url()).pathname.split('/').pop();
    return route.fulfill({
      json: pageOf<Record<string, unknown>>(
        resource === 'wastes'
          ? [waste]
          : [
              {
                ...material,
                material: {
                  ...material.material,
                },
              },
            ],
      ),
    });
  });
  await page.route(
    /\/api\/warehouse\/(goods-issues\/(materials|consumables)|waste-issues)(\/|\?|$)/,
    (route) => {
      const req = route.request();
      const url = new URL(req.url());
      const resource = url.pathname.includes('waste-issues')
        ? 'wastes'
        : url.pathname.includes('/consumables')
          ? 'consumables'
          : 'materials';
      const doc = docs[resource];
      const endpoint =
        resource === 'wastes'
          ? '/api/warehouse/waste-issues'
          : `/api/warehouse/goods-issues/${resource}`;
      if (req.method() === 'GET') {
        reads.push(url);
        return route.fulfill({
          json:
            url.pathname === endpoint
              ? pageOf([doc])
              : { [resource === 'wastes' ? 'wasteIssue' : 'goodsIssue']: doc },
        });
      }
      const data = req.postDataJSON() as Record<string, unknown>;
      writes.push({ url, method: req.method(), data });
      if (url.pathname.endsWith('/details')) {
        for (const change of data.details as {
          id: string;
          quantityToSupply: number;
          projectConvertedQuantity: number;
        }[]) {
          const line = doc.details.find((row) => row.id === change.id)!;
          line.suppliedQuantity = String(Number(line.suppliedQuantity) + change.quantityToSupply);
          line.isSupplied = Number(line.suppliedQuantity) >= Number(line.quantity);
          line.projectConvertedQuantity = String(change.projectConvertedQuantity);
          line.fulfillmentStatus.name = line.isSupplied ? 'Surtido' : 'Surtido parcial';
        }
        doc.fulfillmentStatus.name = doc.details.every((row) => row.isSupplied)
          ? 'Surtido'
          : 'Surtido parcial';
      }
      if (url.pathname.endsWith('/returns')) {
        const line = doc.details.find((detail) => url.pathname.includes(`/details/${detail.id}/`))!;
        line.returnedQuantity = String(Number(line.returnedQuantity) + Number(data.returnQuantity));
        if (Number(line.returnedQuantity) >= Number(line.suppliedQuantity))
          line.fulfillmentStatus.name = 'Cancelado';
        if (doc.details.every((detail) => detail.fulfillmentStatus.name === 'Cancelado')) {
          doc.fulfillmentStatus.name = 'Cancelado';
          doc.status.name = 'Cancelada';
        }
      }
      const code =
        resource === 'wastes'
          ? req.method() === 'POST'
            ? 'CREATED_WASTE_ISSUE'
            : 'UPDATED_WASTE_ISSUE'
          : req.method() === 'POST'
            ? 'CREATED_GOODS_ISSUE'
            : 'UPDATED_GOODS_ISSUE';
      return route.fulfill({ json: { code } });
    },
  );
  for (const [resource, prefix] of [
    ['materials', 'SMA'],
    ['consumables', 'SCO'],
    ['wastes', 'SME'],
  ]) {
    await page.route(`**/api/warehouse/historical-deliveries/${resource}/preview?**`, (route) => {
      const query = new URL(route.request().url()).searchParams;
      const candidate = historicalPreview();
      return route.fulfill({
        json: {
          preview: {
            ...candidate,
            resource,
            cutoffDate: query.get('cutoffDate'),
            page: Number(query.get('page') ?? 1),
            documents: candidate.documents.map((item) => ({
              ...item,
              referenceNumber: `${prefix}-2026-001`,
              departmentName,
            })),
          },
        },
      });
    });
  }
  await page.route('**/api/warehouse/reports/**/excel?**', (route) => {
    reports.push(new URL(route.request().url()));
    return route.fulfill({
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: 'mock-excel',
    });
  });
  return { reads, reports, writes, docs };
};
