import { apiRequest } from '../axiosInstanceApi.js';

export const CONSUMABLES_API_ROUTE = '/api/warehouse/consumables';

export const getAllConsumablesRequest = ({ params }) => apiRequest({
    method: 'get',
    url: CONSUMABLES_API_ROUTE,
    params
});

export const registerConsumableRequest = ({ data }) => apiRequest({
    method: 'post',
    url: CONSUMABLES_API_ROUTE,
    data
});

export const editConsumableRequest = ({ data, id }) => apiRequest({
    method: 'patch',
    url: `${ CONSUMABLES_API_ROUTE }/${ id }`,
    data
});

export const editConsumableStockRequest = ({ data, id }) => apiRequest({
    method: 'patch',
    url: `${ CONSUMABLES_API_ROUTE }/${ id }/stock`,
    data
});

export const deleteConsumableRequest = ({ id }) => apiRequest({
    method: 'delete',
    url: `${ CONSUMABLES_API_ROUTE }/${ id }`
});
