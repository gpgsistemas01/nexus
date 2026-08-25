export const getBase = (item = {}) => (
    item.base ?? item.material?.base ?? item.supplierMaterial?.material?.base ?? null
);
export const getHeight = (item = {}) => (
    item.height ?? item.material?.height ?? item.supplierMaterial?.material?.height ?? null
);
export const getPresentation = (item = {}) => (
    (typeof item.presentation === 'string' ? item.presentation : item.presentation?.name)
    ?? item.material?.presentation?.name
    ?? item.supplierMaterial?.material?.presentation?.name
    ?? ''
);
export const getPresentationId = (item = {}) => (
    item.presentationId
    ?? item.presentation?.id
    ?? item.material?.presentation?.id
    ?? item.supplierMaterial?.material?.presentation?.id
    ?? null
);
export const getUnitMeasure = (item = {}) => (
    (typeof item.unitMeasure === 'string' ? item.unitMeasure : item.unitMeasure?.symbol ?? item.unitMeasure?.name)
    ?? item.material?.unitMeasure?.symbol
    ?? item.supplierMaterial?.material?.unitMeasure?.symbol
    ?? ''
);
export const getUnitMeasureId = (item = {}) => (
    item.unitMeasureId
    ?? item.unitMeasure?.id
    ?? item.material?.unitMeasure?.id
    ?? item.supplierMaterial?.material?.unitMeasure?.id
    ?? null
);
export const getMaxUnitCost = (item) => item.maxUnitCost ?? item.supplierMaterial?.maxUnitCost;
export const getCurrentStock = (item) => item.currentStock ?? item.supplierMaterial?.currentStock;
export const getMinStock = (item) => item.minStock ?? item.supplierMaterial?.minStock;
export const getMaterialName = (item = {}) => (
    item.material?.name
    ?? item.supplierMaterial?.material?.name
    ?? item.materialName
    ?? item.name
    ?? ''
);
export const getSupplierName = (item = {}) => {
    const supplier = item.supplier ?? item.supplierMaterial?.supplier;

    if (typeof supplier === 'string') return supplier;

    return supplier?.tradeName ?? supplier?.name ?? '';
};

export const buildInventorySelectText = (item = {}) => {

    const supplierName = getSupplierName(item);
    const name = getMaterialName(item);
    const base = getBase(item);
    const height = getHeight(item);
    const dimensions = base == null || height == null
        ? 'Sin medidas'
        : `${ base } × ${ height }`;
    const itemIdentity = `${ name } (${ dimensions })`;

    return supplierName
        ? `${ itemIdentity } · ${ supplierName }`
        : itemIdentity;
};

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
    text: buildInventorySelectText(material)
});

const mapIssueQuantities = (detail = {}) => ({
    quantity: detail.quantity,
    convertedQuantity: detail.convertedQuantity,
    suppliedQuantity: detail.suppliedQuantity,
    returnedQuantity: detail.returnedQuantity,
    projectConvertedQuantity: detail.projectConvertedQuantity,
    convertedQuantityDifference: detail.convertedQuantityDifference,
    isSupplied: Boolean(detail.isSupplied),
    originalIsSupplied: Boolean(detail.isSupplied),
    fulfillmentStatus: detail.fulfillmentStatus
});

/**
 * Builds the editable row used by the issue table without modifying the API
 * response. The document-detail id and inventory-item id deliberately remain
 * separate because fulfillment updates address the former while CRUD updates
 * send the latter.
 */
export const mapIssueDetailToTable = (detail = {}) => {
    const wasteId = detail.wasteId ?? detail.waste?.id;
    const materialId = detail.materialId ?? detail.material?.id;
    const isWasteDetail = wasteId !== undefined && wasteId !== null;
    const hasMaterialId = materialId !== undefined && materialId !== null;
    const inventoryItem = isWasteDetail ? (detail.waste || detail) : detail;

    return {
        id: detail.id,
        ...(isWasteDetail
            ? { wasteId }
            : hasMaterialId ? {
                materialId,
                supplierId: detail.supplierId ?? detail.supplier?.id,
                presentationId: getPresentationId(detail)
            } : {}),
        name: buildInventorySelectText(inventoryItem),
        base: getBase(inventoryItem),
        height: getHeight(inventoryItem),
        presentation: getPresentation(inventoryItem),
        unitMeasure: getUnitMeasure(inventoryItem),
        maxUnitCost: getMaxUnitCost(detail) ?? getMaxUnitCost(inventoryItem),
        ...mapIssueQuantities(detail)
    };
};

export const mapGoodsIssueDetailsToRequest = (details = []) => details.map(detail => ({
    materialId: detail.materialId,
    supplierId: detail.supplierId,
    quantity: detail.quantity,
    ...(detail.presentationId ? { presentationId: detail.presentationId } : {})
}));

export const mapIssueDetailsToSupplyRequest = (details = []) => details.reduce((payload, detail) => {
    if (detail.isSupplied && !detail.originalIsSupplied) {
        payload.push({
            id: detail.id,
            isSupplied: detail.isSupplied,
            projectConvertedQuantity: detail.projectConvertedQuantity
        });
    }

    return payload;
}, []);
