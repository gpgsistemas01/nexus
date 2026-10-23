import { formatDateTimeInputInTimeZone } from '@nexus/date-time';
import { goodsReceiptValidation, goodsReceiptEditValidation } from '@nexus/form-validation';
import { mapPurchaseFormToRequest } from './mappers/purchaseRequestMapper.js';
import type { PurchaseDocument, PurchaseValues, PurchaseFilters } from './purchase.js';

export const createInitialPurchaseValues = (document?: PurchaseDocument): PurchaseValues => ({
    supplierId: document?.supplierId ?? '',
    receivedById: document?.receivedById ?? '',
    isInvoiced: document?.isInvoiced ?? true,
    invoice: document?.invoice ?? '',
    receptionDate: formatDateTimeInputInTimeZone(
        document?.receptionDate ?? new Date().toISOString(),
    ),
    observations: document?.observations ?? '',
    details: [],
});

export const emptyPurchaseFilters = (): PurchaseFilters => ({
    startDate: '',
    endDate: '',
    supplierId: '',
    personId: '',
});

export const createPurchaseValidationSchema = (
    getValues: () => PurchaseValues,
    document?: PurchaseDocument,
) => {
    const rules = (document ? goodsReceiptEditValidation : goodsReceiptValidation) as Record<
        string,
        (value: unknown, data: Record<string, unknown>) => string | null
    >;
    return Object.fromEntries(
        Object.entries(rules).map(([field, rule]) => [
            field,
            () => {
                const values = getValues();
                const request = mapPurchaseFormToRequest(values, document);
                return (
                    rule(
                        field === 'receptionDate' ? values.receptionDate : request[field],
                        request,
                    ) || true
                );
            },
        ]),
    );
};
