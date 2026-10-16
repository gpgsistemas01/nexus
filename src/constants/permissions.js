import { DEPARTMENT_KEYS } from './departments.js';
import { ROLE_KEYS } from './roles.js';

export const PERMISSIONS = Object.freeze({
    MATERIALS_READ: 'materials:read',
    MATERIALS_WRITE: 'materials:write',
    MATERIALS_ADJUST_STOCK: 'materials:adjust-stock',
    CATALOGS_MANAGE: 'catalogs:manage',
    INVENTORY_COSTS_READ: 'inventory:costs-read',
    DEPARTMENTS_READ: 'departments:read',
    MOVEMENTS_READ: 'movements:read',
    PERSONS_READ: 'persons:read',
    PERSONS_WRITE: 'persons:write',
    ADMIN_REPORTS_READ: 'admin:reports-read',
    PERSON_REPORTS_READ: 'person:reports-read',
    ROLES_READ: 'roles:read',
    USERS_MANAGE: 'users:manage',
    CLIENTS_READ: 'clients:read',
    CLIENTS_CREATE: 'clients:create',
    CLIENTS_UPDATE: 'clients:update',
    CLIENT_REPORTS_READ: 'client:reports-read',
    FULFILLMENT_STATUSES_READ: 'fulfillment:statuses-read',
    GOODS_ISSUES_MANAGE: 'goods:issues-manage',
    GOODS_ISSUE_DETAILS_MANAGE: 'goods:issue-details-manage',
    GOODS_RECEIPTS_MANAGE: 'goods:receipts-manage',
    PRESENTATIONS_READ: 'presentations:read',
    REASONS_READ: 'reasons:read',
    WAREHOUSE_REPORTS_READ: 'warehouse:reports-read',
    SUPPLIER_REPORTS_READ: 'supplier:reports-read',
    SUPPLIERS_READ: 'suppliers:read',
    SUPPLIERS_MANAGE: 'suppliers:manage',
    SUPPLIERS_UPDATE: 'suppliers:update',
    UNIT_MEASURES_READ: 'unit:measures-read',
    WASTES_READ: 'wastes:read',
    WASTES_WRITE: 'wastes:write',
    WASTES_ADD_STOCK: 'wastes:add-stock',
    WASTES_ADJUST_STOCK: 'wastes:adjust-stock',
    WASTE_ISSUES_MANAGE: 'waste:issues-manage',
    WASTE_ISSUES_SUPPLY: 'waste:issues-supply',
    WASTE_ISSUES_PAGE_VIEW: 'waste:issues-page-view',
    PERSONS_PAGE_VIEW: 'persons:page-view',
    CLIENTS_PAGE_VIEW: 'clients:page-view',
    GOODS_ISSUES_PAGE_VIEW: 'goods:issues-page-view',
    GOODS_RECEIPTS_PAGE_VIEW: 'goods:receipts-page-view',
    SUPPLIERS_PAGE_VIEW: 'suppliers:page-view',
    WASTES_PAGE_VIEW: 'wastes:page-view'
});

export const DATA_SCOPES = Object.freeze({
    SYSTEM_WIDE_READ: 'system-wide-read',
    GOODS_ISSUES_READ_ALL: 'goods-issues:read-all'
});

const createPolicy = ({ roles, departments }) => Object.freeze({
    roleKeys: Object.freeze([...roles]),
    departmentKeys: Object.freeze([...departments])
});

const createAccessConditions = (conditions) => Object.freeze(
    conditions.map(condition => Object.freeze({ ...condition }))
);

export const DATA_SCOPE_POLICIES = Object.freeze({
    [DATA_SCOPES.SYSTEM_WIDE_READ]: createAccessConditions([
        { roleKey: ROLE_KEYS.DIRECTOR },
        { departmentKey: DEPARTMENT_KEYS.MANAGEMENT }
    ]),
    [DATA_SCOPES.GOODS_ISSUES_READ_ALL]: createAccessConditions([
        { roleKey: ROLE_KEYS.SYSTEM_ADMIN },
        {
            roleKey: ROLE_KEYS.COORDINATOR,
            departmentKey: DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY
        }
    ])
});

