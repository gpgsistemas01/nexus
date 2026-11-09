import { computed, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue';
import { zonedDateTimeToUtcIso } from '@nexus/date-time';
import { createUuid } from '../../../shared/utils/createUuid.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { HISTORICAL_DELIVERY_ERROR_CODES } from '@nexus/historical-deliveries';
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
        cutoffDate: '',
        deliveredAt: '',
        reason: '',
        declaredDelivered: false,
        search: '',
    });
    const preview = shallowRef<HistoricalDeliveryPreview | null>(null);
    const receipt = shallowRef<HistoricalDeliveryReceipt | null>(null);
    const selected = ref<string[]>([]);
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

    watch(
        () => [values.cutoffDate, values.search],
        () => {
            preview.value = null;
            selected.value = [];
        },
    );

    const utc = (value: string) => zonedDateTimeToUtcIso(new Date(value));

    const canConfirm = computed(
        () =>
            !!preview.value &&
            selected.value.length > 0 &&
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
                    selected.value = [];
                }
            }
        } finally {
            isWorking.value = false;
        }
    };

    const load = (page = 1) =>
        run(async () => {
            if (recoveryRequired.value || receipt.value) return;

            const cutoffDate = utc(values.cutoffDate);
            if (!cutoffDate || Date.parse(cutoffDate) > Date.now())
                throw new Error('Captura un corte válido que no esté en el futuro.');

            preview.value = await historicalDeliveryService.preview(
                options.resource,
                { cutoffDate, search: values.search, page },
                controller.signal,
            );
            selected.value = [];
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
                deliveredAt: values.deliveredAt ? utc(values.deliveredAt) : null,
                reason: values.reason.trim(),
                declaredDelivered: true,
                documents: preview
                    .value!.documents.filter((item) => selected.value.includes(item.id))
                    .map(({ id, revision }) => ({ id, revision })),
            };
            storage.save(command);
            pending.value = command;
            recoveryRequired.value = true;
            await send();
        });
    };

    const recover = () => run(send);

    const toggle = (id: string) => {
        if (
            isWorking.value ||
            recoveryRequired.value ||
            !preview.value?.documents.some((item) => item.id === id)
        )
            return;

        selected.value = selected.value.includes(id)
            ? selected.value.filter((value) => value !== id)
            : [...selected.value, id];
    };

    const selectAll = () => {
        if (!isWorking.value && !recoveryRequired.value)
            selected.value = preview.value?.documents.map((item) => item.id) ?? [];
    };

    onBeforeUnmount(() => {
        disposed = true;
        controller.abort();
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
        selectAll,
    };
};
