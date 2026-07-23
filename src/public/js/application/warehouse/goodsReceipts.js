import { createSuccessResponseFromRequest } from "../../utils/responseUtils.js";
import { editGoodsReceiptHeaderRequest, getAllGoodsReceiptsRequest, registerGoodsReceiptRequest, correctGoodsReceiptDetailRequest, cancelGoodsReceiptDetailRequest } from "../../services/warehouse/goodsReceiptService.js";

export const getAllGoodsReceipts = async (params = {}) => {

    const response = await getAllGoodsReceiptsRequest({ params });

    return response;
};

export const registerGoodsReceipt = async ({ formData }) => {

    const response = await registerGoodsReceiptRequest({ data: formData });

    return createSuccessResponseFromRequest({ response });
}


export const editGoodsReceiptHeader = async ({ formData, id }) => {

    const response = await editGoodsReceiptHeaderRequest({ data: formData, id });

    return createSuccessResponseFromRequest({ response });
};


export const correctGoodsReceiptDetail = async ({ formData, id, detailId }) => {

    const response = await correctGoodsReceiptDetailRequest({ data: formData, id, detailId });

    return createSuccessResponseFromRequest({
        response,
        dataKey: 'correction'
    });
};

export const cancelGoodsReceiptDetail = async ({ id, detailId }) => {

    const response = await cancelGoodsReceiptDetailRequest({ id, detailId });

    return createSuccessResponseFromRequest({
        response,
        dataKey: 'correction'
    });
};
