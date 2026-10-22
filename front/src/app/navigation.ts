import { PERMISSIONS } from '@nexus/permissions';

export const APP_NAVIGATION = [
    {
        title: 'Materiales',
        to: '/almacen/materiales',
        icon: 'svg:M3 3H11V11H3V3M5 5V9H9V5H5M13 3H21V11H13V3M15 5V9H19V5H15M3 13H11V21H3V13M5 15V19H9V15H5M13 13H21V21H13V13M15 15V19H19V15H15Z',
        permission: PERMISSIONS.MATERIALS_READ,
    },
    {
        title: 'Consumibles',
        to: '/almacen/consumibles',
        icon: 'svg:M21 8V16L12 21L3 16V8L12 3L21 8M12 5.3L6 8.6L12 12L18 8.6L12 5.3M5 10.3V14.8L11 18.1V13.6L5 10.3M13 18.1L19 14.8V10.3L13 13.6V18.1Z',
        permission: PERMISSIONS.MATERIALS_READ,
    },
    {
        title: 'Mermas',
        to: '/almacen/mermas',
        icon: 'svg:M9.64 7.64C9.87 7.14 10 6.59 10 6A4 4 0 0 0 6 2A4 4 0 0 0 2 6A4 4 0 0 0 6 10C6.59 10 7.14 9.87 7.64 9.64L10 12L7.64 14.36C7.14 14.13 6.59 14 6 14A4 4 0 0 0 2 18A4 4 0 0 0 6 22A4 4 0 0 0 10 18C10 17.41 9.87 16.86 9.64 16.36L12 14L19 21H22V20L9.64 7.64M6 8A2 2 0 0 1 4 6A2 2 0 0 1 6 4A2 2 0 0 1 8 6A2 2 0 0 1 6 8M6 20A2 2 0 0 1 4 18A2 2 0 0 1 6 16A2 2 0 0 1 8 18A2 2 0 0 1 6 20M19 3L13 9L15 11L22 4V3H19Z',
        permission: PERMISSIONS.WASTES_PAGE_VIEW,
    },
] as const;

export interface NavigationLink {
    title: string;
    to: string;
    icon: string;
}
