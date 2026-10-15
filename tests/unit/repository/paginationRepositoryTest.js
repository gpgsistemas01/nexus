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

  it('no consulta otro bloque si el consumidor cancela', async () => {
    const model = { findMany: vi.fn().mockResolvedValue([{ id: 'a' }]) };
    for await (const _batch of findBatches({ model, query: {}, batchSize: 1 })) break;
    expect(model.findMany).toHaveBeenCalledTimes(1);
  });
});
