import { findAllCatalogEntries } from '../catalogAdministrationService.js';

export const findAllStatuses = options => findAllCatalogEntries({
    catalog: 'statuses',
    ...options
});
