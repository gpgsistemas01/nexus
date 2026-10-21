import axios from 'axios';
import { errorMessages, getErrorMessage } from '@nexus/api-messages';
import { isRecord } from '../utils/isRecord.js';

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

export const normalizeApiError = async (cause: unknown): Promise<ApiError> => {
    if (cause instanceof ApiError) return cause;
    if (!axios.isAxiosError(cause) || !cause.response) {
        return new ApiError(
            'No fue posible conectar. Revisa tu conexión e inténtalo de nuevo.',
            0,
            'NETWORK_ERROR',
        );
    }
    const status = cause.response.status;
    let data: unknown = cause.response.data;
    if (data instanceof Blob) {
        try {
            data = JSON.parse(await data.text());
        } catch {
            data = null;
        }
    }
    const body = isRecord(data) ? data : {};
    const fields: Record<string, string> = {};
    if (isRecord(body.errors)) {
        for (const [field, detail] of Object.entries(body.errors)) {
            if (!isRecord(detail)) continue;
            const message = knownMessage(detail);
            if (message) fields[field] = message;
        }
    }
    const fallback =
        status === 401
            ? 'Tu sesión terminó. Vuelve a iniciar sesión.'
            : status === 403
              ? 'No tienes permiso para realizar esta operación.'
              : status === 429
                ? 'Demasiadas solicitudes. Espera antes de reintentar.'
                : 'No se pudo completar la operación. Inténtalo de nuevo.';
    return new ApiError(
        knownMessage(body) ?? fallback,
        status,
        typeof body.code === 'string' ? body.code : '',
        fields,
        isRecord(body.meta) ? body.meta : {},
    );
};
