import { zonedDateTimeToUtcIso } from '@nexus/date-time';
import type { PurchaseValues, PurchaseDocument } from '../purchase.js';

export const mapPurchaseFormToRequest = (
    values: PurchaseValues,
    document?: PurchaseDocument,
): Record<string, unknown> => {
    const details = values.details.filter((row) => row.isNew);
    return {
        supplierId: document?.supplierId ?? values.supplierId,
        receivedById: values.receivedById,
        isInvoiced: values.isInvoiced,
        ...(values.isInvoiced ? { invoice: values.invoice.trim().toUpperCase() } : {}),
        receptionDate: zonedDateTimeToUtcIso(new Date(values.receptionDate)),
        observations: values.observations.trim(),
        ...(!document || details.length
            ? {
                  details: details.map((row) => ({
                      materialId: row.materialId,
                      quantity: Number(row.quantity),
                      costPerUnitType: Number(row.costPerUnitType),
                  })),
              }
            : {}),
    };
};
