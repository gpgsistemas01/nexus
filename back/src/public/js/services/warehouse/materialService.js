import { apiRequest } from "../axiosInstanceApi.js";

export const MATERIALS_API_ROUTE = '/api/warehouse/materials';

export const getAllMaterialsRequest = ({ params }) => apiRequest({
    method: 'get',
    url: MATERIALS_API_ROUTE,
    params
});

export const registerMaterialRequest = ({ data }) => apiRequest({
    method: 'post',
    url: MATERIALS_API_ROUTE,
    data
});

export const editMaterialRequest = ({ data, id }) => apiRequest({
    method: 'patch',
    url: `${ MATERIALS_API_ROUTE }/${ id }`,
    data
});

export const editMaterialStockRequest = ({ data, id }) => apiRequest({
    method: 'patch',
    url: `${ MATERIALS_API_ROUTE }/${ id }/stock`,
    data
});

export const deleteMaterialRequest = ({ id }) => apiRequest({
    method: 'delete',
    url: `${ MATERIALS_API_ROUTE }/${ id }`
});
