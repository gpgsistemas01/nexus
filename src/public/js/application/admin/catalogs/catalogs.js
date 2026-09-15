import {
    createCatalogEntryRequest,
    editCatalogEntryRequest,
    getCatalogEntriesRequest
} from '../../../services/admin/catalogService.js';
import { createCrudApplication } from '../../createCrudApplication.js';

const catalogApplication = createCrudApplication({
    requests: {
        getAll: getCatalogEntriesRequest,
        register: createCatalogEntryRequest,
        edit: editCatalogEntryRequest
    },
    dataKey: 'data'
});

export const getCatalogEntries = catalogApplication.getAll;
export const registerCatalogEntry = catalogApplication.register;
export const editCatalogEntry = catalogApplication.edit;
