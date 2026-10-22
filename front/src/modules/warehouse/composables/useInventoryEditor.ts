import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useForm } from 'vee-validate';
import { ApiError } from '../../../shared/http/apiError.js';
import { inventoryService } from '../services/inventoryService.js';
import { createPendingWasteOperation } from '../services/pendingWasteOperation.js';
import {
    initialInventoryValues,
    inventoryRules,
    buildInventoryPayload,
    previewWaste,
    unitUsesMeasurements,
} from '../formModel.js';
import { useRemoteOptions } from './useRemoteOptions.js';
import { useSelectedOption } from './useSelectedOption.js';
import type {
    EditorTarget,
    InventoryField,
    InventoryPayload,
    InventoryResource,
    InventoryValues,
} from '../inventory.js';

export const useInventoryEditor = (options: {
    resource: InventoryResource;
    target: EditorTarget;
    userId: string;
    onSaved: () => void;
    onUnauthorized: () => void;
}) => {
    const { resource, target } = options;
    const message = ref('');
    const isPending = ref(false);
    const isSubmitting = ref(false);
    const isConflicted = ref(false);
    const controller = new AbortController();
    const isCreating = computed(() => target.action === 'create');
    const isStock = computed(() => target.action === 'stock');
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
    const rules = inventoryRules(resource, target.action) as Record<
        string,
        (value: unknown, data: Record<string, unknown>) => string | null
    >;
    const form = useForm<InventoryValues>({
        validateOnMount: false,
        initialValues: initialInventoryValues(target),
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
    const supplierId = computed(() => String(form.values.supplierId));
    const suppliers = useRemoteOptions(
        'suppliers',
        computed(() => isCreating.value && !isPending.value),
    );
    const presentations = useRemoteOptions(
        'presentations',
        computed(() => isCreating.value && resource !== 'wastes'),
    );
    const units = useRemoteOptions(
        'unit-measures',
        computed(() => isCreating.value && resource !== 'wastes'),
    );
    const templates = useRemoteOptions(
        'wastes/material-templates',
        computed(() => isCreating.value && resource === 'wastes' && !isPending.value),
        supplierId,
    );
    const reasons = useRemoteOptions('reasons', isStock);
    const lookupMap = {
        supplierId: suppliers,
        presentationId: presentations,
        unitMeasureId: units,
        materialId: templates,
        reasonId: reasons,
    };
    const lookupByField: Partial<Record<InventoryField, ReturnType<typeof useRemoteOptions>>> =
        lookupMap;
    const lookups = computed(() =>
        Object.fromEntries(
            Object.entries(lookupMap).map(([key, lookup]) => [
                key,
                {
                    items: lookup.items.value,
                    isLoading: lookup.isLoading.value,
                    error: lookup.error.value,
                    hasMore: lookup.hasMore.value,
                },
            ]),
        ),
    );
    const selectedTemplate = useSelectedOption(templates.items, () =>
        String(form.values.materialId),
    );
    const selectedUnit = useSelectedOption(units.items, () => String(form.values.unitMeasureId));
    const usesMeasurements = computed(
        () =>
            resource === 'materials' &&
            (isCreating.value
                ? unitUsesMeasurements(selectedUnit.value?.data)
                : unitUsesMeasurements({
                      symbol: target.row?.unitMeasure,
                      name: target.row?.unitMeasure,
                  })),
    );
    watch(selectedUnit, (unit) => {
        if (
            resource !== 'materials' ||
            !isCreating.value ||
            !unit ||
            unitUsesMeasurements(unit.data)
        )
            return;
        for (const field of ['base', 'height'] as const) {
            form.setFieldValue(field, '', false);
            form.setFieldError(field, undefined);
        }
    });
    const preview = computed(() =>
        isPending.value && pendingData
            ? {
                  isRoll: pendingData.coneWeightKg != null,
                  weightKg: null,
                  base: form.values.base,
                  height: form.values.height,
              }
            : previewWaste(form.values, selectedTemplate.value),
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

    watch(supplierId, () => {
        if (resource === 'wastes' && isCreating.value) form.setFieldValue('materialId', '', false);
    });
    watch(
        () => selectedTemplate.value?.id,
        () => {
            const template = selectedTemplate.value;
            if (isPending.value) return;
            form.setFieldValue('name', String(template?.data.name ?? ''), false);
            form.setFieldValue('maxUnitCost', String(template?.data.maxUnitCost ?? ''), false);
            for (const field of [
                'coneWeightKg',
                'totalWeightKg',
                'referenceRollTotalWeightKg',
                'base',
                'height',
            ] as const) {
                form.setFieldValue(field, '', false);
            }
        },
    );

    const execute = async (payload: InventoryPayload) => {
        if (isSubmitting.value || controller.signal.aborted) return;
        isSubmitting.value = true;
        message.value = '';
        const wasPending = !!pendingData;
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
            await inventoryService.mutate(resource, target.action, payload, id, controller.signal);
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
        options.onSaved();
    };
    const submitValidated = form.handleSubmit((values) =>
        execute(buildInventoryPayload(resource, target, values, preview.value)),
    );
    const submit = () => {
        if (pendingData) return execute(pendingData);
        return submitValidated();
    };
    const editedFields = new Set<InventoryField>();
    const update = (field: InventoryField, value: string | boolean) => {
        if (isPending.value || isSubmitting.value || form.values[field] === value) return;
        editedFields.add(field);
        form.setFieldValue(field, value, false);
        form.setFieldError(field, undefined);
        message.value = '';
    };
    const blur = (field: InventoryField) => {
        // El autofocus y las actualizaciones de catálogos no son captura del usuario.
        if (editedFields.has(field) || form.submitCount.value > 0) return form.validateField(field);
    };
    onBeforeUnmount(() => controller.abort());
    return {
        values: form.values,
        errors: form.errors,
        message,
        isSubmitting,
        isPending,
        isConflicted,
        lookups,
        preview,
        selectedTemplate,
        usesMeasurements,
        submit,
        update,
        blur,
        searchLookup: (field: InventoryField, search: string) =>
            lookupByField[field]?.updateSearch(search),
        loadMore: (field: InventoryField) => lookupByField[field]?.loadMore(),
        retryLookup: (field: InventoryField) => lookupByField[field]?.retry(),
    };
};
