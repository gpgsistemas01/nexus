import { useForm } from 'vee-validate';
import { clientValidation, supplierValidation } from '@nexus/form-validation';
import { useFormInteraction } from '../../../shared/composables/useFormInteraction.js';
import { useRecordSave } from '../../../shared/composables/useRecordSave.js';
import { directoryPayload } from '../directory.js';
import { directoryService } from '../services/directoryService.js';
import type {
    DirectoryResource,
    DirectoryTarget,
    DirectoryField,
    DirectoryValues,
} from '../directory.js';

export const useDirectoryEditor = (options: {
    resource: DirectoryResource;
    target: DirectoryTarget;
    onSaved: () => void;
    onDenied: (status: number) => void;
}) => {
    const row = options.target.action === 'edit' ? options.target.row : undefined;
    const rules = options.resource === 'clients' ? clientValidation : supplierValidation;
    const form = useForm<DirectoryValues>({
        initialValues: {
            name: row?.name ?? '',
            legalName: row?.legalName ?? '',
            tradeName: row?.tradeName ?? '',
            isActive: row?.isActive ?? true,
        },
        validateOnMount: false,
        validationSchema: Object.fromEntries(
            Object.entries(rules).map(([field, rule]) => [
                field,
                (value: unknown) => rule(value) || true,
            ]),
        ),
    });
    for (const field of Object.keys(rules) as DirectoryField[])
        form.defineField(field, { validateOnModelUpdate: false });
    const save = useRecordSave({ ...options, setErrors: form.setErrors });
    const interaction = useFormInteraction<DirectoryField, string | boolean>(form, {
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
            directoryService.save(
                options.resource,
                options.target,
                directoryPayload(options.resource, options.target, values),
                signal,
            ),
        ),
    );

    const submit = () => {
        if (!form.isSubmitting.value && !save.isConflicted.value) return submitValidated();
    };

    return { values: form.values, errors: form.errors, ...save, ...interaction, submit };
};
