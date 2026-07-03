import { beforeEach, describe, expect, it, vi } from 'vitest';

const findAllMovements = vi.fn();

vi.mock('../../../src/services/inventory/movementQueryService.js', () => ({
  findAllMovements
}));

const { findMovementReportRows } = await import('../../../src/services/inventory/reportService.js');

describe('inventory reportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mapea reporte de movimientos normalizando valores numéricos y reenvía filtros', async () => {
    findAllMovements.mockResolvedValue({
      data: [{
        id: 'movement-detail-1',
        referenceNumber: 'AJU-2026-0001',
        productName: 'Producto Uno',
        previousStock: '1.5',
        quantity: '-1',
        newStock: '0.5',
        productBase: '2',
        productHeight: '3'
      }]
    });

    await expect(findMovementReportRows({
      search: 'AJU',
      movementType: 'ISSUE',
      productId: 'product-1',
      supplierId: 'supplier-1'
    })).resolves.toEqual([{
      id: 'movement-detail-1',
      referenceNumber: 'AJU-2026-0001',
      productName: 'Producto Uno',
      previousStock: 1.5,
      quantity: -1,
      newStock: 0.5,
      productBase: 2,
      productHeight: 3
    }]);

    expect(findAllMovements).toHaveBeenCalledWith(expect.objectContaining({
      skip: 0,
      take: 100000,
      search: 'AJU',
      movementType: 'ISSUE',
      productId: 'product-1',
      supplierId: 'supplier-1'
    }));
  });
});
