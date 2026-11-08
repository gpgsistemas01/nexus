import { useForm } from 'vee-validate';
import { issueReturnValidation } from '@nexus/form-validation';
import { getPieceQuantityError } from '@nexus/piece-quantity';
import { useRecordForm } from '../../../shared/composables/useRecordForm.js';
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
        initialValues: { returnQuantity: '', observations: '', physicalReturnConfirmed: false },
        validateOnMount: false,
        validationSchema: {
            returnQuantity: (value: string) =>
                issueReturnValidation.returnQuantity(value) ||
                getPieceQuantityError(value, options.detail.presentation) ||
                (Number(value) > availableQuantity
                    ? 'La cantidad no puede exceder lo disponible para devolver.'
                    : true),
            observations: (value: string) => issueReturnValidation.observations(value) || true,
            physicalReturnConfirmed: (value: boolean) =>
                !options.document.historicalDelivery ||
                value === true ||
                'Confirma la entrada física actual al almacén.',
        },
    });
    form.defineField('returnQuantity', { validateOnModelUpdate: false });
    form.defineField('observations', { validateOnModelUpdate: false });
    form.defineField('physicalReturnConfirmed', { validateOnModelUpdate: false });
    const record = useRecordForm(form, {
        onSaved: options.onSaved,
        onDenied: options.onDenied,
    });
    const submit = record.handleSubmit((values, signal) =>
        issueService.returnDetail({
            resource: options.resource,
            documentId: options.document.id,
            detailId: options.detail.id,
            payload: {
                returnQuantity: Number(values.returnQuantity),
                observations: values.observations.trim(),
                ...(options.document.historicalDelivery && {
                    physicalReturnConfirmed: values.physicalReturnConfirmed,
                }),
            },
            signal,
        }),
    );

    return {
        ...record,
        values: form.values,
        errors: form.errors,
        availableQuantity,
        submit,
    };
};
