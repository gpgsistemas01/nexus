export const wasteDataFields = ['materialId', 'supplierId', 'base', 'height'];
export const wasteSecondaryDataFields = ['minStock', 'maxUnitCost', 'isActive'];
export const wasteStockFields = ['newStock', 'reasonId', 'observations'];
export const wasteCreateFields = [...wasteDataFields, ...wasteSecondaryDataFields, 'newStock', 'observations'];
