import { INVENTORY_CONFIG } from '../modules/warehouse/inventory.js';
import { IDENTITY_CONFIG } from '../modules/identity/identity.js';
import { DIRECTORY_CONFIG } from '../modules/directory/directory.js';
import { APP_ICONS } from './icons.js';
import { PUBLIC_CATALOGS } from '@nexus/catalogs';
import { PERMISSIONS } from '@nexus/permissions';
import { MOVEMENT_CONFIG } from '../modules/movements/movement.js';
import type { MovementResource } from '../modules/movements/movement.js';
import { ISSUE_CONFIG } from '../modules/issues/issueConfig.js';
import type { IssueResource } from '../modules/issues/issue.js';
import { PURCHASE_CONFIG } from '../modules/purchases/purchaseConfig.js';
import type { PurchaseResource } from '../modules/purchases/purchase.js';

export const APP_NAVIGATION = [
    {
        title: PUBLIC_CATALOGS.materials.label,
        to: '/almacen/articulos',
        icon: APP_ICONS.materials,
        permission: PERMISSIONS.MATERIAL_CATALOGS_MANAGE,
    },
    {
        title: INVENTORY_CONFIG.materials.title,
        to: '/almacen/materiales',
        icon: APP_ICONS.materials,
        permission: PERMISSIONS.MATERIALS_READ,
    },
    {
        title: INVENTORY_CONFIG.consumables.title,
        to: '/almacen/consumibles',
        icon: APP_ICONS.consumables,
        permission: PERMISSIONS.MATERIALS_READ,
    },
    {
        title: INVENTORY_CONFIG.wastes.title,
        to: '/almacen/mermas',
        icon: APP_ICONS.wastes,
        permission: PERMISSIONS.WASTES_PAGE_VIEW,
    },
] as const;

export interface NavigationLink {
    title: string;
    to: string;
    icon: string;
}

export interface NavigationGroup {
    id: string;
    title: string;
    icon: string;
    links: readonly (NavigationLink & { permission: string })[];
}
export const APP_NAVIGATION_GROUPS: readonly NavigationGroup[] = [
    {
        id: 'warehouse',
        title: 'Almacén',
        icon: APP_ICONS.warehouse,
        links: APP_NAVIGATION,
    },
    {
        id: 'purchases',
        title: 'Compras',
        icon: APP_ICONS.purchases,
        links: Object.entries(PURCHASE_CONFIG).map(([resource, config]) => ({
            title: config.label,
            to: `/compras/${config.path}`,
            icon: APP_ICONS[resource as PurchaseResource],
            permission: PERMISSIONS.GOODS_RECEIPTS_PAGE_VIEW,
        })),
    },
    {
        id: 'issues',
        title: 'Salidas',
        icon: APP_ICONS.issues,
        links: Object.entries(ISSUE_CONFIG).map(([resource, config]) => ({
            title: config.label,
            to: `/salidas/${config.path}`,
            icon: APP_ICONS[resource as IssueResource],
            permission: config.pagePermission,
        })),
    },
    {
        id: 'movements',
        title: 'Movimientos',
        icon: APP_ICONS.movements,
        links: Object.entries(MOVEMENT_CONFIG).map(([resource, config]) => ({
            title: config.label,
            to: `/movimientos/${config.path}`,
            icon: APP_ICONS[resource as MovementResource],
            permission: PERMISSIONS.MOVEMENTS_READ,
        })),
    },
    {
        id: 'identity',
        title: 'Identidad y acceso',
        icon: APP_ICONS.identity,
        links: [
            {
                title: IDENTITY_CONFIG.persons.title,
                to: '/identidad/personas',
                icon: APP_ICONS.persons,
                permission: PERMISSIONS.PERSONS_PAGE_VIEW,
            },
            {
                title: IDENTITY_CONFIG.users.title,
                to: '/identidad/usuarios',
                icon: APP_ICONS.users,
                permission: PERMISSIONS.USERS_MANAGE,
            },
        ],
    },
    {
        id: 'directory',
        title: 'Directorio comercial',
        icon: APP_ICONS.directory,
        links: [
            {
                title: DIRECTORY_CONFIG.clients.title,
                to: '/directorio/clientes',
                icon: APP_ICONS.clients,
                permission: PERMISSIONS.CLIENTS_PAGE_VIEW,
            },
            {
                title: DIRECTORY_CONFIG.suppliers.title,
                to: '/directorio/proveedores',
                icon: APP_ICONS.suppliers,
                permission: PERMISSIONS.SUPPLIERS_PAGE_VIEW,
            },
        ],
    },
    {
        id: 'catalogs',
        title: 'Catálogos',
        icon: APP_ICONS.catalogs,
        links: Object.entries(PUBLIC_CATALOGS)
            .filter(([name]) => name !== 'materials')
            .map(([name, definition]) => ({
                title: definition.label,
                to: `/catalogos/${name}`,
                icon: APP_ICONS[name as keyof typeof PUBLIC_CATALOGS],
                permission: PERMISSIONS.CATALOGS_MANAGE,
            })),
    },
];
