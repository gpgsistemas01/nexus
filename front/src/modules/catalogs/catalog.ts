import { PUBLIC_CATALOGS } from '@nexus/catalogs';

export type CatalogName = keyof typeof PUBLIC_CATALOGS;
export type CatalogField = keyof CatalogValues;
export interface CatalogValues {
    name: string;
    symbol: string;
    isActive: boolean;
    type?: string;
    presentationId?: string;
    unitMeasureId?: string;
    base?: string;
    height?: string;
}
export interface CatalogEntry extends Omit<CatalogValues, 'isActive'> {
    isActive?: boolean;
    hasSuppliers?: boolean;
    hasHistory?: boolean;
    presentation?: string;
    unitMeasure?: string;
    unitSymbol?: string;
    id: string;
    version: number;
}
export const ARTICLE_TYPE_OPTIONS = [
    { title: 'Material', value: 'MATERIAL' },
    { title: 'Consumible', value: 'CONSUMABLE' },
] as const;

export interface ArticleFilters {
    type: '' | (typeof ARTICLE_TYPE_OPTIONS)[number]['value'];
    presentationId: string;
    unitMeasureId: string;
}
export const EMPTY_ARTICLE_FILTERS: Readonly<ArticleFilters> = {
    type: '',
    presentationId: '',
    unitMeasureId: '',
};

export interface CatalogQuery extends Partial<ArticleFilters> {
    search: string;
    page: number;
    length: number;
}
export type CatalogTarget =
    | { action: 'create'; initialName?: string; materialType?: 'MATERIAL' | 'CONSUMABLE' }
    | { action: 'edit'; row: CatalogEntry };

export const catalogDefinition = (name: CatalogName) => {
    const definition = PUBLIC_CATALOGS[name];
    const maxLengths: { name: number; symbol?: number } = definition.maxLengths;
    return { ...definition, name, maxLengths };
};

export const buildCatalogPayload = (
    catalog: CatalogName,
    target: CatalogTarget,
    values: CatalogValues,
) =>
    catalog === 'materials'
        ? {
              name: values.name.trim(),
              ...(target.action === 'edit' ? { expectedVersion: target.row.version } : {}),
              ...(target.action === 'create' || !target.row.hasSuppliers
                  ? {
                        type: values.type,
                        presentationId: values.presentationId,
                        unitMeasureId: values.unitMeasureId,
                        base: values.base ? Number(values.base) : null,
                        height: values.height ? Number(values.height) : null,
                    }
                  : {}),
          }
        : {
              name: values.name.trim(),
              ...(catalog === 'unit-measures' ? { symbol: values.symbol.trim() } : {}),
              isActive: values.isActive,
              ...(target.action === 'edit' ? { expectedVersion: target.row.version } : {}),
          };
