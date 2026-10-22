import { errorMessages } from '@nexus/api-messages';
import { apiClient } from '../../../shared/http/apiClient.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { LOGIN_MESSAGES } from '../loginMessages.js';
import type { LoginCredentials, LoginFieldErrors } from '../login.js';

export class LoginRequestError extends Error {
    constructor(
        message: string,
        public fieldErrors: LoginFieldErrors = {},
    ) {
        super(message);
        this.name = 'LoginRequestError';
    }
}

export const loginRequest = async (
    credentials: LoginCredentials,
    signal?: AbortSignal,
): Promise<void> => {
    try {
        const data = await apiClient.request<{ code: string }>('/api/auth/login', {
            method: 'POST',
            data: { name: credentials.name.trim(), password: credentials.password },
            signal,
            requiresAuth: false,
        });
        if (data.code !== 'SUCCESS_LOGIN')
            throw new LoginRequestError(LOGIN_MESSAGES.INVALID_RESPONSE);
    } catch (cause) {
        if (!(cause instanceof ApiError)) throw cause;

        if (cause.status === 401) throw new LoginRequestError(errorMessages.LOGIN_ERROR);

        if (cause.status === 429) throw new LoginRequestError(LOGIN_MESSAGES.TOO_MANY_ATTEMPTS);

        if (cause.status === 400)
            throw new LoginRequestError(LOGIN_MESSAGES.INVALID_FIELDS, cause.fieldErrors);

        throw new LoginRequestError(
            cause.code === 'NETWORK_ERROR'
                ? LOGIN_MESSAGES.CONNECTION_FAILED
                : cause.code === 'INVALID_RESPONSE'
                  ? LOGIN_MESSAGES.INVALID_RESPONSE
                  : LOGIN_MESSAGES.REQUEST_FAILED,
        );
    }
};
