import { beforeEach, describe, expect, it, vi } from 'vitest';

const wasteFindMany = vi.fn();
const wasteCount = vi.fn();

vi.mock('../../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    waste: {
      findMany: wasteFindMany,
      count: wasteCount
    }
  })
}));

const { findAllWastes } = await import('../../../../../src/services/warehouse/wastes/wasteService.js');

describe('listado del CRUD de mermas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    wasteCount.mockResolvedValue(1);
  });

  it('trae los snapshots necesarios para renderizar la tabla como inventario', async () => {
    const waste = {
      id: 'waste-1',
      name: 'Lona',
      supplierId: 'supplier-1',
      supplier: { id: 'supplier-1', tradeName: 'Proveedor' },
      presentation: { id: 'presentation-1', name: 'ROLLO' },
      unitMeasure: { id: 'unit-1', name: 'Metro cuadrado', symbol: 'm²' },
      base: 1.52,
      height: 4,
      currentStock: 2,
      minStock: 1,
      convertedQuantity: 12.16,
      maxUnitCost: 25
    };
    wasteFindMany.mockResolvedValue([waste]);

    await expect(findAllWastes({ canReadCosts: true })).resolves.toMatchObject({
      data: [waste],
      recordsTotal: 1,
      recordsFiltered: 1
    });
    expect(wasteFindMany).toHaveBeenCalledWith(expect.objectContaining({
      select: expect.objectContaining({
        name: true,
        base: true,
        height: true,
        currentStock: true,
        minStock: true,
        convertedQuantity: true,
        maxUnitCost: true,
        supplier: expect.any(Object),
        presentation: expect.any(Object),
        unitMeasure: expect.any(Object)
      })
    }));
  });
});
