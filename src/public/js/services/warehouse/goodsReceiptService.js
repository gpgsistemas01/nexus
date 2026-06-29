import { apiRequest } from "../axiosInstanceApi.js";

export const GOODS_RECEIPTS_API_ROUTE = '/api/warehouse/goods-receipts';

export const getAllGoodsReceiptsRequest = ({ params }) => apiRequest({
    method: 'get',
    url: GOODS_RECEIPTS_API_ROUTE,
    params
});

export const registerGoodsReceiptRequest = ({ data }) => apiRequest({
    method: 'post',
    url: GOODS_RECEIPTS_API_ROUTE,
    data
});


export const editGoodsReceiptHeaderRequest = ({ data, id }) => apiRequest({
    method: 'patch',
    url: `${ GOODS_RECEIPTS_API_ROUTE }/${ id }`,
    data
});
