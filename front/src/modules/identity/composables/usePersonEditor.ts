import { ref } from 'vue';
import { useForm } from 'vee-validate';
import { personValidation, personAccessValidation } from '@nexus/form-validation';
import { useRecordForm } from '../../../shared/composables/useRecordForm.js';
import { useOrganizationOptions } from '../../../shared/composables/useOrganizationOptions.js';
import { useSelectedOption } from '../../../shared/composables/useSelectedOption.js';
import { identityService } from '../services/identityService.js';
import { personPayload } from '../identity.js';
import type { PersonValues, PersonTarget } from '../identity.js';

export const usePersonEditor = (options: {
    target: PersonTarget;
    permissions: readonly string[];
    onSaved: () => void;
    onDenied: (status: number) => void;
}) => {
    const row = options.target.action !== 'create' ? options.target.row : undefined;
    const form = useForm<PersonValues>({
        initialValues: {
            fullName: row?.name ?? '',
            accesses: row?.accesses.map((access) => ({ ...access })) ?? [],
        },
        validationSchema: {
            fullName: (value: unknown) => personValidation.fullName(value) || true,
            accesses: (value: unknown) => personValidation.accesses(value) || true,
        },
        validateOnMount: false,
    });
    form.defineField('fullName', { validateOnModelUpdate: false });
    form.defineField('accesses', { validateOnModelUpdate: false });
    const record = useRecordForm(form, {
        onSaved: options.onSaved,
        onDenied: options.onDenied,
        setErrors: (errors) => {
            form.setErrors({
                fullName: errors.fullName,
                accesses: Object.entries(errors).find(([field]) =>
                    field.startsWith('accesses'),
                )?.[1],
            });
        },
    });

    const { isDisabled, message } = record;
    const organization = useOrganizationOptions(options.permissions);
    const departmentId = ref('');
    const roleId = ref('');
    const selectedDepartment = useSelectedOption(
        organization.departments.items,
        () => departmentId.value,
    );
    const selectedRole = useSelectedOption(organization.roles.items, () => roleId.value);
    const accessError = ref('');

    const addAccess = async () => {
        if (isDisabled()) return;

        accessError.value =
            personAccessValidation.departmentId(departmentId.value, {
                accesses: form.values.accesses,
            }) ||
            personAccessValidation.roleId(roleId.value) ||
            '';
        if (accessError.value) return;

        const department = selectedDepartment.value;
        const role = selectedRole.value;

        if (!department || !role) {
            accessError.value = 'Selecciona un área y un rol de las opciones disponibles.';
            return;
        }

        form.setFieldValue(
            'accesses',
            [
                ...form.values.accesses,
                {
                    departmentId: department.id,
                    roleId: role.id,
                    departmentName: department.title,
                    roleName: role.title,
                },
            ],
            false,
        );
        departmentId.value = '';
        roleId.value = '';
        message.value = '';
        await form.validateField('accesses');
    };

    const removeAccess = async (id: string) => {
        if (isDisabled()) return;

        form.setFieldValue(
            'accesses',
            form.values.accesses.filter((access) => access.departmentId !== id),
            false,
        );
        accessError.value = '';
        message.value = '';
        await form.validateField('accesses');
    };

    const submit = record.handleSubmit((values, signal) =>
        identityService.save(
            'persons',
            options.target,
            personPayload(options.target, values),
            signal,
        ),
    );

    return {
        values: form.values,
        errors: form.errors,
        ...record,
        organization,
        departmentId,
        roleId,
        accessError,
        addAccess,
        removeAccess,
        submit,
    };
};
