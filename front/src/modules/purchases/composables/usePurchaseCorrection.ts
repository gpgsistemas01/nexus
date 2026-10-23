import { computed } from 'vue';
import { useForm } from 'vee-validate';
import { goodsReceiptCorrectionValidation } from '@nexus/form-validation';
import { useFormInteraction } from '../../../shared/composables/useFormInteraction.js';
import { useRecordSave } from '../../../shared/composables/useRecordSave.js';
import { purchaseService } from '../services/purchaseService.js';
import type { PurchaseResource, PurchaseDetail } from '../purchase.js';

export const usePurchaseCorrection = (options: {
    resource: PurchaseResource;
    documentId: string;
    detail: PurchaseDetail;
    onSaved: () => void;
    onDenied: (status: number) => void;
}) => {
    type Field = 'quantity' | 'costPerUnitType';
    const form = useForm<Record<Field, string>>({
        initialValues: {
            quantity: String(options.detail.quantity),
            costPerUnitType: String(options.detail.costPerUnitType),
        },
        validateOnMount: false,
        validationSchema: Object.fromEntries(
            Object.entries(goodsReceiptCorrectionValidation).map(([field, rule]) => [
                field,
                (value: unknown) => rule(value) || true,
            ]),
        ),
    });
    for (const field of ['quantity', 'costPerUnitType'] as const)
        form.defineField(field, { validateOnModelUpdate: false });
    const save = useRecordSave({
        setErrors: form.setErrors,
        onSaved: options.onSaved,
        onDenied: options.onDenied,
    });
    const isSubmitting = computed(() => form.isSubmitting.value || save.isSubmitting.value);
    const interaction = useFormInteraction<Field, string>(form, {
        isDisabled: () => isSubmitting.value || save.isDisposed(),
        onChange: () => {
            save.message.value = '';
        },
    });
    const validated = form.handleSubmit((values) =>
        save.execute((signal) =>
            purchaseService.changeDetail(
                options.resource,
                options.documentId,
                options.detail.id,
                'corrections',
                signal,
                {
                    quantity: Number(values.quantity),
                    costPerUnitType: Number(values.costPerUnitType),
                },
            ),
        ),
    );

    const submit = () => {
        if (!isSubmitting.value && !save.isDisposed()) return validated();
    };

    return {
        ...save,
        ...interaction,
        values: form.values,
        errors: form.errors,
        isSubmitting,
        submit,
    };
};
