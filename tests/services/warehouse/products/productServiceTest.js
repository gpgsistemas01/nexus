import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductDeleteRelationConflict, ProductNotFound, ProductStockAdjustmentDatabaseError } from '../../../../src/errors/warehouse/productError.js';

const createStockAdjustment = vi.fn();
const findAllSupplierProducts = vi.fn();
const productFindMany = vi.fn();
const productFindUnique = vi.fn();
const transaction = vi.fn();
const goodsReceiptDetailCount = vi.fn();
const goodsIssueDetailCount = vi.fn();
const purchaseRequisitionDetailCount = vi.fn();
const movementDetailCount = vi.fn();
const stockAdjustmentDetailCount = vi.fn();
const wasteCount = vi.fn();
const supplierProductDeleteMany = vi.fn();
const productDelete = vi.fn();

vi.mock('../../../../src/utils/logger.js', () => ({
  createServiceLogger: () => ({}),
  getModelLogContext: (_model, data = {}) => data,
  logServiceError: vi.fn(),
  logServiceInfo: vi.fn()
}));

vi.mock('../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    $transaction: transaction,
    product: {
      findMany: productFindMany,
      findUnique: productFindUnique,
      delete: productDelete
    },
    goodsReceiptDetail: { count: goodsReceiptDetailCount },
    goodsIssueDetail: { count: goodsIssueDetailCount },
    purchaseRequisitionDetail: { count: purchaseRequisitionDetailCount },
    movementDetail: { count: movementDetailCount },
    stockAdjustmentDetail: { count: stockAdjustmentDetailCount },
    waste: { count: wasteCount },
    supplierProduct: { deleteMany: supplierProductDeleteMany }
  })
}));

vi.mock('../../../../src/services/warehouse/adjustmentService.js', () => ({
  createStockAdjustment
}));

vi.mock('../../../../src/services/warehouse/products/productHelpers.js', () => ({
  prepareProductData: vi.fn(),
  withRetry: vi.fn(async (fn) => fn())
}));

vi.mock('../../../../src/services/warehouse/products/productRelations.js', () => ({
  syncSupplierProduct: vi.fn()
}));

vi.mock('../../../../src/services/warehouse/products/supplierProductService.js', () => ({
  findAllSupplierProducts,
  findCurrentSupplierProductByProductId: vi.fn(),
  findSupplierProductByIds: vi.fn(),
  recalculateConvertedQuantityByProduct: vi.fn()
}));

const { deleteProduct, existsProduct, findAllProducts, findProductsSnapshot, updateProductStock } = await import('../../../../src/services/warehouse/products/productService.js');

