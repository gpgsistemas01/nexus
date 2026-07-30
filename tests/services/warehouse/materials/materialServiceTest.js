import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MaterialDeleteRelationConflict, MaterialNotFound, MaterialStockAdjustmentDatabaseError } from '../../../../src/errors/warehouse/materialError.js';

const createStockAdjustment = vi.fn();
const findAllSupplierMaterials = vi.fn();
const materialFindMany = vi.fn();
const materialFindUnique = vi.fn();
const transaction = vi.fn();
const goodsReceiptDetailCount = vi.fn();
const goodsIssueDetailCount = vi.fn();
const purchaseRequisitionDetailCount = vi.fn();
const movementDetailCount = vi.fn();
const stockAdjustmentDetailCount = vi.fn();
const wasteCount = vi.fn();
const supplierMaterialDeleteMany = vi.fn();
const materialDelete = vi.fn();

vi.mock('../../../../src/utils/logger.js', () => ({
  createServiceLogger: () => ({}),
  getModelLogContext: (_model, data = {}) => data,
  logServiceError: vi.fn(),
  logServiceInfo: vi.fn()
}));

vi.mock('../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    $transaction: transaction,
    material: {
      findMany: materialFindMany,
      findUnique: materialFindUnique,
      delete: materialDelete
    },
    goodsReceiptDetail: { count: goodsReceiptDetailCount },
    goodsIssueDetail: { count: goodsIssueDetailCount },
    purchaseRequisitionDetail: { count: purchaseRequisitionDetailCount },
    movementDetail: { count: movementDetailCount },
    stockAdjustmentDetail: { count: stockAdjustmentDetailCount },
    waste: { count: wasteCount },
    supplierMaterial: { deleteMany: supplierMaterialDeleteMany }
  })
}));

vi.mock('../../../../src/services/warehouse/adjustmentService.js', () => ({
  createStockAdjustment
}));

vi.mock('../../../../src/services/warehouse/materials/materialHelpers.js', () => ({
  prepareMaterialData: vi.fn(),
  withRetry: vi.fn(async (fn) => fn())
}));

vi.mock('../../../../src/services/warehouse/materials/materialRelations.js', () => ({
  syncSupplierMaterial: vi.fn()
}));

vi.mock('../../../../src/services/warehouse/materials/supplierMaterialService.js', () => ({
  findAllSupplierMaterials,
  findCurrentSupplierMaterialByMaterialId: vi.fn(),
  findSupplierMaterialByIds: vi.fn(),
  recalculateConvertedQuantityByMaterial: vi.fn()
}));

const { deleteMaterial, existsMaterial, findAllMaterials, findMaterialsSnapshot, updateMaterialStock } = await import('../../../../src/services/warehouse/materials/materialService.js');

