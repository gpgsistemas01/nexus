import { editConsumableGoodsReceiptHeaderRequest, getAllConsumableGoodsReceiptsRequest, registerConsumableGoodsReceiptRequest, correctConsumableGoodsReceiptDetailRequest, cancelConsumableGoodsReceiptDetailRequest } from '../../../../services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js';
import { createCrudApplication } from '../../../createCrudApplication.js';

const goodsReceiptApplication = createCrudApplication({
    requests: {
        getAll: getAllConsumableGoodsReceiptsRequest,
        register: registerConsumableGoodsReceiptRequest,
        edit: editConsumableGoodsReceiptHeaderRequest,
        correctDetail: correctConsumableGoodsReceiptDetailRequest,
        cancelDetail: cancelConsumableGoodsReceiptDetailRequest
    },
    dataKeys: {
        correctDetail: 'correction',
        cancelDetail: 'correction'
    },
    additionalMutations: ['correctDetail', 'cancelDetail']
});

export const getAllConsumableGoodsReceipts = goodsReceiptApplication.getAll;
export const registerConsumableGoodsReceipt = goodsReceiptApplication.register;
export const editConsumableGoodsReceiptHeader = goodsReceiptApplication.edit;
export const correctConsumableGoodsReceiptDetail = goodsReceiptApplication.correctDetail;
export const cancelConsumableGoodsReceiptDetail = goodsReceiptApplication.cancelDetail;
