import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findAllGoodsReceipts, correctGoodsReceiptDetailLine, findGoodsReceiptReportRows } = vi.hoisted(() => ({
  findAllGoodsReceipts: vi.fn(),
  correctGoodsReceiptDetailLine: vi.fn(),
  findGoodsReceiptReportRows: vi.fn()
}));

vi.mock('../../../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js', () => ({
  createGoodsReceipt: vi.fn(),
  findAllGoodsReceipts,
  updateGoodsReceipt: vi.fn()
}));

vi.mock('../../../../../src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptCancellationService.js', () => ({
  cancelGoodsReceiptDetailLine: vi.fn()
}));

vi.mock('../../../../../src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptCorrectionService.js', () => ({
  correctGoodsReceiptDetailLine
}));

vi.mock('../../../../../src/services/warehouse/reportService.js', () => ({
  findGoodsReceiptReportRows
}));

const materialService = await import(
  '../../../../../src/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js'
);
const consumableService = await import(
  '../../../../../src/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js'
);

describe('servicios de compra específicos por contexto', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fija MATERIAL desde la fachada de materiales', async () => {
    await materialService.findAllMaterialGoodsReceipts({ search: 'folio' });
    await materialService.correctMaterialGoodsReceiptDetailLine({ id: 'receipt-1' });

    expect(findAllGoodsReceipts).toHaveBeenCalledWith({ search: 'folio', type: 'MATERIAL' });
    expect(correctGoodsReceiptDetailLine).toHaveBeenCalledWith({ id: 'receipt-1', type: 'MATERIAL' });
  });

  it('fija CONSUMABLE desde la fachada de consumibles y su reporte', async () => {
    await consumableService.findAllConsumableGoodsReceipts({ search: 'folio' });
    await consumableService.findConsumableGoodsReceiptReportRows({ supplierId: 'supplier-1' });

    expect(findAllGoodsReceipts).toHaveBeenCalledWith({ search: 'folio', type: 'CONSUMABLE' });
    expect(findGoodsReceiptReportRows).toHaveBeenCalledWith({
      supplierId: 'supplier-1',
      type: 'CONSUMABLE'
    });
  });
});
