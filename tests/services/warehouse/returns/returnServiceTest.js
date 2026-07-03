import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GoodsIssueInsufficientStock } from '../../../../src/errors/inventory/stockError.js';
import {
  GoodsReceiptReturnInsufficientStock,
  GoodsReceiptReturnQuantityExceeded
} from '../../../../src/errors/warehouse/goodsReceiptError.js';

const goodsIssueFindUnique = vi.fn();
const goodsReceiptFindUnique = vi.fn();
const movementDetailGroupBy = vi.fn();
const transaction = vi.fn(async (fn) => fn({
  goodsIssue: { findUnique: goodsIssueFindUnique },
  goodsReceipt: { findUnique: goodsReceiptFindUnique },
  movementDetail: { groupBy: movementDetailGroupBy }
}));
const createGoodsIssueReturnStockAdjustment = vi.fn();
const createGoodsReceiptReturnStockAdjustment = vi.fn();

vi.mock('../../../../src/utils/logger.js', () => ({
  createServiceLogger: () => ({}),
  getModelLogContext: (_model, data = {}) => data,
  logServiceError: vi.fn(),
  logServiceInfo: vi.fn()
}));

vi.mock('../../../../src/repository/baseRepository.js', () => ({
  getDb: (tx = null) => tx || ({
    goodsIssue: { findUnique: goodsIssueFindUnique },
    goodsReceipt: { findUnique: goodsReceiptFindUnique },
    $transaction: transaction
  })
}));

vi.mock('../../../../src/services/warehouse/adjustmentService.js', () => ({
  createGoodsIssueReturnStockAdjustment,
  createGoodsReceiptReturnStockAdjustment
}));

vi.mock('../../../../src/services/admin/profileService.js', () => ({
  findProfileById: vi.fn(),
  findProfileWithDepartmentsById: vi.fn()
}));
vi.mock('../../../../src/services/admin/departmentService.js', () => ({ findDepartmentById: vi.fn() }));
vi.mock('../../../../src/services/document/referenceNumberService.js', () => ({ generateYearlyReferenceNumber: vi.fn() }));
vi.mock('../../../../src/services/sales/clientService.js', () => ({ findClientById: vi.fn() }));
vi.mock('../../../../src/services/warehouse/goodsIssues/goodsIssueHelpers.js', () => ({
  buildGoodsIssueDetails: vi.fn(),
  isValidInternalClientAdvisor: vi.fn(),
  isValidInternalClientProjectNumberByDepartment: vi.fn(),
  resolveFulfillmentStatus: vi.fn()
}));
vi.mock('../../../../src/services/inventory/movementService.js', () => ({ applyInventoryMovement: vi.fn() }));

const { returnGoodsIssueProducts, returnGoodsReceiptProducts } = await import('../../../../src/services/warehouse/returns/returnService.js');

describe('returnService goods issue returns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('crea devoluciones de salida sin actualizar cantidades surtidas', async () => {
    goodsIssueFindUnique.mockResolvedValue({
      id: 'issue-1',
      details: [{
        id: 'detail-1',
        productId: 'product-1',
        supplierId: 'supplier-1',
        suppliedQuantity: 5
      }]
    });
    movementDetailGroupBy.mockResolvedValue([]);
    createGoodsIssueReturnStockAdjustment.mockResolvedValue({ id: 'adjustment-1' });

    await expect(returnGoodsIssueProducts({
      id: 'issue-1',
      userId: 'user-1',
      goodsIssueDto: {
        details: [{ id: 'detail-1', isReturned: true, returnedQuantity: 2 }]
      }
    })).resolves.toEqual({
      goodsIssueId: 'issue-1',
      adjustments: [{ id: 'adjustment-1' }]
    });

    expect(createGoodsIssueReturnStockAdjustment).toHaveBeenCalledWith({
      tx: expect.any(Object),
      productId: 'product-1',
      supplierId: 'supplier-1',
      observations: null,
      returnedQuantity: 2,
      userId: 'user-1',
      goodsIssueId: 'issue-1',
      goodsIssueDetailId: 'detail-1'
    });
  });

  it('rechaza devoluciones de salida que exceden la cantidad surtida disponible', async () => {
    goodsIssueFindUnique.mockResolvedValue({
      id: 'issue-1',
      details: [{
        id: 'detail-1',
        productId: 'product-1',
        supplierId: 'supplier-1',
        suppliedQuantity: 5
      }]
    });
    movementDetailGroupBy.mockResolvedValue([{
      goodsIssueDetailId: 'detail-1',
      _sum: { quantity: 4 }
    }]);

    await expect(returnGoodsIssueProducts({
      id: 'issue-1',
      userId: 'user-1',
      goodsIssueDto: {
        details: [{ id: 'detail-1', isReturned: true, returnedQuantity: 2 }]
      }
    })).rejects.toThrow();

    expect(createGoodsIssueReturnStockAdjustment).not.toHaveBeenCalled();
  });

});

