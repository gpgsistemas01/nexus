import { PERMISSIONS } from '@nexus/permissions';

export type DirectoryResource = 'clients' | 'suppliers';
export interface DirectoryValues {
    name: string;
    legalName: string;
    tradeName: string;
    isActive: boolean;
}
export interface DirectoryEntry extends DirectoryValues {
    id: string;
    version: number;
}
export type DirectoryTarget =
    { action: 'create'; initialName?: string } | { action: 'edit'; row: DirectoryEntry };
export type DirectoryField = keyof DirectoryValues;

export const DIRECTORY_CONFIG = {
    clients: {
        title: 'Clientes',
        singular: 'cliente',
        createLabel: 'Nuevo cliente',
        read: PERMISSIONS.CLIENTS_READ,
        create: PERMISSIONS.CLIENTS_CREATE,
        update: PERMISSIONS.CLIENTS_UPDATE,
        report: PERMISSIONS.CLIENT_REPORTS_READ,
        path: '/api/sales/clients',
        reportPath: '/api/sales/reports/clients/excel',
    },
    suppliers: {
        title: 'Proveedores',
        singular: 'proveedor',
        createLabel: 'Nuevo proveedor',
        read: PERMISSIONS.SUPPLIERS_READ,
        create: PERMISSIONS.SUPPLIERS_MANAGE,
        update: PERMISSIONS.SUPPLIERS_UPDATE,
        report: PERMISSIONS.SUPPLIER_REPORTS_READ,
        path: '/api/warehouse/suppliers',
        reportPath: '/api/warehouse/reports/suppliers/excel',
    },
} as const;

export const directoryPayload = (
    resource: DirectoryResource,
    target: DirectoryTarget,
    values: DirectoryValues,
) => ({
    ...(resource === 'clients'
        ? { name: values.name.trim() }
        : { legalName: values.legalName.trim(), tradeName: values.tradeName.trim() }),
    isActive: values.isActive,
    ...(target.action === 'edit' ? { expectedVersion: target.row.version } : {}),
});
