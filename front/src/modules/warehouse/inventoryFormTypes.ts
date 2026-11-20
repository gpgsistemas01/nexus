import type { InventoryField } from './inventory.js';

type SectionId =
    | 'origin'
    | 'identity'
    | 'measurements'
    | 'reference'
    | 'weights'
    | 'history'
    | 'presentation'
    | 'inventory'
    | 'stock'
    | 'notes';

export interface InventoryFieldSpec {
    name: InventoryField;
    label: string;
    type?: 'number' | 'lookup' | 'checkbox' | 'textarea';
    step?: number;
    isReadOnly?: boolean;
    isDisabled?: boolean;
    displayValue?: string;
    hint?: string;
    isWide?: boolean;
}
export interface InventorySummaryItem {
    label: string;
    value: string;
}
export interface InventoryFormSection {
    id: SectionId;
    title: string;
    description?: string;
    fields: InventoryFieldSpec[];
    summary?: InventorySummaryItem[];
}
