export const formatInventorySelectDimensions = item => (
    item.base == null || item.height == null
        ? 'Sin dimensiones'
        : `${ item.base } × ${ item.height }`
);

export const buildInventorySelectText = (item = {}) => {

    const supplierName = item.supplier?.tradeName || item.supplierName || '';
    const materialName = item.materialName || item.name || '';
    const materialBase = item.materialBase ?? item.base;
    const materialHeight = item.materialHeight ?? item.height;

    return [
        materialName,
        supplierName,
        formatInventorySelectDimensions({ base: materialBase, height: materialHeight })
    ].join(' · ');
};

export const resolveMaterialPresentationName = (item = {}) => (
    item.presentation?.name
    || item.presentationName
    || item.material?.presentation?.name
    || ''
);

export const buildMaterialSelectText = (material = {}) => {

    return buildInventorySelectText(material);
};

export const mapMaterialToSelectData = (material = {}) => ({
    id: material.id,
    text: buildMaterialSelectText(material),
    materialName: material.name,
    presentationName: resolveMaterialPresentationName(material),
    unitMeasureName: material.unitMeasure?.name,
    unitMeasureSymbol: material.unitMeasure?.symbol,
    materialBase: material.base,
    materialHeight: material.height,
    currentStock: material.currentStock,
    supplierName: material.supplier?.tradeName,
    supplierId: material.supplier?.id
});


export const mapSupplierMaterialToSelectData = (supplierMaterial = {}) => {

    const material = supplierMaterial.material || supplierMaterial;

    return {
        id: supplierMaterial.supplierMaterialId,
        text: buildMaterialSelectText({
            ...material,
            base: supplierMaterial.materialBase ?? material.base ?? supplierMaterial.base,
            height: supplierMaterial.materialHeight ?? material.height ?? supplierMaterial.height,
            supplier: supplierMaterial.supplier || material.supplier,
            supplierName: supplierMaterial.supplierName
        }),
        presentationName: resolveMaterialPresentationName(supplierMaterial),
        unitMeasureName: material.unitMeasure?.name,
        unitMeasureSymbol: material.unitMeasure?.symbol,
        supplierName: supplierMaterial.supplierName || supplierMaterial.supplier?.tradeName || material.supplier?.tradeName,
        materialBase: supplierMaterial.materialBase ?? material.base ?? supplierMaterial.base,
        materialHeight: supplierMaterial.materialHeight ?? material.height ?? supplierMaterial.height,
        currentStock: supplierMaterial.currentStock ?? material.currentStock,
        maxUnitCost: supplierMaterial.maxUnitCost ?? material.maxUnitCost
    };
};
