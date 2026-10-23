import { describe, expect, it, vi } from 'vitest';
import { findBatches, findPage } from '../../../src/repository/paginationRepository.js';

describe('consulta paginada', () => {
  it('conserva los conteos distintos del catálogo y de la búsqueda', async () => {
    const model = { findMany: vi.fn().mockResolvedValue([{ id: 'match' }]), count: vi.fn().mockResolvedValueOnce(8).mockResolvedValueOnce(1) };
    const page = await findPage({ model, query: { where: { name: 'match' }, skip: 0, take: 10 } });
    expect(page).toEqual({ data: [{ id: 'match' }], recordsTotal: 8, recordsFiltered: 1 });
  });

  it('comparte un solo conteo cuando la página conserva el mismo alcance', async () => {
    const model = { findMany: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(5) };
    const page = await findPage({ model, query: { where: { type: 'MATERIAL' } }, totalWhere: { type: 'MATERIAL' }, hasFilters: false });
    expect(page).toEqual({ data: [], recordsTotal: 5, recordsFiltered: 5 });
    expect(model.count).toHaveBeenCalledTimes(1);
  });

  it('omite los conteos cuando la exportación sólo necesita filas', async () => {
    const model = { findMany: vi.fn().mockResolvedValue([{ id: 'row' }]), count: vi.fn() };
    expect(await findPage({ model, query: {}, includeCounts: false })).toEqual({ data: [{ id: 'row' }] });
    expect(model.count).not.toHaveBeenCalled();
  });
});

describe('lectura por bloques de exportación', () => {
  it('avanza por el último id sin repetir filas y no calcula conteos', async () => {
    const model = {
      findMany: vi.fn().mockResolvedValueOnce([{ id: 'a' }, { id: 'b' }]).mockResolvedValueOnce([{ id: 'c' }]),
      count: vi.fn()
    };
    const batches = [];
    for await (const batch of findBatches({ model, query: { orderBy: [{ name: 'asc' }, { id: 'asc' }] }, batchSize: 2 })) batches.push(batch);
    expect(batches.flat().map(row => row.id)).toEqual(['a', 'b', 'c']);
    expect(model.findMany.mock.calls[1][0]).toMatchObject({ cursor: { id: 'b' }, skip: 1, take: 2 });
    expect(model.count).not.toHaveBeenCalled();
  });

  it.each([0, -1, 1.5, Infinity, '2'])('rechaza un tamaño de bloque inválido antes de consultar: %s', async (batchSize) => {
    const fetchPage = vi.fn();
    const iterator = findBatches({ query: {}, batchSize, fetchPage });
    await expect(iterator.next()).rejects.toThrow('entero positivo');
    expect(fetchPage).not.toHaveBeenCalled();
  });

  it('rechaza una consulta que omite el id requerido para avanzar', async () => {
    const fetchPage = vi.fn().mockResolvedValue([{ name: 'Sin identidad' }]);
    const iterator = findBatches({ query: {}, batchSize: 1, fetchPage });
    await expect(iterator.next()).rejects.toThrow('seleccionar id');
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('interrumpe el reporte si el último id no avanza y no solicita un tercer bloque', async () => {
    const fetchPage = vi.fn().mockResolvedValue([{ id: 'a' }]);
    const iterator = findBatches({ query: {}, batchSize: 1, fetchPage });
    expect((await iterator.next()).value).toEqual([{ id: 'a' }]);
    await expect(iterator.next()).rejects.toThrow('avanzar el cursor');
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it('no consulta otro bloque si el consumidor cancela', async () => {
    const model = { findMany: vi.fn().mockResolvedValue([{ id: 'a' }]) };
    for await (const _batch of findBatches({ model, query: {}, batchSize: 1 })) break;
    expect(model.findMany).toHaveBeenCalledTimes(1);
  });
});
