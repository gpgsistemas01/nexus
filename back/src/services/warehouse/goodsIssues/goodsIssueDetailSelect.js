export const GOODS_ISSUE_DETAIL_SELECT = {
    id: true,
    materialId: true,
    quantity: true,
    convertedQuantity: true,
    maxUnitCost: true,
    materialName: true,
    projectConvertedQuantity: true,
    convertedQuantityDifference: true,
    suppliedQuantity: true,
    returnedQuantity: true,
    isSupplied: true,
    fulfillmentStatus: true,
    supplierId: true,
    material: {
        include: { presentation: true, unitMeasure: true }
    },
    supplier: true
};
