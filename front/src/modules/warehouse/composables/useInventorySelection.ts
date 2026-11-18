import { isPerPieceMeasure, isFixedUnitPresentation } from '@nexus/waste-measurements';
import { useRemoteLookup } from '../../../shared/composables/useRemoteLookup.js';
import { materialCatalogService } from '../../../shared/services/materialCatalogService.js';
import { isRecord } from '../../../shared/utils/isRecord.js';
import { computed, watch } from 'vue';
import type { Ref } from 'vue';
import { useSelectedOption } from '../../../shared/composables/useSelectedOption.js';
import { getLookupPresentation } from '../../../shared/utils/getLookupPresentation.js';
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
    creationContext?: 'goodsReceipt';
    setValue: (field: InventoryField, value: string) => void;
    clearError: (field: InventoryField) => void;
}) => {
    const { resource, target, values, isPending } = options;
    const isCreating = target.action === 'create';
    const selectsArticle =
        isCreating && resource !== 'wastes' && options.creationContext !== 'goodsReceipt';
    const articles = useRemoteLookup(
        (search, page, signal) =>
            materialCatalogService.list(
                resource === 'consumables' ? 'consumables' : 'materials',
                { search, page },
                signal,
            ),
        computed(() => selectsArticle),
    );
    const selectedArticle = useSelectedOption(articles.items, () => String(values.materialId));
    const supplierId = computed(() => String(values.supplierId));
    const suppliers = useRemoteOptions(
        'suppliers',
        computed(() => isCreating && !isPending.value && !options.initialSupplier),
    );
    const presentations = useRemoteOptions(
        'presentations',
        computed(() => isCreating && resource !== 'wastes' && !selectsArticle),
    );
    const units = useRemoteOptions(
        'unit-measures',
        computed(() => isCreating && resource !== 'wastes' && !selectsArticle),
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
    const selectedPresentation = useSelectedOption(presentations.items, () =>
        String(values.presentationId),
    );
    const presentationName = computed(() => {
        if (!isCreating) return target.row?.presentation ?? '';

        if (selectsArticle) {
            const data = selectedArticle.value?.data.material;
            return isRecord(data) && isRecord(data.presentation)
                ? String(data.presentation.name ?? '')
                : '';
        }

        if (resource !== 'wastes') return String(selectedPresentation.value?.data.name ?? '');

        return getLookupPresentation(selectedTemplate.value);
    });
    const lookupMap = {
        supplierId: suppliers,
        presentationId: presentations,
        unitMeasureId: units,
        materialId: selectsArticle ? articles : templates,
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
            resource !== 'wastes' &&
            (isFixedUnitPresentation(
                isCreating ? selectedPresentation.value?.data : { name: target.row?.presentation },
            ) ||
                (isCreating
                    ? unitUsesMeasurements(selectedUnit.value?.data)
                    : unitUsesMeasurements({
                          symbol: target.row?.unitMeasure,
                          name: target.row?.unitMeasure,
                      }))),
    );
    watch(selectedUnit, (unit) => {
        if (
            resource === 'wastes' ||
            !isCreating ||
            !unit ||
            isFixedUnitPresentation(selectedPresentation.value?.data)
        )
            return;

        if (resource === 'consumables') return;

        if (isPerPieceMeasure(unit.data)) {
            options.setValue('base', '1');

            options.clearError('base');
            return;
        }

        if (unitUsesMeasurements(unit.data)) return;

        for (const field of ['base', 'height'] as const) {
            options.setValue(field, '');
            options.clearError(field);
        }
    });
    watch(selectedPresentation, (presentation, previous) => {
        if (resource === 'wastes' || !isCreating) return;

        if (isFixedUnitPresentation(presentation?.data)) {
            for (const field of ['base', 'height'] as const) {
                options.setValue(field, '1');
                options.clearError(field);
            }
        } else if (isFixedUnitPresentation(previous?.data)) {
            for (const field of ['base', 'height'] as const) {
                options.setValue(field, '');
                options.clearError(field);
            }
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

    watch(selectedArticle, (article) => {
        if (!selectsArticle || isPending.value) return;

        const material = article?.data.material;
        const data = isRecord(material) ? material : {};

        for (const field of [
            'name',
            'presentationId',
            'unitMeasureId',
            'base',
            'height',
            'minStock',
        ] as const) {
            options.setValue(field, String(data[field] ?? ''));
        }
    });

    const selectCreatedArticle = (article: LookupItem) => {
        selectedArticle.value = article;
        options.setValue('materialId', article.id);
        void articles.refresh();
    };

    const refreshSuppliers = () => {
        suppliers.updateSearch('');
        return suppliers.refresh();
    };

    return {
        lookups,
        selectsArticle,
        selectedArticle,
        selectCreatedArticle,
        selectedSupplier,
        selectedTemplate,
        presentationName,
        usesMeasurements,
        isPerPiece: computed(() =>
            isFixedUnitPresentation(
                isCreating ? selectedPresentation.value?.data : { name: target.row?.presentation },
            ),
        ),
        refreshSuppliers,
        searchLookup: (field: InventoryField, search: string) =>
            lookupByField[field]?.updateSearch(search),
        loadMore: (field: InventoryField) => lookupByField[field]?.loadMore(),
        retryLookup: (field: InventoryField) => lookupByField[field]?.retry(),
    };
};
