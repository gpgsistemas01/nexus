import { beforeEach, describe, expect, it, vi } from 'vitest';

const findMany = vi.fn();
const count = vi.fn();
vi.mock('../../../../../src/repository/baseRepository.js', () => ({
    getDb: () => ({ goodsReceipt: { findMany, count } })
}));
const { findAllGoodsReceipts } = await import('../../../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js');
const { findGoodsReceiptReportRows } = await import('../../../../../src/services/warehouse/reportService.js');

describe('conteos de compras sin consultas redundantes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        findMany.mockResolvedValue([]);
        count.mockReset().mockResolvedValue(20);
    });

    it.each(['MATERIAL', 'CONSUMABLE'])('reutiliza el conteo del contexto %s cuando no hay filtros', async type => {
        const result = await findAllGoodsReceipts({ type });
        expect(result).toEqual({ data: [], recordsTotal: 20, recordsFiltered: 20 });
        expect(count).toHaveBeenCalledTimes(1);
        expect(count).toHaveBeenCalledWith({ where: {
            type, details: { some: {}, every: { material: { type } } }
        } });
    });

    it('conserva total y filtrado diferentes al buscar dentro del contexto', async () => {
        count.mockResolvedValueOnce(20).mockResolvedValueOnce(7);
        const result = await findAllGoodsReceipts({ type: 'CONSUMABLE', search: 'folio' });
        expect(result.recordsTotal).toBe(20);
        expect(result.recordsFiltered).toBe(7);
        expect(count).toHaveBeenCalledTimes(2);
        expect(count.mock.calls[1][0].where).toMatchObject({ type: 'CONSUMABLE', OR: expect.any(Array) });
    });

    it('el reporte conserva filtros de contexto y estado sin ejecutar conteos', async () => {
        expect(await findGoodsReceiptReportRows({ type: 'CONSUMABLE', supplierId: 'supplier-1' })).toEqual([]);
        expect(count).not.toHaveBeenCalled();
        expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({
            type: 'CONSUMABLE', supplierId: 'supplier-1',
            details: { some: {}, every: { material: { type: 'CONSUMABLE' } } },
            status: expect.any(Object)
        }) }));
    });
});
