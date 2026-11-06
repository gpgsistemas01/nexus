import { describe, expect, it } from 'vitest';

import {
  buildDateRangeFilter,
  getDataTableOrder,
  getDataTablePaging,
  getDataTableSearch,
  isMonthlyReportQuery
} from '../../../src/utils/requestQueryUtils.js';

describe('requestQueryUtils', () => {
  it('obtiene paginación segura para DataTables con valores inválidos o negativos', () => {
    expect(getDataTablePaging({ start: '20', length: '25' })).toEqual({ skip: 20, take: 25 });
    expect(getDataTablePaging({ start: '-10', length: 'invalid' })).toEqual({ skip: 0, take: 10 });
  });

  it.each([
    [{ start: '0', length: '0' }, { skip: 0, take: 0 }],
    [{ start: '20', length: '100' }, { skip: 20, take: 100 }],
    [{ start: '20', length: '101' }, { skip: 20, take: 100 }],
    [{ start: '20', length: '1000000' }, { skip: 20, take: 100 }],
    [{ start: '2147483647', length: '20' }, { skip: 2147483647, take: 20 }],
    [{ start: '2147483648', length: '20' }, { skip: 0, take: 20 }],
    [{ start: '2.5', length: '20abc' }, { skip: 0, take: 10 }],
    [{ start: ['20', '30'], length: ['20', '30'] }, { skip: 0, take: 10 }],
    [{ start: '99999999999999999999', length: '99999999999999999999' }, { skip: 0, take: 10 }]
  ])('normaliza tamaños y offsets antes de construir una consulta: %o', (query, expected) => {
    expect(getDataTablePaging(query)).toEqual(expected);
  });

  it('lee términos de búsqueda desde los formatos soportados por DataTables', () => {
    expect(getDataTableSearch({ search: 'directo' })).toBe('directo');
    expect(getDataTableSearch({ search: { value: 'anidado' } })).toBe('anidado');
    expect(getDataTableSearch({ 'search[value]': 'plano' })).toBe('plano');
    expect(getDataTableSearch({})).toBe('');
  });

  it('resuelve ordenamiento solicitado y usa valores por defecto cuando no son válidos', () => {
    expect(getDataTableOrder({
      query: { order: [{ column: '1', dir: 'DESC' }] },
      columns: ['name', 'createdAt']
    })).toEqual({ orderBy: 'createdAt', orderDir: 'desc' });

    expect(getDataTableOrder({
      query: { 'order[0][column]': '99', 'order[0][dir]': 'sideways' },
      columns: ['name', 'createdAt'],
      defaultDirection: 'DESC'
    })).toEqual({ orderBy: 'name', orderDir: 'desc' });
  });

  it('construye filtros de fechas inclusivos por día de término', () => {
    const filter = buildDateRangeFilter({
      field: 'createdAt',
      startDate: '2026-06-01',
      endDate: '2026-06-15'
    });

    expect(filter.createdAt.gte).toEqual(new Date('2026-06-01'));
    expect(filter.createdAt.lt).toEqual(new Date('2026-06-16'));
  });

  it('retorna un filtro vacío si falta el campo o el rango de fechas', () => {
    expect(buildDateRangeFilter({ field: 'createdAt' })).toEqual({});
    expect(buildDateRangeFilter({ startDate: '2026-06-01' })).toEqual({});
  });

  it('identifica únicamente solicitudes mensuales booleanas o serializadas', () => {
    expect(isMonthlyReportQuery({ monthlyReport: true })).toBe(true);
    expect(isMonthlyReportQuery({ monthlyReport: 'true' })).toBe(true);
    expect(isMonthlyReportQuery({ monthlyReport: false })).toBe(false);
    expect(isMonthlyReportQuery({ monthlyReport: 'false' })).toBe(false);
    expect(isMonthlyReportQuery()).toBe(false);
  });
});
