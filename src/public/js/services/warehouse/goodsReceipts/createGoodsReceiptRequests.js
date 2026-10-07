import { apiRequest } from '../../axiosInstanceApi.js';

export const createGoodsReceiptRequests = ({ apiRoute, reportRoute }) => {
    const getAllGoodsReceiptsRequest = ({ params }) => apiRequest({
        method: 'get',
        url: apiRoute,
        params
    });

    const registerGoodsReceiptRequest = ({ data }) => apiRequest({
        method: 'post',
        url: apiRoute,
        data
    });


    const editGoodsReceiptHeaderRequest = ({ data, id }) => apiRequest({
        method: 'patch',
        url: `${ apiRoute }/${ id }`,
        data
    });


    const correctGoodsReceiptDetailRequest = ({ data, id, detailId }) => apiRequest({
        method: 'patch',
        url: `${ apiRoute }/${ id }/details/${ detailId }/corrections`,
        data
    });

    const cancelGoodsReceiptDetailRequest = ({ id, detailId }) => apiRequest({
        method: 'patch',
        url: `${ apiRoute }/${ id }/details/${ detailId }/cancel`
    });

    const exportReportRequest = (params = {}) => apiRequest({ method: 'get', url: reportRoute, responseType: 'blob', params });
    return { getAllGoodsReceiptsRequest, registerGoodsReceiptRequest, editGoodsReceiptHeaderRequest, correctGoodsReceiptDetailRequest, cancelGoodsReceiptDetailRequest, exportReportRequest };
};
