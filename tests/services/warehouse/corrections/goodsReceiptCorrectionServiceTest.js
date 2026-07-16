import { beforeEach, describe, expect, it, vi } from 'vitest';

const transaction = vi.fn();
const goodsReceiptDetailFindFirst = vi.fn();
const goodsReceiptCorrectionCreate = vi.fn();
const goodsReceiptCorrectionFindUnique = vi.fn();
const buildGoodsReceiptDetails = vi.fn();
const updateGoodsReceiptDetailAndTotals = vi.fn();
const createStockAdjustmentByQuantityChange = vi.fn();
const findGoodsReceiptCorrectionReason = vi.fn();
const updateProductUnitCostIfHigher = vi.fn();

vi.mock('../../../../src/utils/logger.js', () => ({
  createServiceLogger: vi.fn(() => ({})),
  getModelLogContext: vi.fn((_model, data) => data),
  logServiceError: vi.fn()
}));

vi.mock('../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    $transaction: transaction
  })
}));

vi.mock('../../../../src/services/warehouse/adjustmentService.js', () => ({
  createStockAdjustmentByQuantityChange
}));

vi.mock('../../../../src/services/warehouse/products/supplierProductService.js', () => ({
  updateProductUnitCostIfHigher
}));

vi.mock('../../../../src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js', () => ({
  buildGoodsReceiptDetails,
  updateGoodsReceiptDetailAndTotals
}));

vi.mock('../../../../src/services/warehouse/reasonService.js', () => ({
  findGoodsReceiptCorrectionReason
}));

const {
  correctGoodsReceiptDetailLine,
  cancelGoodsReceiptDetailLine
} = await import('../../../../src/services/warehouse/corrections/goodsReceiptCorrectionService.js');

describe('goodsReceiptCorrectionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    transaction.mockImplementation(callback => callback({
      goodsReceiptDetail: {
        findFirst: goodsReceiptDetailFindFirst
      },
      goodsReceiptCorrection: {
        create: goodsReceiptCorrectionCreate,
        findUnique: goodsReceiptCorrectionFindUnique
      },
    }));

    goodsReceiptDetailFindFirst.mockResolvedValue({
      productId: 'product-old',
      productName: 'Producto anterior',
      quantity: 5,
      costPerUnitType: 10,
      netPurchaseAmount: 50,
      grossPurchaseAmount: 59.5,
      goodsReceipt: {
        supplierId: 'supplier-1',
        referenceNumber: 'OC-2026-0001'
      }
    });

    buildGoodsReceiptDetails.mockResolvedValue([{
      productId: 'product-old',
      productName: 'Producto anterior',
      quantity: 7,
      costPerUnitType: 10,
      netPurchaseAmount: 70,
      grossPurchaseAmount: 83.3
    }]);

    findGoodsReceiptCorrectionReason.mockResolvedValue({ id: 'reason-correction' });
    createStockAdjustmentByQuantityChange
      .mockResolvedValueOnce({ id: 'adjustment-1' })
      .mockResolvedValueOnce({ id: 'adjustment-2' });
    updateGoodsReceiptDetailAndTotals.mockResolvedValue({
      updatedDetail: { id: 'detail-1' },
      updatedReceipt: { id: 'receipt-1', supplierId: 'supplier-1' }
    });
    goodsReceiptCorrectionCreate.mockResolvedValue({ id: 'correction-1' });
    goodsReceiptCorrectionFindUnique.mockResolvedValue({ id: 'correction-1', stockAdjustment: { id: 'adjustment-1' } });
    updateProductUnitCostIfHigher.mockResolvedValue();
  });

  it('crea la corrección de recepción de compra', async () => {
    const result = await correctGoodsReceiptDetailLine({
      id: 'receipt-1',
      detailId: 'detail-1',
      correctionDto: {
        quantity: 7,
        costPerUnitType: 10
      },
      userId: 'user-1'
    });

    expect(buildGoodsReceiptDetails).toHaveBeenCalledWith([{
      productId: 'product-old',
      quantity: 7,
      costPerUnitType: 10
    }], expect.objectContaining({ tx: expect.any(Object) }));
    expect(goodsReceiptCorrectionCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        stockAdjustmentId: 'adjustment-1'
      })
    }));
    expect(createStockAdjustmentByQuantityChange).toHaveBeenCalledOnce();
    expect(result.correction).toEqual({ id: 'correction-1', stockAdjustment: { id: 'adjustment-1' } });
  });

  it('maneja la cancelación del detalle como modo CANCEL_DETAIL sin actualizar costo unitario', async () => {
    buildGoodsReceiptDetails.mockResolvedValueOnce([{
      productId: 'product-old',
      productName: 'Producto anterior',
      quantity: 0,
      costPerUnitType: 0,
      netPurchaseAmount: 0,
      grossPurchaseAmount: 0
    }]);

    await cancelGoodsReceiptDetailLine({
      id: 'receipt-1',
      detailId: 'detail-1',
      userId: 'user-1'
    });

    expect(buildGoodsReceiptDetails).toHaveBeenCalledWith([{
      productId: 'product-old',
      quantity: 0,
      costPerUnitType: 0
    }], expect.objectContaining({ tx: expect.any(Object) }));
    expect(updateGoodsReceiptDetailAndTotals).toHaveBeenCalledWith(expect.objectContaining({
      correctedDetail: expect.objectContaining({
        status: 'CANCELED'
      })
    }));
    expect(goodsReceiptCorrectionCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        correctionType: 'CANCEL_DETAIL',
        correctedQuantity: 0,
        correctedCostPerUnitType: 0
      })
    }));
    expect(updateProductUnitCostIfHigher).not.toHaveBeenCalled();
  });

});
