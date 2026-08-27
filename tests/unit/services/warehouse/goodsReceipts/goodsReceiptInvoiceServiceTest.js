import { beforeEach, describe, expect, it, vi } from 'vitest';

const findFirst = vi.fn();

vi.mock('../../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({ goodsReceipt: { findFirst } })
}));

const { assertGoodsReceiptInvoiceAvailable } = await import(
  '../../../../../src/services/warehouse/goodsReceipts/goodsReceiptInvoiceService.js'
);

describe('unicidad de factura al crear y actualizar entradas de compra', () => {
  beforeEach(() => {
    findFirst.mockReset();
  });

  it('rechaza el alta duplicada e identifica la compra que debe editarse', async () => {
    findFirst.mockResolvedValue({ id: 'receipt-1', referenceNumber: 'COM-2026-0001' });

    await expect(assertGoodsReceiptInvoiceAvailable({
      supplierId: 'supplier-1',
      invoice: 'FAC-001'
    })).rejects.toMatchObject({
      code: 'GOODS_RECEIPT_INVOICE_ALREADY_EXISTS',
      statusCode: 409,
      meta: {
        existingGoodsReceiptId: 'receipt-1',
        existingReferenceNumber: 'COM-2026-0001'
      }
    });

    expect(findFirst).toHaveBeenCalledWith({
      where: { supplierId: 'supplier-1', invoice: 'FAC-001' },
      select: { id: true, referenceNumber: true }
    });
  });

  it('excluye la compra actual al validar una edición', async () => {
    findFirst.mockResolvedValue(null);

    await expect(assertGoodsReceiptInvoiceAvailable({
      supplierId: 'supplier-1',
      invoice: 'FAC-001',
      excludeGoodsReceiptId: 'receipt-1'
    })).resolves.toBeUndefined();

    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        supplierId: 'supplier-1',
        invoice: 'FAC-001',
        id: { not: 'receipt-1' }
      }
    }));
  });

  it('permite entradas sin factura sin consultar duplicados', async () => {
    await expect(assertGoodsReceiptInvoiceAvailable({
      supplierId: 'supplier-1',
      invoice: null
    })).resolves.toBeUndefined();

    expect(findFirst).not.toHaveBeenCalled();
  });
});
