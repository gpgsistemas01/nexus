import { errorMessages, getErrorMessage } from '@nexus/api-messages';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

export class ApiError extends Error {
    constructor(
        message: string,
        public status = 0,
        public code = '',
        public fieldErrors: Record<string, string> = {},
        public meta: Record<string, unknown> = {},
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

const knownMessage = (data: Record<string, unknown>) =>
    typeof data.code === 'string' && Object.hasOwn(errorMessages, data.code)
        ? String(getErrorMessage(data))
        : undefined;

export const createApiClient = (fetcher: typeof fetch = (...args) => fetch(...args)) => {
    let refresh: Promise<boolean> | null = null;

    const send = async (url: string, options: RequestInit) => {
        try {
            return await fetcher(url, {
                ...options,
                credentials: 'same-origin',
                headers: { Accept: 'application/json', ...options.headers },
                signal: AbortSignal.any([
                    AbortSignal.timeout(15_000),
                    ...(options.signal ? [options.signal] : []),
                ]),
            });
        } catch (error) {
            if (options.signal?.aborted) throw error;
            throw new ApiError('No fue posible conectar. Revisa tu conexión e inténtalo de nuevo.');
        }
    };

    const request = async <T>(
        url: string,
        options: RequestInit = {},
        asBlob = false,
    ): Promise<T> => {
        let response = await send(url, options);
        if (response.status === 401) {
            // Una sola renovación para las consultas simultáneas. No se reintentan errores de red ni 5xx.
            refresh ??= send('/api/auth/refresh', { method: 'POST' })
                .then((result) => result.ok)
                .finally(() => {
                    refresh = null;
                });
            if (await refresh) response = await send(url, options);
        }
        if (response.ok && asBlob) {
            if (
                !response.headers
                    .get('content-type')
                    ?.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            ) {
                throw new ApiError('El servidor no devolvió un archivo Excel válido.');
            }
            return (await response.blob()) as T;
        }
        let data: unknown;
        try {
            data = await response.json();
        } catch {
            data = null;
        }
        if (!response.ok) {
            const body = isRecord(data) ? data : {};
            const fields: Record<string, string> = {};
            if (isRecord(body.errors)) {
                for (const [field, detail] of Object.entries(body.errors)) {
                    if (isRecord(detail))
                        fields[field] = knownMessage(detail) ?? 'Revisa este campo.';
                }
            }
            const fallback =
                response.status === 401
                    ? 'Tu sesión terminó. Vuelve a iniciar sesión.'
                    : response.status === 403
                      ? 'No tienes permiso para realizar esta operación.'
                      : response.status === 429
                        ? 'Demasiadas solicitudes. Espera antes de reintentar.'
                        : 'No se pudo completar la operación. Inténtalo de nuevo.';
            throw new ApiError(
                knownMessage(body) ?? fallback,
                response.status,
                typeof body.code === 'string' ? body.code : '',
                fields,
                isRecord(body.meta) ? body.meta : {},
            );
        }
        if (!isRecord(data)) throw new ApiError('El servidor devolvió una respuesta inesperada.');
        return data as T;
    };
    return { request };
};

export const apiClient = createApiClient();
