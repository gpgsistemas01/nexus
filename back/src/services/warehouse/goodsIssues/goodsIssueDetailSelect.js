import { MATERIAL_DOCUMENT_DISPLAY_SELECT } from '../materials/materialDocumentSnapshot.js';

export const GOODS_ISSUE_DETAIL_SELECT = {
    id: true,
    materialId: true,
    quantity: true,
    convertedQuantity: true,
    maxUnitCost: true,
    materialName: true,
    supplierName: true,
    materialSpecification: true,
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

export const GOODS_ISSUE_DETAIL_READ_SELECT = {
    ...GOODS_ISSUE_DETAIL_SELECT,
    material: { select: MATERIAL_DOCUMENT_DISPLAY_SELECT },
    supplier: false
};
