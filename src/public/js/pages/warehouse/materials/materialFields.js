import { MATERIAL_ROLL_REFERENCE_FIELDS } from '../../../constants/inventory.js';

export const materialRollReferenceFields = MATERIAL_ROLL_REFERENCE_FIELDS;
export const materialDataFields = ['name', 'supplierId', 'presentationId', 'unitMeasureId', 'base', 'height'];
export const materialSecondaryDataFields = ['name', 'supplierId', 'minStock', 'maxUnitCost', 'isActive', ...materialRollReferenceFields];
export const materialEditableDataFields = ['name', 'minStock', 'maxUnitCost', 'isActive', ...materialRollReferenceFields];
export const materialStockFields = ['newStock', 'reasonId', 'observations'];
export const materialStockRequestFields = ['supplierId', ...materialStockFields];
export const materialCreateFields = [
    ...materialDataFields,
    'minStock',
    'maxUnitCost',
    'isActive',
    'newStock',
    'observations',
    ...materialRollReferenceFields
];
