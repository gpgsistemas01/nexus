export const wasteDataFields = ['materialId', 'supplierId', 'base', 'height'];
export const wasteSecondaryDataFields = ['minStock', 'maxUnitCost', 'isActive'];
export const wasteEditFields = ['name', ...wasteSecondaryDataFields];
export const wasteStockFields = ['newStock', 'reasonId', 'observations'];
export const wasteCreateFields = ['name', ...wasteDataFields, ...wasteSecondaryDataFields, 'newStock', 'observations'];
