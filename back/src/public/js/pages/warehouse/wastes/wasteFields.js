export const wasteDataFields = ['materialId', 'supplierId', 'base', 'height'];
export const wasteSecondaryDataFields = ['minStock', 'maxUnitCost', 'isActive'];
export const wasteEditFields = ['name', ...wasteSecondaryDataFields];
export const wasteStockAdjustmentFields = ['newStock', 'reasonId', 'observations'];
export const wasteStockAdditionFields = ['quantity', 'observations'];
export const wasteCreateFields = ['name', 'coneWeightKg', 'totalWeightKg', 'referenceRollTotalWeightKg', ...wasteDataFields, ...wasteSecondaryDataFields, 'initialQuantity', 'observations'];
