import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductNotFound } from '../../../../src/errors/warehouse/productError.js';
import { buildGoodsReceiptDetails, calculateGoodsReceiptTotals, cancelGoodsReceiptDetailAndTotals, correctGoodsReceiptDetailAndTotals } from '../../../../src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js';
import { findProductsSnapshot } from '../../../../src/services/warehouse/products/productService.js';

vi.mock('../../../../src/services/warehouse/products/productService.js', () => ({
  findProductsSnapshot: vi.fn()
}));

describe('goodsReceiptHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('construye detalles de compra con montos, IVA y conversión usando datos representativos', async () => {
    findProductsSnapshot.mockResolvedValue([
      {
        id: 'product-1',
        name: 'Lámina PVC',
        base: 1.2,
        height: 2,
        presentation: { id: 'presentation-1', name: 'Hoja' },
        unitMeasure: { id: 'unit-1', name: 'Metro cuadrado', symbol: 'm2' }
      }
    ]);

    await expect(buildGoodsReceiptDetails([
      { productId: 'product-1', quantity: 3, costPerUnitType: 125.5 }
    ])).resolves.toEqual([
      {
        productId: 'product-1',
        quantity: 3,
        convertedQuantity: 7.2,
        costPerUnitType: 125.5,
        conversionUnitCost: 52.29,
        netPurchaseAmount: 376.5,
        grossPurchaseAmount: 436.74,
        productName: 'Lámina PVC',
        productBase: 1.2,
        productHeight: 2,
        presentationId: 'presentation-1',
        presentationName: 'Hoja',
        unitMeasureId: 'unit-1',
        unitMeasureName: 'Metro cuadrado',
        unitMeasureSymbol: 'm2'
      }
    ]);

    expect(findProductsSnapshot).toHaveBeenCalledWith({ tx: null, productIds: ['product-1'] });
  });

  it('calcula totales sólo con detalles activos para mantener visibles los cancelados', () => {
    expect(calculateGoodsReceiptTotals([
      { quantity: 5, netPurchaseAmount: 50, grossPurchaseAmount: 58, status: 'ACTIVE' },
      { quantity: 3, netPurchaseAmount: 30, grossPurchaseAmount: 34.8, status: 'CANCELED' }
    ])).toEqual({
      totalQuantity: 5,
      totalNetPurchaseAmount: 50,
      totalGrossPurchaseAmount: 58
    });
  });

  it('lanza ProductNotFound si el producto solicitado no existe en el snapshot', async () => {
    findProductsSnapshot.mockResolvedValue([]);

    await expect(buildGoodsReceiptDetails([
      { productId: 'missing-product', quantity: 1, costPerUnitType: 10 }
    ])).rejects.toThrow(ProductNotFound);
  });
});


describe('actualización de detalle y totales de compra', () => {
  const createTx = () => ({
    goodsReceiptDetail: {
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn()
    },
    goodsReceipt: { update: vi.fn() }
  });

  it('actualiza el detalle activo antes de cancelar el encabezado', async () => {
    const tx = createTx();
    const updatedDetail = { id: 'detail-1', status: 'CANCELED' };
    const updatedReceipt = { id: 'receipt-1', details: [updatedDetail] };
    tx.goodsReceiptDetail.updateMany.mockResolvedValue({ count: 1 });
    tx.goodsReceiptDetail.findUnique.mockResolvedValue(updatedDetail);
    tx.goodsReceiptDetail.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ quantity: 5, netPurchaseAmount: 50, grossPurchaseAmount: 58, status: 'CANCELED' }]);
    tx.goodsReceipt.update.mockResolvedValue(updatedReceipt);

    await expect(cancelGoodsReceiptDetailAndTotals({
      tx,
      goodsReceiptId: 'receipt-1',
      detailId: 'detail-1'
    })).resolves.toEqual({ updatedDetail, updatedReceipt });

    expect(tx.goodsReceiptDetail.updateMany).toHaveBeenCalledWith({
      where: { id: 'detail-1', goodsReceiptId: 'receipt-1', status: 'ACTIVE' },
      data: { status: 'CANCELED' }
    });
    expect(tx.goodsReceipt.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        status: { connect: { name: 'Cancelada' } }
      })
    }));
  });

  it('aplica los datos calculados únicamente en el flujo de corrección', async () => {
    const tx = createTx();
    const correctedDetail = { quantity: 4, netPurchaseAmount: 40, grossPurchaseAmount: 46.4 };
    tx.goodsReceiptDetail.updateMany.mockResolvedValue({ count: 1 });
    tx.goodsReceiptDetail.findUnique.mockResolvedValue({ id: 'detail-1', ...correctedDetail });
    tx.goodsReceiptDetail.findMany.mockResolvedValue([{ ...correctedDetail, status: 'ACTIVE' }]);
    tx.goodsReceipt.update.mockResolvedValue({ id: 'receipt-1' });

    await correctGoodsReceiptDetailAndTotals({
      tx,
      goodsReceiptId: 'receipt-1',
      detailId: 'detail-1',
      correctedDetail
    });

    expect(tx.goodsReceiptDetail.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: correctedDetail
    }));
  });

  it('no modifica el encabezado si el detalle no pudo cambiar de activo a cancelado', async () => {
    const tx = createTx();
    tx.goodsReceiptDetail.updateMany.mockResolvedValue({ count: 0 });

    await expect(cancelGoodsReceiptDetailAndTotals({
      tx,
      goodsReceiptId: 'receipt-1',
      detailId: 'detail-1'
    })).rejects.toMatchObject({ code: 'GOODS_RECEIPT_DETAIL_ALREADY_CANCELED' });

    expect(tx.goodsReceiptDetail.findMany).not.toHaveBeenCalled();
    expect(tx.goodsReceipt.update).not.toHaveBeenCalled();
  });
});
