import { computed, watch } from 'vue';
import { useForm } from 'vee-validate';
import { PERMISSIONS } from '@nexus/permissions';
import { useRecordForm } from '../../../shared/composables/useRecordForm.js';
import { useRemoteLookup } from '../../../shared/composables/useRemoteLookup.js';
import { useSelectedOption } from '../../../shared/composables/useSelectedOption.js';
import type { LookupItem } from '../../../shared/lookup.js';
import { purchaseService } from '../services/purchaseService.js';
import { purchaseLookupService } from '../services/purchaseLookupService.js';
import { createInitialPurchaseValues, createPurchaseValidationSchema } from '../purchaseForm.js';
import { mapPurchaseFormToRequest } from '../mappers/purchaseRequestMapper.js';
import { calculatePurchaseTotals } from '../purchaseCalculations.js';
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
    const validationSchema = createPurchaseValidationSchema(() => form.values, document);
    const form = useForm<PurchaseValues>({
        initialValues: createInitialPurchaseValues(document),
        validateOnMount: false,
        validationSchema,
    });
    for (const field of Object.keys(validationSchema) as PurchaseField[])
        form.defineField(field, { validateOnModelUpdate: false });
    const record = useRecordForm(form, {
        onSaved: options.onSaved,
        onDenied: options.onDenied,
        isReadOnly: () => isReadOnly,
    });
    const canSuppliers = computed(() => options.has(PERMISSIONS.SUPPLIERS_READ));
    const canPersons = computed(() => options.has(PERMISSIONS.PERSONS_READ));
    const suppliers = useRemoteLookup(
        (search, page, signal) =>
            purchaseLookupService.list(
                { kind: 'suppliers', resource: options.resource, search, page, capture: true },
                signal,
            ),
        computed(() => !document && !isReadOnly && canSuppliers.value),
    );
    const persons = useRemoteLookup(
        (search, page, signal) =>
            purchaseLookupService.list(
                { kind: 'persons', resource: options.resource, search, page },
                signal,
            ),
        computed(() => !isReadOnly && canPersons.value),
    );
    const supplier = useSelectedOption(
        suppliers.items,
        () => form.values.supplierId,
        () =>
            document
                ? { id: document.supplierId, title: document.supplierName, data: {} }
                : undefined,
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
        if (record.isDisposed() || isReadOnly || document) return;

        if (item.isDisabled) {
            record.message.value =
                'El proveedor se registró como inactivo. Actívalo antes de capturar una compra.';
            void suppliers.refresh();
            return;
        }

        supplier.value = item;
        record.update('supplierId', item.id);
        suppliers.updateSearch('');
        void suppliers.refresh();
    };

    const addDetail = (line: PurchaseDetail) =>
        record.update('details', [...form.values.details, line]);

    const removeDetail = (id: string) =>
        record.update(
            'details',
            form.values.details.filter((row) => row.id !== id),
        );

    const totals = computed(() =>
        calculatePurchaseTotals([...(document?.details ?? []), ...form.values.details]),
    );
    const target = options.target;
    const submit =
        target.action === 'view'
            ? () => undefined
            : record.handleSubmit((values, signal) =>
                  purchaseService.save({
                      resource: options.resource,
                      target,
                      payload: mapPurchaseFormToRequest(values, document),
                      signal,
                  }),
              );

    return {
        ...record,
        values: form.values,
        errors: form.errors,
        isReadOnly,
        suppliers,
        persons,
        supplier,
        receiverSeed,
        canSuppliers,
        canPersons,
        selectCreatedSupplier,
        addDetail,
        removeDetail,
        totals,
        submit,
    };
};