export const ORGANIZATION_CONTEXT_POLICIES = Object.freeze({
    isCoordinator: createAccessConditions([{ roleKey: ROLE_KEYS.COORDINATOR }]),
    isWarehouse: createAccessConditions([{ departmentKey: DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY }]),
    isSystem: createAccessConditions([{ departmentKey: DEPARTMENT_KEYS.SYSTEMS }]),
    isSales: createAccessConditions([{ departmentKey: DEPARTMENT_KEYS.SALES }])
});

// Accesos comunes de consulta y solicitudes. Almacén y Sistemas conservan además
// sus políticas de gestión; el acceso de sólo consulta aplica a las otras cinco áreas.
const operationalAccessPolicy = createPolicy({
    roles: [ROLE_KEYS.SYSTEM_ADMIN, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.OPERATOR, ROLE_KEYS.INSTALLER, ROLE_KEYS.WAREHOUSE_KEEPER],
    departments: [
        DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY,
        DEPARTMENT_KEYS.SYSTEMS,
        DEPARTMENT_KEYS.PRINTING,
        DEPARTMENT_KEYS.WORKSHOP_3D,
        DEPARTMENT_KEYS.PT_TRAFFIC,
        DEPARTMENT_KEYS.INSTALLATIONS,
        DEPARTMENT_KEYS.FINISHING
    ]
});

