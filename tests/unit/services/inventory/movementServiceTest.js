import { describe, expect, it, vi } from 'vitest';
vi.mock('../../../../src/repository/baseRepository.js', () => ({ getDb: tx => tx }));
const { applyInventoryMovement } = await import('../../../../src/services/inventory/movementService.js');

describe('saldos de movimientos de inventario', () => {
  it('distribuye el saldo real entre detalles repetidos sin modificar la oferta recibida', async () => {
    const offer = Object.freeze({ materialId: 'material', supplierId: 'supplier', currentStock: 20, material: Object.freeze({ base: 1, height: 1 }) });
    const create = vi.fn().mockImplementation(async ({ data }) => ({ details: data.details.create }));
    const queryRaw = vi.fn().mockResolvedValue([{ materialId: 'material', supplierId: 'supplier', currentStock: 13 }]);
    const result = await applyInventoryMovement({
      tx: { $queryRaw: queryRaw, inventoryMovement: { create } },
      supplierMaterials: [offer], movementType: 'ISSUE', details: [
        { materialId: 'material', supplierId: 'supplier', quantity: 1, goodsIssueDetailId: 'detail-1' },
        { materialId: 'material', supplierId: 'supplier', quantity: 2, goodsIssueDetailId: 'detail-2' }
      ]
    });
    expect(result.details.map(detail => [detail.previousStock, detail.newStock])).toEqual([[16, 15], [15, 13]]);
    expect(result.details.map(detail => detail.goodsIssueDetailId)).toEqual(['detail-1', 'detail-2']);
    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(offer.currentStock).toBe(20);
  });
});
