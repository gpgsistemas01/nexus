import { access, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { captureRecipe } from '../manual-profiles/captureRecipes.js';
import { mockWarehouse } from './warehouseFixtures.js';
import { ids, template, user } from '../fixtures/inventory.js';

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
