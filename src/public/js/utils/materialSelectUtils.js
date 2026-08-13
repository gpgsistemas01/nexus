export const formatInventorySelectDimensions = item => (
    item.base == null || item.height == null
        ? 'Sin medidas'
        : `${ item.base } × ${ item.height }`
);

export const buildInventorySelectText = (item = {}, {
    supplierName: supplierOverride = null,
    useRowDimensions = false
} = {}) => {

    const supplierName = supplierOverride || item.supplier?.tradeName || item.supplierName || '';
    const materialName = item.materialName || item.material?.name || item.name || '';
    const materialBase = useRowDimensions ? item.base : item.materialBase ?? item.material?.base ?? item.base;
    const materialHeight = useRowDimensions ? item.height : item.materialHeight ?? item.material?.height ?? item.height;
    const dimensions = formatInventorySelectDimensions({ base: materialBase, height: materialHeight });
    const materialIdentity = `${ materialName } (${ dimensions })`;

    return supplierName
        ? `${ materialIdentity } · ${ supplierName }`
        : materialIdentity;
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
