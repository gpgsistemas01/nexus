import { describe, expect, it } from 'vitest';

import {
  buildDateRangeFilter,
  getDataTableOrder,
  getDataTablePaging,
  getDataTableSearch
} from '../../src/utils/requestQueryUtils.js';

describe('requestQueryUtils', () => {
  it('obtiene paginación segura para DataTables con valores inválidos o negativos', () => {
    expect(getDataTablePaging({ start: '20', length: '25' })).toEqual({ skip: 20, take: 25 });
    expect(getDataTablePaging({ start: '-10', length: 'invalid' })).toEqual({ skip: 0, take: 10 });
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
});
