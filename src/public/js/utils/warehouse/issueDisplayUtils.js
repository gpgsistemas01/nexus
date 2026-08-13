export const formatIssueItemDimensions = item => (
    item.base == null || item.height == null
        ? 'Sin dimensiones'
        : `${ item.base } × ${ item.height }`
);

const resolveCatalogDisplay = ({ detail, item, supplier }) => ({
    ...detail,
    supplierName: detail.supplierName ?? supplier?.tradeName ?? '',
    base: detail.base ?? detail.materialBase ?? item?.base ?? null,
    height: detail.height ?? detail.materialHeight ?? item?.height ?? null,
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
            supplier: supplierMaterial?.supplier
        }),
        maxUnitCost: detail.maxUnitCost ?? supplierMaterial?.maxUnitCost ?? null
    };
};

export const mapGoodsIssueDetailDisplay = detail => resolveCatalogDisplay({
    detail,
    item: detail.material,
    supplier: detail.supplier
});

export const formatWasteSelectOption = waste => [
    waste.materialName,
    waste.supplier?.tradeName,
    formatIssueItemDimensions(waste),
    waste.presentation?.name || 'Sin presentación',
    `Stock: ${ waste.currentStock } ${ waste.unitMeasure?.symbol || '' }`
].join(' · ');
