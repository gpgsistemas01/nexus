import {
    INVENTORY_IMPORT_LIMITS,
    INVENTORY_IMPORT_MODES as modes,
    INVENTORY_IMPORT_STATUSES as statuses,
    LEGACY_INVENTORY_IMPORT_MODE,
} from '@nexus/inventory-imports';
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue';
import { ApiError } from '../../../shared/http/apiError.js';
import { createUuid } from '../../../shared/utils/createUuid.js';
import { useFileExport } from '../../../shared/composables/useFileExport.js';
import { inventoryImportService } from '../services/inventoryImportService.js';
import { pendingInventoryImport } from '../services/pendingInventoryImport.js';
import { isInventoryImportOperation } from '../inventoryImport.js';
import type { InventoryResource } from '../inventory.js';
import type {
    InventoryImportBatch,
    InventoryImportMode,
    InventoryImportOperation,
    PendingInventoryImport,
} from '../inventoryImport.js';

export const useInventoryImport = (options: {
    resource: InventoryResource;
    userId: string;
    initialMode?: InventoryImportOperation;
    availableModes?: () => readonly InventoryImportOperation[];
    onSaved: () => void;
    onUnauthorized: () => void;
}) => {
    const availableModes = computed(() => options.availableModes?.() ?? Object.values(modes));

    const initialMode = () =>
        availableModes.value.find((value) => value === options.initialMode) ??
        availableModes.value[0] ??
        modes.CREATE;

    const mode = ref<InventoryImportMode>(initialMode());
    const batch = shallowRef<InventoryImportBatch | null>(null);
    const file = shallowRef<File | null>(null);
    const isWorking = ref(false);
    const error = ref('');
    const pending = shallowRef<PendingInventoryImport | null>(null);
    const recoveryRequired = ref(false);
    const storage = pendingInventoryImport(options.userId, options.resource);
    const controller = new AbortController();
    let disposed = false;

    try {
        pending.value = storage.read();
        recoveryRequired.value = !!pending.value;
    } catch (cause) {
        recoveryRequired.value = true;
        error.value =
            cause instanceof Error ? cause.message : 'No se pudo recuperar la importación.';
    }

    const showError = (cause: unknown) => {
        error.value =
            cause instanceof Error ? cause.message : 'No se pudo completar la importación.';
        if (cause instanceof ApiError && cause.status === 401) options.onUnauthorized();
    };

    const run = async (action: () => Promise<void>) => {
        if (isWorking.value || disposed) return;

        isWorking.value = true;
        error.value = '';

        try {
            await action();
        } catch (cause) {
            if (!disposed) showError(cause);
        } finally {
            isWorking.value = false;
        }
    };

    const finish = (saved: InventoryImportBatch) => {
        if (disposed) return;

        batch.value = saved;
        storage.clear();
        pending.value = null;
        recoveryRequired.value = false;
        file.value = null;
        options.onSaved();
    };

    const selectFile = (value: File | null) => {
        if (isWorking.value || batch.value || recoveryRequired.value || template.isExporting.value)
            return;

        error.value = '';

        if (
            value &&
            (!/\.xlsx$/i.test(value.name) ||
                value.size === 0 ||
                value.size > INVENTORY_IMPORT_LIMITS.maxBytes)
        ) {
            file.value = null;
            error.value = 'Selecciona un archivo .xlsx de hasta 2 MiB.';
            return;
        }

        file.value = value;
    };

    const selectMode = (value: unknown) => {
        if (
            !isInventoryImportOperation(value) ||
            !availableModes.value.includes(value) ||
            value === mode.value ||
            isWorking.value ||
            batch.value ||
            recoveryRequired.value ||
            template.isExporting.value ||
            errors.isExporting.value
        )
            return;

        mode.value = value;
        file.value = null;
        error.value = '';
        template.exportError.value = '';
        errors.exportError.value = '';
    };

    const prepare = () => {
        const operation = mode.value;
        if (
            !file.value ||
            batch.value ||
            recoveryRequired.value ||
            template.isExporting.value ||
            !isInventoryImportOperation(operation) ||
            !availableModes.value.includes(operation)
        )
            return Promise.resolve();

        return run(async () => {
            batch.value = await inventoryImportService.preview(
                options.resource,
                operation,
                file.value!,
                controller.signal,
            );
            file.value = null;
        });
    };

    const confirm = () =>
        run(async () => {
            if (
                !batch.value?.preview ||
                batch.value.preview.summary.errors ||
                batch.value.status !== statuses.DRAFT ||
                batch.value.mode === LEGACY_INVENTORY_IMPORT_MODE ||
                recoveryRequired.value
            )
                return;

            pending.value ??= {
                id: batch.value.id,
                expectedVersion: batch.value.version,
                operationId: createUuid(),
            };
            // Guardar la clave antes del POST permite consultar o repetir exactamente la misma confirmación.
            storage.save(pending.value);
            recoveryRequired.value = true;
            const saved = await inventoryImportService.confirm(pending.value, controller.signal);
            finish(saved);
        });

    const recover = () =>
        run(async () => {
            if (!pending.value) return;

            const saved = await inventoryImportService.get(pending.value.id, controller.signal);
            if (disposed) return;

            if (saved.resource !== options.resource)
                throw new Error('La importación pendiente pertenece a otro módulo.');

            batch.value = saved;
            mode.value = saved.mode;
            if (saved.status === statuses.COMPLETED) return finish(saved);

            if (saved.status === statuses.DRAFT) {
                // GET todavía pendiente no demuestra rollback; el mismo POST resuelve la carrera con el servidor.
                return finish(
                    await inventoryImportService.confirm(pending.value, controller.signal),
                );
            }

            storage.clear();
            pending.value = null;
            recoveryRequired.value = false;
            error.value =
                'La importación pendiente venció o fue descartada. Descarga una plantilla nueva.';
        });

    const discard = () =>
        run(async () => {
            const id =
                pending.value?.id ??
                (batch.value?.status === statuses.DRAFT ? batch.value.id : null);
            if (recoveryRequired.value && !id)
                throw new Error('Conserva la referencia pendiente y contacta al administrador.');

            if (id) await inventoryImportService.cancel(id, controller.signal);

            if (disposed) return;

            storage.clear();
            pending.value = null;
            recoveryRequired.value = false;
            batch.value = null;
            mode.value = initialMode();
            file.value = null;
        });

    const template = useFileExport<{ supplierId: string; search: string; page: number }>({
        canExport: () =>
            !batch.value &&
            !isWorking.value &&
            !recoveryRequired.value &&
            isInventoryImportOperation(mode.value) &&
            availableModes.value.includes(mode.value),
        filename: () => `plantilla_${options.resource}_${mode.value}`,
        request: (query, signal) => {
            if (!isInventoryImportOperation(mode.value))
                throw new Error('Selecciona una operación vigente.');

            return inventoryImportService.template(options.resource, mode.value, query, signal);
        },
        onDenied: (status) => {
            if (status === 401) options.onUnauthorized();
        },
    });
    const errors = useFileExport<undefined>({
        canExport: () => !!batch.value?.preview?.summary.errors && !isWorking.value,
        filename: 'errores_importacion',
        request: (_, signal) => inventoryImportService.errors(batch.value!.id, signal),
        onDenied: (status) => {
            if (status === 401) options.onUnauthorized();
        },
    });
    const canConfirm = computed(
        () =>
            batch.value?.status === statuses.DRAFT &&
            !!batch.value.preview &&
            !batch.value.preview.summary.errors &&
            batch.value.mode !== LEGACY_INVENTORY_IMPORT_MODE &&
            !recoveryRequired.value,
    );
    onBeforeUnmount(() => {
        disposed = true;
        controller.abort();
        file.value = null;
    });
    return {
        mode: computed(() => mode.value),
        availableModes,
        batch,
        file,
        isWorking,
        error,
        recoveryRequired,
        canConfirm,
        selectFile,
        selectMode,
        prepare,
        confirm,
        recover,
        discard,
        template,
        errors,
    };
};
