import { describe, expect, it } from 'vitest';
import { DATA_SCOPES, getGrantedPermissions, getOrganizationContext, hasDataScope } from '../../../src/constants/permissions.js';
import { PERMISSIONS } from '../../../src/shared/constants/permissions.js';
import { DEPARTMENT_KEYS } from '../../../src/constants/departments.js';
import { ROLE_KEYS } from '../../../src/constants/roles.js';

describe('políticas funcionales de acceso', () => {
    const operationalDepartments = [
        DEPARTMENT_KEYS.PRINTING,
        DEPARTMENT_KEYS.ROUTER,
        DEPARTMENT_KEYS.WORKSHOP_3D,
        DEPARTMENT_KEYS.PT_TRAFFIC,
        DEPARTMENT_KEYS.INSTALLATIONS,
        DEPARTMENT_KEYS.FINISHING
    ];
    const operationalRoles = [
        ROLE_KEYS.SYSTEM_ADMIN,
        ROLE_KEYS.COORDINATOR,
        ROLE_KEYS.AUXILIARY,
        ROLE_KEYS.OPERATOR,
        ROLE_KEYS.INSTALLER,
        ROLE_KEYS.WAREHOUSE_KEEPER
    ];

    it.each(operationalDepartments.flatMap(department => operationalRoles.map(role => [department, role])))(
        'permite solicitudes y consulta de inventario para %s / %s sin operar existencias',
        (department, role) => {
            const permissions = getGrantedPermissions([{
                departmentKey: department,
                roleKey: role
            }]);

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
            { roleKey: ROLE_KEYS.OPERATOR, departmentKey: DEPARTMENT_KEYS.SALES },
            { roleKey: ROLE_KEYS.SALES_ADVISOR, departmentKey: DEPARTMENT_KEYS.PRINTING }
        ]);

        expect(permissions).toEqual([]);
    });

    describe('políticas de alcance de datos', () => {
        it.each([
            [{ roleKey: ROLE_KEYS.DIRECTOR, departmentKey: DEPARTMENT_KEYS.PRINTING }],
            [{ roleKey: ROLE_KEYS.OPERATOR, departmentKey: DEPARTMENT_KEYS.MANAGEMENT }]
        ])('concede alcance global de lectura por rol o área: %o', (access) => {
            expect(hasDataScope([access], DATA_SCOPES.SYSTEM_WIDE_READ)).toBe(true);
        });

        it('no concede alcance global de lectura a otras asignaciones', () => {
            expect(hasDataScope(
                [{ roleKey: ROLE_KEYS.COORDINATOR, departmentKey: DEPARTMENT_KEYS.PRINTING }],
                DATA_SCOPES.SYSTEM_WIDE_READ
            )).toBe(false);
        });

        it.each([
            [{ roleKey: ROLE_KEYS.SYSTEM_ADMIN, departmentKey: DEPARTMENT_KEYS.PRINTING }],
            [{
                roleKey: ROLE_KEYS.COORDINATOR,
                departmentKey: DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY
            }]
        ])('concede consulta de todas las salidas por política: %o', (access) => {
            expect(hasDataScope([access], DATA_SCOPES.GOODS_ISSUES_READ_ALL)).toBe(true);
        });

        it('no amplía la consulta de salidas a coordinadores de otras áreas', () => {
            expect(hasDataScope(
                [{ roleKey: ROLE_KEYS.COORDINATOR, departmentKey: DEPARTMENT_KEYS.PRINTING }],
                DATA_SCOPES.GOODS_ISSUES_READ_ALL
            )).toBe(false);
        });

        it('deriva el contexto informativo desde las asignaciones', () => {
            expect(getOrganizationContext([
                { roleKey: ROLE_KEYS.COORDINATOR, departmentKey: DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY },
                { roleKey: ROLE_KEYS.OPERATOR, departmentKey: DEPARTMENT_KEYS.SYSTEMS },
                { roleKey: ROLE_KEYS.SALES_ADVISOR, departmentKey: DEPARTMENT_KEYS.SALES }
            ])).toEqual({
                isCoordinator: true,
                isWarehouse: true,
                isSystem: true,
                isSales: true
            });
        });
    });

    it.each([
        ROLE_KEYS.SALES_ADVISOR,
        ROLE_KEYS.COORDINATOR,
        ROLE_KEYS.SYSTEM_ADMIN
    ])('no concede permisos al área de ventas con el rol %s', (role) => {
        const permissions = getGrantedPermissions([{
            roleKey: role,
            departmentKey: DEPARTMENT_KEYS.SALES
        }]);

        expect(permissions).toEqual([]);
    });

    it('no permite que un asesor opere salidas aunque pertenezca a almacén', () => {
        const permissions = getGrantedPermissions([{
            roleKey: ROLE_KEYS.SALES_ADVISOR,
            departmentKey: DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY
        }]);

        expect(permissions).not.toContain(PERMISSIONS.GOODS_ISSUES_MANAGE);
        expect(permissions).not.toContain(PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE);
        expect(permissions).not.toContain(PERMISSIONS.WASTE_ISSUES_MANAGE);
        expect(permissions).not.toContain(PERMISSIONS.WASTE_ISSUES_SUPPLY);
    });

    it.each([DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS].flatMap(department =>
        [
            ROLE_KEYS.WAREHOUSE_KEEPER,
            ROLE_KEYS.COORDINATOR,
            ROLE_KEYS.AUXILIARY,
            ROLE_KEYS.SYSTEM_ADMIN
        ].map(role => [department, role])
    ))('conserva los permisos de gestión de %s / %s', (department, role) => {
        const permissions = getGrantedPermissions([{
            departmentKey: department,
            roleKey: role
        }]);

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

        const isSystemAdmin = department === DEPARTMENT_KEYS.SYSTEMS && role === ROLE_KEYS.SYSTEM_ADMIN;
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
            { departmentKey: DEPARTMENT_KEYS.PRINTING, roleKey: ROLE_KEYS.OPERATOR },
            {
                departmentKey: DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY,
                roleKey: ROLE_KEYS.WAREHOUSE_KEEPER
            }
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
            roleKey: ROLE_KEYS.WAREHOUSE_KEEPER,
            departmentKey: DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY
        }]);

        expect(permissions).toEqual(expect.arrayContaining([
            PERMISSIONS.CLIENTS_PAGE_VIEW,
            PERMISSIONS.SUPPLIERS_PAGE_VIEW
        ]));
    });
});
