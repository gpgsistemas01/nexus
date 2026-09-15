import { beforeEach, describe, expect, it, vi } from 'vitest';

const database = {
  unitMeasure: {
    count: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn()
  }
};

vi.mock('../../../../src/repository/baseRepository.js', () => ({
  getDb: () => database
}));

const {
  createCatalogEntry,
  findAllCatalogEntries,
  getManagedCatalog,
  updateCatalogEntry
} = await import('../../../../src/services/admin/catalogService.js');

describe('catalogService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('provides the presentation contract for an individual catalog page', () => {
    expect(getManagedCatalog('unit-measures')).toEqual({
      name: 'unit-measures',
      fields: ['name', 'symbol', 'isActive'],
      maxLengths: { name: 20, symbol: 10 },
      label: 'Unidades de medida',
      entityLabel: 'unidad de medida',
      createButtonLabel: 'Nueva unidad de medida'
    });
  });

  it('lists only a catalog registered in the server whitelist', async () => {
    database.unitMeasure.findMany.mockResolvedValue([{ id: 'unit-1', name: 'Metro', symbol: 'm' }]);
    database.unitMeasure.count.mockResolvedValueOnce(3).mockResolvedValueOnce(1);

    await expect(findAllCatalogEntries('unit-measures', {
      skip: 10,
      take: 10,
      search: 'met'
    })).resolves.toEqual({
      data: [{ id: 'unit-1', name: 'Metro', symbol: 'm' }],
      recordsTotal: 3,
      recordsFiltered: 1
    });
    expect(database.unitMeasure.findMany).toHaveBeenCalledWith({
      where: { name: { contains: 'met', mode: 'insensitive' } },
      skip: 10,
      take: 10,
      orderBy: { name: 'asc' }
    });
  });

  it('normalizes allowed fields and discards arbitrary input when creating', async () => {
    database.unitMeasure.create.mockResolvedValue({ id: 'unit-1' });

    await createCatalogEntry('unit-measures', {
      name: ' Metro ',
      symbol: ' m ',
      isActive: false,
      unexpected: 'discarded'
    });

    expect(database.unitMeasure.create).toHaveBeenCalledWith({
      data: { name: 'Metro', symbol: 'm', isActive: false }
    });
  });

  it('rejects unknown catalogs before accessing Prisma', async () => {
    await expect(updateCatalogEntry('users', 'user-1', { name: 'No permitido' }))
      .rejects.toMatchObject({
        code: 'CATALOG_NOT_FOUND',
        statusCode: 404,
        message: 'El catálogo users no está disponible',
        meta: { catalogName: 'users' }
      });
  });

  it('rejects values with a type outside the catalog contract', async () => {
    await expect(createCatalogEntry('unit-measures', { name: 42, symbol: 'm' }))
      .rejects.toMatchObject({
        code: 'CATALOG_VALIDATION_ERROR',
        statusCode: 400,
        message: 'Complete correctamente los campos del catálogo Unidades de medida',
        meta: { catalogLabel: 'Unidades de medida' }
      });
    expect(database.unitMeasure.create).not.toHaveBeenCalled();
  });

  it('reports a missing entry using its catalog type', async () => {
    database.unitMeasure.update.mockRejectedValueOnce({ code: 'P2025' });

    await expect(updateCatalogEntry('unit-measures', '4fe1eb70-6ad3-4a22-95d6-2a95c362c01c', {
      name: 'Metro',
      symbol: 'm',
      isActive: true
    })).rejects.toMatchObject({
      code: 'CATALOG_ENTRY_NOT_FOUND',
      statusCode: 404,
      message: 'El registro de Unidades de medida no está disponible',
      meta: { catalogLabel: 'Unidades de medida' }
    });
  });

  it('reports a malformed URL identifier as a missing catalog entry', async () => {
    database.unitMeasure.update.mockRejectedValueOnce({ code: 'P2023' });

    await expect(updateCatalogEntry('unit-measures', 'not-a-uuid', {
      name: 'Metro',
      symbol: 'm',
      isActive: true
    })).rejects.toMatchObject({
      code: 'CATALOG_ENTRY_NOT_FOUND',
      statusCode: 404,
      meta: { catalogLabel: 'Unidades de medida' }
    });
  });

  it.each([
    [{ name: 'x'.repeat(21), symbol: 'm', isActive: true }, 'a name longer than the Prisma column'],
    [{ name: 'Metro', symbol: 'x'.repeat(11), isActive: true }, 'a symbol longer than the Prisma column']
  ])('rejects %s before accessing Prisma (%s)', async (input) => {
    await expect(createCatalogEntry('unit-measures', input))
      .rejects.toMatchObject({ code: 'CATALOG_VALIDATION_ERROR', statusCode: 400 });
    expect(database.unitMeasure.create).not.toHaveBeenCalled();
  });
});
