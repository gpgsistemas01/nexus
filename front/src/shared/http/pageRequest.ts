import { apiClient } from './apiClient.js';
import { ApiError } from './apiError.js';
import { isRecord } from '../utils/isRecord.js';

export interface PageResult<T> {
    data: T[];
    recordsFiltered: number;
    recordsTotal: number;
}

export const requestPage = async (
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
