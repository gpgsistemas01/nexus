import { describe, expect, it, vi } from 'vitest';
import { updateSupplierMaterialStock } from '../../../../../src/services/warehouse/materials/supplierMaterialStockService.js';

describe('existencias de la relación material–proveedor', () => {
  it('descuenta ambas cantidades atómicamente incluso al agotar un consumible', async () => {
    const queryRaw = vi.fn().mockResolvedValue([{ materialId: 'material', supplierId: 'supplier', currentStock: 0 }]);
    const balances = await updateSupplierMaterialStock({
      tx: { $queryRaw: queryRaw }, movementType: 'ISSUE',
      grouped: new Map([['material:supplier', 1]]),
      supplierMaterialsByKey: new Map([['material:supplier', { materialId: 'material', supplierId: 'supplier', material: { base: null, height: null } }]])
    });
    expect(balances.get('material:supplier')).toEqual({ previousStock: 1, newStock: 0 });
    expect(queryRaw.mock.calls[0][0].values).toEqual(['material', 'supplier', -1, -1]);
  });

  it('rechaza stock insuficiente con el error de dominio y la identidad del artículo', async () => {
    await expect(updateSupplierMaterialStock({
      tx: { $queryRaw: vi.fn().mockResolvedValue([]) }, movementType: 'ISSUE',
      grouped: new Map([['material:supplier', 4]]),
      supplierMaterialsByKey: new Map([['material:supplier', { materialId: 'material', supplierId: 'supplier', material: { name: 'Lona', base: 1.5, height: 20 } }]])
    })).rejects.toMatchObject({ code: 'GOODS_ISSUE_INSUFFICIENT_STOCK', statusCode: 409, meta: { materialId: 'material', supplierId: 'supplier', requestedQuantity: 4 } });
  });
});
