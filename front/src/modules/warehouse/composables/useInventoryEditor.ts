import { computed, onBeforeUnmount, ref } from 'vue';
import { useForm } from 'vee-validate';
import { useFormInteraction } from '../../../shared/composables/useFormInteraction.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { inventoryService } from '../services/inventoryService.js';
import { createPendingWasteOperation } from '../services/pendingWasteOperation.js';
import {
    initialInventoryValues,
    inventoryRules,
    buildInventoryPayload,
    previewWaste,
} from '../formModel.js';
import { useInventorySelection } from './useInventorySelection.js';
import { useWasteDuplicateRecovery } from './useWasteDuplicateRecovery.js';
import type { LookupItem } from '../../../shared/lookup.js';
import type {
    EditorTarget,
    InventoryField,
    InventoryPayload,
    InventoryResource,
    InventoryValues,
    StockAdditionTarget,
} from '../inventory.js';

export const useInventoryEditor = (options: {
    resource: InventoryResource;
    target: EditorTarget;
    userId: string;
    onSaved: (created?: LookupItem) => void;
    onUnauthorized: () => void;
    creationContext?: 'goodsReceipt';
    initialSupplier?: LookupItem;
    canAddStock?: boolean;
    onAddStock?: (target: StockAdditionTarget) => void;
}) => {
    const { resource, target } = options;
    const message = ref('');
    const isPending = ref(false);
    const isSubmitting = ref(false);
    const isConflicted = ref(false);
    const controller = new AbortController();
    const duplicateRecovery = useWasteDuplicateRecovery({
        canAddStock: options.canAddStock === true,
        signal: controller.signal,
        onAddStock: options.onAddStock,
    });
    const isCreating = computed(() => target.action === 'create');
    const isIdempotent = resource === 'wastes' && ['create', 'add-stock'].includes(target.action);
    let pending: ReturnType<typeof createPendingWasteOperation> | undefined;
    let pendingData: InventoryPayload | null = null;

    try {
        if (isIdempotent) {
            pending = createPendingWasteOperation(
                options.userId,
                target.action === 'create' ? 'create' : 'add-stock',
                target.row?.entityId,
            );
            pendingData = pending.read();
            isPending.value = !!pendingData;
        }
    } catch (cause) {
        message.value =
            cause instanceof Error
                ? cause.message
                : 'No se pudo preparar la recuperación de la captura.';
    }

    const rules = inventoryRules(resource, target.action, options.creationContext) as Record<
        string,
        (value: unknown, data: Record<string, unknown>) => string | null
    >;
    const form = useForm<InventoryValues>({
        validateOnMount: false,
        initialValues: {
            ...initialInventoryValues(target),
            ...(options.initialSupplier ? { supplierId: options.initialSupplier.id } : {}),
        },
        validationSchema: computed(() =>
            Object.fromEntries(
                Object.entries(rules).map(([field, rule]) => [
                    field,
                    () =>
                        rule(
                            (validationData.value as Record<string, unknown>)[field],
                            validationData.value,
                        ) || true,
                ]),
            ),
        ),
    });

    // Registrar los campos permite a VeeValidate distinguir los ya validados.
    // Sin registro, la validación silenciosa del esquema publica todos los errores.
    for (const field of Object.keys(rules) as InventoryField[]) {
        form.defineField(field, { validateOnModelUpdate: false });
    }

    if (pendingData) {
        for (const field of Object.keys(form.values) as InventoryField[]) {
            if (pendingData[field] !== undefined)
                form.setFieldValue(
                    field,
                    field === 'isActive'
                        ? pendingData[field] === true
                        : String(pendingData[field] ?? ''),
                    false,
                );
        }
    }

    const selection = useInventorySelection({
        resource,
        target,
        values: form.values,
        isPending,
        initialSupplier: options.initialSupplier,
        setValue: (field, value) => form.setFieldValue(field, value, false),
        clearError: (field) => form.setFieldError(field, undefined),
    });
    const preview = computed(() =>
        isPending.value && pendingData
            ? {
                  isRoll: pendingData.coneWeightKg != null,
                  weightKg: null,
                  base: form.values.base,
                  height: form.values.height,
              }
            : previewWaste(form.values, selection.selectedTemplate.value),
    );
    const validationData = computed(() => ({
        ...form.values,
        ...(resource === 'wastes' && isCreating.value
            ? {
                  base: preview.value.base,
                  height: preview.value.height,
                  presentationName: preview.value.isRoll ? 'ROLLO' : '',
              }
            : {}),
    }));

    const execute = async (payload: InventoryPayload) => {
        if (isSubmitting.value || controller.signal.aborted) return;

        isSubmitting.value = true;
        message.value = '';
        const wasPending = !!pendingData;

        let created: LookupItem | undefined;

        try {
            if (isIdempotent) {
                if (!pending)
                    throw new Error(
                        'Se necesita almacenamiento local disponible para recuperar esta operación.',
                    );

                pendingData = pending.save(payload);
                isPending.value = true;
                payload = pendingData;
            }

            const id = target.action === 'delete' ? target.row?.id : target.row?.entityId;
            if (
                options.creationContext === 'goodsReceipt' &&
                resource !== 'wastes' &&
                isCreating.value
            )
                created = await inventoryService.createForPurchase(
                    resource,
                    payload,
                    controller.signal,
                );
            else
                await inventoryService.mutate(
                    resource,
                    target.action,
                    payload,
                    id,
                    controller.signal,
                );
        } catch (cause) {
            if (!controller.signal.aborted) {
                try {
                    pending?.reject(cause, wasPending);
                    pendingData = pending?.read() ?? null;
                } catch {
                    /* Se conserva la captura si no se puede limpiar. */
                }

                isPending.value = !!pendingData;
                message.value = cause instanceof Error ? cause.message : 'No se pudo guardar.';

                if (cause instanceof ApiError) {
                    form.setErrors(cause.fieldErrors);
                    isConflicted.value = cause.code === 'RECORD_VERSION_CONFLICT';
                    if (cause.status === 401) options.onUnauthorized();
                }

                if (resource === 'wastes' && isCreating.value && !isPending.value)
                    await duplicateRecovery.recover(cause, payload);
            }

            return;
        } finally {
            isSubmitting.value = false;
        }

        if (controller.signal.aborted) return;

        try {
            pending?.clear();
        } catch {
            /* Repetir el mismo operationId recupera el resultado confirmado. */
        }

        options.onSaved(created);
    };

    const submitValidated = form.handleSubmit((values) =>
        execute(
            buildInventoryPayload(resource, target, values, preview.value, options.creationContext),
        ),
    );

    const submit = () => {
        if (pendingData) return execute(pendingData);

        return submitValidated();
    };

    const { update, blur } = useFormInteraction<InventoryField, string | boolean>(form, {
        isDisabled: () => isPending.value || isSubmitting.value || controller.signal.aborted,
        onChange: () => {
            message.value = '';
        },
    });
    onBeforeUnmount(() => controller.abort());

    const selectCreatedSupplier = (created: LookupItem) => {
        if (
            !isCreating.value ||
            resource === 'wastes' ||
            options.initialSupplier ||
            isPending.value ||
            isSubmitting.value ||
            controller.signal.aborted
        )
            return;

        if (created.isDisabled) {
            message.value =
                'El proveedor se registró como inactivo. Actívalo antes de seleccionarlo.';
            return;
        }

        selection.selectedSupplier.value = created;
        update('supplierId', created.id);
        void selection.refreshSuppliers();
    };

    return {
        values: form.values,
        errors: form.errors,
        message,
        isSubmitting,
        isPending,
        isConflicted,
        isConfirmingDuplicate: duplicateRecovery.isConfirming,
        lookups: selection.lookups,
        preview,
        selectedTemplate: selection.selectedTemplate,
        selectedSupplier: selection.selectedSupplier,
        selectCreatedSupplier,
        usesMeasurements: selection.usesMeasurements,
        submit,
        update,
        blur,
        searchLookup: selection.searchLookup,
        loadMore: selection.loadMore,
        retryLookup: selection.retryLookup,
    };
};
