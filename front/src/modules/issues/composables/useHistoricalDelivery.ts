import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef } from 'vue';
import { createUuid } from '../../../shared/utils/createUuid.js';
import { ApiError } from '../../../shared/http/apiError.js';
import {
    HISTORICAL_DELIVERY_ERROR_CODES,
    HISTORICAL_DELIVERY_LIMITS as limits,
} from '@nexus/historical-deliveries';
import { historicalDeliveryService } from '../services/historicalDeliveryService.js';
import { pendingHistoricalDelivery } from '../services/pendingHistoricalDelivery.js';
import type { IssueResource } from '../issue.js';
import type {
    HistoricalDeliveryCommand,
    HistoricalDeliveryPreview,
    HistoricalDeliveryReceipt,
} from '../historicalDelivery.js';

export const useHistoricalDelivery = (options: {
    resource: IssueResource;
    userId: string;
    onSaved: () => void;
    onUnauthorized: () => void;
}) => {
    const values = reactive({
        reason: '',
        declaredDelivered: false,
    });
    const cutoffDate = new Date().toISOString();
    const preview = shallowRef<HistoricalDeliveryPreview | null>(null);
    const receipt = shallowRef<HistoricalDeliveryReceipt | null>(null);
    const selection = shallowRef(new Map<string, string>());
    const selected = computed(() => [...selection.value.keys()]);
    const isWorking = ref(false);
    const error = ref('');
    const pending = shallowRef<HistoricalDeliveryCommand | null>(null);
    const recoveryRequired = ref(false);
    const controller = new AbortController();
    const storage = pendingHistoricalDelivery(options.userId, options.resource);
    let disposed = false;

    try {
        pending.value = storage.read();
        recoveryRequired.value = !!pending.value;
    } catch {
        recoveryRequired.value = true;
        error.value =
            'No se pudo leer la regularización pendiente. Contacta al administrador antes de registrar otra.';
    }

    const canConfirm = computed(
        () =>
            !!preview.value &&
            selected.value.length > 0 &&
            selected.value.length <= limits.maxDocuments &&
            values.declaredDelivered &&
            !!values.reason.trim() &&
            !recoveryRequired.value &&
            !isWorking.value,
    );

    const run = async (action: () => Promise<void>) => {
        if (isWorking.value || disposed) return;

        isWorking.value = true;
        error.value = '';

        try {
            await action();
        } catch (cause) {
            if (!disposed) {
                error.value =
                    cause instanceof Error
                        ? cause.message
                        : 'No se pudo completar la regularización.';
                if (cause instanceof ApiError && cause.status === 401) options.onUnauthorized();

                // Sólo una respuesta definitiva a la misma captura permite abandonar el reintento.
                if (
                    pending.value &&
                    cause instanceof ApiError &&
                    [400, 404, 409].includes(cause.status) &&
                    ![HISTORICAL_DELIVERY_ERROR_CODES.BUSY, 'OPERATION_KEY_CONFLICT'].includes(
                        cause.code,
                    )
                ) {
                    storage.clear();
                    pending.value = null;
                    recoveryRequired.value = false;
                    preview.value = null;
                    selection.value = new Map();
                }
            }
        } finally {
            isWorking.value = false;
        }
    };

    const load = (page = 1) =>
        run(async () => {
            if (recoveryRequired.value || receipt.value) return;

            const result = await historicalDeliveryService.preview(
                options.resource,
                { cutoffDate, page },
                controller.signal,
            );
            preview.value = result;
        });

    const send = async () => {
        if (!pending.value) return;

        const saved = await historicalDeliveryService.confirm(
            options.resource,
            pending.value,
            controller.signal,
        );
        if (disposed) return;

        receipt.value = saved;
        storage.clear();
        pending.value = null;
        recoveryRequired.value = false;
        options.onSaved();
    };

    const confirm = () => {
        if (!canConfirm.value || !preview.value) return Promise.resolve();

        return run(async () => {
            const command: HistoricalDeliveryCommand = {
                operationId: createUuid(),
                cutoffDate: preview.value!.cutoffDate,
                deliveredAt: null,
                reason: values.reason.trim(),
                declaredDelivered: true,
                documents: Array.from(selection.value, ([id, revision]) => ({ id, revision })),
            };
            storage.save(command);
            pending.value = command;
            recoveryRequired.value = true;
            await send();
        });
    };

    const recover = () => run(send);

    const toggle = (id: string) => {
        if (isWorking.value || recoveryRequired.value) return;

        const next = new Map(selection.value);

        if (!next.delete(id)) {
            const candidate = preview.value?.documents.find((document) => document.id === id);
            if (!candidate || next.size >= limits.maxDocuments) return;

            next.set(id, candidate.revision);
        }

        selection.value = next;
    };

    const selectPage = (select = true) => {
        if (isWorking.value || recoveryRequired.value || !preview.value) return;

        const next = new Map(selection.value);

        for (const { id, revision } of preview.value.documents) {
            if (!select) {
                next.delete(id);
            } else if (next.size < limits.maxDocuments && !next.has(id)) {
                next.set(id, revision);
            }
        }

        selection.value = next;
    };

    onBeforeUnmount(() => {
        disposed = true;
        controller.abort();
    });
    onMounted(() => {
        void load();
    });

    return {
        values,
        preview,
        receipt,
        selected,
        isWorking,
        error,
        recoveryRequired,
        canConfirm,
        load,
        confirm,
        recover,
        toggle,
        selectPage,
    };
};
