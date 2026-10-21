import { onBeforeUnmount, ref } from 'vue';
import { confirmRemoval } from '../../../shared/ui/feedback.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { inventoryService } from '../services/inventoryService.js';
import { INVENTORY_CONFIG } from '../inventory.js';
import type { InventoryResource, InventoryRow } from '../inventory.js';

export const useInventoryRemoval = (options: {
    resource: InventoryResource;
    onSaved: () => void;
    onUnauthorized: () => void;
}) => {
    const isConfirming = ref(false);
    const controller = new AbortController();
    const remove = async (row: InventoryRow) => {
        if (isConfirming.value || controller.signal.aborted) return;
        isConfirming.value = true;
        try {
            const confirmed = await confirmRemoval({
                title: `Eliminar ${INVENTORY_CONFIG[options.resource].singular}: ${row.name}`,
                description: `Se eliminará la relación con ${row.supplierName}. Si no quedan otros proveedores, también se eliminará el material.`,
                signal: controller.signal,
                submit: async () => {
                    try {
                        await inventoryService.mutate(
                            options.resource,
                            'delete',
                            {},
                            row.id,
                            controller.signal,
                        );
                    } catch (cause) {
                        if (cause instanceof ApiError && cause.status === 401)
                            options.onUnauthorized();
                        throw cause;
                    }
                },
            });
            if (confirmed) options.onSaved();
        } finally {
            isConfirming.value = false;
        }
    };
    onBeforeUnmount(() => controller.abort());
    return { isConfirming, remove };
};
