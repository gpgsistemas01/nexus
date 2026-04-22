import { apiRequest } from "../axiosInstanceApi.js";

export const SUPPLIERS_API_ROUTE = '/api/warehouse/suppliers';

export const registerSupplierRequest = (data) => apiRequest({
    method: 'post',
    url: `${ SUPPLIERS_API_ROUTE }`,
    data
});

export const editSupplierRequest = (data, id) => apiRequest({
    method: 'put',
    url: `${ SUPPLIERS_API_ROUTE }/${ id }`,
    data
});