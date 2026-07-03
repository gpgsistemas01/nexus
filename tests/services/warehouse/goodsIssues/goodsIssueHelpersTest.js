import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GoodsIssueMissingMaxUnitCost } from '../../../../src/errors/inventory/stockError.js';
import { ProductNotFound } from '../../../../src/errors/warehouse/productError.js';
import {
  buildGoodsIssueDetails,
  isInternalClient,
  isValidInternalClientAdvisor,
  isValidInternalClientProjectNumberByDepartment,
  resolveFulfillmentStatus
} from '../../../../src/services/warehouse/goodsIssues/goodsIssueHelpers.js';
import { profileBelongsToDepartment } from '../../../../src/services/admin/profileService.js';
import { findSupplierProductsSnapshot } from '../../../../src/services/warehouse/products/supplierProductService.js';

vi.mock('../../../../src/services/admin/profileService.js', () => ({
  profileBelongsToDepartment: vi.fn()
}));

vi.mock('../../../../src/services/warehouse/products/supplierProductService.js', () => ({
  findSupplierProductsSnapshot: vi.fn()
}));

describe('goodsIssueHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('identifica clientes internos sin depender de mayúsculas o espacios', () => {
    expect(isInternalClient({ name: '  gpg interno ' })).toBe(true);
    expect(isInternalClient({ name: 'Cliente externo' })).toBe(false);
  });

  it('valida asesor y número de proyecto para salidas internas', () => {
    const client = { name: 'GPG INTERNO' };
    const advisor = { departments: [] };

    profileBelongsToDepartment.mockReturnValue(true);

    expect(isValidInternalClientAdvisor({ client, advisor })).toBe(true);
    expect(profileBelongsToDepartment).toHaveBeenCalledWith({
      profile: advisor,
      departmentName: 'ALMACÉN Y PROVEDURÍA'
    });
    expect(isValidInternalClientProjectNumberByDepartment({
      client,
      department: { name: 'DISEÑO' },
      projectNumber: '120004'
    })).toBe(true);
    expect(isValidInternalClientProjectNumberByDepartment({
      client,
      department: { name: 'DISEÑO' },
      projectNumber: '120003'
    })).toBe(false);
  });

  it('resuelve el estado de surtido según cantidades suministradas', () => {
    expect(resolveFulfillmentStatus([
      { isSupplied: true, suppliedQuantity: 5 },
      { isSupplied: true, suppliedQuantity: 1 }
    ])).toBe('Surtido');
    expect(resolveFulfillmentStatus([
      { isSupplied: false, suppliedQuantity: 2 },
      { isSupplied: false, suppliedQuantity: 0 }
    ])).toBe('Surtido parcial');
    expect(resolveFulfillmentStatus([
      { isSupplied: false, suppliedQuantity: 0 },
      { isSupplied: false, suppliedQuantity: 0 }
    ])).toBe('Pendiente');
  });

  it('construye detalles de salida con snapshot de proveedor y costo máximo', async () => {
    findSupplierProductsSnapshot.mockResolvedValue([
      {
        id: 'product-1',
        name: 'Lámina PVC',
        base: 1,
        height: 2,
        maxUnitCost: 80,
        supplier: { id: 'supplier-1', tradeName: 'Proveedor Uno' },
        presentation: { id: 'presentation-1', name: 'Hoja' },
        unitMeasure: { id: 'unit-1', name: 'Metro cuadrado', symbol: 'm2' }
      }
    ]);

    await expect(buildGoodsIssueDetails({
      details: [{ productId: 'product-1', supplierId: 'supplier-1', quantity: 4, presentationId: 'presentation-1' }]
    })).resolves.toEqual([
      {
        productId: 'product-1',
        supplierId: 'supplier-1',
        supplierName: 'Proveedor Uno',
        quantity: 4,
        convertedQuantity: 8,
        maxUnitCost: 80,
        productName: 'Lámina PVC',
        productBase: 1,
        productHeight: 2,
        presentationId: 'presentation-1',
        presentationName: 'Hoja',
        unitMeasureId: 'unit-1',
        unitMeasureName: 'Metro cuadrado',
        unitMeasureSymbol: 'm2'
      }
    ]);
  });

  it('falla si el producto proveedor no existe o no tiene costo máximo', async () => {
    findSupplierProductsSnapshot.mockResolvedValueOnce([]);

    await expect(buildGoodsIssueDetails({
      details: [{ productId: 'missing-product', supplierId: 'supplier-1', quantity: 1 }]
    })).rejects.toThrow(ProductNotFound);

    findSupplierProductsSnapshot.mockResolvedValueOnce([
      {
        id: 'product-1',
        name: 'Lámina PVC',
        base: 1,
        height: 2,
        maxUnitCost: null,
        supplier: { id: 'supplier-1', tradeName: 'Proveedor Uno' },
        presentation: { id: 'presentation-1', name: 'Hoja' },
        unitMeasure: { id: 'unit-1', name: 'Metro cuadrado', symbol: 'm2' }
      }
    ]);

    await expect(buildGoodsIssueDetails({
      details: [{ productId: 'product-1', supplierId: 'supplier-1', quantity: 1 }]
    })).rejects.toThrow(GoodsIssueMissingMaxUnitCost);
  });
});
