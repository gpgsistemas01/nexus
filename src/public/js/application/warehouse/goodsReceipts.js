import { editGoodsReceiptHeaderRequest, getAllGoodsReceiptsRequest, registerGoodsReceiptRequest, correctGoodsReceiptDetailRequest, cancelGoodsReceiptDetailRequest } from "../../services/warehouse/goodsReceiptService.js";
import { createCrudApplication } from '../createCrudApplication.js';

const goodsReceiptApplication = createCrudApplication({
    requests: {
        getAll: getAllGoodsReceiptsRequest,
        register: registerGoodsReceiptRequest,
        edit: editGoodsReceiptHeaderRequest,
        correctDetail: correctGoodsReceiptDetailRequest,
        cancelDetail: cancelGoodsReceiptDetailRequest
    },
    dataKeys: {
        correctDetail: 'correction',
        cancelDetail: 'correction'
    },
    additionalMutations: ['correctDetail', 'cancelDetail']
});

export const getAllGoodsReceipts = goodsReceiptApplication.getAll;
export const registerGoodsReceipt = goodsReceiptApplication.register;
export const editGoodsReceiptHeader = goodsReceiptApplication.edit;
export const correctGoodsReceiptDetail = goodsReceiptApplication.correctDetail;
export const cancelGoodsReceiptDetail = goodsReceiptApplication.cancelDetail;
