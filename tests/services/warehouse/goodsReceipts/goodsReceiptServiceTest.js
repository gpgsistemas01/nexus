import { beforeEach, describe, expect, it, vi } from 'vitest';

const goodsReceiptFindUnique = vi.fn();
const goodsReceiptUpdate = vi.fn();
const findProfileById = vi.fn();

vi.mock('../../../../src/utils/logger.js', () => ({
  createServiceLogger: vi.fn(() => ({})),
  getModelLogContext: vi.fn((_model, data) => data),
  logServiceError: vi.fn(),
  logServiceInfo: vi.fn()
}));

vi.mock('../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    goodsReceipt: {
      findUnique: goodsReceiptFindUnique,
      update: goodsReceiptUpdate
    }
  })
}));

vi.mock('../../../../src/services/admin/profileService.js', () => ({
  findProfileById
}));

vi.mock('../../../../src/services/document/referenceNumberService.js', () => ({
  generateYearlyReferenceNumber: vi.fn()
}));

vi.mock('../../../../src/services/inventory/movementService.js', () => ({
  applyInventoryMovement: vi.fn()
}));

vi.mock('../../../../src/services/warehouse/supplierService.js', () => ({
  findUniqueSupplier: vi.fn()
}));

vi.mock('../../../../src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js', () => ({
  buildGoodsReceiptDetails: vi.fn()
}));

vi.mock('../../../../src/services/warehouse/products/supplierProductService.js', () => ({
  updateProductUnitCostIfHigher: vi.fn()
}));

vi.mock('../../../../src/services/warehouse/returns/returnHelpers.js', () => ({
  findReturnedQuantityTotalsByDetailIds: vi.fn(() => new Map())
}));

const { updateGoodsReceiptHeader } = await import('../../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js');

describe('goodsReceiptService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    goodsReceiptFindUnique.mockResolvedValue({ id: 'receipt-1' });
    findProfileById.mockResolvedValue({ id: 'profile-1', fullName: 'Usuario Almacén' });
    goodsReceiptUpdate.mockResolvedValue({ id: 'receipt-1', referenceNumber: 'REC-2026-0001' });
  });

  it('actualiza solo encabezado editable y no modifica proveedor ni detalles de la compra', async () => {
    await updateGoodsReceiptHeader({
      id: 'receipt-1',
      goodsReceiptDto: {
        supplierId: 'supplier-changed',
        receivedById: 'profile-1',
        isInvoiced: true,
        invoice: 'FAC-1',
        receptionDate: new Date('2026-07-09T00:00:00.000Z'),
        observations: 'Nota actualizada',
        details: [{ id: 'detail-1', quantity: 999 }]
      }
    });

    expect(goodsReceiptUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'receipt-1' },
      data: {
        isInvoiced: true,
        invoice: 'FAC-1',
        receptionDate: new Date('2026-07-09T00:00:00.000Z'),
        observations: 'Nota actualizada',
        receivedByName: 'Usuario Almacén',
        receivedBy: {
          connect: { id: 'profile-1' }
        }
      }
    }));

    const updateData = goodsReceiptUpdate.mock.calls[0][0].data;
    expect(updateData).not.toHaveProperty('supplierId');
    expect(updateData).not.toHaveProperty('supplierName');
    expect(updateData).not.toHaveProperty('supplier');
    expect(updateData).not.toHaveProperty('details');
  });
});
