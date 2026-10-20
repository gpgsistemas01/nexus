import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROLE_KEYS } from '../../../../../src/constants/roles.js';
import { DEPARTMENT_KEYS } from '../../../../../src/constants/departments.js';

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
        await findAllGoodsIssues({ type, accesses: [{ departmentId: 'department-1' }] });
        const where = findMany.mock.calls[0][0].where;
        expect(where).toMatchObject({
            type,
            details: { some: {}, every: { material: { type } } },
            departmentId: { in: ['department-1'] }
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

    it.each([
        ['administrador del sistema', { roleKey: ROLE_KEYS.SYSTEM_ADMIN, departmentKey: DEPARTMENT_KEYS.PRINTING }],
        ['coordinador de almacén', {
            roleKey: ROLE_KEYS.COORDINATOR,
            departmentKey: DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY
        }]
    ])('omite el filtro de área para %s', async (_, access) => {
        await findAllGoodsIssues({ accesses: [access] });

        expect(findMany.mock.calls[0][0].where.department).toBeUndefined();
    });

    it('conserva el filtro de área para coordinadores de otras áreas', async () => {
        await findAllGoodsIssues({
            accesses: [{
                roleKey: ROLE_KEYS.COORDINATOR,
                departmentKey: DEPARTMENT_KEYS.PRINTING,
                departmentId: 'printing-id'
            }]
        });

        expect(findMany.mock.calls[0][0].where.departmentId).toEqual({
            in: ['printing-id']
        });
    });

    it('el reporte omite el conteo y conserva el contexto y el alcance de área', async () => {
        const { findGoodsIssueReportRows } = await import('../../../../../src/services/warehouse/reportService.js');
        expect(await Array.fromAsync(findGoodsIssueReportRows({
            type: 'CONSUMABLE',
            accesses: [{ departmentId: 'department-1' }]
        }))).toEqual([]);
        expect(count).not.toHaveBeenCalled();
        expect(findMany.mock.calls[0][0].where).toMatchObject({
            type: 'CONSUMABLE',
            details: { some: {}, every: { material: { type: 'CONSUMABLE' } } },
            departmentId: { in: ['department-1'] }
        });
    });

});
