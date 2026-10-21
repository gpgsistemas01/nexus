import { apiClient } from '../../../shared/http/apiClient.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { isRecord } from '../../../shared/utils/isRecord.js';
import type { InventoryQuery, PageResult } from '../inventory.js';

export const inventoryParams = (query: Partial<InventoryQuery>) =>
    new URLSearchParams({
        start: String(((query.page ?? 1) - 1) * (query.length ?? 10)),
        length: String(query.length ?? 10),
        search: query.search ?? '',
        supplierId: query.supplierId ?? '',
        'order[0][column]': String(query.orderColumn ?? 0),
        'order[0][dir]': query.direction ?? 'asc',
    });

export const requestInventoryPage = async (
    url: string,
    signal?: AbortSignal,
): Promise<PageResult<Record<string, unknown>>> => {
    const page = await apiClient.request<PageResult<unknown>>(url, { signal });
    if (
        !Array.isArray(page.data) ||
        !page.data.every(isRecord) ||
        !Number.isFinite(page.recordsFiltered) ||
        !Number.isFinite(page.recordsTotal)
    ) {
        throw new ApiError('El servidor devolvió un listado inesperado.');
    }
    return page as PageResult<Record<string, unknown>>;
};
