import { computed } from 'vue';
import { useForm } from 'vee-validate';
import { useFormInteraction } from '../../../shared/composables/useFormInteraction.js';
import { useRecordSave } from '../../../shared/composables/useRecordSave.js';
import { issueService } from '../services/issueService.js';
import { createInitialIssueValues, createIssueValidationSchema } from '../issueForm.js';
import { isIssueWriteTarget } from '../issueRules.js';
import { mapIssueFormToRequest } from '../mappers/issueRequestMapper.js';
import { addIssueDetail, updateIssueDetailSupply } from '../issueDetails.js';
import { useIssueHeaderSelection } from './useIssueHeaderSelection.js';
import type { IssueResource, IssueTarget, IssueValues, IssueField, IssueDetail } from '../issue.js';
import type { MutationConfirmation } from '../../../shared/http/recordContract.js';

export const useIssueEditor = (options: {
    resource: IssueResource;
    target: IssueTarget;
    has: (permission: string) => boolean;
    onSaved: (result: MutationConfirmation) => void;
    onDenied: (status: number) => void;
}) => {
    const { mode, document } = options.target;
    const isReadOnly = mode === 'view' || mode === 'return';
    const canEditHeader = ['create', 'edit', 'header'].includes(mode);
    const canEditDetails = mode === 'create' || mode === 'edit';
    const validationSchema = createIssueValidationSchema({
        resource: options.resource,
        mode,
        getValues: () => form.values,
    });
    const form = useForm<IssueValues>({
        initialValues: createInitialIssueValues(document),
        validateOnMount: false,
        validationSchema,
    });
    for (const field of Object.keys(validationSchema) as IssueField[])
        form.defineField(field, { validateOnModelUpdate: false });
    const save = useRecordSave({
        setErrors: form.setErrors,
        onSaved: options.onSaved,
        onDenied: options.onDenied,
    });
    const isSubmitting = computed(() => form.isSubmitting.value || save.isSubmitting.value);

    const isDisabled = () =>
        isReadOnly || isSubmitting.value || save.isConflicted.value || save.isDisposed();

    const interaction = useFormInteraction<IssueField, string | IssueDetail[]>(form, {
        isDisabled,
        onChange: () => {
            save.message.value = '';
        },
    });
    const headerSelection = useIssueHeaderSelection({
        resource: options.resource,
        has: options.has,
        selectClient: (id) => interaction.update('clientId', id),
        values: form.values,
        document,
        isEnabled: () => canEditHeader && !isDisabled(),
        setHeaderField: (field, value) => form.setFieldValue(field, value, false),
    });

    const addDetail = (line: IssueDetail) => {
        if (canEditDetails)
            interaction.update('details', addIssueDetail(form.values.details, line));
    };

    const removeDetail = (id: string) => {
        if (canEditDetails)
            interaction.update(
                'details',
                form.values.details.filter((row) => row.id !== id || row.isOriginallySupplied),
            );
    };

    const updateDetailSupply = (
        id: string,
        changes: Partial<Pick<IssueDetail, 'isSupplied' | 'projectConvertedQuantity'>>,
    ) => {
        if (mode !== 'supply') return;

        interaction.update('details', updateIssueDetailSupply(form.values.details, id, changes));
    };

    const submitValidated = form.handleSubmit((values) => {
        const target = options.target;
        if (!isIssueWriteTarget(target)) return;

        return save.execute((signal) =>
            issueService.save({
                resource: options.resource,
                target,
                payload: mapIssueFormToRequest(values, options.resource, target.mode),
                signal,
            }),
        );
    });

    const submit = () => {
        if (!isDisabled()) return submitValidated();
    };

    return {
        ...save,
        ...interaction,
        values: form.values,
        errors: form.errors,
        isSubmitting,
        isReadOnly,
        canEditHeader,
        canEditDetails,
        headerSelection,
        addDetail,
        removeDetail,
        updateDetailSupply,
        submit,
    };
};
