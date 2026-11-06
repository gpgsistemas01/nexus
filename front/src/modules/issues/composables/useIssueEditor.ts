import { useForm } from 'vee-validate';
import { useRecordForm } from '../../../shared/composables/useRecordForm.js';
import { issueService } from '../services/issueService.js';
import { createInitialIssueValues, createIssueValidationSchema } from '../issueForm.js';
import { isIssueWriteTarget } from '../issueRules.js';
import { mapIssueFormToRequest } from '../mappers/issueRequestMapper.js';
import { addIssueDetail, updateIssueDetailSupply } from '../issueDetails.js';
import { useIssueHeaderSelection } from './useIssueHeaderSelection.js';
import type {
    IssueResource,
    IssueTarget,
    IssueValues,
    IssueField,
    IssueDetail,
    IssueSupplyChanges,
} from '../issue.js';
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
    const record = useRecordForm(form, {
        onSaved: options.onSaved,
        onDenied: options.onDenied,
        isReadOnly: () => isReadOnly,
    });
    const headerSelection = useIssueHeaderSelection({
        resource: options.resource,
        has: options.has,
        selectClient: (id) => record.update('clientId', id),
        values: form.values,
        document,
        isEnabled: () => canEditHeader && !record.isDisabled(),
        setHeaderField: (field, value) => form.setFieldValue(field, value, false),
    });

    const addDetail = (line: IssueDetail) => {
        if (canEditDetails) record.update('details', addIssueDetail(form.values.details, line));
    };

    const removeDetail = (id: string) => {
        if (canEditDetails)
            record.update(
                'details',
                form.values.details.filter(
                    (row) => row.id !== id || row.isOriginallySupplied || row.isCanceled,
                ),
            );
    };

    const updateDetailSupply = (id: string, changes: IssueSupplyChanges) => {
        if (mode !== 'supply') return;

        record.update('details', updateIssueDetailSupply(form.values.details, id, changes));
    };

    const target = options.target;
    const submit = isIssueWriteTarget(target)
        ? record.handleSubmit((values, signal) =>
              issueService.save({
                  resource: options.resource,
                  target,
                  payload: mapIssueFormToRequest(values, options.resource, target.mode),
                  signal,
              }),
          )
        : () => undefined;

    return {
        ...record,
        values: form.values,
        errors: form.errors,
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