describe('productService submit operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation((callback) => callback({
      product: { findUnique: productFindUnique, delete: productDelete },
      goodsReceiptDetail: { count: goodsReceiptDetailCount },
      goodsIssueDetail: { count: goodsIssueDetailCount },
      purchaseRequisitionDetail: { count: purchaseRequisitionDetailCount },
      movementDetail: { count: movementDetailCount },
      stockAdjustmentDetail: { count: stockAdjustmentDetailCount },
      waste: { count: wasteCount },
      supplierProduct: { deleteMany: supplierProductDeleteMany }
    }));
  });

  it('delega el listado GET a supplierProductService con filtros', async () => {
    const result = { data: [{ id: 'product-1' }], recordsTotal: 1, recordsFiltered: 1 };

    findAllSupplierProducts.mockResolvedValue(result);

    await expect(findAllProducts({
      skip: 10,
      take: 5,
      search: 'lamina',
      supplierId: 'supplier-1',
      orderBy: 'name',
      orderDir: 'desc'
    })).resolves.toEqual(result);
    expect(findAllSupplierProducts).toHaveBeenCalledWith({
      skip: 10,
      take: 5,
      search: 'lamina',
      supplierId: 'supplier-1',
      orderBy: 'name',
      orderDir: 'desc'
    });
  });

  it('obtiene snapshots de productos y valida existencia para GET', async () => {
    const products = [{ id: 'product-1', name: 'Lámina' }];

    productFindMany.mockResolvedValue(products);
    productFindUnique.mockResolvedValue({ id: 'product-1' });

    await expect(findProductsSnapshot({ productIds: ['product-1'] })).resolves.toEqual(products);
    await expect(existsProduct({ id: 'product-1' })).resolves.toEqual({ id: 'product-1' });

    expect(productFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: { in: ['product-1'] } }
    }));
    expect(productFindUnique).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      select: { id: true }
    });
  });

  it('falla con ProductNotFound si no existe el producto consultado', async () => {
    productFindUnique.mockResolvedValue(null);

    await expect(existsProduct({ id: 'missing-product' })).rejects.toThrow(ProductNotFound);
  });



  it('elimina el producto y sus relaciones con proveedores cuando no tiene vínculos operativos', async () => {
    const deleted = { id: 'product-1' };

    productFindUnique.mockResolvedValue({ id: 'product-1' });
    goodsReceiptDetailCount.mockResolvedValue(0);
    goodsIssueDetailCount.mockResolvedValue(0);
    purchaseRequisitionDetailCount.mockResolvedValue(0);
    movementDetailCount.mockResolvedValue(0);
    stockAdjustmentDetailCount.mockResolvedValue(0);
    wasteCount.mockResolvedValue(0);
    supplierProductDeleteMany.mockResolvedValue({ count: 1 });
    productDelete.mockResolvedValue(deleted);

    await expect(deleteProduct('product-1')).resolves.toEqual(deleted);
    expect(supplierProductDeleteMany).toHaveBeenCalledWith({ where: { productId: 'product-1' } });
    expect(productDelete).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      select: { id: true }
    });
  });

  it('bloquea la eliminación si el producto tiene compras o salidas relacionadas', async () => {
    productFindUnique.mockResolvedValue({ id: 'product-1' });
    goodsReceiptDetailCount.mockResolvedValue(1);
    goodsIssueDetailCount.mockResolvedValue(0);
    purchaseRequisitionDetailCount.mockResolvedValue(0);
    movementDetailCount.mockResolvedValue(0);
    stockAdjustmentDetailCount.mockResolvedValue(0);
    wasteCount.mockResolvedValue(0);

    await expect(deleteProduct('product-1')).rejects.toThrow(ProductDeleteRelationConflict);
    expect(supplierProductDeleteMany).not.toHaveBeenCalled();
    expect(productDelete).not.toHaveBeenCalled();
  });


  it('delega el submit de ajuste de stock a createStockAdjustment', async () => {
    const productDto = {
      supplierId: 'supplier-1',
      reasonId: 'reason-1',
      observations: 'Ajuste por conteo',
      newStock: 25
    };
    const adjustment = { id: 'adjustment-1', productId: 'product-1' };

    createStockAdjustment.mockResolvedValue(adjustment);

    await expect(updateProductStock({ id: 'product-1', userId: 'user-1', productDto })).resolves.toEqual(adjustment);
    expect(createStockAdjustment).toHaveBeenCalledWith({
      productId: 'product-1',
      supplierId: 'supplier-1',
      reasonId: 'reason-1',
      observations: 'Ajuste por conteo',
      newStock: 25,
      userId: 'user-1'
    });
  });

  it('traduce P2025 a ProductNotFound durante el ajuste de stock', async () => {
    createStockAdjustment.mockRejectedValue({ code: 'P2025' });

    await expect(updateProductStock({
      id: 'missing-product',
      userId: 'user-1',
      productDto: { supplierId: 'supplier-1', reasonId: 'reason-1', newStock: 0 }
    })).rejects.toThrow(ProductNotFound);
  });

  it('envuelve otros errores de ajuste de stock en ProductStockAdjustmentDatabaseError', async () => {
    createStockAdjustment.mockRejectedValue(new Error('db failed'));

    await expect(updateProductStock({
      id: 'product-1',
      userId: 'user-1',
      productDto: { supplierId: 'supplier-1', reasonId: 'reason-1', newStock: 0 }
    })).rejects.toThrow(ProductStockAdjustmentDatabaseError);
  });
});
