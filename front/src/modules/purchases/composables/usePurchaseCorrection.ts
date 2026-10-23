import { computed } from 'vue';
import { useForm } from 'vee-validate';
import { goodsReceiptCorrectionValidation } from '@nexus/form-validation';
import { useFormInteraction } from '../../../shared/composables/useFormInteraction.js';
import { useRecordSave } from '../../../shared/composables/useRecordSave.js';
import { confirmAction } from '../../../shared/ui/feedback.js';
import { calculatePurchaseCorrectionTotals } from '../purchaseCalculations.js';
import { purchaseService } from '../services/purchaseService.js';
import type { PurchaseResource, PurchaseDetail, PurchaseDocument } from '../purchase.js';
import type { MutationConfirmation } from '../../../shared/http/recordContract.js';

export const usePurchaseCorrection = (options: {
    resource: PurchaseResource;
    document: PurchaseDocument;
    detail: PurchaseDetail;
    onSaved: (confirmation: MutationConfirmation) => void;
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
    const totals = computed(() =>
        calculatePurchaseCorrectionTotals(options.document, options.detail, form.values),
    );
    const validated = form.handleSubmit(async (values) => {
        if (
            Number(values.quantity) === Number(options.detail.quantity) &&
            Number(values.costPerUnitType) === Number(options.detail.costPerUnitType)
        ) {
            save.message.value = 'Debe modificar la cantidad o el costo para corregir el detalle.';
            return;
        }

        const confirmed = await confirmAction({
            title: '¿Corregir detalle de compra?',
            description:
                'Revisa los nuevos totales estimados en el formulario. Se guardará la corrección y se ajustará inventario automáticamente.',
            confirmLabel: 'Corregir detalle',
            signal: save.signal,
        });
        if (!confirmed || save.isDisposed()) return;

        return save.execute((signal) =>
            purchaseService.changeDetail({
                resource: options.resource,
                documentId: options.document.id,
                detailId: options.detail.id,
                change: {
                    action: 'correct',
                    quantity: Number(values.quantity),
                    costPerUnitType: Number(values.costPerUnitType),
                },
                signal,
            }),
        );
    });

    const submit = () => {
        if (!isSubmitting.value && !save.isDisposed()) return validated();
    };

    return {
        ...save,
        ...interaction,
        values: form.values,
        totals,
        errors: form.errors,
        isSubmitting,
        submit,
    };
};
