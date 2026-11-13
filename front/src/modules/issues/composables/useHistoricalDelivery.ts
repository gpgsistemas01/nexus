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
    const selected = ref<string[]>([]);
    const candidates = shallowRef(
        new Map<string, HistoricalDeliveryPreview['documents'][number]>(),
    );
    const allSelected = ref(false);
    const isWorking = ref(false);
    const isSelectingAll = ref(false);
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
                    selected.value = [];
                    candidates.value = new Map();
                    allSelected.value = false;
                }
            }
        } finally {
            isWorking.value = false;
        }
    };

    const load = (page = 1, preserveSelection = false) =>
        run(async () => {
            if (recoveryRequired.value || receipt.value) return;

            const result = await historicalDeliveryService.preview(
                options.resource,
                { cutoffDate, page },
                controller.signal,
            );
            preview.value = result;
            candidates.value =
                page === 1 && !preserveSelection ? new Map() : new Map(candidates.value);
            for (const candidate of result.documents) candidates.value.set(candidate.id, candidate);

            if (page === 1 && !preserveSelection) {
                selected.value = [];
                allSelected.value = false;
            }
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
                documents: selected.value.map((id) => {
                    const candidate = candidates.value.get(id);
                    if (!candidate)
                        throw new ApiError(
                            'No se encontró una salida seleccionada. Vuelve a buscar antes de confirmar.',
                        );

                    return { id: candidate.id, revision: candidate.revision };
                }),
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

        if (selected.value.includes(id)) {
            selected.value = selected.value.filter((value) => value !== id);
            allSelected.value = false;
            error.value = '';
            return;
        }

        const candidate = candidates.value.get(id);
        if (!candidate) return;

        if (selected.value.length >= limits.maxDocuments) {
            error.value = `Puedes seleccionar hasta ${limits.maxDocuments} salidas por lote. Desmarca alguna o selecciona otro lote.`;
            return;
        }

        selected.value = [...selected.value, id];
        allSelected.value = false;
        error.value = '';
    };

    const selectAll = (isSelected = true) => {
        if (isWorking.value || recoveryRequired.value) return Promise.resolve();

        if (!isSelected) {
            selected.value = [];
            allSelected.value = false;
            error.value = '';
            return Promise.resolve();
        }

        return run(async () => {
            const currentPreview = preview.value;
            if (!currentPreview) return;

            isSelectingAll.value = true;

            try {
                const allCandidates = new Map<
                    string,
                    HistoricalDeliveryPreview['documents'][number]
                >();
                let complete = false;

                for (let page = 1; page <= limits.maxPage; page += 1) {
                    const result =
                        currentPreview.page === page
                            ? currentPreview
                            : await historicalDeliveryService.preview(
                                  options.resource,
                                  { cutoffDate, page },
                                  controller.signal,
                              );

                    for (const candidate of result.documents) {
                        allCandidates.set(candidate.id, candidate);
                        if (allCandidates.size > limits.maxDocuments)
                            throw new ApiError(
                                `Hay más de ${limits.maxDocuments} salidas para este corte. Selecciona manualmente hasta ${limits.maxDocuments} por lote.`,
                            );
                    }

                    if (!result.hasMore) {
                        complete = true;
                        break;
                    }
                }

                if (!complete)
                    throw new ApiError(
                        'Hay demasiadas páginas para seleccionar todos los resultados de una vez. Selecciona manualmente hasta 100 salidas por lote.',
                    );

                candidates.value = allCandidates;
                selected.value = [...allCandidates.keys()];
                allSelected.value = selected.value.length > 0;
            } finally {
                isSelectingAll.value = false;
            }
        });
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
        allSelected,
        isWorking,
        isSelectingAll,
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
