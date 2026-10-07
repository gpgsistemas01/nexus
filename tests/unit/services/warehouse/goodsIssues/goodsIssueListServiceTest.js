import { beforeEach, describe, expect, it, vi } from 'vitest';

const findMany = vi.fn();
const count = vi.fn();
vi.mock('../../../../../src/repository/baseRepository.js', () => ({
    getDb: () => ({ goodsIssue: { findMany, count } })
}));
const { findAllGoodsIssues } = await import('../../../../../src/services/warehouse/goodsIssues/goodsIssueService.js');

describe('listado de salidas por recurso', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        findMany.mockResolvedValue([]);
        count.mockResolvedValue(0);
    });

    it.each([
        ['material', 'MATERIAL'], ['consumable', 'CONSUMABLE']
    ])('filtra %s conservando la restricción de área y el mismo conteo', async (inventoryResource, type) => {
        await findAllGoodsIssues({ type, accesses: [{ department: 'ÁREA' }] });
        const where = findMany.mock.calls[0][0].where;
        expect(where).toMatchObject({
            type,
            details: { some: {}, every: { material: { type } } },
            department: { name: { in: ['ÁREA'] } }
        });
        expect(count).toHaveBeenCalledWith({ where });
    });

    it('usa materiales como contexto predeterminado cuando no hay recurso', async () => {
        await findAllGoodsIssues({});
        expect(findMany.mock.calls[0][0].where.details).toEqual({
            some: {},
            every: { material: { type: 'MATERIAL' } }
        });
    });
    it('el reporte omite el conteo y conserva el contexto y el alcance de área', async () => {
        const { findGoodsIssueReportRows } = await import('../../../../../src/services/warehouse/reportService.js');
        expect(await findGoodsIssueReportRows({ type: 'CONSUMABLE', accesses: [{ department: 'ÁREA' }] })).toEqual([]);
        expect(count).not.toHaveBeenCalled();
        expect(findMany.mock.calls[0][0].where).toMatchObject({
            type: 'CONSUMABLE',
            details: { some: {}, every: { material: { type: 'CONSUMABLE' } } },
            department: { name: { in: ['ÁREA'] } }
        });
    });

});
