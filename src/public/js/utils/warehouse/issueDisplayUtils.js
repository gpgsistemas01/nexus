import { buildInventorySelectText } from '../materialSelectUtils.js';

const resolveCatalogDisplay = ({ detail, item, supplier, materialId }) => ({
    ...detail,
    materialId,
    materialName: detail.materialName ?? item?.name ?? '',
    supplierName: detail.supplierName ?? supplier?.tradeName ?? '',
    base: detail.materialBase ?? detail.base ?? item?.base ?? null,
    height: detail.materialHeight ?? detail.height ?? item?.height ?? null,
    presentationId: detail.presentationId ?? item?.presentation?.id ?? null,
    unitMeasureId: detail.unitMeasureId ?? item?.unitMeasure?.id ?? null,
    presentation: detail.presentationName ?? item?.presentation?.name ?? '',
    unitMeasure: detail.unitMeasureSymbol ?? item?.unitMeasure?.symbol ?? ''
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