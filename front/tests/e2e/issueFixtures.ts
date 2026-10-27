import type { Page } from '@playwright/test';
import { mockWarehouse } from './warehouseFixtures.js';
import { issueFor, issuePermissions, departmentId } from '../fixtures/issues.js';
import { material, waste, pageOf } from '../fixtures/inventory.js';
import { clientData, personData } from '../fixtures/records.js';

export const mockIssues = async (
  page: Page,
  permissions = issuePermissions,
  state = 'Pendiente',
  departmentName = 'SISTEMAS',
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
    if (state === 'Surtido') {
      doc.details[0]!.isSupplied = true;
      doc.details[0]!.suppliedQuantity = '2';
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
    route.fulfill({ json: pageOf([{ id: departmentId, name: 'Pendiente' }]) }),
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
        doc.fulfillmentStatus.name = 'Surtido';
        doc.details[0]!.isSupplied = true;
        doc.details[0]!.suppliedQuantity = '2';
      }
      if (url.pathname.endsWith('/returns'))
        doc.details[0]!.returnedQuantity = String(data.returnQuantity);
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
  await page.route('**/api/warehouse/reports/**/excel?**', (route) => {
    reports.push(new URL(route.request().url()));
    return route.fulfill({
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: 'mock-excel',
    });
  });
  return { reads, reports, writes };
};