describe('materialService submit operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation((callback) => callback({
      material: { findUnique: materialFindUnique, delete: materialDelete },
      goodsReceiptDetail: { count: goodsReceiptDetailCount },
      goodsIssueDetail: { count: goodsIssueDetailCount },
      purchaseRequisitionDetail: { count: purchaseRequisitionDetailCount },
      movementDetail: { count: movementDetailCount },
      stockAdjustmentDetail: { count: stockAdjustmentDetailCount },
      waste: { count: wasteCount },
      supplierMaterial: { deleteMany: supplierMaterialDeleteMany }
    }));
  });

  it('delega el listado GET a supplierMaterialService con filtros', async () => {
    const result = { data: [{ id: 'material-1' }], recordsTotal: 1, recordsFiltered: 1 };

    findAllSupplierMaterials.mockResolvedValue(result);

    await expect(findAllMaterials({
      skip: 10,
      take: 5,
      search: 'lamina',
      supplierId: 'supplier-1',
      orderBy: 'name',
      orderDir: 'desc'
    })).resolves.toEqual(result);
    expect(findAllSupplierMaterials).toHaveBeenCalledWith({
      skip: 10,
      take: 5,
      search: 'lamina',
      supplierId: 'supplier-1',
      orderBy: 'name',
      orderDir: 'desc'
    });
  });

  it('obtiene snapshots de materiales y valida existencia para GET', async () => {
    const materials = [{ id: 'material-1', name: 'Lámina' }];

    materialFindMany.mockResolvedValue(materials);
    materialFindUnique.mockResolvedValue({ id: 'material-1' });

    await expect(findMaterialsSnapshot({ materialIds: ['material-1'] })).resolves.toEqual(materials);
    await expect(existsMaterial({ id: 'material-1' })).resolves.toEqual({ id: 'material-1' });

    expect(materialFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: { in: ['material-1'] } }
    }));
    expect(materialFindUnique).toHaveBeenCalledWith({
      where: { id: 'material-1' },
      select: { id: true }
    });
  });

  it('falla con MaterialNotFound si no existe el material consultado', async () => {
    materialFindUnique.mockResolvedValue(null);

    await expect(existsMaterial({ id: 'missing-material' })).rejects.toThrow(MaterialNotFound);
  });



  it('elimina el material y sus relaciones con proveedores cuando no tiene vínculos operativos', async () => {
    const deleted = { id: 'material-1' };

    materialFindUnique.mockResolvedValue({ id: 'material-1' });
    goodsReceiptDetailCount.mockResolvedValue(0);
    goodsIssueDetailCount.mockResolvedValue(0);
    purchaseRequisitionDetailCount.mockResolvedValue(0);
    movementDetailCount.mockResolvedValue(0);
    stockAdjustmentDetailCount.mockResolvedValue(0);
    wasteCount.mockResolvedValue(0);
    supplierMaterialDeleteMany.mockResolvedValue({ count: 1 });
    materialDelete.mockResolvedValue(deleted);

    await expect(deleteMaterial('material-1')).resolves.toEqual(deleted);
    expect(supplierMaterialDeleteMany).toHaveBeenCalledWith({ where: { materialId: 'material-1' } });
    expect(materialDelete).toHaveBeenCalledWith({
      where: { id: 'material-1' },
      select: { id: true }
    });
  });

  it('bloquea la eliminación si el material tiene compras o salidas relacionadas', async () => {
    materialFindUnique.mockResolvedValue({ id: 'material-1' });
    goodsReceiptDetailCount.mockResolvedValue(1);
    goodsIssueDetailCount.mockResolvedValue(0);
    purchaseRequisitionDetailCount.mockResolvedValue(0);
    movementDetailCount.mockResolvedValue(0);
    stockAdjustmentDetailCount.mockResolvedValue(0);
    wasteCount.mockResolvedValue(0);

    await expect(deleteMaterial('material-1')).rejects.toThrow(MaterialDeleteRelationConflict);
    expect(supplierMaterialDeleteMany).not.toHaveBeenCalled();
    expect(materialDelete).not.toHaveBeenCalled();
  });


  it('delega el submit de ajuste de stock a createStockAdjustment', async () => {
    const materialDto = {
      supplierId: 'supplier-1',
      reasonId: 'reason-1',
      observations: 'Ajuste por conteo',
      newStock: 25
    };
    const adjustment = { id: 'adjustment-1', materialId: 'material-1' };

    createStockAdjustment.mockResolvedValue(adjustment);

    await expect(updateMaterialStock({ id: 'material-1', userId: 'user-1', materialDto })).resolves.toEqual(adjustment);
    expect(createStockAdjustment).toHaveBeenCalledWith({
      materialId: 'material-1',
      supplierId: 'supplier-1',
      reasonId: 'reason-1',
      observations: 'Ajuste por conteo',
      newStock: 25,
      userId: 'user-1'
    });
  });

  it('traduce P2025 a MaterialNotFound durante el ajuste de stock', async () => {
    createStockAdjustment.mockRejectedValue({ code: 'P2025' });

    await expect(updateMaterialStock({
      id: 'missing-material',
      userId: 'user-1',
      materialDto: { supplierId: 'supplier-1', reasonId: 'reason-1', newStock: 0 }
    })).rejects.toThrow(MaterialNotFound);
  });

  it('envuelve otros errores de ajuste de stock en MaterialStockAdjustmentDatabaseError', async () => {
    createStockAdjustment.mockRejectedValue(new Error('db failed'));

    await expect(updateMaterialStock({
      id: 'material-1',
      userId: 'user-1',
      materialDto: { supplierId: 'supplier-1', reasonId: 'reason-1', newStock: 0 }
    })).rejects.toThrow(MaterialStockAdjustmentDatabaseError);
  });
});
