import { createConsumableGoodsReceipt, findAllConsumableGoodsReceipts, updateConsumableGoodsReceipt, cancelConsumableGoodsReceiptDetailLine, correctConsumableGoodsReceiptDetailLine } from '../../../../../services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js';
import { buildReadHandler, buildListHandler, buildRegisterHandler, buildEditHandler, buildCorrectionHandler, buildCancellationHandler } from '../shared/goodsReceiptHandlers.js';

export const getConsumableGoodsReceipt = buildReadHandler(findAllConsumableGoodsReceipts);
export const getAllConsumableGoodsReceipts = buildListHandler(findAllConsumableGoodsReceipts);
export const registerConsumableGoodsReceipt = buildRegisterHandler({
    createGoodsReceipt: createConsumableGoodsReceipt,
    inventoryContext: 'consumable'
});
export const editConsumableGoodsReceipt = buildEditHandler({
    updateGoodsReceipt: updateConsumableGoodsReceipt,
    inventoryContext: 'consumable'
});
export const correctConsumableGoodsReceiptDetail = buildCorrectionHandler({
    correctGoodsReceiptDetail: correctConsumableGoodsReceiptDetailLine,
    inventoryContext: 'consumable'
});
export const cancelConsumableGoodsReceiptDetail = buildCancellationHandler({
    cancelGoodsReceiptDetail: cancelConsumableGoodsReceiptDetailLine,
    inventoryContext: 'consumable'
});
