import { beforeEach, describe, expect, it, vi } from 'vitest';

const goodsReceiptFindUnique = vi.fn();
const goodsReceiptUpdate = vi.fn();
const findProfileById = vi.fn();
const applyInventoryMovement = vi.fn();
const createGoodsReceiptDetailsAndUpdateTotals = vi.fn();
const dbTransaction = vi.fn(async (callback) => callback({
  goodsReceipt: {
    update: goodsReceiptUpdate
  }
}));

vi.mock('../../../../src/utils/logger.js', () => ({
  createServiceLogger: vi.fn(() => ({})),
  getModelLogContext: vi.fn((_model, data) => data),
  logServiceError: vi.fn(),
  logServiceInfo: vi.fn()
}));

vi.mock('../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    $transaction: dbTransaction,
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
  applyInventoryMovement
}));

vi.mock('../../../../src/services/warehouse/supplierService.js', () => ({
  findUniqueSupplier: vi.fn()
}));

vi.mock('../../../../src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js', () => ({
  buildGoodsReceiptDetails: vi.fn(),
  calculateGoodsReceiptTotals: vi.fn(() => ({})),
  createGoodsReceiptDetailsAndUpdateTotals
}));

vi.mock('../../../../src/services/warehouse/products/supplierProductService.js', () => ({
  updateProductUnitCostIfHigher: vi.fn()
}));

vi.mock('../../../../src/services/warehouse/returns/returnHelpers.js', () => ({
  findReturnedQuantityTotalsByDetailIds: vi.fn(() => new Map())
}));

const { updateGoodsReceipt } = await import('../../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js');

describe('goodsReceiptService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    goodsReceiptFindUnique.mockResolvedValue({ id: 'receipt-1' });
    findProfileById.mockResolvedValue({ id: 'profile-1', fullName: 'Usuario Almacén' });
    goodsReceiptUpdate.mockResolvedValue({
      id: 'receipt-1',
      referenceNumber: 'REC-2026-0001',
      supplierId: 'supplier-1',
      details: []
    });
    createGoodsReceiptDetailsAndUpdateTotals.mockResolvedValue({
      createdDetails: [{ id: 'detail-new', productId: 'product-1', quantity: 2 }],
      updatedReceipt: {
        id: 'receipt-1',
        referenceNumber: 'REC-2026-0001',
        supplierId: 'supplier-1',
        details: [{ id: 'detail-new', productId: 'product-1', quantity: 2 }]
      }
    });
  });

  it('actualiza compra con encabezado editable y no modifica proveedor ni detalles de la compra', async () => {
    await updateGoodsReceipt({
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

  it('crea los detalles nuevos y registra su movimiento de entrada al editar una compra', async () => {
    await updateGoodsReceipt({
      id: 'receipt-1',
      goodsReceiptDto: {
        receivedById: 'profile-1',
        isInvoiced: false,
        invoice: null,
        receptionDate: new Date('2026-07-09T00:00:00.000Z'),
        details: [{ productId: 'product-1', quantity: 2, costPerUnitType: 50 }],
        userId: 'user-1'
      }
    });

    expect(createGoodsReceiptDetailsAndUpdateTotals).toHaveBeenCalledWith({
      tx: expect.any(Object),
      goodsReceiptId: 'receipt-1',
      details: [{ productId: 'product-1', quantity: 2, costPerUnitType: 50 }]
    });

    expect(applyInventoryMovement).toHaveBeenCalledWith({
      tx: expect.any(Object),
      reference: { goodsReceiptId: 'receipt-1' },
      details: [{
        productId: 'product-1',
        goodsReceiptDetailId: 'detail-new',
        supplierId: 'supplier-1',
        quantity: 2
      }],
      movementType: 'ENTRY'
    });
  });
});
