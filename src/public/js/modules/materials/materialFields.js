export const materialDataFields = ['name', 'supplierId', 'presentationId', 'unitMeasureId', 'base', 'height'];
export const materialSecondaryDataFields = ['name', 'supplierId', 'minStock', 'maxUnitCost', 'isActive'];
export const materialStockFields = ['newStock', 'reasonId', 'observations'];
export const materialCreateFields = [
    ...materialDataFields,
    'minStock',
    'maxUnitCost',
    'isActive',
    'newStock',
    'observations'
];
