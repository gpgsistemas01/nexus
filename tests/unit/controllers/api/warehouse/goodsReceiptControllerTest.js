import { beforeEach, describe, expect, it, vi } from 'vitest';

const { emitInventoryUpdated, updateGoodsReceipt } = vi.hoisted(() => ({
  emitInventoryUpdated: vi.fn(),
  updateGoodsReceipt: vi.fn()
}));

vi.mock('../../../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js', () => ({
  createGoodsReceipt: vi.fn(),
  findAllGoodsReceipts: vi.fn(),
  updateGoodsReceipt
}));

vi.mock('../../../../../src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptCancellationService.js', () => ({
  cancelGoodsReceiptDetailLine: vi.fn()
}));

vi.mock('../../../../../src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptCorrectionService.js', () => ({
  correctGoodsReceiptDetailLine: vi.fn()
}));

vi.mock('../../../../../src/utils/socketUtils.js', () => ({ emitInventoryUpdated }));

import { editGoodsReceiptHeader } from '../../../../../src/controllers/api/warehouse/goodsReceiptController.js';

describe('actualización CRUD de entradas de compra', () => {
  beforeEach(() => vi.clearAllMocks());

  it('notifica el inventario después de agregar un detalle en modo edición', async () => {
    const goodsReceipt = { id: 'receipt-1', details: [{ id: 'detail-2' }] };
    const req = {
      params: { id: 'receipt-1' },
      user: { id: 'user-1' },
      body: {
        supplierId: ' supplier-1 ',
        receivedById: ' person-1 ',
        isInvoiced: false,
        receptionDate: '2026-08-27T12:00:00.000Z',
        details: [{ materialId: ' material-2 ', quantity: '2', costPerUnitType: '50' }]
      }
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    updateGoodsReceipt.mockResolvedValue(goodsReceipt);

    await editGoodsReceiptHeader(req, res);

    expect(updateGoodsReceipt).toHaveBeenCalledWith({
      id: 'receipt-1',
      goodsReceiptDto: expect.objectContaining({
        supplierId: 'supplier-1',
        receivedById: 'person-1',
        userId: 'user-1',
        details: [{ materialId: 'material-2', quantity: 2, costPerUnitType: 50 }]
      })
    });
    expect(emitInventoryUpdated).toHaveBeenCalledWith({
      context: 'material',
      source: 'goods-receipt-updated'
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ goodsReceipt }));
  });
});
