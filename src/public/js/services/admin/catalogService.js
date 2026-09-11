import { apiRequest } from '../axiosInstanceApi.js';

export const getCatalogEntriesRequest = ({ route, params }) => apiRequest({ method: 'get', url: route, params });
export const createCatalogEntryRequest = ({ route, data }) => apiRequest({ method: 'post', url: route, data });
export const updateCatalogEntryRequest = ({ route, id, data }) => apiRequest({ method: 'put', url: `${ route }/${ id }`, data });
export const deleteCatalogEntryRequest = ({ route, id }) => apiRequest({ method: 'delete', url: `${ route }/${ id }` });
