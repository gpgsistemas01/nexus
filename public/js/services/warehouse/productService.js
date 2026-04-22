import { apiRequest } from "../axiosInstanceApi.js";

export const PRODUCTS_API_ROUTE = '/api/warehouse/products';

export const registerProductRequest = (data) => apiRequest({
    method: 'post',
    url: `${ PRODUCTS_API_ROUTE }`,
    data
});

export const editProductRequest = (data, id) => apiRequest({
    method: 'put',
    url: `${ PRODUCTS_API_ROUTE }/${ id }`,
    data
});