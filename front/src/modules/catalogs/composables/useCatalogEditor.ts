import { computed, watch } from 'vue';
import { materialCatalogValidation, materialCatalogEditValidation } from '@nexus/form-validation';
import { isFixedUnitPresentation } from '@nexus/waste-measurements';
import { useRemoteLookup } from '../../../shared/composables/useRemoteLookup.js';
import { useSelectedOption } from '../../../shared/composables/useSelectedOption.js';
import { useForm } from 'vee-validate';
import { createCatalogValidation } from '@nexus/form-validation';
import { useRecordForm } from '../../../shared/composables/useRecordForm.js';
import { buildCatalogPayload, catalogDefinition } from '../catalog.js';
import { catalogService } from '../services/catalogService.js';
import type {
    CatalogField,
    CatalogName,
    CatalogTarget,
    CatalogValues,
    CatalogEntry,
} from '../catalog.js';

export const useCatalogEditor = (options: {
    catalog: CatalogName;
    target: CatalogTarget;
    onSaved: (entry: CatalogEntry) => void;
    onDenied: (status: number) => void;
}) => {
    const { catalog, target } = options;
    const definition = catalogDefinition(catalog);
    const row = target.action === 'edit' ? target.row : undefined;
    const canEditIdentity = !row?.hasSuppliers;
    type FormValues = Required<CatalogValues>;
    const rules: Record<string, (value: unknown, values: FormValues) => string | null | undefined> =
        catalog === 'materials'
            ? !canEditIdentity
                ? materialCatalogEditValidation
                : materialCatalogValidation
            : createCatalogValidation({
                  entityLabel: definition.entityLabel,
                  nameMaxLength: definition.maxLengths.name,
                  symbolMaxLength: definition.maxLengths.symbol ?? 0,
              });
    const form = useForm<FormValues>({
        initialValues: {
            name: row?.name ?? (target.action === 'create' ? (target.initialName ?? '') : ''),
            symbol: row?.symbol ?? '',
            isActive: row?.isActive ?? true,
            type:
                row?.type ??
                (target.action === 'create' ? (target.materialType ?? 'MATERIAL') : 'MATERIAL'),
            presentationId: row?.presentationId ?? '',
            unitMeasureId: row?.unitMeasureId ?? '',
            base: row?.base ?? '',
            height: row?.height ?? '',
            minStock: row?.minStock ?? '',
        },
        validationSchema: Object.fromEntries(
            Object.entries(rules).map(([field, rule]) => [
                field,
                (value: unknown) =>
                    rule(value, {
                        ...form.values,
                        base: form.values.base ?? '',
                        height: form.values.height ?? '',
                    }) || true,
            ]),
        ),
        validateOnMount: false,
    });

    for (const field of Object.keys(rules) as CatalogField[]) {
        form.defineField(field, { validateOnModelUpdate: false });
    }

    const lookup = (name: 'presentations' | 'unit-measures') =>
        useRemoteLookup(
            async (search, page, signal) => {
                const result = await catalogService.list(
                    name,
                    { search, page, length: 20 },
                    signal,
                );
                return {
                    ...result,
                    data: result.data.map((entry) => ({
                        id: entry.id,
                        title:
                            name === 'unit-measures'
                                ? `${entry.name} (${entry.symbol})`
                                : entry.name,
                        isDisabled: entry.isActive === false,
                        data: { ...entry },
                    })),
                };
            },
            computed(() => catalog === 'materials' && canEditIdentity),
        );

    const lookups = {
        presentationId: lookup('presentations'),
        unitMeasureId: lookup('unit-measures'),
    };
    const selectedPresentation = useSelectedOption(
        lookups.presentationId.items,
        () => form.values.presentationId ?? '',
        () =>
            row?.presentationId
                ? { id: row.presentationId, title: row.presentation ?? '', data: {} }
                : undefined,
    );
    const selectedUnit = useSelectedOption(
        lookups.unitMeasureId.items,
        () => form.values.unitMeasureId ?? '',
        () =>
            row?.unitMeasureId
                ? {
                      id: row.unitMeasureId,
                      title: `${row.unitMeasure} (${row.unitSymbol})`,
                      data: {},
                  }
                : undefined,
    );
    const fixedMeasurements = computed(
        () =>
            canEditIdentity && isFixedUnitPresentation({ name: selectedPresentation.value?.title }),
    );
    watch(fixedMeasurements, (fixed, previous) => {
        if (fixed || previous) {
            form.setFieldValue('base', fixed ? '1' : '');
            form.setFieldValue('height', fixed ? '1' : '');
        }
    });

    const record = useRecordForm(form, {
        onSaved: options.onSaved,
        onDenied: options.onDenied,
        errorMessage: 'No se pudo guardar el catálogo.',
    });
    const submit = record.handleSubmit((values, signal) =>
        catalogService.save(catalog, target, buildCatalogPayload(catalog, target, values), signal),
    );

    return {
        canEditIdentity,
        lookups,
        selectedPresentation,
        selectedUnit,
        fixedMeasurements,
        values: form.values,
        errors: form.errors,
        ...record,
        submit,
    };
};
