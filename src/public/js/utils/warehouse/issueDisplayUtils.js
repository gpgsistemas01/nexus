export const formatIssueItemDimensions = item => (
    item.base == null || item.height == null
        ? 'Sin dimensiones'
        : `${ item.base } × ${ item.height }`
);

const resolveCatalogDisplay = ({ detail, item, supplier, materialId }) => ({
    ...detail,
    materialId,
    materialName: detail.materialName ?? item?.name ?? '',
    supplierName: detail.supplierName ?? supplier?.tradeName ?? '',
    materialBase: detail.materialBase ?? detail.base ?? item?.base ?? null,
    materialHeight: detail.materialHeight ?? detail.height ?? item?.height ?? null,
    presentationId: detail.presentationId ?? item?.presentation?.id ?? null,
    unitMeasureId: detail.unitMeasureId ?? item?.unitMeasure?.id ?? null,
    presentationName: detail.presentationName ?? item?.presentation?.name ?? '',
    unitMeasureName: detail.unitMeasureName ?? item?.unitMeasure?.name ?? '',
    unitMeasureSymbol: detail.unitMeasureSymbol ?? item?.unitMeasure?.symbol ?? ''
});

export const mapWasteIssueDetailDisplay = detail => {
    const supplierMaterial = detail.waste?.supplierMaterial;

    return {
        ...resolveCatalogDisplay({
            detail,
            item: supplierMaterial?.material,
            supplier: supplierMaterial?.supplier,
            materialId: detail.wasteId
        }),
        maxUnitCost: detail.maxUnitCost ?? supplierMaterial?.maxUnitCost ?? null
    };
};

export const mapGoodsIssueDetailDisplay = detail => resolveCatalogDisplay({
    detail,
    item: detail.material,
    supplier: detail.supplier,
    materialId: detail.materialId
});

export const formatWasteSelectOption = waste => [
    waste.materialName,
    waste.supplier?.tradeName,
    formatIssueItemDimensions(waste),
    waste.presentation?.name || 'Sin presentación',
    `Stock: ${ waste.currentStock } ${ waste.unitMeasure?.symbol || '' }`
].join(' · ');
