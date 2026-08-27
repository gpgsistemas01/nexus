import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/services/warehouse/materials/materialService.js', () => ({
    findMaterialsSnapshot: vi.fn(({ tx, materialIds }) => tx.material.findMany({
        where: { id: { in: materialIds } }
    }))
}));

import {
    cancelGoodsReceiptDetailAndTotals,
    createGoodsReceiptDetailsAndUpdateTotals
} from '../../../src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js';

describe('cancelGoodsReceiptDetailAndTotals', () => {
    it('devuelve material y catálogos anidados para refrescar la tabla de compras', async () => {
        const update = vi.fn().mockResolvedValue({ id: 'receipt-id' });
        const tx = {
            goodsReceiptDetail: {
                updateMany: vi.fn().mockResolvedValue({ count: 1 }),
                findUnique: vi.fn().mockResolvedValue({ id: 'detail-id' }),
                findMany: vi.fn().mockResolvedValue([{
                    quantity: 1,
                    netPurchaseAmount: 10,
                    grossPurchaseAmount: 11.6
                }])
            },
            goodsReceipt: { update }
        };

        await cancelGoodsReceiptDetailAndTotals({
            tx,
            goodsReceiptId: 'receipt-id',
            detailId: 'detail-id'
        });

        expect(update).toHaveBeenCalledWith(expect.objectContaining({
            include: {
                details: {
                    include: {
                        material: {
                            include: {
                                presentation: true,
                                unitMeasure: true
                            }
                        }
                    }
                },
                supplier: true,
                status: true
            }
        }));
    });

    it('conserva las relaciones al agregar detalles a una compra existente', async () => {
        const update = vi.fn().mockResolvedValue({ id: 'receipt-id' });
        const tx = {
            material: {
                findMany: vi.fn().mockResolvedValue([{
                    id: 'material-id',
                    name: 'Material',
                    base: null,
                    height: null
                }])
            },
            goodsReceiptDetail: {
                createManyAndReturn: vi.fn().mockResolvedValue([]),
                findMany: vi.fn().mockResolvedValue([])
            },
            goodsReceipt: { update }
        };

        await createGoodsReceiptDetailsAndUpdateTotals({
            tx,
            goodsReceiptId: 'receipt-id',
            details: [{ materialId: 'material-id', quantity: 1, costPerUnitType: 10 }]
        });

        expect(update).toHaveBeenCalledWith(expect.objectContaining({
            include: expect.objectContaining({
                details: {
                    include: {
                        material: {
                            include: { presentation: true, unitMeasure: true }
                        }
                    }
                },
                supplier: true
            })
        }));
    });
});
