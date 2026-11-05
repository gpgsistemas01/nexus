import type { Page } from '@playwright/test';
import { mockWarehouse } from './warehouseFixtures.js';
import { pageOf } from '../fixtures/inventory.js';
import {
  personData,
  accountData,
  clientData,
  supplierData,
  departments,
  roles,
  recordPermissions,
} from '../fixtures/records.js';
export const recordRoutes = [
  {
    path: '/identidad/personas',
    title: 'Personas',
    permission: 'persons:page-view',
    resource: 'persons',
  },
  { path: '/identidad/usuarios', title: 'Usuarios', permission: 'users:manage', resource: 'users' },
  {
    path: '/directorio/clientes',
    title: 'Clientes',
    permission: 'clients:page-view',
    resource: 'clients',
  },
  {
    path: '/directorio/proveedores',
    title: 'Proveedores',
    permission: 'suppliers:page-view',
    resource: 'suppliers',
  },
] as const;
export const mockRecords = async (page: Page, permissions = recordPermissions) => {
  await mockWarehouse(page, permissions);
  const store = new Map<string, Record<string, unknown>[]>([
    ['persons', [structuredClone(personData)]],
    ['users', [structuredClone(accountData)]],
    ['clients', [{ ...clientData }]],
    ['suppliers', [{ ...supplierData }]],
  ]);
  const writes: { resource: string; method: string; data: Record<string, unknown>; url: string }[] =
    [];
  const reads: URL[] = [];
  const reports: URL[] = [];
  for (const resource of ['departments', 'roles'] as const) {
    await page.route(`**/api/admin/${resource}?**`, (route) => {
      const url = new URL(route.request().url());
      const values = (resource === 'departments' ? departments : roles).filter((row) =>
        row.name.toLowerCase().includes((url.searchParams.get('search') ?? '').toLowerCase()),
      );
      return route.fulfill({ json: pageOf(values) });
    });
  }
  await page.route(
    /\/api\/(?:admin\/(?:persons|users)|sales\/clients|warehouse\/suppliers)(?:\/|\?|$)/,
    async (route) => {
      const url = new URL(route.request().url());
      const resource = url.pathname.split('/')[3]!;
      const rows = store.get(resource)!;
      const method = route.request().method();
      if (method === 'GET') {
        reads.push(url);
        const filtered = rows.filter((row) => {
          const text = String(
            row.fullName ?? row.name ?? `${row.tradeName} ${row.legalName}`,
          ).toLowerCase();
          if (!text.includes((url.searchParams.get('search') ?? '').toLowerCase())) return false;
          if (resource !== 'persons') return true;
          const accesses = row.accesses as typeof personData.accesses;
          return (
            (!url.searchParams.get('department') ||
              accesses.some(
                (item) => item.department.name === url.searchParams.get('department'),
              )) &&
            (!url.searchParams.get('role') ||
              accesses.some((item) => item.role.name === url.searchParams.get('role')))
          );
        });
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
      const data = route.request().postDataJSON() as Record<string, unknown>;
      writes.push({ resource, method, data, url: url.pathname });
      const old = rows.find((row) => row.id === url.pathname.split('/')[4]);
      if (method !== 'POST' && data.expectedVersion !== old?.version)
        return route.fulfill({ status: 409, json: { code: 'RECORD_VERSION_CONFLICT' } });
      const passwordOnly = url.pathname.endsWith('/password');
      const saved: Record<string, unknown> = {
        ...old,
        ...(passwordOnly ? {} : data),
        id: method === 'POST' ? '99999999-9999-4999-8999-999999999999' : old!.id,
        version: method === 'POST' ? 0 : Number(old!.version) + 1,
      };
      delete saved.password;
      delete saved.expectedVersion;
      if (resource === 'persons' && Array.isArray(data.accesses))
        saved.accesses = (data.accesses as { departmentId: string; roleId: string }[]).map(
          (access) => ({
            department: departments.find((row) => row.id === access.departmentId)!,
            role: roles.find((row) => row.id === access.roleId)!,
          }),
        );
      if (resource === 'users' && !passwordOnly) {
        saved.departmentName = departments.find((row) => row.id === data.departmentId)?.name;
        saved.roleName = roles.find((row) => row.id === data.roleId)?.name;
      }
      store.set(
        resource,
        method === 'POST'
          ? [...rows, saved]
          : rows.map((row) => (row.id === old!.id ? saved : row)),
      );
      const entities = {
        persons: 'PERSON',
        users: 'USER',
        clients: 'CLIENT',
        suppliers: 'SUPPLIER',
      };
      const entity = entities[resource as keyof typeof entities];
      const code = passwordOnly
        ? 'UPDATED_USER_PASSWORD'
        : `${method === 'POST' ? 'CREATED' : 'UPDATED'}_${entity}`;
      return route.fulfill({ json: { code, [resource.slice(0, -1)]: saved } });
    },
  );
  await page.route(
    /\/api\/(?:admin\/reports\/(?:persons|users)|sales\/reports\/clients|warehouse\/reports\/suppliers)\/excel/,
    (route) => {
      reports.push(new URL(route.request().url()));
      return route.fulfill({
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: Buffer.from('PK-reporte-simulado'),
      });
    },
  );
  return { store, writes, reads, reports };
};
