import { createSuccessResponseFromRequest } from "../../utils/responseUtils.js";
import { editGoodsReceiptHeaderRequest, getAllGoodsReceiptsRequest, registerGoodsReceiptRequest } from "../../services/warehouse/goodsReceiptService.js";

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