describe('returnService goods receipt returns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('crea devoluciones de compra reduciendo stock', async () => {
    goodsReceiptFindUnique.mockResolvedValue({
      id: 'receipt-1',
      supplierId: 'supplier-1',
      details: [{
        id: 'receipt-detail-1',
        productId: 'product-1',
        quantity: 10
      }]
    });
    movementDetailGroupBy.mockResolvedValue([]);
    createGoodsReceiptReturnStockAdjustment.mockResolvedValue({ id: 'adjustment-1' });

    await expect(returnGoodsReceiptProducts({
      id: 'receipt-1',
      userId: 'user-1',
      goodsReceiptDto: {
        details: [{ id: 'receipt-detail-1', isReturned: true, returnedQuantity: 3 }]
      }
    })).resolves.toEqual({
      goodsReceiptId: 'receipt-1',
      adjustments: [{ id: 'adjustment-1' }]
    });

    expect(createGoodsReceiptReturnStockAdjustment).toHaveBeenCalledWith({
      tx: expect.any(Object),
      productId: 'product-1',
      supplierId: 'supplier-1',
      observations: null,
      returnedQuantity: 3,
      userId: 'user-1',
      goodsReceiptId: 'receipt-1',
      goodsReceiptDetailId: 'receipt-detail-1'
    });
  });

  it('rechaza devoluciones de compra que exceden la cantidad recibida disponible', async () => {
    goodsReceiptFindUnique.mockResolvedValue({
      id: 'receipt-1',
      supplierId: 'supplier-1',
      details: [{
        id: 'receipt-detail-1',
        productId: 'product-1',
        quantity: 10
      }]
    });
    movementDetailGroupBy.mockResolvedValue([{
      goodsReceiptDetailId: 'receipt-detail-1',
      _sum: { quantity: -9 }
    }]);

    await expect(returnGoodsReceiptProducts({
      id: 'receipt-1',
      userId: 'user-1',
      goodsReceiptDto: {
        details: [{ id: 'receipt-detail-1', isReturned: true, returnedQuantity: 2 }]
      }
    })).rejects.toThrow(GoodsReceiptReturnQuantityExceeded);

    expect(createGoodsReceiptReturnStockAdjustment).not.toHaveBeenCalled();
  });

  it('lanza error de stock insuficiente de devolución de compra cuando excede existencias', async () => {
    const stockError = new GoodsIssueInsufficientStock({
      productName: 'Lámina',
      supplierName: 'Proveedor',
      requestedQuantity: 3
    });

    goodsReceiptFindUnique.mockResolvedValue({
      id: 'receipt-1',
      supplierId: 'supplier-1',
      details: [{
        id: 'receipt-detail-1',
        productId: 'product-1',
        quantity: 10
      }]
    });
    movementDetailGroupBy.mockResolvedValue([]);
    createGoodsReceiptReturnStockAdjustment.mockRejectedValue(stockError);

    await expect(returnGoodsReceiptProducts({
      id: 'receipt-1',
      userId: 'user-1',
      goodsReceiptDto: {
        details: [{ id: 'receipt-detail-1', isReturned: true, returnedQuantity: 3 }]
      }
    })).rejects.toThrow(GoodsReceiptReturnInsufficientStock);
  });

});
