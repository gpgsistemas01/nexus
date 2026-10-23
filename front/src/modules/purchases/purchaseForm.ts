import { calculateGoodsReceiptDetailAmounts } from '@nexus/purchase-calculations';
import { formatDateTimeInputInTimeZone, zonedDateTimeToUtcIso } from '@nexus/date-time';
import { isRecord } from '../../shared/utils/isRecord.js';
import type { LookupItem } from '../../shared/lookup.js';
import type { PurchaseDetail, PurchaseDocument, PurchaseValues } from './purchase.js';

export const initialPurchaseValues = (document?: PurchaseDocument): PurchaseValues => ({
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

export const purchasePayload = (
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

export const draftPurchaseDetail = (
    item: LookupItem,
    quantity: number,
    costPerUnitType: number,
): PurchaseDetail => {
    const material = isRecord(item.data.material) ? item.data.material : {};
    const presentation = isRecord(material.presentation) ? material.presentation : {};
    const unit = isRecord(material.unitMeasure) ? material.unitMeasure : {};
    return {
        id: crypto.randomUUID(),
        materialId: item.id,
        name: String(material.name ?? item.title),
        base: material.base == null ? null : Number(material.base),
        height: material.height == null ? null : Number(material.height),
        presentation: String(presentation.name ?? ''),
        unitMeasure: String(unit.symbol || unit.name || ''),
        ...calculateGoodsReceiptDetailAmounts({
            quantity,
            costPerUnitType,
            base: material.base,
            height: material.height,
        }),
        status: 'ACTIVE',
        isNew: true,
    };
};

export const purchaseTotals = (details: PurchaseDetail[]) =>
    details
        .filter((row) => row.status === 'ACTIVE')
        .reduce(
            (total, row) => ({
                quantity: total.quantity + Number(row.quantity),
                net: total.net + Number(row.netPurchaseAmount),
                gross: total.gross + Number(row.grossPurchaseAmount),
            }),
            { quantity: 0, net: 0, gross: 0 },
        );
