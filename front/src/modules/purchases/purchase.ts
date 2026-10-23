import type { RecordQuery } from '../../shared/list.js';
import type { LookupItem } from '../../shared/lookup.js';

export type PurchaseResource = 'materials' | 'consumables';
export type Decimal = string | number;
export interface PurchaseFilters {
    startDate: string;
    endDate: string;
    supplierId: string;
    personId: string;
}
export type PurchaseQuery = RecordQuery & PurchaseFilters;
export interface PurchaseRow {
    id: string;
    referenceNumber: string;
    receptionDate: string;
    supplierId: string;
    supplierName: string;
    receivedById: string;
    receivedByName: string;
    isInvoiced: boolean;
    invoice: string;
    status: string;
    totalQuantity: Decimal;
    totalNetPurchaseAmount: Decimal;
    totalGrossPurchaseAmount: Decimal;
}
export interface PurchaseDetail {
    id: string;
    materialId: string;
    name: string;
    base: Decimal | null;
    height: Decimal | null;
    presentation: string;
    unitMeasure: string;
    quantity: Decimal;
    convertedQuantity: Decimal;
    costPerUnitType: Decimal;
    conversionUnitCost: Decimal;
    netPurchaseAmount: Decimal;
    grossPurchaseAmount: Decimal;
    status: 'ACTIVE' | 'CANCELED';
    isNew: boolean;
}
export interface PurchaseDocument extends PurchaseRow {
    observations: string;
    details: PurchaseDetail[];
}
export interface PurchaseValues {
    supplierId: string;
    receivedById: string;
    isInvoiced: boolean;
    invoice: string;
    receptionDate: string;
    observations: string;
    details: PurchaseDetail[];
}
export type PurchaseField = keyof PurchaseValues;
export type PurchaseTarget =
    { action: 'create' } | { action: 'edit' | 'view'; document: PurchaseDocument };
export type CreatedOption = (item: LookupItem) => void;
export interface ItemCreation {
    supplier: LookupItem;
    onCreated: CreatedOption;
}
export const PURCHASE_CONFIG = {
    materials: {
        title: 'Compras de Materiales',
        label: 'Materiales',
        item: 'Material',
        path: 'materiales',
        type: 'MATERIAL',
    },
    consumables: {
        title: 'Compras de Consumibles',
        label: 'Consumibles',
        item: 'Consumible',
        path: 'consumibles',
        type: 'CONSUMABLE',
    },
} as const;

export const emptyPurchaseFilters = (): PurchaseFilters => ({
    startDate: '',
    endDate: '',
    supplierId: '',
    personId: '',
});

export const canEditPurchase = (row: PurchaseRow) =>
    row.status === 'Confirmada' || row.status === 'Abierta';
