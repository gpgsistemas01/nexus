import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GoodsIssueInsufficientStock } from '../../../src/errors/inventory/stockError.js';

const executeRawUnsafe = vi.fn();
const supplierMaterialUpdateMany = vi.fn();
const supplierMaterialUpdate = vi.fn();

vi.mock('../../../src/services/warehouse/adjustmentService.js', () => ({
  createStockAdjustment: vi.fn()
}));

vi.mock('../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    $executeRawUnsafe: executeRawUnsafe,
    supplierMaterial: {
      updateMany: supplierMaterialUpdateMany,
      update: supplierMaterialUpdate
    }
  })
}));

const {
  recalculateConvertedQuantityByMaterial,
  recalculateMaterialUnitCosts,
  updateMaterialUnitCostIfHigher,
  updateSupplierMaterialStock
} = await import('../../../src/services/warehouse/materials/supplierMaterialService.js');

describe('supplierMaterialService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    executeRawUnsafe.mockResolvedValue(0);
    supplierMaterialUpdateMany.mockResolvedValue({ count: 1 });
    supplierMaterialUpdate.mockResolvedValue({});
  });

  it('actualiza costos máximos en una sola consulta para evitar N+1', async () => {
    await updateMaterialUnitCostIfHigher({
      supplierId: '00000000-0000-0000-0000-000000000001',
      details: [
        {
          materialId: '00000000-0000-0000-0000-000000000101',
          conversionUnitCost: 10
        },
        {
          materialId: '00000000-0000-0000-0000-000000000102',
          conversionUnitCost: 20
        },
        {
          materialId: '00000000-0000-0000-0000-000000000101',
          conversionUnitCost: 15
        }
      ]
    });

    expect(executeRawUnsafe).toHaveBeenCalledTimes(1);

    const [query, ...params] = executeRawUnsafe.mock.calls[0];

    expect(query).toContain('UPDATE "SupplierMaterial" AS sp');
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
    await recalculateConvertedQuantityByMaterial({
      materialId: '00000000-0000-0000-0000-000000000101',
      base: 2,
      height: 3
    });

    expect(executeRawUnsafe).toHaveBeenCalledTimes(1);

    const [query, ...params] = executeRawUnsafe.mock.calls[0];

    expect(query).toContain('UPDATE "SupplierMaterial"');
    expect(query).toContain('ROUND("currentStock" * $1::numeric * $2::numeric, 2)');
    expect(params).toEqual([
      2,
      3,
      '00000000-0000-0000-0000-000000000101'
    ]);
  });

  it('recalcula el costo máximo desde los detalles activos de compra', async () => {
    await recalculateMaterialUnitCosts({
      supplierId: '00000000-0000-0000-0000-000000000001',
      materialIds: [
        '00000000-0000-0000-0000-000000000101',
        '00000000-0000-0000-0000-000000000101'
      ]
    });

    expect(executeRawUnsafe).toHaveBeenCalledTimes(1);
    const [query, ...params] = executeRawUnsafe.mock.calls[0];

    expect(query).toContain('MAX(detail."conversionUnitCost")');
    expect(query).toContain('detail."status" = \'ACTIVE\'');
    expect(params).toEqual([
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000101'
    ]);
  });


  it('permite surtir hasta dejar el stock exactamente en cero', async () => {
    await updateSupplierMaterialStock({
      grouped: new Map([['material-1:supplier-1', 5]]),
      movementType: 'ISSUE',
      supplierMaterials: [{
        materialId: 'material-1',
        supplierId: 'supplier-1',
        currentStock: 5,
        convertedQuantity: 4.99,
        material: { id: 'material-1', name: 'Material', base: 1, height: 1 },
        supplier: { tradeName: 'Proveedor' }
      }]
    });

    expect(supplierMaterialUpdateMany).toHaveBeenCalledWith({
      where: {
        supplierId: 'supplier-1',
        materialId: 'material-1',
        currentStock: { gte: 5 }
      },
      data: {
        currentStock: { decrement: 5 },
        convertedQuantity: 0
      }
    });
  });


  it('lanza stock insuficiente si ninguna fila cumple la condición atómica de stock', async () => {
    supplierMaterialUpdateMany.mockResolvedValueOnce({ count: 0 });

    await expect(updateSupplierMaterialStock({
      grouped: new Map([['material-1:supplier-1', 5]]),
      movementType: 'ISSUE',
      supplierMaterials: [{
        materialId: 'material-1',
        supplierId: 'supplier-1',
        currentStock: 5,
        convertedQuantity: 5,
        material: { id: 'material-1', name: 'Material', base: 1, height: 1 },
        supplier: { tradeName: 'Proveedor' }
      }]
    })).rejects.toThrow(GoodsIssueInsufficientStock);
  });

  it('omite la consulta cuando no hay detalles por actualizar', async () => {
    await expect(updateMaterialUnitCostIfHigher({
      supplierId: '00000000-0000-0000-0000-000000000001',
      details: []
    })).resolves.toEqual({ count: 0 });

    expect(executeRawUnsafe).not.toHaveBeenCalled();
  });
});
