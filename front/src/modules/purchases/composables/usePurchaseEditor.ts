import { computed, shallowRef, watch } from 'vue';
import { useForm } from 'vee-validate';
import { goodsReceiptValidation, goodsReceiptEditValidation } from '@nexus/form-validation';
import { PERMISSIONS } from '@nexus/permissions';
import { useFormInteraction } from '../../../shared/composables/useFormInteraction.js';
import { useRecordSave } from '../../../shared/composables/useRecordSave.js';
import { useRemoteLookup } from '../../../shared/composables/useRemoteLookup.js';
import { useSelectedOption } from '../../../shared/composables/useSelectedOption.js';
import type { LookupItem } from '../../../shared/lookup.js';
import { purchaseService } from '../services/purchaseService.js';
import { purchaseLookupService } from '../services/purchaseLookupService.js';
import { initialPurchaseValues, purchasePayload, purchaseTotals } from '../purchaseForm.js';
import type {
    PurchaseTarget,
    PurchaseField,
    PurchaseValues,
    PurchaseResource,
    PurchaseDetail,
} from '../purchase.js';
import type { MutationConfirmation } from '../../../shared/http/recordContract.js';

export const usePurchaseEditor = (options: {
    resource: PurchaseResource;
    target: PurchaseTarget;
    has: (permission: string) => boolean;
    onSaved: (confirmation: MutationConfirmation) => void;
    onDenied: (status: number) => void;
}) => {
    const document = options.target.action === 'create' ? undefined : options.target.document;
    const isReadOnly = options.target.action === 'view';
    const rules = (document ? goodsReceiptEditValidation : goodsReceiptValidation) as Record<
        string,
        (value: unknown, data: Record<string, unknown>) => string | null
    >;
    const form = useForm<PurchaseValues>({
        initialValues: initialPurchaseValues(document),
        validateOnMount: false,
        validationSchema: computed(() =>
            Object.fromEntries(
                Object.entries(rules).map(([field, rule]) => [
                    field,
                    () => {
                        const payload = purchasePayload(form.values, document);
                        return (
                            rule(
                                field === 'receptionDate'
                                    ? form.values.receptionDate
                                    : payload[field],
                                payload,
                            ) || true
                        );
                    },
                ]),
            ),
        ),
    });
    for (const field of Object.keys(rules) as PurchaseField[])
        form.defineField(field, { validateOnModelUpdate: false });
    const save = useRecordSave({
        setErrors: form.setErrors,
        onSaved: options.onSaved,
        onDenied: options.onDenied,
    });
    const isSubmitting = computed(() => form.isSubmitting.value || save.isSubmitting.value);
    const interaction = useFormInteraction<PurchaseField, string | boolean | PurchaseDetail[]>(
        form,
        {
            isDisabled: () =>
                isReadOnly || isSubmitting.value || save.isConflicted.value || save.isDisposed(),
            onChange: () => {
                save.message.value = '';
            },
        },
    );
    const canSuppliers = computed(() => options.has(PERMISSIONS.SUPPLIERS_READ));
    const canPersons = computed(() => options.has(PERMISSIONS.PERSONS_READ));
    const suppliers = useRemoteLookup(
        (search, page, signal) =>
            purchaseLookupService.list('suppliers', options.resource, search, page, signal, {
                capture: true,
            }),
        computed(() => !document && !isReadOnly && canSuppliers.value),
    );
    const persons = useRemoteLookup(
        (search, page, signal) =>
            purchaseLookupService.list('persons', options.resource, search, page, signal),
        computed(() => !isReadOnly && canPersons.value),
    );
    const supplierSeed = shallowRef<LookupItem | undefined>(
        document ? { id: document.supplierId, title: document.supplierName, data: {} } : undefined,
    );
    const selected = useSelectedOption(suppliers.items, () => form.values.supplierId);
    const supplier = computed(
        () =>
            selected.value ??
            (supplierSeed.value?.id === form.values.supplierId ? supplierSeed.value : undefined),
    );
    const receiverSeed = document
        ? { id: document.receivedById, title: document.receivedByName, data: {} }
        : undefined;
    watch(
        () => form.values.supplierId,
        () => {
            if (document) return;

            form.setFieldValue('details', [], false);
            form.setFieldValue('receivedById', '', false);
            form.setFieldError('details', undefined);
        },
        { flush: 'sync' },
    );

    const selectCreatedSupplier = (item: LookupItem) => {
        if (save.isDisposed() || isReadOnly || document) return;

        if (item.isDisabled) {
            save.message.value =
                'El proveedor se registró como inactivo. Actívalo antes de capturar una compra.';
            void suppliers.refresh();
            return;
        }

        supplierSeed.value = item;
        interaction.update('supplierId', item.id);
        suppliers.updateSearch('');
        void suppliers.refresh();
    };

    const addLine = (line: PurchaseDetail) =>
        interaction.update('details', [...form.values.details, line]);

    const removeLine = (id: string) =>
        interaction.update(
            'details',
            form.values.details.filter((row) => row.id !== id),
        );

    const totals = computed(() =>
        purchaseTotals([...(document?.details ?? []), ...form.values.details]),
    );
    const submitValidated = form.handleSubmit((values) =>
        save.execute((signal) =>
            purchaseService.save(
                options.resource,
                purchasePayload(values, document),
                signal,
                document?.id,
            ),
        ),
    );

    const submit = () => {
        if (!isReadOnly && !isSubmitting.value && !save.isConflicted.value && !save.isDisposed())
            return submitValidated();
    };

    return {
        ...save,
        ...interaction,
        values: form.values,
        errors: form.errors,
        isSubmitting,
        isReadOnly,
        suppliers,
        persons,
        supplier,
        receiverSeed,
        canSuppliers,
        canPersons,
        selectCreatedSupplier,
        addLine,
        removeLine,
        totals,
        submit,
    };
};
