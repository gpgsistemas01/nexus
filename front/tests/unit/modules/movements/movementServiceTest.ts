import { afterEach, expect, it, vi } from 'vitest';
import { dateRangeError, reportScopeError } from '../../../../src/shared/report.js';
import { apiClient } from '../../../../src/shared/http/apiClient.js';
import { movementService } from '../../../../src/modules/movements/services/movementService.js';
import { emptyMovementFilters } from '../../../../src/modules/movements/movement.js';
import type {
  MovementQuery,
  MovementResource,
} from '../../../../src/modules/movements/movement.js';
import { mockHttpAdapter } from '../../../helpers/httpAdapter.js';
import { movement } from '../../../fixtures/movements.js';
import { ids, material, pageOf, waste } from '../../../fixtures/inventory.js';

const original = apiClient.http.defaults.adapter;
const query: MovementQuery = {
  ...emptyMovementFilters(),
  page: 2,
  length: 10,
  search: 'SAL',
  orderColumn: 0,
  direction: 'desc',
  supplierId: ids.supplier,
  itemId: ids.material,
  startDate: '2026-10-01',
  endDate: '2026-10-22',
  movementType: 'RETURN',
};
const signal = () => new AbortController().signal;
afterEach(() => {
  apiClient.http.defaults.adapter = original;
  vi.restoreAllMocks();
});

it.each<MovementResource>(['materials', 'consumables', 'wastes'])(
  'consulta %s conserva el contrato, cantidades firmadas y fecha del servidor sin exigir versión',
  async (resource) => {
    apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
      const url = new URL(config.url!, 'http://test');
      expect(url.pathname).toBe(`/api/admin/movements/${resource}`);
      expect(Object.fromEntries(url.searchParams)).toEqual({
        start: '10',
        length: '10',
        search: 'SAL',
        'order[0][column]': '0',
        'order[0][dir]': 'desc',
        startDate: query.startDate,
        endDate: query.endDate,
        movementType: 'RETURN',
        supplierId: ids.supplier,
        [resource === 'wastes' ? 'wasteId' : 'materialId']: ids.material,
      });
      return { data: pageOf([movement]) };
    });
    expect((await movementService.list(resource, query, signal())).data).toEqual([movement]);
  },
);
it.each([undefined, null, '', 'NaN', Infinity])(
  'rechaza cantidad mal formada (%s)',
  async (quantity) => {
    apiClient.http.defaults.adapter = mockHttpAdapter(() => ({
      data: pageOf([{ ...movement, quantity }]),
    }));
    await expect(movementService.list('materials', query, signal())).rejects.toThrow();
  },
);
it('conserva ceros, saldos históricos nulos y folio ausente', async () => {
  apiClient.http.defaults.adapter = mockHttpAdapter(() => ({
    data: pageOf([
      { ...movement, quantity: 0, previousStock: null, newStock: null, referenceNumber: null },
    ]),
  }));
  expect((await movementService.list('materials', query, signal())).data[0]).toMatchObject({
    quantity: 0,
    previousStock: null,
    newStock: null,
    referenceNumber: '—',
  });
});
it.each<MovementResource>(['materials', 'consumables', 'wastes'])(
  'selector %s usa la identidad del material y conserva el proveedor',
  async (resource) => {
    apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
      const url = new URL(config.url!, 'http://test');
      expect(url.searchParams.get('supplierId')).toBe(ids.supplier);
      expect(url.searchParams.get('start')).toBe('20');
      return { data: pageOf([resource === 'wastes' ? waste : material]) };
    });
    const result = await movementService.lookup(resource, '', 2, ids.supplier, signal());
    expect(result.data[0]?.id).toBe(resource === 'wastes' ? ids.waste : ids.material);
    expect(result.data[0]?.id).not.toBe(ids.offer);
  },
);
it('el historial incluye proveedores inactivos', async () => {
  apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
    expect(config.url).not.toContain('onlyActive');
    return { data: pageOf([{ id: ids.supplier, tradeName: 'Histórico', isActive: false }]) };
  });
  expect((await movementService.lookup('suppliers', '', 1, '', signal())).data[0]?.title).toBe(
    'Histórico',
  );
});
it.each(['filtered', 'current-month', 'specific-month'] as const)(
  'exportación %s distingue los filtros de la tabla del mes completo',
  async (mode) => {
    apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
      const url = new URL(config.url!, 'http://test');
      expect(url.pathname).toBe('/api/admin/reports/movements/materials/excel');
      expect(url.searchParams.has('start')).toBe(false);
      expect(url.searchParams.has('length')).toBe(false);
      if (mode === 'filtered') {
        expect(url.searchParams.get('materialId')).toBe(ids.material);
        expect(url.searchParams.get('search')).toBe('SAL');
        expect(url.searchParams.has('monthlyReport')).toBe(false);
      } else {
        expect(Object.fromEntries(url.searchParams)).toEqual({
          'order[0][column]': '0',
          'order[0][dir]': 'desc',
          monthlyReport: 'true',
          reportMonth: mode === 'specific-month' ? '2026-09' : '',
        });
      }
      return {
        data: new Blob(['test'], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
      };
    });
    await expect(
      movementService.export('materials', query, { mode, month: '2026-09' }, signal()),
    ).resolves.toBeInstanceOf(Blob);
  },
);
it.each([
  ['', '', true],
  ['2026-10-22', '', true],
  ['', '2026-10-22', true],
  ['2026-10-22', '2026-10-22', true],
  ['2026-10-23', '2026-10-22', false],
  ['2026-02-29', '', false],
  ['2024-02-29', '', true],
  ['22/10/2026', '', false],
])('fechas %s a %s: válido=%s', (startDate, endDate, valid) => {
  expect(
    !dateRangeError({
      ...emptyMovementFilters(),
      startDate: String(startDate),
      endDate: String(endDate),
    }),
  ).toBe(valid);
});
it.each(['', '2026-00', '2026-13', '0000-01', '2026-1'])(
  'mes específico inválido %s impide el request',
  async (month) => {
    const request = vi.fn();
    apiClient.http.defaults.adapter = mockHttpAdapter(request);
    expect(reportScopeError({ mode: 'specific-month', month })).not.toBe('');
    await expect(
      movementService.export('materials', query, { mode: 'specific-month', month }, signal()),
    ).rejects.toThrow('mes válido');
    expect(request).not.toHaveBeenCalled();
  },
);
