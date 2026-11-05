import { expect, it, vi } from 'vitest';
import { findWasteReference, lookupPages } from '../../../scripts/manual/preparation.mjs';

type Query = { resource: string; supplierId: string; page: number };
const supplier = (id: string) => ({ id, tradeName: `Proveedor ${id}`, isActive: true });
const roll = {
  id: 'rollo-1',
  name: 'Lona',
  base: 2,
  height: 50,
  presentation: { name: 'ROLLO' },
};

it('busca otro proveedor cuando el primero no tiene referencia ROLLO', async () => {
  const lookup = vi.fn(async ({ resource, supplierId }: Query) => {
    if (resource === 'suppliers')
      return { data: [supplier('uno'), supplier('dos')], recordsFiltered: 2 };
    return supplierId === 'uno'
      ? { data: [{ ...roll, presentation: { name: 'PLIEGO' } }], recordsFiltered: 1 }
      : { data: [roll], recordsFiltered: 1 };
  });
  expect(await findWasteReference(lookup)).toEqual({ supplier: supplier('dos'), material: roll });
  expect(lookup.mock.calls.map(([query]) => query.supplierId)).toEqual(['', 'uno', 'dos']);
});

it('recorre las páginas de proveedores y referencias y descarta medidas inválidas', async () => {
  const lookup = vi.fn(async ({ resource, supplierId, page }: Query) => {
    if (resource === 'suppliers')
      return {
        data:
          page === 1
            ? Array.from({ length: 20 }, (_, index) => supplier(`primero-${index}`))
            : [supplier('ultimo')],
        recordsFiltered: 21,
      };
    if (supplierId !== 'ultimo') return { data: [], recordsFiltered: 0 };
    return {
      data: page === 1 ? Array.from({ length: 20 }, () => ({ ...roll, base: 0 })) : [roll],
      recordsFiltered: 21,
    };
  });
  expect(await findWasteReference(lookup)).toEqual({
    supplier: supplier('ultimo'),
    material: roll,
  });
  expect(lookup).toHaveBeenCalledWith({
    resource: 'suppliers',
    supplierId: '',
    page: 2,
    start: 20,
  });
  expect(lookup).toHaveBeenCalledWith({
    resource: 'wastes/material-templates',
    supplierId: 'ultimo',
    page: 2,
    start: 20,
  });
});

it('no omite documentos cuando la API devuelve páginas menores que el tamaño solicitado', async () => {
  const starts: number[] = [];
  const rows = [];
  for await (const data of lookupPages(async ({ start }: { start: number }) => {
    starts.push(start);
    return { data: [{ id: start + 1 }], recordsFiltered: 3 };
  }, 'documents'))
    rows.push(...data);
  expect(rows).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  expect(starts).toEqual([0, 1, 2]);
});

it('informa el dato faltante si no hay ROLLO y no toma un proveedor inactivo', async () => {
  const lookup = vi.fn(async ({ resource }: Query) =>
    resource === 'suppliers'
      ? {
          data: [{ ...supplier('inactivo'), isActive: false }, supplier('activo')],
          recordsFiltered: 2,
        }
      : { data: [], recordsFiltered: 0 },
  );
  await expect(findWasteReference(lookup)).rejects.toThrow(
    'proveedor activo con un material ROLLO',
  );
  expect(lookup).not.toHaveBeenCalledWith(expect.objectContaining({ supplierId: 'inactivo' }));
});

it('no confunde un error de consulta ni un contrato inválido con falta de datos', async () => {
  await expect(
    findWasteReference(async () => {
      throw new Error('HTTP 503');
    }),
  ).rejects.toThrow('HTTP 503');
  await expect(findWasteReference(async () => ({ data: [], recordsFiltered: -1 }))).rejects.toThrow(
    'catálogo incompleto',
  );
});
