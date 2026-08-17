export const wasteDataFields = ['supplierMaterialId', 'base', 'height', 'weight'];
export const wasteSecondaryDataFields = ['minStock', 'isActive'];
export const wasteStockFields = ['newStock', 'reasonId', 'observations'];
export const wasteCreateFields = [...wasteDataFields, ...wasteSecondaryDataFields, 'newStock', 'observations'];
