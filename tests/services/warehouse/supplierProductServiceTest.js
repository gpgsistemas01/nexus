import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GoodsIssueInsufficientStock } from '../../../src/errors/inventory/stockError.js';

const executeRawUnsafe = vi.fn();
const supplierProductUpdateMany = vi.fn();
const supplierProductUpdate = vi.fn();

vi.mock('../../../src/services/warehouse/adjustmentService.js', () => ({
  createStockAdjustment: vi.fn()
}));

vi.mock('../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    $executeRawUnsafe: executeRawUnsafe,
    supplierProduct: {
      updateMany: supplierProductUpdateMany,
      update: supplierProductUpdate
    }
  })
}));

const {
  recalculateConvertedQuantityByProduct,
  updateProductUnitCostIfHigher,
  updateSupplierProductStock
} = await import('../../../src/services/warehouse/products/supplierProductService.js');

describe('supplierProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    executeRawUnsafe.mockResolvedValue(0);
    supplierProductUpdateMany.mockResolvedValue({ count: 1 });
    supplierProductUpdate.mockResolvedValue({});
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


  it('permite surtir hasta dejar el stock exactamente en cero', async () => {
    await updateSupplierProductStock({
      grouped: new Map([['product-1:supplier-1', 5]]),
      movementType: 'ISSUE',
      supplierProducts: [{
        productId: 'product-1',
        supplierId: 'supplier-1',
        currentStock: 5,
        convertedQuantity: 4.99,
        product: { id: 'product-1', name: 'Producto', base: 1, height: 1 },
        supplier: { tradeName: 'Proveedor' }
      }]
    });

    expect(supplierProductUpdateMany).toHaveBeenCalledWith({
      where: {
        supplierId: 'supplier-1',
        productId: 'product-1',
        currentStock: { gte: 5 }
      },
      data: {
        currentStock: { decrement: 5 },
        convertedQuantity: 0
      }
    });
  });


  it('lanza stock insuficiente si ninguna fila cumple la condición atómica de stock', async () => {
    supplierProductUpdateMany.mockResolvedValueOnce({ count: 0 });

    await expect(updateSupplierProductStock({
      grouped: new Map([['product-1:supplier-1', 5]]),
      movementType: 'ISSUE',
      supplierProducts: [{
        productId: 'product-1',
        supplierId: 'supplier-1',
        currentStock: 5,
        convertedQuantity: 5,
        product: { id: 'product-1', name: 'Producto', base: 1, height: 1 },
        supplier: { tradeName: 'Proveedor' }
      }]
    })).rejects.toThrow(GoodsIssueInsufficientStock);
  });

  it('omite la consulta cuando no hay detalles por actualizar', async () => {
    await expect(updateProductUnitCostIfHigher({
      supplierId: '00000000-0000-0000-0000-000000000001',
      details: []
    })).resolves.toEqual({ count: 0 });

    expect(executeRawUnsafe).not.toHaveBeenCalled();
  });
});
