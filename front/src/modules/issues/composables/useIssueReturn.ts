import { computed } from 'vue';
import { useForm } from 'vee-validate';
import { issueReturnValidation } from '@nexus/form-validation';
import { useFormInteraction } from '../../../shared/composables/useFormInteraction.js';
import { useRecordSave } from '../../../shared/composables/useRecordSave.js';
import { issueService } from '../services/issueService.js';
import { getIssueReturnableQuantity } from '../issueRules.js';
import type { IssueResource, IssueDocument, IssueDetail } from '../issue.js';
import type { MutationConfirmation } from '../../../shared/http/recordContract.js';

export const useIssueReturn = (options: {
    resource: IssueResource;
    document: IssueDocument;
    detail: IssueDetail;
    onSaved: (result: MutationConfirmation) => void;
    onDenied: (status: number) => void;
}) => {
    const availableQuantity = getIssueReturnableQuantity(options.detail);
    const form = useForm({
        initialValues: { returnQuantity: '', observations: '' },
        validateOnMount: false,
        validationSchema: {
            returnQuantity: (value: string) =>
                issueReturnValidation.returnQuantity(value) ||
                (Number(value) > availableQuantity
                    ? 'La cantidad no puede exceder lo disponible para devolver.'
                    : true),
            observations: (value: string) => issueReturnValidation.observations(value) || true,
        },
    });
    form.defineField('returnQuantity', { validateOnModelUpdate: false });
    form.defineField('observations', { validateOnModelUpdate: false });
    const save = useRecordSave({
        setErrors: form.setErrors,
        onSaved: options.onSaved,
        onDenied: options.onDenied,
    });
    const isSubmitting = computed(() => form.isSubmitting.value || save.isSubmitting.value);

    const isDisabled = () => isSubmitting.value || save.isDisposed();

    const interaction = useFormInteraction(form, {
        isDisabled,
        onChange: () => {
            save.message.value = '';
        },
    });
    const validated = form.handleSubmit((values) =>
        save.execute((signal) =>
            issueService.returnDetail({
                resource: options.resource,
                documentId: options.document.id,
                detailId: options.detail.id,
                payload: {
                    returnQuantity: Number(values.returnQuantity),
                    observations: values.observations.trim(),
                },
                signal,
            }),
        ),
    );

    const submit = () => {
        if (!isDisabled()) return validated();
    };

    return {
        ...save,
        ...interaction,
        values: form.values,
        errors: form.errors,
        isSubmitting,
        availableQuantity,
        submit,
    };
};
