const admin = '/api/admin';
const warehouse = '/api/warehouse';
const sales = '/api/sales';

const directory = {
    clients: `${sales}/clients`,
    suppliers: `${warehouse}/suppliers`,
} as const;

const inventory = {
    materials: `${warehouse}/materials`,
    consumables: `${warehouse}/consumables`,
    wastes: `${warehouse}/wastes`,
} as const;

export const API_PATHS = {
    auth: {
        login: '/api/auth/login',
        me: '/api/auth/me',
        refresh: '/api/auth/refresh',
    },
    identity: { persons: `${admin}/persons`, users: `${admin}/users` },
    organization: { departments: `${admin}/departments`, roles: `${admin}/roles` },
    directory,
    inventory,
    inventoryCatalogs: {
        suppliers: directory.suppliers,
        presentations: `${warehouse}/presentations`,
        'unit-measures': `${warehouse}/unit-measures`,
        reasons: `${warehouse}/reasons`,
        'wastes/material-templates': `${inventory.wastes}/material-templates`,
    },
    catalogs: `${admin}/catalogs`,
    inventoryImports: `${warehouse}/inventory-imports`,
    historicalDeliveries: `${warehouse}/historical-deliveries`,
    purchases: {
        materials: `${warehouse}/goods-receipts/materials`,
        consumables: `${warehouse}/goods-receipts/consumables`,
    },
    issues: {
        materials: `${warehouse}/goods-issues/materials`,
        consumables: `${warehouse}/goods-issues/consumables`,
        wastes: `${warehouse}/waste-issues`,
    },
    fulfillmentStatuses: `${warehouse}/fulfillment-statuses`,
    movements: {
        materials: `${admin}/movements/materials`,
        consumables: `${admin}/movements/consumables`,
        wastes: `${admin}/movements/wastes`,
    },
    reports: {
        identity: {
            persons: `${admin}/reports/persons/excel`,
            users: `${admin}/reports/users/excel`,
        },
        directory: {
            clients: `${sales}/reports/clients/excel`,
            suppliers: `${warehouse}/reports/suppliers/excel`,
        },
        inventory: {
            materials: `${warehouse}/reports/inventory/excel`,
            consumables: `${warehouse}/reports/inventory/excel`,
            wastes: `${warehouse}/reports/wastes/excel`,
        },
        purchases: {
            materials: `${warehouse}/reports/goods-receipts/materials/excel`,
            consumables: `${warehouse}/reports/goods-receipts/consumables/excel`,
        },
        issues: {
            materials: `${warehouse}/reports/goods-issues/materials/excel`,
            consumables: `${warehouse}/reports/goods-issues/consumables/excel`,
            wastes: `${warehouse}/reports/waste-issues/excel`,
        },
        movements: {
            materials: `${admin}/reports/movements/materials/excel`,
            consumables: `${admin}/reports/movements/consumables/excel`,
            wastes: `${admin}/reports/movements/wastes/excel`,
        },
    },
} as const;

export type InventoryCatalogPath = keyof typeof API_PATHS.inventoryCatalogs;
