import type { Page } from '@playwright/test';
import { mockWarehouse } from './warehouseFixtures.js';
import { user } from '../fixtures/inventory.js';
export const catalogs = [
  { name: 'departments', label: 'Áreas', create: 'Nueva área', entity: 'área' },
  { name: 'roles', label: 'Roles', create: 'Nuevo rol', entity: 'rol' },
  {
    name: 'presentations',
    label: 'Presentaciones',
    create: 'Nueva presentación',
    entity: 'presentación',
  },
  {
    name: 'unit-measures',
    label: 'Unidades de medida',
    create: 'Nueva unidad de medida',
    entity: 'unidad de medida',
  },
  {
    name: 'reasons',
    label: 'Motivos de ajuste',
    create: 'Nuevo motivo de ajuste',
    entity: 'motivo de ajuste',
  },
  {
    name: 'fulfillment-statuses',
    label: 'Estados de cumplimiento',
    create: 'Nuevo estado de cumplimiento',
    entity: 'estado de cumplimiento',
  },
];
export interface Entry {
  id: string;
  name: string;
  symbol?: string;
  isActive: boolean;
  version: number;
}
export const entryId = '11111111-1111-4111-8111-111111111111';
export const mockCatalogs = async (page: Page, permissions = user.permissions) => {
  await mockWarehouse(page, permissions);
  const store = new Map<string, Entry[]>(
    catalogs.map((catalog) => [
      catalog.name,
      [
        {
          id: entryId,
          name: 'Registro existente',
          ...(catalog.name === 'unit-measures' ? { symbol: 'm' } : {}),
          isActive: true,
          version: 7,
        },
      ],
    ]),
  );
  const writes: { method: string; catalog: string; data: Record<string, unknown> }[] = [];
  const reads: URL[] = [];
  await page.route('**/api/admin/catalogs/**', async (route) => {
    const url = new URL(route.request().url());
    const name = url.pathname.split('/')[4]!;
    const rows = store.get(name) ?? [];
    const method = route.request().method();
    if (method === 'GET') {
      reads.push(url);
      const filtered = rows.filter((row) =>
        row.name.toLowerCase().includes((url.searchParams.get('search') ?? '').toLowerCase()),
      );
      const start = Number(url.searchParams.get('start') ?? 0);
      const length = Number(url.searchParams.get('length') ?? 10);
      return route.fulfill({
        json: {
          data: filtered.slice(start, start + length),
          recordsFiltered: filtered.length,
          recordsTotal: rows.length,
        },
      });
    }
    const body = route.request().postDataJSON();
    writes.push({ method, catalog: name, data: body });
    const saved = {
      id: method === 'POST' ? '22222222-2222-4222-8222-222222222222' : entryId,
      name: body.name,
      ...(name === 'unit-measures' ? { symbol: body.symbol } : {}),
      isActive: body.isActive,
      version: method === 'POST' ? 0 : 8,
    };
    store.set(
      name,
      method === 'POST' ? [...rows, saved] : rows.map((row) => (row.id === entryId ? saved : row)),
    );
    return route.fulfill({
      status: method === 'POST' ? 201 : 200,
      json: {
        code: method === 'POST' ? 'CREATED_CATALOG_ENTRY' : 'UPDATED_CATALOG_ENTRY',
        data: saved,
      },
    });
  });
  return { store, writes, reads };
};
