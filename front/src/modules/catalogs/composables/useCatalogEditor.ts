import { useForm } from 'vee-validate';
import { createCatalogValidation } from '@nexus/form-validation';
import { useRecordForm } from '../../../shared/composables/useRecordForm.js';
import { buildCatalogPayload, catalogDefinition } from '../catalog.js';
import { catalogService } from '../services/catalogService.js';
import type { CatalogField, CatalogName, CatalogTarget, CatalogValues } from '../catalog.js';

export const useCatalogEditor = (options: {
    catalog: CatalogName;
    target: CatalogTarget;
    onSaved: () => void;
    onDenied: (status: number) => void;
}) => {
    const { catalog, target } = options;
    const definition = catalogDefinition(catalog);
    const row = target.action === 'edit' ? target.row : undefined;
    const rules = createCatalogValidation({
        entityLabel: definition.entityLabel,
        nameMaxLength: definition.maxLengths.name,
        symbolMaxLength: definition.maxLengths.symbol ?? 0,
    });
    const form = useForm<CatalogValues>({
        initialValues: {
            name: row?.name ?? '',
            symbol: row?.symbol ?? '',
            isActive: row?.isActive ?? true,
        },
        validationSchema: Object.fromEntries(
            Object.entries(rules).map(([field, rule]) => [
                field,
                (value: unknown) => rule(value) || true,
            ]),
        ),
        validateOnMount: false,
    });

    for (const field of Object.keys(rules) as CatalogField[]) {
        form.defineField(field, { validateOnModelUpdate: false });
    }

    const record = useRecordForm(form, {
        onSaved: options.onSaved,
        onDenied: options.onDenied,
        errorMessage: 'No se pudo guardar el catálogo.',
    });
    const submit = record.handleSubmit((values, signal) =>
        catalogService.save(catalog, target, buildCatalogPayload(catalog, target, values), signal),
    );

    return {
        values: form.values,
        errors: form.errors,
        ...record,
        submit,
    };
};
