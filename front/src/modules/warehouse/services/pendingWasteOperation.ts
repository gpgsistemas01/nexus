import { ApiError } from '../../../shared/http/apiError.js';
import { isRecord } from '../../../shared/utils/isRecord.js';
import type { InventoryPayload } from '../inventory.js';

export const createPendingWasteOperation = (
    userId: string,
    action: string,
    id = '',
    storage: Storage = localStorage,
) => {
    // Misma identidad que EJS: una captura pendiente se puede recuperar desde ambas interfaces.
    const key = `nexus:waste-operation:${userId}:${action}:${id}`;
    const read = (): InventoryPayload | null => {
        const raw = storage.getItem(key);
        if (!raw) return null;
        const data: unknown = JSON.parse(raw);
        if (
            !isRecord(data) ||
            typeof data.operationId !== 'string' ||
            !Object.values(data).every(
                (value) => value === null || ['string', 'number', 'boolean'].includes(typeof value),
            )
        ) {
            throw new Error(
                'La captura pendiente no se puede leer. Conserva sus datos y contacta al administrador.',
            );
        }
        return data as InventoryPayload;
    };
    const save = (payload: InventoryPayload) => {
        const data = read() ?? { ...payload, operationId: crypto.randomUUID() };
        storage.setItem(key, JSON.stringify(data));
        return data;
    };
    const clear = () => storage.removeItem(key);
    const reject = (cause: unknown, wasPending: boolean) => {
        if (!(cause instanceof ApiError)) return;
        if (
            (!wasPending &&
                cause.status >= 400 &&
                cause.status < 500 &&
                cause.code !== 'OPERATION_KEY_CONFLICT') ||
            cause.meta.operationRejected === true
        )
            clear();
    };
    return { read, save, clear, reject };
};
