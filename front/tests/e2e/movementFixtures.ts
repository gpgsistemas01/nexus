import type { Page } from '@playwright/test';
import { mockWarehouse } from './warehouseFixtures.js';
import { movement } from '../fixtures/movements.js';
import { pageOf } from '../fixtures/inventory.js';
export const mockMovements = async (
  page: Page,
  permissions = [
    'movements:read',
    'admin:reports-read',
    'suppliers:read',
    'materials:read',
    'wastes:read',
  ],
) => {
  await mockWarehouse(page, permissions);
  const reads: URL[] = [];
  const reports: URL[] = [];
  await page.route('**/api/admin/movements/**', (route) => {
    const url = new URL(route.request().url());
    reads.push(url);
    const start = Number(url.searchParams.get('start') || 0);
    const length = Number(url.searchParams.get('length') || 10);
    const rows = Array.from({ length: 21 }, (_, index) => ({
      ...movement,
      id: `movement-${index}`,
      referenceNumber: `SAL-${String(index + 1).padStart(3, '0')}`,
    }));
    return route.fulfill({
      json: { ...pageOf(rows.slice(start, start + length)), recordsTotal: 21, recordsFiltered: 21 },
    });
  });
  await page.route('**/api/admin/reports/movements/**', (route) => {
    reports.push(new URL(route.request().url()));
    return route.fulfill({
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: 'mock-excel',
    });
  });
  return { reads, reports };
};
