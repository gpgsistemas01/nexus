import { PERMISSIONS } from '@nexus/permissions';

export const ISSUE_CONFIG = {
    materials: {
        title: 'Salidas de materiales',
        label: 'Materiales',
        item: 'Material',
        path: 'materiales',
        type: 'MATERIAL',
        pagePermission: PERMISSIONS.GOODS_ISSUES_PAGE_VIEW,
        managePermission: PERMISSIONS.GOODS_ISSUES_MANAGE,
        supplyPermission: PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE,
    },
    consumables: {
        title: 'Salidas de consumibles',
        label: 'Consumibles',
        item: 'Consumible',
        path: 'consumibles',
        type: 'CONSUMABLE',
        pagePermission: PERMISSIONS.GOODS_ISSUES_PAGE_VIEW,
        managePermission: PERMISSIONS.GOODS_ISSUES_MANAGE,
        supplyPermission: PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE,
    },
    wastes: {
        title: 'Salidas de merma',
        label: 'Mermas',
        item: 'Merma',
        path: 'mermas',
        type: null,
        pagePermission: PERMISSIONS.WASTE_ISSUES_PAGE_VIEW,
        managePermission: PERMISSIONS.WASTE_ISSUES_MANAGE,
        supplyPermission: PERMISSIONS.WASTE_ISSUES_SUPPLY,
    },
} as const;

export const ISSUE_FILTER_SELECTS = [
    { field: 'clientId', kind: 'clients', label: 'Cliente', permission: PERMISSIONS.CLIENTS_READ },
    {
        field: 'departmentId',
        kind: 'departments',
        label: 'Área',
        permission: PERMISSIONS.DEPARTMENTS_READ,
    },
    { field: 'personId', kind: 'persons', label: 'Persona', permission: PERMISSIONS.PERSONS_READ },
    {
        field: 'fulfillmentStatusId',
        kind: 'statuses',
        label: 'Estado de surtido',
        permission: PERMISSIONS.FULFILLMENT_STATUSES_READ,
    },
] as const;
