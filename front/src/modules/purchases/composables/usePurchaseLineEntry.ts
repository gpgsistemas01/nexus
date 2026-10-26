import { computed, onBeforeUnmount } from 'vue';
import { useForm } from 'vee-validate';
import { addGoodsReceiptMaterialValidation } from '@nexus/form-validation';
import { useFormInteraction } from '../../../shared/composables/useFormInteraction.js';
import { useRemoteLookup } from '../../../shared/composables/useRemoteLookup.js';
import { useSelectedOption } from '../../../shared/composables/useSelectedOption.js';
import type { LookupItem } from '../../../shared/lookup.js';
import { purchaseLookupService } from '../services/purchaseLookupService.js';
import { createPurchaseDetailDraft } from '../purchaseDetails.js';
import type { PurchaseResource, PurchaseDetail } from '../purchase.js';

export const usePurchaseLineEntry = (options: {
    resource: PurchaseResource;
    supplier: LookupItem;
    canRead: boolean;
    isDisabled: () => boolean;
    onAdded: (line: PurchaseDetail) => void;
}) => {
    type Field = 'materialId' | 'quantity' | 'costPerUnitType';
    let isDisposed = false;
    onBeforeUnmount(() => {
        isDisposed = true;
    });
    const rules = addGoodsReceiptMaterialValidation;
    const form = useForm<Record<Field, string>>({
        initialValues: { materialId: '', quantity: '', costPerUnitType: '' },
        validateOnMount: false,
        validationSchema: Object.fromEntries(
            Object.entries(rules).map(([field, rule]) => [
                field,
                (value: unknown) => rule(value) || true,
            ]),
        ),
    });
    for (const field of Object.keys(rules) as Field[])
        form.defineField(field, { validateOnModelUpdate: false });
    const items = useRemoteLookup(
        (search, page, signal) =>
            purchaseLookupService.list('items', options.resource, search, page, signal, {
                supplierId: options.supplier.id,
            }),
        computed(() => options.canRead),
    );
    const item = useSelectedOption(items.items, () => form.values.materialId);
    const interaction = useFormInteraction<Field, string>(form, {
        isDisabled: () =>
            !options.canRead || options.isDisabled() || isDisposed || form.isSubmitting.value,
        onChange: () => {},
    });

    const selectCreatedItem = (created: LookupItem) => {
        if (options.isDisabled() || isDisposed) return;

        if (created.isDisabled) {
            form.setFieldError(
                'materialId',
                'El artículo se registró como inactivo. Actívalo antes de agregarlo a una compra.',
            );
            void items.refresh();
            return;
        }

        item.value = created;
        interaction.update('materialId', created.id);
        items.updateSearch('');
        void items.refresh();
    };

    const validated = form.handleSubmit((values) => {
        if (options.isDisabled() || isDisposed || !item.value || item.value.isDisabled) return;

        options.onAdded(
            createPurchaseDetailDraft(
                item.value,
                Number(values.quantity),
                Number(values.costPerUnitType),
            ),
        );
        form.resetForm();
        items.updateSearch('');
    });

    const add = () => {
        if (options.canRead && !options.isDisabled() && !isDisposed && !form.isSubmitting.value)
            return validated();
    };

    return {
        ...interaction,
        values: form.values,
        errors: form.errors,
        items,
        item,
        selectCreatedItem,
        add,
    };
};
