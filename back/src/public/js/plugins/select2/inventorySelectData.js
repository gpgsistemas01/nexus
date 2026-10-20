import { buildInventorySelectText } from '../../utils/warehouseInventoryUtils.js';

export const mapSelectMaterialData = (supplierMaterial = {}) => ({
    ...supplierMaterial,
    text: buildInventorySelectText(supplierMaterial),
    material: JSON.stringify(supplierMaterial.material),
    supplier: JSON.stringify(supplierMaterial.supplier)
});

export const mapSelectWasteData = (waste = {}) => ({
    ...waste,
    text: buildInventorySelectText(waste),
    supplier: JSON.stringify(waste.supplier),
    presentation: JSON.stringify(waste.presentation ?? {}),
    unitMeasure: JSON.stringify(waste.unitMeasure ?? {})
});

export const mapSelectWasteMaterialTemplateData = (material = {}) => ({
    ...material,
    text: buildInventorySelectText(material),
    presentation: JSON.stringify(material.presentation ?? {}),
    unitMeasure: JSON.stringify(material.unitMeasure ?? {})
});

export const normalizeInventorySelectRelations = (item = {}) => {
    const data = { ...item };
    ['material', 'supplier', 'presentation', 'unitMeasure'].forEach(field => {
        if (typeof data[field] === 'string') data[field] = JSON.parse(data[field] || '{}');
    });
    return data;
};
