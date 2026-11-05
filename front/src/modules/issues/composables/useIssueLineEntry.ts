import { computed } from 'vue';
import { useForm } from 'vee-validate';
import {
    addGoodsIssueMaterialValidation,
    addWasteIssueDetailValidation,
} from '@nexus/form-validation';
import { useRemoteLookup } from '../../../shared/composables/useRemoteLookup.js';
import { useSelectedOption } from '../../../shared/composables/useSelectedOption.js';
import { useFormInteraction } from '../../../shared/composables/useFormInteraction.js';
import { issueLookupService } from '../services/issueLookupService.js';
import { createIssueDetailDraft } from '../issueDetails.js';
import type { IssueResource, IssueDetail } from '../issue.js';

export const useIssueLineEntry = (options: {
    resource: IssueResource;
    isDisabled: () => boolean;
    canRead: () => boolean;
    onAdd: (line: IssueDetail) => void;
}) => {
    const isEnabled = computed(() => options.canRead() && !options.isDisabled());
    const items = useRemoteLookup(
        (search, page, signal) =>
            issueLookupService.list(
                { kind: 'items', resource: options.resource, search, page },
                signal,
            ),
        isEnabled,
    );
    const form = useForm({
        initialValues: { itemId: '', quantity: '' },
        validateOnMount: false,
        validationSchema: {
            itemId: () =>
                (selected.value && !selected.value.isDisabled) || 'Seleccione un artículo activo.',
            quantity: (value: string) =>
                (options.resource === 'wastes'
                    ? addWasteIssueDetailValidation.quantity(value)
                    : addGoodsIssueMaterialValidation.quantity(value)) || true,
        },
    });
    form.defineField('itemId', { validateOnModelUpdate: false });
    form.defineField('quantity', { validateOnModelUpdate: false });
    const selected = useSelectedOption(items.items, () => form.values.itemId);
    const interaction = useFormInteraction(form, {
        isDisabled: () => !isEnabled.value,
        onChange: () => {},
    });
    const validated = form.handleSubmit((values) => {
        if (!isEnabled.value || !selected.value || selected.value.isDisabled) return;

        options.onAdd(
            createIssueDetailDraft(selected.value, Number(values.quantity), options.resource),
        );
        form.resetForm();
        items.updateSearch('');
    });

    const add = () => {
        if (isEnabled.value) return validated();
    };

    return { ...interaction, values: form.values, errors: form.errors, selected, items, add };
};
