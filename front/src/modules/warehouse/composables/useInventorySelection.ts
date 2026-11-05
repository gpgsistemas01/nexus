import { computed, watch } from 'vue';
import type { Ref } from 'vue';
import { useSelectedOption } from '../../../shared/composables/useSelectedOption.js';
import { useRemoteOptions } from './useRemoteOptions.js';
import { unitUsesMeasurements } from '../formModel.js';
import type { LookupItem } from '../../../shared/lookup.js';
import type {
    EditorTarget,
    InventoryField,
    InventoryResource,
    InventoryValues,
} from '../inventory.js';

export const useInventorySelection = (options: {
    resource: InventoryResource;
    target: EditorTarget;
    values: InventoryValues;
    isPending: Ref<boolean>;
    initialSupplier?: LookupItem;
    setValue: (field: InventoryField, value: string) => void;
    clearError: (field: InventoryField) => void;
}) => {
    const { resource, target, values, isPending } = options;
    const isCreating = target.action === 'create';
    const supplierId = computed(() => String(values.supplierId));
    const suppliers = useRemoteOptions(
        'suppliers',
        computed(() => isCreating && !isPending.value && !options.initialSupplier),
    );
    const presentations = useRemoteOptions(
        'presentations',
        computed(() => isCreating && resource !== 'wastes'),
    );
    const units = useRemoteOptions(
        'unit-measures',
        computed(() => isCreating && resource !== 'wastes'),
    );
    const templates = useRemoteOptions(
        'wastes/material-templates',
        computed(() => isCreating && resource === 'wastes' && !isPending.value),
        supplierId,
    );
    const reasons = useRemoteOptions(
        'reasons',
        computed(() => target.action === 'stock'),
    );
    const selectedSupplier = useSelectedOption(
        suppliers.items,
        () => String(values.supplierId),
        () => options.initialSupplier,
    );
    const selectedTemplate = useSelectedOption(templates.items, () => String(values.materialId));
    const selectedUnit = useSelectedOption(units.items, () => String(values.unitMeasureId));
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
            Object.entries(lookupMap).map(([key, lookup]) => [key, lookup.state.value]),
        ),
    );
    const usesMeasurements = computed(
        () =>
            resource === 'materials' &&
            (isCreating
                ? unitUsesMeasurements(selectedUnit.value?.data)
                : unitUsesMeasurements({
                      symbol: target.row?.unitMeasure,
                      name: target.row?.unitMeasure,
                  })),
    );
    watch(selectedUnit, (unit) => {
        if (resource !== 'materials' || !isCreating || !unit || unitUsesMeasurements(unit.data))
            return;

        for (const field of ['base', 'height'] as const) {
            options.setValue(field, '');
            options.clearError(field);
        }
    });
    watch(supplierId, () => {
        if (resource === 'wastes' && isCreating) options.setValue('materialId', '');
    });
    watch(
        () => selectedTemplate.value?.id,
        () => {
            const template = selectedTemplate.value;
            if (isPending.value) return;

            options.setValue('name', String(template?.data.name ?? ''));
            options.setValue('maxUnitCost', String(template?.data.maxUnitCost ?? ''));

            for (const field of [
                'coneWeightKg',
                'totalWeightKg',
                'referenceRollTotalWeightKg',
                'base',
                'height',
            ] as const) {
                options.setValue(field, '');
            }
        },
    );

    const refreshSuppliers = () => {
        suppliers.updateSearch('');
        return suppliers.refresh();
    };

    return {
        lookups,
        selectedSupplier,
        selectedTemplate,
        usesMeasurements,
        refreshSuppliers,
        searchLookup: (field: InventoryField, search: string) =>
            lookupByField[field]?.updateSearch(search),
        loadMore: (field: InventoryField) => lookupByField[field]?.loadMore(),
        retryLookup: (field: InventoryField) => lookupByField[field]?.retry(),
    };
};
