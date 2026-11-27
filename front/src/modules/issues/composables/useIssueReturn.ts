import { shallowRef } from 'vue';
import { useForm } from 'vee-validate';
import { issueReturnValidation } from '@nexus/form-validation';
import { getPieceQuantityError } from '@nexus/piece-quantity';
import { useRecordForm } from '../../../shared/composables/useRecordForm.js';
import { issueService } from '../services/issueService.js';
import { getIssueReturnableQuantity } from '../issueRules.js';
import type { IssueResource, IssueDocument, IssueDetail } from '../issue.js';
import type { MutationConfirmation } from '../../../shared/http/recordContract.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { isRecord } from '../../../shared/utils/isRecord.js';

export interface IssueReturnSource {
    id: string;
    date: string | null;
    quantity: number;
}

const isIssueReturnSource = (value: unknown): value is IssueReturnSource =>
    isRecord(value) &&
    typeof value.id === 'string' &&
    (value.date === null || typeof value.date === 'string') &&
    typeof value.quantity === 'number';

export const useIssueReturn = (options: {
    resource: IssueResource;
    document: IssueDocument;
    detail: IssueDetail;
    onSaved: (result: MutationConfirmation) => void;
    onDenied: (status: number) => void;
}) => {
    const availableQuantity = getIssueReturnableQuantity(options.detail);
    const sources = shallowRef<IssueReturnSource[]>([]);
    const form = useForm({
        initialValues: {
            returnQuantity: '',
            observations: '',
            physicalReturnConfirmed: false,
            sourceMovementDetailId: '',
        },
        validateOnMount: false,
        validationSchema: {
            returnQuantity: (value: string) =>
                issueReturnValidation.returnQuantity(value) ||
                getPieceQuantityError(value, options.detail.presentation) ||
                (Number(value) > availableQuantity
                    ? 'La cantidad no puede exceder lo disponible para devolver.'
                    : true),
            observations: (value: string) => issueReturnValidation.observations(value) || true,
            sourceMovementDetailId: (value: string) =>
                !sources.value.length ||
                sources.value.some(({ id }) => id === value) ||
                'Selecciona el surtido de origen.',
            physicalReturnConfirmed: (value: boolean) =>
                !options.document.historicalDelivery ||
                value === true ||
                'Confirma la entrada física actual al almacén.',
        },
    });
    form.defineField('returnQuantity', { validateOnModelUpdate: false });
    form.defineField('observations', { validateOnModelUpdate: false });
    form.defineField('physicalReturnConfirmed', { validateOnModelUpdate: false });
    form.defineField('sourceMovementDetailId', { validateOnModelUpdate: false });
    const record = useRecordForm(form, {
        onSaved: options.onSaved,
        onDenied: options.onDenied,
    });
    const submit = record.handleSubmit(async (values, signal) => {
        try {
            return await issueService.returnDetail({
                resource: options.resource,
                documentId: options.document.id,
                detailId: options.detail.id,
                payload: {
                    returnQuantity: Number(values.returnQuantity),
                    observations: values.observations.trim(),
                    ...(options.document.historicalDelivery && {
                        physicalReturnConfirmed: values.physicalReturnConfirmed,
                    }),
                    ...(values.sourceMovementDetailId && {
                        sourceMovementDetailId: values.sourceMovementDetailId,
                    }),
                },
                signal,
            });
        } catch (error) {
            if (
                error instanceof ApiError &&
                error.code === 'ISSUE_RETURN_COST_SOURCE_REQUIRED' &&
                Array.isArray(error.meta.sources)
            ) {
                sources.value = error.meta.sources.filter(isIssueReturnSource);
                if (!sources.value.some(({ id }) => id === values.sourceMovementDetailId))
                    form.setFieldValue('sourceMovementDetailId', '', false);
            }

            throw error;
        }
    });

    return {
        ...record,
        values: form.values,
        errors: form.errors,
        sources,
        availableQuantity,
        submit,
    };
};
