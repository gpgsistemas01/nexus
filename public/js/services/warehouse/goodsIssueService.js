import { apiRequest } from "../axiosInstanceApi.js";

export const GOODS_ISSUES_API_ROUTE = '/api/warehouse/goods-issues';

export const registerGoodsIssueRequest = (data) => apiRequest({
    method: 'post',
    url: `${ GOODS_ISSUES_API_ROUTE }`,
    data
});

export const editGoodsIssueDetailsRequest = (data, id) => apiRequest({
    method: 'patch',
    url: `${ GOODS_ISSUES_API_ROUTE }/${ id }/details`,
    data
});

export const cancelGoodsIssueRequest = (id) => apiRequest({
    method: 'patch',
    url: `${ GOODS_ISSUES_API_ROUTE }/${ id }/cancel`
});

export const confirmGoodsIssueRequest = (id) => apiRequest({
    method: 'patch',
    url: `${ GOODS_ISSUES_API_ROUTE }/${ id }/confirm`
});

export const rejectGoodsIssueRequest = (id) => apiRequest({
    method: 'patch',
    url: `${ GOODS_ISSUES_API_ROUTE }/${ id }/reject`
});

export const approveGoodsIssueRequest = (id) => apiRequest({
    method: 'patch',
    url: `${ GOODS_ISSUES_API_ROUTE }/${ id }/approve`
});