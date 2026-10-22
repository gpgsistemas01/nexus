import { PUBLIC_CATALOGS } from '@nexus/catalogs';

export type CatalogName = keyof typeof PUBLIC_CATALOGS;
export type CatalogField = 'name' | 'symbol' | 'isActive';
export interface CatalogValues {
    name: string;
    symbol: string;
    isActive: boolean;
}
export interface CatalogEntry extends CatalogValues {
    id: string;
    version: number;
}
export interface CatalogQuery {
    search: string;
    page: number;
    length: number;
}
export type CatalogTarget = { action: 'create' } | { action: 'edit'; row: CatalogEntry };
export const catalogDefinition = (name: CatalogName) => {
    const definition = PUBLIC_CATALOGS[name];
    const maxLengths: { name: number; symbol?: number } = definition.maxLengths;
    return { ...definition, name, maxLengths };
};
export const buildCatalogPayload = (
    catalog: CatalogName,
    target: CatalogTarget,
    values: CatalogValues,
) => ({
    name: values.name.trim(),
    ...(catalog === 'unit-measures' ? { symbol: values.symbol.trim() } : {}),
    isActive: values.isActive,
    ...(target.action === 'edit' ? { expectedVersion: target.row.version } : {}),
});
