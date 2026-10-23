import type { Page } from '@playwright/test';
import { mockWarehouse } from './warehouseFixtures.js';
import { purchase, purchaseItem, purchasePermissions } from '../fixtures/purchases.js';
import { pageOf } from '../fixtures/inventory.js';
import { personData, supplierData } from '../fixtures/records.js';

export const mockPurchases = async (page: Page, permissions = purchasePermissions) => {
  await mockWarehouse(page, permissions);
  const reads: URL[] = [];
  const reports: URL[] = [];
  const writes: { url: URL; method: string; data: Record<string, unknown> | null }[] = [];
  let current = structuredClone(purchase);
  await page.route('**/api/admin/persons?**', (route) =>
    route.fulfill({ json: pageOf([personData]) }),
  );
  await page.route('**/api/warehouse/suppliers?**', (route) =>
    route.fulfill({ json: pageOf([supplierData]) }),
  );
  await page.route(/\/api\/warehouse\/(materials|consumables)\?/, (route) => {
    const type = route.request().url().includes('/consumables') ? 'CONSUMABLE' : 'MATERIAL';
    return route.fulfill({
      json: pageOf([{ ...purchaseItem, material: { ...purchaseItem.material, type } }]),
    });
  });
  await page.route('**/api/warehouse/goods-receipts/**', (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const resource = url.pathname.includes('/consumables') ? 'consumables' : 'materials';
    const context = () => ({
      ...current,
      type: resource === 'materials' ? 'MATERIAL' : 'CONSUMABLE',
      details: current.details.map((line) => ({
        ...line,
        material: { ...line.material, type: resource === 'materials' ? 'MATERIAL' : 'CONSUMABLE' },
      })),
    });
    if (req.method() === 'GET') {
      reads.push(url);
      if (url.pathname.endsWith(`/${resource}`)) {
        const start = Number(url.searchParams.get('start') || 0);
        const length = Number(url.searchParams.get('length') || 10);
        const rows = Array.from({ length: 21 }, (_, index) => ({
          ...context(),
          referenceNumber: `COM-${String(index + 1).padStart(3, '0')}`,
        }));
        return route.fulfill({
          json: {
            ...pageOf(rows.slice(start, start + length)),
            recordsTotal: 21,
            recordsFiltered: 21,
          },
        });
      }
      return route.fulfill({ json: { goodsReceipt: context() } });
    }
    const data = req.postData() ? (req.postDataJSON() as Record<string, unknown>) : null;
    writes.push({ url, method: req.method(), data });
    if (url.pathname.endsWith('/cancel')) {
      current.details[0]!.status = 'CANCELED';
      current.status.name = 'Cancelada';
      current.totalQuantity = '0';
      current.totalNetPurchaseAmount = '0';
      current.totalGrossPurchaseAmount = '0';
    } else if (url.pathname.endsWith('/corrections')) {
      current.details[0]!.quantity = String(data!.quantity);
      current.details[0]!.costPerUnitType = String(data!.costPerUnitType);
    } else if (req.method() === 'PATCH') {
      current = { ...current, ...data } as typeof current;
    }
    return route.fulfill({
      json: {
        code: req.method() === 'POST' ? 'CREATED_GOODS_RECEIPT' : 'UPDATED_GOODS_RECEIPT',
        goodsReceipt: context(),
      },
    });
  });
  await page.route('**/api/warehouse/reports/goods-receipts/**', (route) => {
    reports.push(new URL(route.request().url()));
    return route.fulfill({
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: 'mock-excel',
    });
  });
  return { reads, reports, writes };
};
