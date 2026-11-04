import { CanceledError } from 'axios';
import type { AxiosError, GenericAbortSignal, InternalAxiosRequestConfig } from 'axios';

export const SESSION_REFRESH_PATH = '/api/auth/refresh';
const RETRY_DELAYS = [500, 1000];

export interface RecoverableRequest extends InternalAxiosRequestConfig {
    connectionRetries?: number;
}

const waitForRetry = (delay: number, signal?: GenericAbortSignal) =>
    new Promise<void>((resolve, reject) => {
        if (signal?.aborted) {
            reject(new CanceledError());
            return;
        }

        const cancel = () => {
            clearTimeout(timer);
            signal?.removeEventListener?.('abort', cancel);
            reject(new CanceledError());
        };

        const timer = setTimeout(() => {
            signal?.removeEventListener?.('abort', cancel);
            resolve();
        }, delay);
        signal?.addEventListener?.('abort', cancel, { once: true });
    });

export const recoverConnection = async (
    cause: AxiosError,
    request: RecoverableRequest,
): Promise<boolean> => {
    if (request.signal?.aborted) throw new CanceledError();

    const method = (request.method ?? 'get').toLowerCase();
    const canRepeat =
        method === 'get' ||
        method === 'head' ||
        (method === 'post' && request.url === SESSION_REFRESH_PATH);
    const isTransient = cause.response
        ? [502, 503, 504].includes(cause.response.status)
        : ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED'].includes(
              cause.code ?? '',
          );
    const attempt = request.connectionRetries ?? 0;
    const delay = RETRY_DELAYS[attempt];
    if (!canRepeat || !isTransient || delay === undefined) return false;

    request.connectionRetries = attempt + 1;
    await waitForRetry(delay, request.signal);
    return true;
};
