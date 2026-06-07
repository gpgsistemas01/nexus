import { apiRequest } from "../axiosInstanceApi.js";

export const WASTES_API_ROUTE = '/api/warehouse/wastes';

export const getAllWastesRequest = ({ params }) => apiRequest({
    method: 'get',
    url: WASTES_API_ROUTE,
    params
});

export const registerWasteRequest = ({ data }) => apiRequest({
    method: 'post',
    url: WASTES_API_ROUTE,
    data
});
