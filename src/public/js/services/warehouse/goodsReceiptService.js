import { apiRequest } from "../axiosInstanceApi.js";
import { goodsReceiptContext } from '../../pages/warehouse/goodsReceipts/goodsReceiptContext.js';

export const GOODS_RECEIPTS_API_ROUTE = `/api/warehouse/goods-receipts/${ goodsReceiptContext.resource === 'consumable' ? 'consumables' : 'materials' }`;

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


export const correctGoodsReceiptDetailRequest = ({ data, id, detailId }) => apiRequest({
    method: 'patch',
    url: `${ GOODS_RECEIPTS_API_ROUTE }/${ id }/details/${ detailId }/corrections`,
    data
});

export const cancelGoodsReceiptDetailRequest = ({ id, detailId }) => apiRequest({
    method: 'patch',
    url: `${ GOODS_RECEIPTS_API_ROUTE }/${ id }/details/${ detailId }/cancel`
});
