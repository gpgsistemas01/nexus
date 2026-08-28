import { describe, expect, it } from 'vitest';
import { getGrantedPermissions, PERMISSIONS } from '../../../src/constants/permissions.js';

describe('políticas funcionales de acceso', () => {
    it.each([
        'Asesor de ventas',
        'Coordinador',
        'Administrador del sistema'
    ])('no concede permisos al área de ventas con el rol %s', (role) => {
        const permissions = getGrantedPermissions([{
            role,
            department: 'VENTAS Y PROYECTOS ESPECIALES'
        }]);

        expect(permissions).toEqual([]);
    });

    it('no permite que un asesor opere salidas aunque pertenezca a almacén', () => {
        const permissions = getGrantedPermissions([{
            role: 'Asesor de ventas',
            department: 'ALMACÉN Y PROVEDURÍA'
        }]);

        expect(permissions).not.toContain(PERMISSIONS.GOODS_ISSUES_MANAGE);
        expect(permissions).not.toContain(PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE);
        expect(permissions).not.toContain(PERMISSIONS.WASTE_ISSUES_MANAGE);
        expect(permissions).not.toContain(PERMISSIONS.WASTE_ISSUES_SUPPLY);
    });

    it('conserva el CRUD de salidas para el personal de almacén autorizado', () => {
        const permissions = getGrantedPermissions([{
            role: 'Almacenista',
            department: 'ALMACÉN Y PROVEDURÍA'
        }]);

        expect(permissions).toEqual(expect.arrayContaining([
            PERMISSIONS.GOODS_ISSUES_MANAGE,
            PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE,
            PERMISSIONS.WASTE_ISSUES_MANAGE,
            PERMISSIONS.WASTE_ISSUES_SUPPLY
        ]));
    });
});
