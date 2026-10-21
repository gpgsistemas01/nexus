import { errorMessages, getErrorMessage } from '@nexus/api-messages';
import { LOGIN_MESSAGES } from '../loginMessages.js';
import type { LoginCredentials, LoginFieldErrors } from '../login.js';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const getFieldErrorMessage = (value: unknown): string | undefined => {
    if (!isRecord(value) || typeof value.code !== 'string' || !Object.hasOwn(errorMessages, value.code)) return;

    const message = getErrorMessage({ code: value.code });

    return typeof message === 'string' ? message : undefined;
};

export class LoginRequestError extends Error {
    constructor(message: string, public fieldErrors: LoginFieldErrors = {}) {
        super(message);
        this.name = 'LoginRequestError';
    }
}

// Cookies HttpOnly administradas por Express, siempre bajo el mismo origen.
export const loginRequest = async (credentials: LoginCredentials, signal?: AbortSignal): Promise<void> => {
    let response: Response;

    try {
        response = await fetch('/api/auth/login', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ name: credentials.name.trim(), password: credentials.password }),
            signal: AbortSignal.any([AbortSignal.timeout(15_000), ...(signal ? [signal] : [])]),
        });
    } catch {
        throw new LoginRequestError(LOGIN_MESSAGES.CONNECTION_FAILED);
    }

    // Un proxy o limitador puede devolver texto/HTML en lugar del JSON de Express.
    if (response.status === 401) throw new LoginRequestError(errorMessages.LOGIN_ERROR);
    if (response.status === 429) throw new LoginRequestError(LOGIN_MESSAGES.TOO_MANY_ATTEMPTS);

    let data: unknown;
    try {
        data = await response.json();
    } catch {
        throw new LoginRequestError(LOGIN_MESSAGES.INVALID_RESPONSE);
    }

    if (response.status === 200 && isRecord(data) && data.code === 'SUCCESS_LOGIN') return;
    if (response.status === 400 && isRecord(data) && isRecord(data.errors)) {
        const fields: LoginFieldErrors = {};
        for (const field of ['name', 'password'] as const) {
            const message = getFieldErrorMessage(data.errors[field]);
            if (message) fields[field] = message;
        }
        throw new LoginRequestError(LOGIN_MESSAGES.INVALID_FIELDS, fields);
    }
    throw new LoginRequestError(LOGIN_MESSAGES.REQUEST_FAILED);
};
