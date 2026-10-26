import { ref } from 'vue';
import { ApiError } from '../../../shared/http/apiError.js';
import { confirmAction } from '../../../shared/ui/feedback.js';
import { mapWasteStockAddition } from '../mappers/wasteStockAdditionMapper.js';
import type { InventoryPayload, StockAdditionTarget } from '../inventory.js';

export const useWasteDuplicateRecovery = (options: {
    canAddStock: boolean;
    signal: AbortSignal;
    onAddStock?: (target: StockAdditionTarget) => void;
}) => {
    const isConfirming = ref(false);

    const recover = async (cause: unknown, capture: InventoryPayload) => {
        if (
            !options.canAddStock ||
            !options.onAddStock ||
            options.signal.aborted ||
            isConfirming.value ||
            !(cause instanceof ApiError) ||
            cause.code !== 'WASTE_ALREADY_EXISTS' ||
            cause.meta.operationRejected !== true
        )
            return false;

        const target = mapWasteStockAddition(cause.meta.waste, capture);
        if (!target) return false;

        isConfirming.value = true;

        try {
            const confirmed = await confirmAction({
                title: 'Esta merma ya existe',
                description: `¿Abrir Agregar stock para revisar la cantidad y las observaciones de ${target.row.name}?`,
                confirmLabel: 'Abrir Agregar stock',
                signal: options.signal,
            });
            if (!confirmed || options.signal.aborted) return false;

            options.onAddStock(target);
            return true;
        } finally {
            isConfirming.value = false;
        }
    };

    return { isConfirming, recover };
};
