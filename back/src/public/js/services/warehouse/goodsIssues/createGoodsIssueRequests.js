import { apiRequest } from '../../axiosInstanceApi.js';

export const createGoodsIssueRequests = ({ apiRoute, reportRoute }) => {
    const getAllGoodsIssuesRequest = ({ params }) => apiRequest({
        method: 'get',
        url: apiRoute,
        params
    });

    const registerGoodsIssueRequest = ({ data }) => apiRequest({
        method: 'post',
        url: apiRoute,
        data
    });

    const editGoodsIssueRequest = ({ data, id }) => apiRequest({
        method: 'patch',
        url: `${ apiRoute }/${ id }`,
        data
    });

    const editGoodsIssueHeaderRequest = ({ data, id }) => apiRequest({
        method: 'patch',
        url: `${ apiRoute }/${ id }/header`,
        data
    });

    const editGoodsIssueDetailsRequest = ({ data, id }) => apiRequest({
        method: 'patch',
        url: `${ apiRoute }/${ id }/details`,
        data
    });

    const returnGoodsIssueDetailRequest = ({ data, id, detailId }) => apiRequest({
        method: 'patch',
        url: `${ apiRoute }/${ id }/details/${ detailId }/returns`,
        data
    });

    const exportReportRequest = (params = {}) => apiRequest({ method: 'get', url: reportRoute, responseType: 'blob', params });

    return { getAllGoodsIssuesRequest, registerGoodsIssueRequest, editGoodsIssueRequest, editGoodsIssueHeaderRequest, editGoodsIssueDetailsRequest, returnGoodsIssueDetailRequest, exportReportRequest };
};
