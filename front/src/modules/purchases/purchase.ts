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
    | { action: 'create' }
    | { action: 'edit'; document: PurchaseDocument }
    | { action: 'view'; document: PurchaseDocument };
export type PurchaseWriteTarget = Exclude<PurchaseTarget, { action: 'view' }>;
export type PurchaseDetailChange =
    { action: 'correct'; quantity: number; costPerUnitType: number } | { action: 'cancel' };
export type CreatedOption = (item: LookupItem) => void;
export interface ItemCreation {
    supplier: LookupItem;
    onCreated: CreatedOption;
}
