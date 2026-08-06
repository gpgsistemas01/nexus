import { beforeEach, describe, expect, it, vi } from 'vitest';

const transaction = vi.fn();
const goodsReceiptDetailFindFirst = vi.fn();
const goodsReceiptDetailChangeCreate = vi.fn();
const goodsReceiptDetailChangeFindUnique = vi.fn();
const buildGoodsReceiptDetails = vi.fn();
const correctGoodsReceiptDetailAndTotals = vi.fn();
const cancelGoodsReceiptDetailAndTotals = vi.fn();
const createInventoryMovement = vi.fn();
const findSupplierMaterialByIds = vi.fn();
const adjustSupplierMaterialStock = vi.fn();
const findGoodsReceiptDetailChangeReason = vi.fn();
const recalculateMaterialUnitCosts = vi.fn();

vi.mock('../../../../../src/utils/logger.js', () => ({
  createServiceLogger: vi.fn(() => ({})),
  getModelLogContext: vi.fn((_model, data) => data),
  logServiceError: vi.fn()
}));

vi.mock('../../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    $transaction: transaction
  })
}));

vi.mock('../../../../../src/services/inventory/movementService.js', () => ({
  createInventoryMovement
}));

vi.mock('../../../../../src/services/warehouse/materials/supplierMaterialService.js', () => ({
  recalculateMaterialUnitCosts,
  findSupplierMaterialByIds,
  adjustSupplierMaterialStock
}));

vi.mock('../../../../../src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js', () => ({
  buildGoodsReceiptDetails,
  correctGoodsReceiptDetailAndTotals,
  cancelGoodsReceiptDetailAndTotals
}));

vi.mock('../../../../../src/services/warehouse/reasonService.js', () => ({
  findGoodsReceiptDetailChangeReason
}));

const { correctGoodsReceiptDetailLine } = await import('../../../../../src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptCorrectionService.js');
const { cancelGoodsReceiptDetailLine } = await import('../../../../../src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptCancellationService.js');

