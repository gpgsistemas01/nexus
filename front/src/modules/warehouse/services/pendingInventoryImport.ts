import { UUID_V4_PATTERN } from '@nexus/input-validation';
import { isRecord } from '../../../shared/utils/isRecord.js';
import type { InventoryResource } from '../inventory.js';
import type { PendingInventoryImport } from '../inventoryImport.js';

export const pendingInventoryImport = (
    userId: string,
    resource: InventoryResource,
    storage: Storage = localStorage,
) => {
    const key = `nexus:inventory-import:${userId}:${resource}`;

    const read = (): PendingInventoryImport | null => {
        const raw = storage.getItem(key);
        if (!raw) return null;

        const value: unknown = JSON.parse(raw);

        if (
            !isRecord(value) ||
            !UUID_V4_PATTERN.test(String(value.id)) ||
            !UUID_V4_PATTERN.test(String(value.operationId)) ||
            !Number.isInteger(value.expectedVersion) ||
            Number(value.expectedVersion) < 0
        ) {
            throw new Error(
                'No se pudo leer la referencia pendiente. Contacta al administrador antes de importar otro archivo.',
            );
        }

        return {
            id: String(value.id),
            expectedVersion: Number(value.expectedVersion),
            operationId: String(value.operationId),
        };
    };

    const save = (value: PendingInventoryImport) =>
        storage.setItem(
            key,
            JSON.stringify({
                id: value.id,
                expectedVersion: value.expectedVersion,
                operationId: value.operationId,
            }),
        );

    return { read, save, clear: () => storage.removeItem(key) };
};
