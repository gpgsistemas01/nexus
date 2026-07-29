export const buildMaterialSelectText = (material = {}) => {

    const supplierName = material.supplier?.tradeName || material.supplierName || '';
    const materialName = material.materialName || material.name || '';
    const materialBase = material.materialBase ?? material.base;
    const materialHeight = material.materialHeight ?? material.height;

    if (!materialBase || !materialHeight) return `${ materialName } || ${ supplierName }`;

    return `${ materialName } (${ materialBase } x ${ materialHeight }) || ${ supplierName }`;
};

export const mapMaterialToSelectData = (material = {}) => ({
    id: material.id,
    text: buildMaterialSelectText(material),
    materialName: material.name,
    presentationName: material.presentation?.name,
    unitMeasureName: material.unitMeasure?.name,
    materialBase: material.base,
    materialHeight: material.height,
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
        presentationName: material.presentation?.name,
        unitMeasureName: material.unitMeasure?.name,
        supplierName: supplierMaterial.supplierName || supplierMaterial.supplier?.tradeName || material.supplier?.tradeName,
        materialBase: supplierMaterial.materialBase ?? material.base ?? supplierMaterial.base,
        materialHeight: supplierMaterial.materialHeight ?? material.height ?? supplierMaterial.height,
        maxUnitCost: supplierMaterial.maxUnitCost ?? material.maxUnitCost
    };
};
