import { PERMISSIONS } from '@nexus/permissions';

export const APP_NAVIGATION = [
    {
        title: 'Materiales',
        to: '/almacen/materiales',
        initial: 'M',
        permission: PERMISSIONS.MATERIALS_READ,
    },
    {
        title: 'Consumibles',
        to: '/almacen/consumibles',
        initial: 'C',
        permission: PERMISSIONS.MATERIALS_READ,
    },
    {
        title: 'Mermas',
        to: '/almacen/mermas',
        initial: 'R',
        permission: PERMISSIONS.WASTES_PAGE_VIEW,
    },
] as const;

export interface NavigationLink {
    title: string;
    to: string;
    initial: string;
}
