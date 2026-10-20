import { apiRequest } from '../axiosInstanceApi.js';

const API_ROUTE = '/api/admin/catalogs';

export const getCatalogEntriesRequest = ({ params }) => apiRequest({
    method: 'get',
    url: `${ API_ROUTE }/${ params.catalog }`
});

export const createCatalogEntryRequest = ({ catalog, data }) => apiRequest({
    method: 'post',
    url: `${ API_ROUTE }/${ catalog }`,
    data
});

export const editCatalogEntryRequest = ({ catalog, data, id }) => apiRequest({
    method: 'put',
    url: `${ API_ROUTE }/${ catalog }/${ id }`,
    data
});
