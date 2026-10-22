import { apiClient } from '../../../shared/http/apiClient.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { requestPage } from '../../../shared/http/pageRequest.js';
import { isRecord } from '../../../shared/utils/isRecord.js';
import type { CatalogEntry, CatalogName, CatalogQuery, CatalogTarget } from '../catalog.js';

const normalizeEntry = (value: unknown, catalog: CatalogName): CatalogEntry => {
    if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        !value.id ||
        typeof value.name !== 'string' ||
        typeof value.isActive !== 'boolean' ||
        !Number.isInteger(value.version) ||
        Number(value.version) < 0 ||
        (catalog === 'unit-measures' && typeof value.symbol !== 'string')
    )
        throw new ApiError('El servidor devolvió un registro de catálogo incompleto.');
    // La clave estable interna nunca forma parte de la captura ni de la vista.
    return {
        id: value.id,
        name: value.name,
        symbol: typeof value.symbol === 'string' ? value.symbol : '',
        isActive: value.isActive,
        version: Number(value.version),
    };
};
export const catalogService = {
    async list(catalog: CatalogName, query: CatalogQuery, signal?: AbortSignal) {
        const params = new URLSearchParams({
            start: String((query.page - 1) * query.length),
            length: String(query.length),
            search: query.search,
        });
        const result = await requestPage(`/api/admin/catalogs/${catalog}?${params}`, signal);
        return { ...result, data: result.data.map((value) => normalizeEntry(value, catalog)) };
    },
    async save(
        catalog: CatalogName,
        target: CatalogTarget,
        payload: Record<string, unknown>,
        signal?: AbortSignal,
    ) {
        const result = await apiClient.request<{ code: string; data: unknown }>(
            `/api/admin/catalogs/${catalog}${target.action === 'edit' ? `/${encodeURIComponent(target.row.id)}` : ''}`,
            {
                method: target.action === 'edit' ? 'PUT' : 'POST',
                data: payload,
                signal,
            },
        );
        const expected =
            target.action === 'edit' ? 'UPDATED_CATALOG_ENTRY' : 'CREATED_CATALOG_ENTRY';
        if (result.code !== expected)
            throw new ApiError(
                'No se pudo confirmar la operación. Actualiza el catálogo antes de reintentar.',
            );
        return normalizeEntry(result.data, catalog);
    },
};
