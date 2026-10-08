import { createMaterialGoodsReceipt, findAllMaterialGoodsReceipts, updateMaterialGoodsReceipt, cancelMaterialGoodsReceiptDetailLine, correctMaterialGoodsReceiptDetailLine } from '../../../../../services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js';
import { buildListHandler, buildRegisterHandler, buildEditHandler, buildCorrectionHandler, buildCancellationHandler } from '../shared/goodsReceiptHandlers.js';

export const getAllMaterialGoodsReceipts = buildListHandler(findAllMaterialGoodsReceipts);
export const registerMaterialGoodsReceipt = buildRegisterHandler({
    createGoodsReceipt: createMaterialGoodsReceipt,
    inventoryContext: 'material'
});
export const editMaterialGoodsReceipt = buildEditHandler({
    updateGoodsReceipt: updateMaterialGoodsReceipt,
    inventoryContext: 'material'
});
export const correctMaterialGoodsReceiptDetail = buildCorrectionHandler({
    correctGoodsReceiptDetail: correctMaterialGoodsReceiptDetailLine,
    inventoryContext: 'material'
});
export const cancelMaterialGoodsReceiptDetail = buildCancellationHandler({
    cancelGoodsReceiptDetail: cancelMaterialGoodsReceiptDetailLine,
    inventoryContext: 'material'
});
