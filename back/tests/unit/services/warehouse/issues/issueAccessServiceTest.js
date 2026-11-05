import { describe, expect, it } from 'vitest';
import { buildIssueDepartmentWhere, assertIssueDepartmentAccess } from '../../../../../src/services/warehouse/issues/issueAccessService.js';
import { ROLE_KEYS } from '../../../../../src/constants/roles.js';
import { DEPARTMENT_KEYS } from '../../../../../src/constants/departments.js';

const access = (departmentId, departmentKey, roleKey = ROLE_KEYS.OPERATOR) => ({ departmentId, departmentKey, roleKey });
const printing = access('printing-id', DEPARTMENT_KEYS.PRINTING);

describe('alcance de las áreas de salidas', () => {
    it.each([ROLE_KEYS.AUXILIARY, ROLE_KEYS.COORDINATOR])('Almacén / %s consulta y registra en cualquier área sin perder el filtro elegido', roleKey => {
        const accesses = [access('warehouse-id', DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, roleKey)];
        expect(buildIssueDepartmentWhere({ accesses })).toEqual({});
        expect(buildIssueDepartmentWhere({ accesses, departmentId: 'printing-id' })).toEqual({ departmentId: 'printing-id' });
        expect(() => assertIssueDepartmentAccess({ accesses, departmentId: 'printing-id' })).not.toThrow();
    });

    it('acumula sólo las áreas de asignaciones autorizadas y aplica la intersección con el filtro', () => {
        const accesses = [printing, printing, access('router-id', DEPARTMENT_KEYS.ROUTER), access('sales-id', DEPARTMENT_KEYS.SALES)];
        expect(buildIssueDepartmentWhere({ accesses })).toEqual({ departmentId: { in: ['printing-id', 'router-id'] } });
        expect(buildIssueDepartmentWhere({ accesses, departmentId: 'router-id' })).toEqual({ departmentId: { in: ['router-id'] } });
        for (const departmentId of ['printing-id', 'router-id']) {
            expect(() => assertIssueDepartmentAccess({ accesses, departmentId })).not.toThrow();
        }
        for (const departmentId of ['sales-id', 'foreign-id']) {
            expect(buildIssueDepartmentWhere({ accesses, departmentId })).toEqual({ departmentId: { in: [] } });
            expect(() => assertIssueDepartmentAccess({ accesses, departmentId })).toThrow(expect.objectContaining({ code: 'FORBIDDEN', statusCode: 403 }));
        }
    });

    it('sin asignaciones no devuelve ni permite crear salidas', () => {
        expect(buildIssueDepartmentWhere()).toEqual({ departmentId: { in: [] } });
        expect(() => assertIssueDepartmentAccess({ departmentId: 'printing-id' })).toThrow(expect.objectContaining({ statusCode: 403 }));
    });
});
