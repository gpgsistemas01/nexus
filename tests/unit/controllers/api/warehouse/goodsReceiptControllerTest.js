import { beforeEach, describe, expect, it, vi } from 'vitest';

const createGoodsReceipt = vi.fn();
const findAllGoodsReceipts = vi.fn();
const updateGoodsReceipt = vi.fn();
const correctGoodsReceiptDetailLine = vi.fn();
const cancelGoodsReceiptDetailLine = vi.fn();

vi.mock('../../../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js', () => ({
  createGoodsReceipt,
  findAllGoodsReceipts,
  updateGoodsReceipt
}));
vi.mock('../../../../../src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptCorrectionService.js', () => ({
  correctGoodsReceiptDetailLine
}));
vi.mock('../../../../../src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptCancellationService.js', () => ({
  cancelGoodsReceiptDetailLine
}));

const {
  correctGoodsReceiptDetail,
  registerGoodsReceipt
} = await import('../../../../../src/controllers/api/warehouse/goodsReceiptController.js');

const createResponse = () => {
  const response = { status: vi.fn(), json: vi.fn() };
  response.status.mockReturnValue(response);
  return response;
};

describe('goodsReceiptController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('envía solo operandos al servicio y descarta costos calculados por el frontend', async () => {
    const goodsReceipt = { id: 'receipt-1' };
    const response = createResponse();
    createGoodsReceipt.mockResolvedValue(goodsReceipt);

    await registerGoodsReceipt({
      body: {
        supplierId: ' supplier-1 ',
        receivedById: ' person-1 ',
        isInvoiced: false,
        receptionDate: '2026-08-06T12:00:00.000Z',
        details: [{
          materialId: ' material-1 ',
          quantity: '7.89',
          costPerUnitType: '12.34',
          convertedQuantity: 44.25,
          conversionUnitCost: 2.75,
          netPurchaseAmount: 97.36,
          grossPurchaseAmount: 112.94
        }]
      }
    }, response);

    expect(createGoodsReceipt).toHaveBeenCalledWith({
      goodsReceiptDto: {
        supplierId: 'supplier-1',
        receivedById: 'person-1',
        receptionDate: new Date('2026-08-06T12:00:00.000Z'),
        details: [{
          materialId: 'material-1',
          quantity: 7.89,
          costPerUnitType: 12.34
        }]
      }
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ goodsReceipt, code: 'CREATED_GOODS_RECEIPT' });
  });

  it('corrige cantidad y costo desde el controller para recalcular todos los derivados', async () => {
    const correction = { updatedDetail: { id: 'detail-1' } };
    const response = createResponse();
    correctGoodsReceiptDetailLine.mockResolvedValue(correction);

    await correctGoodsReceiptDetail({
      params: { id: 'receipt-1', detailId: 'detail-1' },
      user: { id: 'user-1' },
      body: {
        quantity: '3.333333',
        costPerUnitType: '12.345678',
        conversionUnitCost: 999,
        netPurchaseAmount: 999,
        grossPurchaseAmount: 999
      }
    }, response);

    expect(correctGoodsReceiptDetailLine).toHaveBeenCalledWith({
      id: 'receipt-1',
      detailId: 'detail-1',
      correctionDto: {
        quantity: 3.333333,
        costPerUnitType: 12.345678
      },
      userId: 'user-1'
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ correction, code: 'UPDATED_GOODS_RECEIPT' });
  });
});
