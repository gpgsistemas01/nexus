import { ApiError } from './apiError.js';

export const isReadRetryable = (cause: unknown) =>
    !(cause instanceof ApiError) || ![400, 401, 403, 404, 405, 410, 422].includes(cause.status);
