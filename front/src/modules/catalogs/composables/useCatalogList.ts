import { ApiError } from '../../../shared/http/apiError.js';
import { usePagedList } from '../../../shared/composables/usePagedList.js';
import { catalogService } from '../services/catalogService.js';
import type { CatalogEntry, CatalogName, CatalogQuery } from '../catalog.js';

export const useCatalogList = (catalog: CatalogName, onDenied: (status: number) => void) =>
    usePagedList<CatalogQuery, CatalogEntry>({
        initialQuery: { page: 1, length: 10, search: '' },
        request: (query, signal) => catalogService.list(catalog, query, signal),
        errorMessage: 'No se pudo cargar el catálogo.',
        onError: (cause) => {
            if (cause instanceof ApiError && [401, 403].includes(cause.status)) {
                onDenied(cause.status);
            }
        },
    });
