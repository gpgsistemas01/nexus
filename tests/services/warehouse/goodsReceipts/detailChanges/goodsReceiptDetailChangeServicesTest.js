import { beforeEach, describe, expect, it, vi } from 'vitest';

const transaction = vi.fn();
const goodsReceiptDetailFindFirst = vi.fn();
const goodsReceiptDetailChangeCreate = vi.fn();
const goodsReceiptDetailChangeFindUnique = vi.fn();
const buildGoodsReceiptDetails = vi.fn();
const updateGoodsReceiptDetailAndTotals = vi.fn();
const createStockAdjustmentByQuantityChange = vi.fn();
const findGoodsReceiptDetailChangeReason = vi.fn();
const updateProductUnitCostIfHigher = vi.fn();

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

vi.mock('../../../../../src/services/warehouse/adjustmentService.js', () => ({
  createStockAdjustmentByQuantityChange
}));

vi.mock('../../../../../src/services/warehouse/products/supplierProductService.js', () => ({
  updateProductUnitCostIfHigher
}));

vi.mock('../../../../../src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js', () => ({
  buildGoodsReceiptDetails,
  updateGoodsReceiptDetailAndTotals
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
      productId: 'product-old',
      productName: 'Producto anterior',
      quantity: 5,
      costPerUnitType: 10,
      netPurchaseAmount: 50,
      grossPurchaseAmount: 59.5,
      status: 'ACTIVE',
      goodsReceipt: {
        supplierId: 'supplier-1',
        referenceNumber: 'OC-2026-0001'
      }
    });

    buildGoodsReceiptDetails.mockResolvedValue([{
      productId: 'product-old',
      productName: 'Producto anterior',
      quantity: 4,
      costPerUnitType: 10,
      netPurchaseAmount: 40,
      grossPurchaseAmount: 47.6
    }]);

    findGoodsReceiptDetailChangeReason.mockResolvedValue({ id: 'reason-correction' });
    createStockAdjustmentByQuantityChange
      .mockResolvedValueOnce({ id: 'adjustment-1' })
      .mockResolvedValueOnce({ id: 'adjustment-2' });
    updateGoodsReceiptDetailAndTotals.mockResolvedValue({
      updatedDetail: { id: 'detail-1' },
      updatedReceipt: { id: 'receipt-1', supplierId: 'supplier-1' }
    });
    goodsReceiptDetailChangeCreate.mockResolvedValue({ id: 'change-1' });
    goodsReceiptDetailChangeFindUnique.mockResolvedValue({ id: 'change-1', stockAdjustment: { id: 'adjustment-1' } });
    updateProductUnitCostIfHigher.mockResolvedValue();
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
      productId: 'product-old',
      quantity: 4,
      costPerUnitType: 10
    }], expect.objectContaining({ tx: expect.any(Object) }));
    expect(findGoodsReceiptDetailChangeReason).toHaveBeenCalledWith(expect.objectContaining({
      changeType: 'QUANTITY'
    }));
    expect(goodsReceiptDetailChangeCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        stockAdjustmentId: 'adjustment-1'
      })
    }));
    expect(createStockAdjustmentByQuantityChange).toHaveBeenCalledWith(expect.objectContaining({
      quantityChange: -1,
      observations: 'Corrección de compra OC-2026-0001; campos afectados: cantidad. Ajuste de salida por disminución de cantidad.'
    }));
    expect(result.detailChange).toEqual({ id: 'change-1', stockAdjustment: { id: 'adjustment-1' } });
    expect(result).not.toHaveProperty('costDifference');
  });

  it('cancela el detalle con un flujo independiente sin actualizar costo unitario', async () => {
    const result = await cancelGoodsReceiptDetailLine({
      id: 'receipt-1',
      detailId: 'detail-1',
      userId: 'user-1'
    });

    expect(buildGoodsReceiptDetails).not.toHaveBeenCalled();
    expect(findGoodsReceiptDetailChangeReason).toHaveBeenCalledWith(expect.objectContaining({
      changeType: 'CANCELLATION'
    }));
    expect(createStockAdjustmentByQuantityChange).toHaveBeenCalledWith(expect.objectContaining({
      quantityChange: -5,
      observations: 'Cancelación de detalle de compra OC-2026-0001. Ajuste de salida por cancelación del detalle.'
    }));
    expect(updateGoodsReceiptDetailAndTotals).toHaveBeenCalledWith(expect.objectContaining({
      correctedDetail: {
        status: 'CANCELED'
      }
    }));
    expect(goodsReceiptDetailChangeCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        changeType: 'CANCELLATION',
        correctedQuantity: 0,
        correctedCostPerUnitType: 10,
        costDifference: 0
      })
    }));
    expect(updateProductUnitCostIfHigher).not.toHaveBeenCalled();
    expect(result).not.toHaveProperty('costDifference');
  });



  it('rechaza cancelar un detalle de compra que ya está cancelado', async () => {
    goodsReceiptDetailFindFirst.mockResolvedValueOnce({
      productId: 'product-old',
      productName: 'Producto anterior',
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
    expect(createStockAdjustmentByQuantityChange).not.toHaveBeenCalled();
    expect(updateGoodsReceiptDetailAndTotals).not.toHaveBeenCalled();
    expect(goodsReceiptDetailChangeCreate).not.toHaveBeenCalled();
  });

  it('rechaza correcciones con cantidad cero para usar el flujo explícito de cancelación', async () => {
    buildGoodsReceiptDetails.mockResolvedValueOnce([{
      productId: 'product-old',
      productName: 'Producto anterior',
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

    expect(createStockAdjustmentByQuantityChange).not.toHaveBeenCalled();
    expect(updateGoodsReceiptDetailAndTotals).not.toHaveBeenCalled();
    expect(goodsReceiptDetailChangeCreate).not.toHaveBeenCalled();
  });

  it('rechaza correcciones con cantidad mayor a la registrada del detalle', async () => {
    buildGoodsReceiptDetails.mockResolvedValueOnce([{
      productId: 'product-old',
      productName: 'Producto anterior',
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

    expect(createStockAdjustmentByQuantityChange).not.toHaveBeenCalled();
    expect(updateGoodsReceiptDetailAndTotals).not.toHaveBeenCalled();
  });

});
