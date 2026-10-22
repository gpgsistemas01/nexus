import { APP_ICONS } from './icons.js';
import { PUBLIC_CATALOGS } from '@nexus/catalogs';
import { PERMISSIONS } from '@nexus/permissions';

export const APP_NAVIGATION = [
    {
        title: 'Materiales',
        to: '/almacen/materiales',
        icon: APP_ICONS.materials,
        permission: PERMISSIONS.MATERIALS_READ,
    },
    {
        title: 'Consumibles',
        to: '/almacen/consumibles',
        icon: APP_ICONS.consumables,
        permission: PERMISSIONS.MATERIALS_READ,
    },
    {
        title: 'Mermas',
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
        id: 'catalogs',
        title: 'Catálogos',
        icon: APP_ICONS.catalogs,
        links: Object.entries(PUBLIC_CATALOGS).map(([name, definition]) => ({
            title: definition.label,
            to: `/catalogos/${name}`,
            icon: APP_ICONS[name as keyof typeof PUBLIC_CATALOGS],
            permission: PERMISSIONS.CATALOGS_MANAGE,
        })),
    },
];
