import { editMaterialGoodsReceiptHeaderRequest, getAllMaterialGoodsReceiptsRequest, registerMaterialGoodsReceiptRequest, correctMaterialGoodsReceiptDetailRequest, cancelMaterialGoodsReceiptDetailRequest } from '../../../../services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js';
import { createCrudApplication } from '../../../createCrudApplication.js';

const goodsReceiptApplication = createCrudApplication({
    requests: {
        getAll: getAllMaterialGoodsReceiptsRequest,
        register: registerMaterialGoodsReceiptRequest,
        edit: editMaterialGoodsReceiptHeaderRequest,
        correctDetail: correctMaterialGoodsReceiptDetailRequest,
        cancelDetail: cancelMaterialGoodsReceiptDetailRequest
    },
    dataKeys: {
        correctDetail: 'correction',
        cancelDetail: 'correction'
    },
    additionalMutations: ['correctDetail', 'cancelDetail']
});

export const getAllMaterialGoodsReceipts = goodsReceiptApplication.getAll;
export const registerMaterialGoodsReceipt = goodsReceiptApplication.register;
export const editMaterialGoodsReceiptHeader = goodsReceiptApplication.edit;
export const correctMaterialGoodsReceiptDetail = goodsReceiptApplication.correctDetail;
export const cancelMaterialGoodsReceiptDetail = goodsReceiptApplication.cancelDetail;