describe('goods receipt detail change services', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    transaction.mockImplementation(callback => callback({
      goodsReceiptDetail: {
        findFirst: goodsReceiptDetailFindFirst
      },
      goodsReceiptDetailChange: {
        create: goodsReceiptDetailChangeCreate,
        findUnique: goodsReceiptDetailChangeFindUnique
      },
    }));

    goodsReceiptDetailFindFirst.mockResolvedValue({
      materialId: 'material-old',
      materialName: 'Material anterior',
      quantity: 5,
      costPerUnitType: 10,
      netPurchaseAmount: 50,
      grossPurchaseAmount: 59.5,
      materialBase: 1,
      materialHeight: 1,
      status: 'ACTIVE',
      goodsReceipt: {
        supplierId: 'supplier-1',
        referenceNumber: 'OC-2026-0001'
      }
    });

    buildGoodsReceiptDetails.mockResolvedValue([{
      materialId: 'material-old',
      materialName: 'Material anterior',
      quantity: 4,
      costPerUnitType: 10,
      netPurchaseAmount: 40,
      grossPurchaseAmount: 47.6
    }]);

    findGoodsReceiptDetailChangeReason.mockResolvedValue({ id: 'reason-correction' });
    findSupplierMaterialByIds.mockResolvedValue({
      materialId: 'material-old',
      supplierId: 'supplier-1',
      currentStock: 10,
      convertedQuantity: 10,
      material: { id: 'material-old', name: 'Material anterior', base: 1, height: 1 },
      supplier: { tradeName: 'Proveedor' }
    });
    createInventoryMovement.mockResolvedValue({ id: 'movement-1' });
    adjustSupplierMaterialStock.mockResolvedValue({});
    correctGoodsReceiptDetailAndTotals.mockResolvedValue({
      updatedDetail: { id: 'detail-1', materialId: 'material-old' },
      updatedReceipt: { id: 'receipt-1', supplierId: 'supplier-1' }
    });
    cancelGoodsReceiptDetailAndTotals.mockResolvedValue({
      updatedDetail: { id: 'detail-1', materialId: 'material-old', status: 'CANCELED' },
      updatedReceipt: { id: 'receipt-1', supplierId: 'supplier-1' }
    });
    goodsReceiptDetailChangeCreate.mockResolvedValue({ id: 'change-1', inventoryMovement: { id: 'movement-1' } });
    recalculateMaterialUnitCosts.mockResolvedValue();
  });

  it('crea la corrección de recepción de compra', async () => {
    const result = await correctGoodsReceiptDetailLine({
      id: 'receipt-1',
      detailId: 'detail-1',
      correctionDto: {
        quantity: 4,
        costPerUnitType: 10
      },
      userId: 'user-1'
    });

    expect(buildGoodsReceiptDetails).toHaveBeenCalledWith([{
      materialId: 'material-old',
      quantity: 4,
      costPerUnitType: 10
    }], expect.objectContaining({ tx: expect.any(Object) }));
    expect(findGoodsReceiptDetailChangeReason).toHaveBeenCalledWith(expect.objectContaining({
      changeType: 'QUANTITY'
    }));
    expect(goodsReceiptDetailChangeCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        inventoryMovementId: 'movement-1'
      }),
      include: {
        inventoryMovement: true
      }
    }));
    expect(createInventoryMovement).toHaveBeenCalledWith(expect.objectContaining({
      movementType: 'ADJUSTMENT',
      reference: { goodsReceiptId: 'receipt-1' },
      details: [expect.objectContaining({ quantity: -1, goodsReceiptDetailId: 'detail-1' })]
    }));
    expect(correctGoodsReceiptDetailAndTotals).toHaveBeenCalledWith(expect.objectContaining({
      goodsReceiptId: 'receipt-1',
      detailId: 'detail-1',
      correctedDetail: expect.objectContaining({ quantity: 4 })
    }));
    expect(cancelGoodsReceiptDetailAndTotals).not.toHaveBeenCalled();
    expect(recalculateMaterialUnitCosts).toHaveBeenCalledWith({
      supplierId: 'supplier-1',
      materialIds: ['material-old']
    });
    expect(result.movement).toEqual({ id: 'movement-1' });
    expect(result).not.toHaveProperty('costDifference');
  });

  it('cancela el detalle y recalcula el costo unitario restante', async () => {
    const tx = {
      goodsReceiptDetail: {
        findFirst: goodsReceiptDetailFindFirst
      },
      goodsReceiptDetailChange: {
        create: goodsReceiptDetailChangeCreate,
        findUnique: goodsReceiptDetailChangeFindUnique
      }
    };
    transaction.mockImplementationOnce(callback => callback(tx));

    const result = await cancelGoodsReceiptDetailLine({
      id: 'receipt-1',
      detailId: 'detail-1',
      userId: 'user-1'
    });

    expect(buildGoodsReceiptDetails).not.toHaveBeenCalled();
    expect(findGoodsReceiptDetailChangeReason).toHaveBeenCalledWith({
      tx,
      changeType: 'CANCELLATION'
    });
    expect(createInventoryMovement).toHaveBeenCalledWith(expect.objectContaining({
      tx,
      movementType: 'ADJUSTMENT',
      reference: { goodsReceiptId: 'receipt-1' },
      details: [expect.objectContaining({ quantity: -5, goodsReceiptDetailId: 'detail-1' })]
    }));
    expect(cancelGoodsReceiptDetailAndTotals).toHaveBeenCalledWith({
      tx,
      goodsReceiptId: 'receipt-1',
      detailId: 'detail-1'
    });
    expect(goodsReceiptDetailChangeCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        inventoryMovementId: 'movement-1',
        changeType: 'CANCELLATION',
        correctedQuantity: 5,
        correctedCostPerUnitType: 10,
        correctedNetPurchaseAmount: 50,
        correctedGrossPurchaseAmount: 59.5,
        quantityDifference: -5,
        costDifference: 0
      }),
      include: {
        inventoryMovement: true
      }
    }));
    expect(goodsReceiptDetailChangeFindUnique).not.toHaveBeenCalled();
    expect(recalculateMaterialUnitCosts).toHaveBeenCalledWith({
      supplierId: 'supplier-1',
      materialIds: ['material-old']
    });
    expect(result).not.toHaveProperty('costDifference');
  });

  it('rechaza la cancelación antes de crear el movimiento cuando no hay stock suficiente', async () => {
    findSupplierMaterialByIds.mockResolvedValueOnce({
      materialId: 'material-old',
      supplierId: 'supplier-1',
      currentStock: 2,
      convertedQuantity: 2,
      material: { id: 'material-old', name: 'Material anterior', base: 1, height: 1 },
      supplier: { tradeName: 'Proveedor' }
    });

    await expect(cancelGoodsReceiptDetailLine({
      id: 'receipt-1',
      detailId: 'detail-1',
      userId: 'user-1'
    })).rejects.toMatchObject({
      code: 'GOODS_RECEIPT_CORRECTION_INSUFFICIENT_STOCK'
    });

    expect(createInventoryMovement).not.toHaveBeenCalled();
    expect(adjustSupplierMaterialStock).not.toHaveBeenCalled();
    expect(cancelGoodsReceiptDetailAndTotals).not.toHaveBeenCalled();
    expect(goodsReceiptDetailChangeCreate).not.toHaveBeenCalled();
  });



  it('rechaza cancelar un detalle de compra que ya está cancelado', async () => {
    goodsReceiptDetailFindFirst.mockResolvedValueOnce({
      materialId: 'material-old',
      materialName: 'Material anterior',
      quantity: 0,
      costPerUnitType: 0,
      netPurchaseAmount: 0,
      grossPurchaseAmount: 0,
      status: 'CANCELED',
      goodsReceipt: {
        supplierId: 'supplier-1',
        referenceNumber: 'OC-2026-0001'
      }
    });

    await expect(cancelGoodsReceiptDetailLine({
      id: 'receipt-1',
      detailId: 'detail-1',
      userId: 'user-1'
    })).rejects.toMatchObject({
      code: 'GOODS_RECEIPT_DETAIL_ALREADY_CANCELED'
    });

    expect(buildGoodsReceiptDetails).not.toHaveBeenCalled();
    expect(createInventoryMovement).not.toHaveBeenCalled();
    expect(correctGoodsReceiptDetailAndTotals).not.toHaveBeenCalled();
    expect(goodsReceiptDetailChangeCreate).not.toHaveBeenCalled();
  });

  it('rechaza correcciones con cantidad cero para usar el flujo explícito de cancelación', async () => {
    buildGoodsReceiptDetails.mockResolvedValueOnce([{
      materialId: 'material-old',
      materialName: 'Material anterior',
      quantity: 0,
      costPerUnitType: 10,
      netPurchaseAmount: 0,
      grossPurchaseAmount: 0
    }]);

    await expect(correctGoodsReceiptDetailLine({
      id: 'receipt-1',
      detailId: 'detail-1',
      correctionDto: {
        quantity: 0,
        costPerUnitType: 10
      },
      userId: 'user-1'
    })).rejects.toMatchObject({
      code: 'GOODS_RECEIPT_CORRECTION_QUANTITY_CONFLICT'
    });

    expect(createInventoryMovement).not.toHaveBeenCalled();
    expect(correctGoodsReceiptDetailAndTotals).not.toHaveBeenCalled();
    expect(goodsReceiptDetailChangeCreate).not.toHaveBeenCalled();
  });

  it('rechaza correcciones con cantidad mayor a la registrada del detalle', async () => {
    buildGoodsReceiptDetails.mockResolvedValueOnce([{
      materialId: 'material-old',
      materialName: 'Material anterior',
      quantity: 6,
      costPerUnitType: 10,
      netPurchaseAmount: 60,
      grossPurchaseAmount: 71.4
    }]);

    await expect(correctGoodsReceiptDetailLine({
      id: 'receipt-1',
      detailId: 'detail-1',
      correctionDto: {
        quantity: 6,
        costPerUnitType: 10
      },
      userId: 'user-1'
    })).rejects.toMatchObject({
      code: 'GOODS_RECEIPT_CORRECTION_QUANTITY_CONFLICT'
    });

    expect(createInventoryMovement).not.toHaveBeenCalled();
    expect(cancelGoodsReceiptDetailAndTotals).not.toHaveBeenCalled();
  });

});
