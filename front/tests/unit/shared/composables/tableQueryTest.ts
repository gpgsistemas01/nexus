import { reactive, ref } from 'vue';
import { expect, it } from 'vitest';
import { useTableQuery } from '../../../../src/shared/composables/useTableQuery.js';

it('conserva índices de API discontinuos y traduce página, tamaño y sentido sin mezclar columnas', () => {
  const query = reactive({ orderColumn: 4, direction: 'desc' as 'asc' | 'desc' });
  const table = useTableQuery(
    () => query,
    () => ({ name: 0, base: 1, height: 2, minStock: 4 }),
  );
  expect(table.sortBy.value).toEqual([{ key: 'minStock', order: 'desc' }]);
  expect(
    table.changesFromOptions({
      page: 3,
      itemsPerPage: 20,
      sortBy: [{ key: 'height', order: 'asc' }],
    }),
  ).toEqual({ page: 3, length: 20, orderColumn: 2, direction: 'asc' });
  query.orderColumn = 1;
  expect(table.sortBy.value).toEqual([{ key: 'base', order: 'desc' }]);
});
it('un cambio de recurso no conserva columnas de orden que la nueva API no admite', () => {
  const supplier = ref(true);
  const table = useTableQuery(
    () => ({ orderColumn: 1, direction: 'asc' }),
    (): Readonly<Record<string, number>> =>
      supplier.value ? { name: 0, legalName: 1 } : { name: 0 },
  );
  expect(table.sortBy.value[0]?.key).toBe('legalName');
  supplier.value = false;
  expect(table.sortBy.value[0]?.key).toBe('name');
  expect(
    table.changesFromOptions({
      page: 1,
      itemsPerPage: 10,
      sortBy: [{ key: 'legalName', order: 'desc' }],
    }).orderColumn,
  ).toBe(0);
});
it('Movimientos mantiene fecha descendente cuando la tabla no informa orden', () => {
  const table = useTableQuery(
    () => ({ direction: 'desc' }),
    () => ({ date: 0, type: 1, referenceNumber: 2 }),
    'desc',
  );
  expect(table.sortBy.value).toEqual([{ key: 'date', order: 'desc' }]);
  expect(table.changesFromOptions({ page: 1, itemsPerPage: 10, sortBy: [] })).toEqual({
    page: 1,
    length: 10,
    orderColumn: 0,
    direction: 'desc',
  });
});
