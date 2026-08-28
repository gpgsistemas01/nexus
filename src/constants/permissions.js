export const PERMISSIONS = Object.freeze({
    MATERIALS_READ: 'materials:read',
    MATERIALS_WRITE: 'materials:write',
    MATERIALS_ADJUST_STOCK: 'materials:adjust-stock',
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
    SUPPLIERS_MANAGE: 'suppliers:manage',
    SUPPLIERS_UPDATE: 'suppliers:update',
    UNIT_MEASURES_READ: 'unit:measures-read',
    WASTES_READ: 'wastes:read',
    WASTES_WRITE: 'wastes:write',
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

const createPolicy = ({ roles, departments }) => Object.freeze({
    roles: Object.freeze([...roles]),
    departments: Object.freeze([...departments])
});

export const AUTHORIZATION_POLICIES = Object.freeze({
    [PERMISSIONS.MATERIALS_READ]: createPolicy({
        roles: [
            'Almacenista',
            'Coordinador',
            'Auxiliar',
            'Operador',
            'Instalador',
            'Administrador del sistema'
        ],
        departments: [
            'ALMACÉN Y PROVEDURÍA',
            'SISTEMAS'
        ]
    }),
    [PERMISSIONS.MATERIALS_WRITE]: createPolicy({
        roles: [
            'Almacenista',
            'Coordinador',
            'Auxiliar',
            'Administrador del sistema'
        ],
        departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
    }),
    [PERMISSIONS.MATERIALS_ADJUST_STOCK]: createPolicy({
        roles: ['Administrador del sistema'],
        departments: ['SISTEMAS']
    }),
    [PERMISSIONS.INVENTORY_COSTS_READ]: createPolicy({
        roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
        departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
    }),
    [PERMISSIONS.DEPARTMENTS_READ]: createPolicy({
    roles: [ 'Administrador del sistema', 'Coordinador', 'Auxiliar', 'Operador', 'Instalador', 'Diseñador', 'Almacenista', 'Repartidor', 'Director', 'Administrador', 'Contador' ],
    departments: [
        'DIRECCIÓN',
        'ACABADOS',
        'ADMINISTRATIVO',
        'ALMACÉN Y PROVEDURÍA',
        'DISEÑO',
        'INSTALACIONES',
        'IMPRESIÓN',
        'ROUTER',
        'PT/TRÁFICO',
        'SISTEMAS',
        'TALLER 3D'
    ]
}),
    [PERMISSIONS.MOVEMENTS_READ]: createPolicy({
    roles: [ 'Administrador del sistema' ],
    departments: [ 'SISTEMAS' ]
}),
    [PERMISSIONS.PERSONS_READ]: createPolicy({
    roles: [ 'Administrador del sistema', 'Coordinador', 'Auxiliar', 'Operador', 'Instalador', 'Diseñador', 'Almacenista', 'Repartidor', 'Director', 'Administrador', 'Contador' ],
    departments: [
        'DIRECCIÓN',
        'ACABADOS',
        'ADMINISTRATIVO',
        'ALMACÉN Y PROVEDURÍA',
        'DISEÑO',
        'INSTALACIONES',
        'IMPRESIÓN',
        'ROUTER',
        'PT/TRÁFICO',
        'SISTEMAS',
        'TALLER 3D'
    ]
}),
    [PERMISSIONS.PERSONS_WRITE]: createPolicy({
    roles: ['Administrador del sistema', 'Coordinador', 'Auxiliar', 'Almacenista'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
}),
    [PERMISSIONS.ADMIN_REPORTS_READ]: createPolicy({
    roles: ['Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['SISTEMAS']
}),
    [PERMISSIONS.PERSON_REPORTS_READ]: createPolicy({
    roles: ['Coordinador', 'Auxiliar', 'Almacenista', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
}),
    [PERMISSIONS.ROLES_READ]: createPolicy({
    roles: ['Administrador del sistema', 'Coordinador', 'Auxiliar', 'Almacenista'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
}),
    [PERMISSIONS.USERS_MANAGE]: createPolicy({
    roles: ['Administrador del sistema'],
    departments: ['SISTEMAS']
}),
    [PERMISSIONS.CLIENTS_READ]: createPolicy({
    roles: ['Administrador del sistema', 'Coordinador', 'Auxiliar', 'Operador', 'Instalador', 'Almacenista'],
    departments: [
        'DIRECCIÓN',
        'ACABADOS',
        'ADMINISTRATIVO',
        'ALMACÉN Y PROVEDURÍA',
        'DISEÑO',
        'INSTALACIONES',
        'IMPRESIÓN',
        'ROUTER',
        'PT/TRÁFICO',
        'SISTEMAS',
        'TALLER 3D'
    ]
}),
    [PERMISSIONS.CLIENTS_CREATE]: createPolicy({
    roles: ['Administrador del sistema', 'Coordinador', 'Auxiliar', 'Almacenista'],
    departments: [
        'SISTEMAS',
        'ALMACÉN Y PROVEDURÍA',
        'ADMINISTRATIVO'
    ]
}),
    [PERMISSIONS.CLIENTS_UPDATE]: createPolicy({
    roles: ['Administrador del sistema'],
    departments: ['SISTEMAS']
}),
    [PERMISSIONS.CLIENT_REPORTS_READ]: createPolicy({
    roles: ['Administrador del sistema', 'Coordinador', 'Auxiliar'],
    departments: ['SISTEMAS']
}),
    [PERMISSIONS.FULFILLMENT_STATUSES_READ]: createPolicy({
    roles: ['Administrador del sistema', 'Coordinador', 'Auxiliar', 'Operador', 'Instalador', 'Almacenista'],
    departments: [
        'DIRECCIÓN',
        'ACABADOS',
        'ADMINISTRATIVO',
        'ALMACÉN Y PROVEDURÍA',
        'DISEÑO',
        'INSTALACIONES',
        'IMPRESIÓN',
        'ROUTER',
        'PT/TRÁFICO',
        'SISTEMAS',
        'TALLER 3D'
    ]
}),
    [PERMISSIONS.GOODS_ISSUES_MANAGE]: createPolicy({
    roles: ['Administrador del sistema', 'Coordinador', 'Auxiliar', 'Operador', 'Instalador', 'Almacenista'],
    departments: [
        'DIRECCIÓN',
        'ACABADOS',
        'ADMINISTRATIVO',
        'ALMACÉN Y PROVEDURÍA',
        'DISEÑO',
        'INSTALACIONES',
        'IMPRESIÓN',
        'ROUTER',
        'PT/TRÁFICO',
        'SISTEMAS',
        'TALLER 3D'
    ]
}),
    [PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE]: createPolicy({
    roles: ['Almacenista', 'Auxiliar', 'Coordinador', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
}),
    [PERMISSIONS.GOODS_RECEIPTS_MANAGE]: createPolicy({
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
}),
    [PERMISSIONS.PRESENTATIONS_READ]: createPolicy({
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
}),
    [PERMISSIONS.REASONS_READ]: createPolicy({
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
}),
    [PERMISSIONS.WAREHOUSE_REPORTS_READ]: createPolicy({
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
}),
    [PERMISSIONS.SUPPLIER_REPORTS_READ]: createPolicy({
    roles: ['Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['SISTEMAS']
}),
    [PERMISSIONS.SUPPLIERS_MANAGE]: createPolicy({
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
}),
    [PERMISSIONS.SUPPLIERS_UPDATE]: createPolicy({
    roles: ['Administrador del sistema'],
    departments: ['SISTEMAS']
}),
    [PERMISSIONS.UNIT_MEASURES_READ]: createPolicy({
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
}),
    [PERMISSIONS.WASTES_READ]: createPolicy({
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
}),
    [PERMISSIONS.WASTES_WRITE]: createPolicy({
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
}),
    [PERMISSIONS.WASTES_ADJUST_STOCK]: createPolicy({
    roles: ['Administrador del sistema'],
    departments: ['SISTEMAS']
    }),
    [PERMISSIONS.WASTE_ISSUES_MANAGE]: createPolicy({
        roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
        departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
    }),
    [PERMISSIONS.WASTE_ISSUES_SUPPLY]: createPolicy({
        roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
        departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
    }),
    [PERMISSIONS.WASTE_ISSUES_PAGE_VIEW]: createPolicy({
        roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
        departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
    }),
    [PERMISSIONS.PERSONS_PAGE_VIEW]: createPolicy({
    roles: ['Administrador del sistema', 'Coordinador', 'Auxiliar', 'Almacenista'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
}),
    [PERMISSIONS.CLIENTS_PAGE_VIEW]: createPolicy({
    roles: ['Administrador del sistema'],
    departments: ['SISTEMAS']
}),
    [PERMISSIONS.GOODS_ISSUES_PAGE_VIEW]: createPolicy({
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
}),
    [PERMISSIONS.GOODS_RECEIPTS_PAGE_VIEW]: createPolicy({
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
}),
    [PERMISSIONS.SUPPLIERS_PAGE_VIEW]: createPolicy({
    roles: ['Administrador del sistema'],
    departments: ['SISTEMAS']
}),
    [PERMISSIONS.WASTES_PAGE_VIEW]: createPolicy({
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
})
});

export const getAuthorizationPolicy = (permission) => {
    const policy = AUTHORIZATION_POLICIES[permission];

    if (!policy) {
        throw new Error(`Permiso de autorización no configurado: ${permission}`);
    }

    return policy;
};

export const getGrantedPermissions = (accesses = []) => Object.entries(AUTHORIZATION_POLICIES)
    .filter(([, policy]) => accesses.some(access => (
        policy.departments.includes(access.department)
        && policy.roles.includes(access.role)
    )))
    .map(([permission]) => permission);
