import { apiRequest } from '../axiosInstanceApi.js';

const ROUTE = '/api/warehouse/waste-issues';

export const getAllWasteIssuesRequest = ({ params }) => apiRequest({
    method: 'get',
    url: ROUTE,
    params
});

export const registerWasteIssueRequest = ({ data }) => apiRequest({
    method: 'post',
    url: ROUTE,
    data
});

export const editWasteIssueRequest = ({ id, data }) => apiRequest({
    method: 'patch',
    url: `${ ROUTE }/${ id }`,
    data
});

export const editWasteIssueHeaderRequest = ({ id, data }) => apiRequest({
    method: 'patch',
    url: `${ ROUTE }/${ id }/header`,
    data
});

export const editWasteIssueDetailsRequest = ({ id, data }) => apiRequest({
    method: 'patch',
    url: `${ ROUTE }/${ id }/details`,
    data
});

export const returnWasteIssueDetailRequest = ({ id, detailId, data }) => apiRequest({
    method: 'patch',
    url: `${ ROUTE }/${ id }/details/${ detailId }/returns`,
    data
});
