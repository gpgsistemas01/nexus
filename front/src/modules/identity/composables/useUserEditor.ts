import { useForm } from 'vee-validate';
import { userValidation, userEditValidation, userPasswordValidation } from '@nexus/form-validation';
import { useRecordForm } from '../../../shared/composables/useRecordForm.js';
import { useOrganizationOptions } from '../../../shared/composables/useOrganizationOptions.js';
import { identityService } from '../services/identityService.js';
import { userPayload } from '../identity.js';
import type { UserField, UserValues, IdentityTarget } from '../identity.js';

export const useUserEditor = (options: {
    target: IdentityTarget;
    permissions: readonly string[];
    onSaved: () => void;
    onDenied: (status: number) => void;
}) => {
    const row = options.target.action !== 'create' ? options.target.row : undefined;
    const rules =
        options.target.action === 'password'
            ? userPasswordValidation
            : options.target.action === 'create'
              ? userValidation
              : userEditValidation;
    const form = useForm<UserValues>({
        initialValues: {
            name: row?.name ?? '',
            password: '',
            departmentId: row?.departmentId ?? '',
            roleId: row?.roleId ?? '',
        },
        validateOnMount: false,
        validationSchema: Object.fromEntries(
            Object.entries(rules).map(([field, rule]) => [
                field,
                (value: unknown) => rule(value) || true,
            ]),
        ),
    });
    for (const field of Object.keys(rules) as UserField[])
        form.defineField(field, { validateOnModelUpdate: false });
    const record = useRecordForm(form, {
        onSaved: options.onSaved,
        onDenied: options.onDenied,
    });
    const organization = useOrganizationOptions(
        options.target.action === 'password' ? [] : options.permissions,
    );
    const submit = record.handleSubmit((values, signal) =>
        identityService.save('users', options.target, userPayload(options.target, values), signal),
    );

    return {
        values: form.values,
        errors: form.errors,
        ...record,
        organization,
        submit,
    };
};
