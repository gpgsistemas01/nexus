import { beforeEach, describe, expect, it, vi } from 'vitest';

const executeRawUnsafe = vi.fn();

vi.mock('../../../src/services/warehouse/adjustmentService.js', () => ({
  createStockAdjustment: vi.fn()
}));

vi.mock('../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    $executeRawUnsafe: executeRawUnsafe
  })
}));

const {
  recalculateConvertedQuantityByProduct,
  updateProductUnitCostIfHigher
} = await import('../../../src/services/warehouse/products/supplierProductService.js');

describe('supplierProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    executeRawUnsafe.mockResolvedValue(0);
  });

  it('actualiza costos máximos en una sola consulta para evitar N+1', async () => {
    await updateProductUnitCostIfHigher({
      supplierId: '00000000-0000-0000-0000-000000000001',
      details: [
        {
          productId: '00000000-0000-0000-0000-000000000101',
          conversionUnitCost: 10
        },
        {
          productId: '00000000-0000-0000-0000-000000000102',
          conversionUnitCost: 20
        },
        {
          productId: '00000000-0000-0000-0000-000000000101',
          conversionUnitCost: 15
        }
      ]
    });

    expect(executeRawUnsafe).toHaveBeenCalledTimes(1);

    const [query, ...params] = executeRawUnsafe.mock.calls[0];

    expect(query).toContain('UPDATE "SupplierProduct" AS sp');
    expect(query).toContain('FROM (VALUES ($1::uuid, $2::numeric), ($3::uuid, $4::numeric))');
    expect(params).toEqual([
      '00000000-0000-0000-0000-000000000101',
      15,
      '00000000-0000-0000-0000-000000000102',
      20,
      '00000000-0000-0000-0000-000000000001'
    ]);
  });

  it('recalcula cantidades convertidas en una sola consulta para evitar N+1', async () => {
    await recalculateConvertedQuantityByProduct({
      productId: '00000000-0000-0000-0000-000000000101',
      base: 2,
      height: 3
    });

    expect(executeRawUnsafe).toHaveBeenCalledTimes(1);

    const [query, ...params] = executeRawUnsafe.mock.calls[0];

    expect(query).toContain('UPDATE "SupplierProduct"');
    expect(query).toContain('ROUND("currentStock" * $1::numeric * $2::numeric, 2)');
    expect(params).toEqual([
      2,
      3,
      '00000000-0000-0000-0000-000000000101'
    ]);
  });

  it('omite la consulta cuando no hay detalles por actualizar', async () => {
    await expect(updateProductUnitCostIfHigher({
      supplierId: '00000000-0000-0000-0000-000000000001',
      details: []
    })).resolves.toEqual({ count: 0 });

    expect(executeRawUnsafe).not.toHaveBeenCalled();
  });
});
