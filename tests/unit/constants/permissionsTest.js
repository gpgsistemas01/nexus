import { describe, expect, it } from 'vitest';
import { getGrantedPermissions, PERMISSIONS } from '../../../src/constants/permissions.js';

describe('políticas funcionales de acceso', () => {
    const operationalDepartments = ['IMPRESIÓN', 'TALLER 3D', 'PT/TRÁFICO', 'INSTALACIONES', 'ACABADOS'];
    const operationalRoles = ['Administrador del sistema', 'Coordinador', 'Auxiliar', 'Operador', 'Instalador', 'Almacenista'];

    it.each(operationalDepartments.flatMap(department => operationalRoles.map(role => [department, role])))(
        'permite solicitudes y consulta de inventario para %s / %s sin operar existencias',
        (department, role) => {
            const permissions = getGrantedPermissions([{ department, role }]);

            expect(permissions).toEqual(expect.arrayContaining([
                PERMISSIONS.GOODS_ISSUES_PAGE_VIEW,
                PERMISSIONS.GOODS_ISSUES_MANAGE,
                PERMISSIONS.WASTE_ISSUES_PAGE_VIEW,
                PERMISSIONS.WASTE_ISSUES_MANAGE,
                PERMISSIONS.MATERIALS_READ,
                PERMISSIONS.WASTES_PAGE_VIEW,
                PERMISSIONS.WASTES_READ,
                PERMISSIONS.SUPPLIERS_READ,
                PERMISSIONS.CLIENTS_READ,
                PERMISSIONS.PERSONS_READ,
                PERMISSIONS.DEPARTMENTS_READ,
                PERMISSIONS.FULFILLMENT_STATUSES_READ
            ]));
            for (const permission of [
                PERMISSIONS.MATERIALS_WRITE, PERMISSIONS.MATERIALS_ADJUST_STOCK,
                PERMISSIONS.WASTES_WRITE, PERMISSIONS.WASTES_ADD_STOCK, PERMISSIONS.WASTES_ADJUST_STOCK,
                PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE, PERMISSIONS.WASTE_ISSUES_SUPPLY,
                PERMISSIONS.INVENTORY_COSTS_READ, PERMISSIONS.WAREHOUSE_REPORTS_READ,
                PERMISSIONS.GOODS_RECEIPTS_MANAGE, PERMISSIONS.GOODS_RECEIPTS_PAGE_VIEW,
                PERMISSIONS.SUPPLIERS_MANAGE, PERMISSIONS.SUPPLIERS_UPDATE, PERMISSIONS.SUPPLIERS_PAGE_VIEW,
                PERMISSIONS.CLIENTS_CREATE, PERMISSIONS.PERSONS_WRITE, PERMISSIONS.CATALOGS_MANAGE
            ]) {
                expect(permissions).not.toContain(permission);
            }
        }
    );

    it('no combina el rol autorizado de una asignación con el área de otra', () => {
        const permissions = getGrantedPermissions([
            { role: 'Operador', department: 'VENTAS Y PROYECTOS ESPECIALES' },
            { role: 'Asesor de ventas', department: 'IMPRESIÓN' }
        ]);

        expect(permissions).toEqual([]);
    });

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

    it.each(['ALMACÉN Y PROVEDURÍA', 'SISTEMAS'].flatMap(department =>
        ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'].map(role => [department, role])
    ))('conserva los permisos de gestión de %s / %s', (department, role) => {
        const permissions = getGrantedPermissions([{ department, role }]);

        expect(permissions).toEqual(expect.arrayContaining([
            PERMISSIONS.MATERIALS_READ, PERMISSIONS.MATERIALS_WRITE,
            PERMISSIONS.WASTES_READ, PERMISSIONS.WASTES_WRITE, PERMISSIONS.WASTES_ADD_STOCK,
            PERMISSIONS.GOODS_ISSUES_PAGE_VIEW, PERMISSIONS.GOODS_ISSUES_MANAGE,
            PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE,
            PERMISSIONS.WASTE_ISSUES_PAGE_VIEW, PERMISSIONS.WASTE_ISSUES_MANAGE,
            PERMISSIONS.WASTE_ISSUES_SUPPLY,
            PERMISSIONS.INVENTORY_COSTS_READ, PERMISSIONS.WAREHOUSE_REPORTS_READ,
            PERMISSIONS.GOODS_RECEIPTS_MANAGE, PERMISSIONS.GOODS_RECEIPTS_PAGE_VIEW,
            PERMISSIONS.SUPPLIERS_READ, PERMISSIONS.SUPPLIERS_MANAGE,
            PERMISSIONS.CLIENTS_CREATE, PERMISSIONS.PERSONS_WRITE
        ]));

        const isSystemAdmin = department === 'SISTEMAS' && role === 'Administrador del sistema';
        for (const permission of [
            PERMISSIONS.MATERIALS_ADJUST_STOCK, PERMISSIONS.WASTES_ADJUST_STOCK,
            PERMISSIONS.CATALOGS_MANAGE, PERMISSIONS.USERS_MANAGE,
            PERMISSIONS.MOVEMENTS_READ, PERMISSIONS.SUPPLIERS_UPDATE
        ]) {
            expect(permissions.includes(permission)).toBe(isSystemAdmin);
        }
    });

    it('conserva la gestión de almacén cuando el usuario también tiene un área operativa', () => {
        const permissions = getGrantedPermissions([
            { department: 'IMPRESIÓN', role: 'Operador' },
            { department: 'ALMACÉN Y PROVEDURÍA', role: 'Almacenista' }
        ]);

        expect(permissions).toEqual(expect.arrayContaining([
            PERMISSIONS.MATERIALS_WRITE,
            PERMISSIONS.WASTES_ADD_STOCK,
            PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE,
            PERMISSIONS.WASTE_ISSUES_SUPPLY,
            PERMISSIONS.INVENTORY_COSTS_READ
        ]));
        expect(permissions).not.toContain(PERMISSIONS.MATERIALS_ADJUST_STOCK);
    });

    it('permite al personal de almacén abrir las consultas de clientes y proveedores', () => {
        const permissions = getGrantedPermissions([{
            role: 'Almacenista',
            department: 'ALMACÉN Y PROVEDURÍA'
        }]);

        expect(permissions).toEqual(expect.arrayContaining([
            PERMISSIONS.CLIENTS_PAGE_VIEW,
            PERMISSIONS.SUPPLIERS_PAGE_VIEW
        ]));
    });
});
