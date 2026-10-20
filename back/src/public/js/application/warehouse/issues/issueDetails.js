import {
    buildInventorySelectText,
    getBase,
    getHeight,
    getPresentation,
    getPresentationId,
    getUnitMeasure,
    getMaxUnitCost
} from '../../../utils/warehouseInventoryUtils.js';

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
