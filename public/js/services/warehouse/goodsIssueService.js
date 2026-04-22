import { apiRequest } from "../axiosInstanceApi.js";

export const GOODS_RECEIPTS_API_ROUTE = '/api/warehouse/goods-issues';

export const registerGoodsIssueRequest = (data) => apiRequest({
    method: 'post',
    url: `${ GOODS_RECEIPTS_API_ROUTE }`,
    data
});

export const editGoodsIssueRequest = (data, id) => apiRequest({
    method: 'put',
    url: `${ GOODS_RECEIPTS_API_ROUTE }/${ id }`,
    data
});

export const cancelGoodsIssueRequest = (id) => apiRequest({
    method: 'patch',
    url: `${ GOODS_RECEIPTS_API_ROUTE }/${ id }/cancel`
});

export const confirmGoodsIssueRequest = (id) => apiRequest({
    method: 'patch',
    url: `${ GOODS_RECEIPTS_API_ROUTE }/${ id }/confirm`
});

export const rejectGoodsIssueRequest = (id) => apiRequest({
    method: 'patch',
    url: `${ GOODS_RECEIPTS_API_ROUTE }/${ id }/reject`
});

export const approveGoodsIssueRequest = (id) => apiRequest({
    method: 'patch',
    url: `${ GOODS_RECEIPTS_API_ROUTE }/${ id }/approve`
});