export const AUTHORIZATION_POLICIES = Object.freeze({
    [PERMISSIONS.CATALOGS_MANAGE]: createPolicy({
        roles: [ROLE_KEYS.SYSTEM_ADMIN],
        departments: [DEPARTMENT_KEYS.SYSTEMS]
    }),
    [PERMISSIONS.MATERIALS_READ]: operationalAccessPolicy,
    [PERMISSIONS.MATERIALS_WRITE]: createPolicy({
        roles: [
            ROLE_KEYS.WAREHOUSE_KEEPER,
            ROLE_KEYS.COORDINATOR,
            ROLE_KEYS.AUXILIARY,
            ROLE_KEYS.SYSTEM_ADMIN
        ],
        departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
    }),
    [PERMISSIONS.MATERIALS_ADJUST_STOCK]: createPolicy({
        roles: [ROLE_KEYS.SYSTEM_ADMIN],
        departments: [DEPARTMENT_KEYS.SYSTEMS]
    }),
    [PERMISSIONS.INVENTORY_COSTS_READ]: createPolicy({
        roles: [ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.SYSTEM_ADMIN],
        departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
    }),
    [PERMISSIONS.DEPARTMENTS_READ]: createPolicy({
    roles: [ ROLE_KEYS.SYSTEM_ADMIN, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.OPERATOR, ROLE_KEYS.INSTALLER, ROLE_KEYS.DESIGNER, ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.DISTRIBUTOR, ROLE_KEYS.DIRECTOR, ROLE_KEYS.ADMINISTRATOR, ROLE_KEYS.ACCOUNTANT ],
    departments: [
        DEPARTMENT_KEYS.MANAGEMENT,
        DEPARTMENT_KEYS.FINISHING,
        DEPARTMENT_KEYS.ADMINISTRATIVE,
        DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY,
        DEPARTMENT_KEYS.DESIGN,
        DEPARTMENT_KEYS.INSTALLATIONS,
        DEPARTMENT_KEYS.PRINTING,
        DEPARTMENT_KEYS.ROUTER,
        DEPARTMENT_KEYS.PT_TRAFFIC,
        DEPARTMENT_KEYS.SYSTEMS,
        DEPARTMENT_KEYS.WORKSHOP_3D
    ]
}),
    [PERMISSIONS.MOVEMENTS_READ]: createPolicy({
    roles: [ ROLE_KEYS.SYSTEM_ADMIN ],
    departments: [ DEPARTMENT_KEYS.SYSTEMS ]
}),
    [PERMISSIONS.PERSONS_READ]: createPolicy({
    roles: [ ROLE_KEYS.SYSTEM_ADMIN, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.OPERATOR, ROLE_KEYS.INSTALLER, ROLE_KEYS.DESIGNER, ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.DISTRIBUTOR, ROLE_KEYS.DIRECTOR, ROLE_KEYS.ADMINISTRATOR, ROLE_KEYS.ACCOUNTANT ],
    departments: [
        DEPARTMENT_KEYS.MANAGEMENT,
        DEPARTMENT_KEYS.FINISHING,
        DEPARTMENT_KEYS.ADMINISTRATIVE,
        DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY,
        DEPARTMENT_KEYS.DESIGN,
        DEPARTMENT_KEYS.INSTALLATIONS,
        DEPARTMENT_KEYS.PRINTING,
        DEPARTMENT_KEYS.ROUTER,
        DEPARTMENT_KEYS.PT_TRAFFIC,
        DEPARTMENT_KEYS.SYSTEMS,
        DEPARTMENT_KEYS.WORKSHOP_3D
    ]
}),
    [PERMISSIONS.PERSONS_WRITE]: createPolicy({
    roles: [ROLE_KEYS.SYSTEM_ADMIN, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.WAREHOUSE_KEEPER],
    departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.ADMIN_REPORTS_READ]: createPolicy({
    roles: [ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.PERSON_REPORTS_READ]: createPolicy({
    roles: [ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.ROLES_READ]: createPolicy({
    roles: [ROLE_KEYS.SYSTEM_ADMIN, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.WAREHOUSE_KEEPER],
    departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.USERS_MANAGE]: createPolicy({
    roles: [ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.CLIENTS_READ]: createPolicy({
    roles: [ROLE_KEYS.SYSTEM_ADMIN, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.OPERATOR, ROLE_KEYS.INSTALLER, ROLE_KEYS.WAREHOUSE_KEEPER],
    departments: [
        DEPARTMENT_KEYS.MANAGEMENT,
        DEPARTMENT_KEYS.FINISHING,
        DEPARTMENT_KEYS.ADMINISTRATIVE,
        DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY,
        DEPARTMENT_KEYS.DESIGN,
        DEPARTMENT_KEYS.INSTALLATIONS,
        DEPARTMENT_KEYS.PRINTING,
        DEPARTMENT_KEYS.ROUTER,
        DEPARTMENT_KEYS.PT_TRAFFIC,
        DEPARTMENT_KEYS.SYSTEMS,
        DEPARTMENT_KEYS.WORKSHOP_3D
    ]
}),
    [PERMISSIONS.CLIENTS_CREATE]: createPolicy({
    roles: [ROLE_KEYS.SYSTEM_ADMIN, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.WAREHOUSE_KEEPER],
    departments: [
        DEPARTMENT_KEYS.SYSTEMS,
        DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY,
        DEPARTMENT_KEYS.ADMINISTRATIVE
    ]
}),
    [PERMISSIONS.CLIENTS_UPDATE]: createPolicy({
    roles: [ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.CLIENT_REPORTS_READ]: createPolicy({
    roles: [ROLE_KEYS.SYSTEM_ADMIN, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY],
    departments: [DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.FULFILLMENT_STATUSES_READ]: createPolicy({
    roles: [ROLE_KEYS.SYSTEM_ADMIN, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.OPERATOR, ROLE_KEYS.INSTALLER, ROLE_KEYS.WAREHOUSE_KEEPER],
    departments: [
        DEPARTMENT_KEYS.MANAGEMENT,
        DEPARTMENT_KEYS.FINISHING,
        DEPARTMENT_KEYS.ADMINISTRATIVE,
        DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY,
        DEPARTMENT_KEYS.DESIGN,
        DEPARTMENT_KEYS.INSTALLATIONS,
        DEPARTMENT_KEYS.PRINTING,
        DEPARTMENT_KEYS.ROUTER,
        DEPARTMENT_KEYS.PT_TRAFFIC,
        DEPARTMENT_KEYS.SYSTEMS,
        DEPARTMENT_KEYS.WORKSHOP_3D
    ]
}),
    [PERMISSIONS.GOODS_ISSUES_MANAGE]: createPolicy({
    roles: [ROLE_KEYS.SYSTEM_ADMIN, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.OPERATOR, ROLE_KEYS.INSTALLER, ROLE_KEYS.WAREHOUSE_KEEPER],
    departments: [
        DEPARTMENT_KEYS.MANAGEMENT,
        DEPARTMENT_KEYS.FINISHING,
        DEPARTMENT_KEYS.ADMINISTRATIVE,
        DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY,
        DEPARTMENT_KEYS.DESIGN,
        DEPARTMENT_KEYS.INSTALLATIONS,
        DEPARTMENT_KEYS.PRINTING,
        DEPARTMENT_KEYS.ROUTER,
        DEPARTMENT_KEYS.PT_TRAFFIC,
        DEPARTMENT_KEYS.SYSTEMS,
        DEPARTMENT_KEYS.WORKSHOP_3D
    ]
}),
    [PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE]: createPolicy({
    roles: [ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.AUXILIARY, ROLE_KEYS.COORDINATOR, ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.GOODS_RECEIPTS_MANAGE]: createPolicy({
    roles: [ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.PRESENTATIONS_READ]: createPolicy({
    roles: [ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.REASONS_READ]: createPolicy({
    roles: [ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.WAREHOUSE_REPORTS_READ]: createPolicy({
    roles: [ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.SUPPLIER_REPORTS_READ]: createPolicy({
    roles: [ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.SUPPLIERS_MANAGE]: createPolicy({
    roles: [ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.SUPPLIERS_READ]: operationalAccessPolicy,
    [PERMISSIONS.SUPPLIERS_UPDATE]: createPolicy({
    roles: [ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.UNIT_MEASURES_READ]: createPolicy({
    roles: [ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.WASTES_READ]: operationalAccessPolicy,
    [PERMISSIONS.WASTES_WRITE]: createPolicy({
    roles: [ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
    }),
    [PERMISSIONS.WASTES_ADD_STOCK]: createPolicy({
        roles: [ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.SYSTEM_ADMIN],
        departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
    }),
    [PERMISSIONS.WASTES_ADJUST_STOCK]: createPolicy({
    roles: [ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.SYSTEMS]
    }),
    [PERMISSIONS.WASTE_ISSUES_MANAGE]: operationalAccessPolicy,
    [PERMISSIONS.WASTE_ISSUES_SUPPLY]: createPolicy({
        roles: [ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.SYSTEM_ADMIN],
        departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
    }),
    [PERMISSIONS.WASTE_ISSUES_PAGE_VIEW]: operationalAccessPolicy,
    [PERMISSIONS.PERSONS_PAGE_VIEW]: createPolicy({
    roles: [ROLE_KEYS.SYSTEM_ADMIN, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.WAREHOUSE_KEEPER],
    departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.CLIENTS_PAGE_VIEW]: createPolicy({
    roles: [ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.GOODS_ISSUES_PAGE_VIEW]: operationalAccessPolicy,
    [PERMISSIONS.GOODS_RECEIPTS_PAGE_VIEW]: createPolicy({
    roles: [ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.SUPPLIERS_PAGE_VIEW]: createPolicy({
    roles: [ROLE_KEYS.WAREHOUSE_KEEPER, ROLE_KEYS.COORDINATOR, ROLE_KEYS.AUXILIARY, ROLE_KEYS.SYSTEM_ADMIN],
    departments: [DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY, DEPARTMENT_KEYS.SYSTEMS]
}),
    [PERMISSIONS.WASTES_PAGE_VIEW]: operationalAccessPolicy
});

export const getAuthorizationPolicy = (permission) => {
    const policy = AUTHORIZATION_POLICIES[permission];

    if (!policy) {
        throw new Error(`Permiso de autorización no configurado: ${permission}`);
    }

    return policy;
};

const matchesAccessConditions = (accesses, conditions) => accesses.some(access => (
    conditions.some(condition => Object.entries(condition).every(([key, value]) => (
        access[key] === value
    )))
));

export const hasDataScope = (accesses = [], scope) => {
    const conditions = DATA_SCOPE_POLICIES[scope];

    if (!conditions) {
        throw new Error(`Alcance de datos no configurado: ${scope}`);
    }

    return matchesAccessConditions(accesses, conditions);
};

export const getOrganizationContext = (accesses = []) => Object.fromEntries(
    Object.entries(ORGANIZATION_CONTEXT_POLICIES).map(([context, conditions]) => [
        context,
        matchesAccessConditions(accesses, conditions)
    ])
);

export const getGrantedPermissions = (accesses = []) => Object.entries(AUTHORIZATION_POLICIES)
    .filter(([, policy]) => accesses.some(access => (
        policy.departmentKeys.includes(access.departmentKey)
        && policy.roleKeys.includes(access.roleKey)
    )))
    .map(([permission]) => permission);
