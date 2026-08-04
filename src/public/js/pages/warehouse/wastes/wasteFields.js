export const wasteDataFields = ['supplierMaterialId', 'base', 'height'];
export const wasteStockFields = ['currentStock', 'reasonId', 'observations'];
export const wasteCreateFields = [...wasteDataFields, 'currentStock', 'observations'];

export const pickWasteFields = (data, fields) => Object.fromEntries(
    fields.map((field) => [field, data[field]])
);
