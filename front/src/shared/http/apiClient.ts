import axios, { CanceledError } from 'axios';
import type { AxiosAdapter, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { ApiError, normalizeApiError } from './apiError.js';
import { isRecord } from '../utils/isRecord.js';

export interface ApiRequestConfig extends AxiosRequestConfig {
    requiresAuth?: boolean;
}
interface RetriableRequest extends InternalAxiosRequestConfig {
    requiresAuth?: boolean;
    hasRetried?: boolean;
}

export const createApiClient = (adapter?: AxiosAdapter) => {
    const http = axios.create({
        timeout: 15_000,
        headers: { Accept: 'application/json' },
        ...(adapter ? { adapter } : {}),
    });
    let refresh: Promise<unknown> | null = null;
    http.interceptors.response.use(
        (response) => response,
        async (cause: unknown) => {
            if (!axios.isAxiosError(cause)) throw cause;

            const original = cause.config as RetriableRequest | undefined;
            if (
                cause.response?.status !== 401 ||
                !original ||
                original.requiresAuth === false ||
                original.hasRetried
            )
                throw cause;

            original.hasRetried = true;
            refresh ??= http
                .post('/api/auth/refresh', {}, { requiresAuth: false } as ApiRequestConfig)
                .finally(() => {
                    refresh = null;
                });
            await refresh;
            if (original.signal?.aborted) throw new CanceledError();

            return http.request(original);
        },
    );

    const request = async <T>(url: string, options: ApiRequestConfig = {}): Promise<T> => {
        try {
            const response = await http.request({ ...options, url });
            if (options.responseType === 'blob') return response.data as T;

            if (!isRecord(response.data))
                throw new ApiError(
                    'El servidor devolvió una respuesta inesperada.',
                    response.status,
                    'INVALID_RESPONSE',
                );

            return response.data as T;
        } catch (cause) {
            if (axios.isCancel(cause)) throw cause;

            throw await normalizeApiError(cause);
        }
    };

    return { request, http };
};

// Cookies del mismo origen: el navegador las administra, sin tokens en almacenamiento.
export const apiClient = createApiClient();
