import { useForm } from 'vee-validate';
import { clientValidation, supplierValidation } from '@nexus/form-validation';
import { useRecordForm } from '../../../shared/composables/useRecordForm.js';
import { directoryPayload } from '../directory.js';
import { directoryService } from '../services/directoryService.js';
import type {
    DirectoryResource,
    DirectoryTarget,
    DirectoryField,
    DirectoryValues,
    DirectoryEntry,
} from '../directory.js';

export const useDirectoryEditor = (options: {
    resource: DirectoryResource;
    target: DirectoryTarget;
    onSaved: (entry?: DirectoryEntry) => void;
    onDenied: (status: number) => void;
}) => {
    const row = options.target.action === 'edit' ? options.target.row : undefined;
    const initialName =
        options.target.action === 'create' ? (options.target.initialName ?? '') : '';
    const rules = options.resource === 'clients' ? clientValidation : supplierValidation;
    const form = useForm<DirectoryValues>({
        initialValues: {
            name: row?.name ?? (options.resource === 'clients' ? initialName : ''),
            legalName: row?.legalName ?? '',
            tradeName: row?.tradeName ?? (options.resource === 'suppliers' ? initialName : ''),
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
    const record = useRecordForm(form, {
        onSaved: options.onSaved,
        onDenied: options.onDenied,
    });
    const submit = record.handleSubmit((values, signal) =>
        directoryService.save(
            options.resource,
            options.target,
            directoryPayload(options.resource, options.target, values),
            signal,
        ),
    );

    return { values: form.values, errors: form.errors, ...record, submit };
};
