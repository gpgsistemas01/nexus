import { useForm } from 'vee-validate';
import { createCatalogValidation } from '@nexus/form-validation';
import { useFormInteraction } from '../../../shared/composables/useFormInteraction.js';
import { useRecordSave } from '../../../shared/composables/useRecordSave.js';
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

    const save = useRecordSave({
        ...options,
        setErrors: form.setErrors,
        errorMessage: 'No se pudo guardar el catálogo.',
    });
    const { update, blur } = useFormInteraction<CatalogField, string | boolean>(form, {
        isDisabled: () =>
            form.isSubmitting.value ||
            save.isSubmitting.value ||
            save.isConflicted.value ||
            save.isDisposed(),
        onChange: () => {
            save.message.value = '';
        },
    });
    const submitValidated = form.handleSubmit((values) =>
        save.execute((signal) =>
            catalogService.save(
                catalog,
                target,
                buildCatalogPayload(catalog, target, values),
                signal,
            ),
        ),
    );

    const submit = () => {
        if (!form.isSubmitting.value && !save.isConflicted.value) return submitValidated();
    };

    return {
        values: form.values,
        errors: form.errors,
        ...save,
        isSubmitting: form.isSubmitting,
        update,
        blur,
        submit,
    };
};
