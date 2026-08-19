export const getBase = (item) => item.base ?? item.material?.base ?? item.supplierMaterial?.material?.base;
export const getHeight = (item) => item.height ?? item.material?.height ?? item.supplierMaterial?.material?.height;
export const getPresentation = (item) => item.material?.presentation?.name ?? item.supplierMaterial?.material?.presentation?.name;
export const getUnitMeasure = (item) => item.material?.unitMeasure?.symbol ?? item.supplierMaterial?.material?.unitMeasure?.symbol;
export const getMaxUnitCost = (item) => item.maxUnitCost ?? item.supplierMaterial?.maxUnitCost;
export const getCurrentStock = (item) => item.currentStock ?? item.supplierMaterial?.currentStock;
export const getMinStock = (item) => item.minStock ?? item.supplierMaterial?.minStock;

export const buildInventorySelectText = (item = {}) => {

    const supplierName = item.supplier?.tradeName || item.supplierMaterial?.supplier?.tradeName || '';
    const name = item.material?.name || item.supplierMaterial?.material?.name || '';
    const base = getBase(item);
    const height = getHeight(item);
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
