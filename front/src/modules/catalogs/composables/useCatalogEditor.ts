import { onBeforeUnmount, ref } from 'vue';
import { useForm } from 'vee-validate';
import { createCatalogValidation } from '@nexus/catalog-validation';
import { useFormInteraction } from '../../../shared/composables/useFormInteraction.js';
import { ApiError } from '../../../shared/http/apiError.js';
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
    const controller = new AbortController();
    const message = ref('');
    const isConflicted = ref(false);
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

    const { update, blur } = useFormInteraction<CatalogField, string | boolean>(form, {
        isDisabled: () =>
            form.isSubmitting.value || isConflicted.value || controller.signal.aborted,
        onChange: () => {
            message.value = '';
        },
    });
    const submitValidated = form.handleSubmit(async (values) => {
        if (controller.signal.aborted || isConflicted.value) return;

        message.value = '';

        try {
            await catalogService.save(
                catalog,
                target,
                buildCatalogPayload(catalog, target, values),
                controller.signal,
            );
        } catch (cause) {
            if (controller.signal.aborted) return;

            message.value =
                cause instanceof Error ? cause.message : 'No se pudo guardar el catálogo.';

            if (cause instanceof ApiError) {
                form.setErrors(cause.fieldErrors);
                isConflicted.value = cause.code === 'RECORD_VERSION_CONFLICT';
                if ([401, 403].includes(cause.status)) options.onDenied(cause.status);
            }

            return;
        }

        if (!controller.signal.aborted) options.onSaved();
    });

    const submit = () => {
        if (!form.isSubmitting.value && !isConflicted.value) return submitValidated();
    };

    onBeforeUnmount(() => controller.abort());

    return {
        values: form.values,
        errors: form.errors,
        isSubmitting: form.isSubmitting,
        message,
        isConflicted,
        update,
        blur,
        submit,
    };
};
