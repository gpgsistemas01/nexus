import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductNotFound } from '../../../../src/errors/warehouse/productError.js';
import { buildGoodsReceiptDetails } from '../../../../src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js';
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

    expect(findProductsSnapshot).toHaveBeenCalledWith({ productIds: ['product-1'] });
  });

  it('lanza ProductNotFound si el producto solicitado no existe en el snapshot', async () => {
    findProductsSnapshot.mockResolvedValue([]);

    await expect(buildGoodsReceiptDetails([
      { productId: 'missing-product', quantity: 1, costPerUnitType: 10 }
    ])).rejects.toThrow(ProductNotFound);
  });
});
