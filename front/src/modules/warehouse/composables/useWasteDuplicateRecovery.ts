import { ref } from 'vue';
import { ApiError } from '../../../shared/http/apiError.js';
import { confirmAction } from '../../../shared/ui/feedback.js';
import { mapWasteStockAddition } from '../mappers/wasteStockAdditionMapper.js';
import type { InventoryPayload, StockAdditionTarget } from '../inventory.js';

type WasteDuplicateRecoveryResult = 'unavailable' | 'canceled' | 'confirmed';

export const useWasteDuplicateRecovery = (options: {
    canAddStock: boolean;
    signal: AbortSignal;
    onAddStock?: (target: StockAdditionTarget) => void;
}) => {
    const isConfirming = ref(false);

    const recover = async (
        cause: unknown,
        capture: InventoryPayload,
    ): Promise<WasteDuplicateRecoveryResult> => {
        if (
            !options.canAddStock ||
            !options.onAddStock ||
            options.signal.aborted ||
            isConfirming.value ||
            !(cause instanceof ApiError) ||
            cause.code !== 'WASTE_ALREADY_EXISTS' ||
            cause.meta.operationRejected !== true
        )
            return 'unavailable';

        const target = mapWasteStockAddition(cause.meta.waste, capture);
        if (!target) return 'unavailable';

        isConfirming.value = true;

        try {
            const confirmed = await confirmAction({
                title: 'Esta merma ya existe',
                description: `¿Abrir Agregar stock para revisar la cantidad y las observaciones de ${target.row.name}?`,
                confirmLabel: 'Abrir Agregar stock',
                signal: options.signal,
            });
            if (!confirmed || options.signal.aborted) return 'canceled';

            options.onAddStock(target);
            return 'confirmed';
        } finally {
            isConfirming.value = false;
        }
    };

    return { isConfirming, recover };
};
