export const buildInventorySelectText = (item = {}, {
    useRowDimensions = false
} = {}) => {

    const supplierName = item.supplier?.tradeName || item.supplierMaterial?.supplier?.tradeName || '';
    const name = item.material?.name || item.supplierMaterial?.material?.name || '';
    const base = useRowDimensions ? item.base : item.base ?? item.material?.base ?? item.supplierMaterial?.material?.base;
    const height = useRowDimensions ? item.height : item.height ?? item.material?.height ?? item.supplierMaterial?.material?.height;
    const dimensions = base === null || height === null
        ? 'Sin medidas'
        : `${ base } × ${ height }`
    const itemIdentity = `${ name } (${ dimensions })`;

    return supplierName
        ? `${ itemIdentity } · ${ supplierName }`
        : itemIdentity;
};

export const resolveMaterialPresentationName = (item = {}) => (
    item.presentation?.name
    || item.presentationName
    || item.material?.presentation?.name
    || ''
);

export const mapSelectMaterialData = (supplierMaterial = {}) => ({
    ...supplierMaterial,
    text: buildInventorySelectText(supplierMaterial),
    material: JSON.stringify(supplierMaterial.material),
    supplier: JSON.stringify(supplierMaterial.supplier)
});

export const mapSelectWasteData = (waste = {}) => ({
    ...waste,
    text: buildInventorySelectText(waste),
    supplierMaterial: JSON.stringify(waste.supplierMaterial)
});

export const mapSupplierMaterialToSelectData = (supplierMaterial = {}) => {

    const material = supplierMaterial.material || supplierMaterial;

    return {
        id: supplierMaterial.supplierMaterialId,
        text: buildInventorySelectText({
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
