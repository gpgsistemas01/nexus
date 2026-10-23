import { calculateGoodsReceiptDetailAmounts } from '@nexus/purchase-calculations';
import type { PurchaseDetail, PurchaseDocument } from './purchase.js';

export const calculatePurchaseTotals = (details: PurchaseDetail[]) =>
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

export const calculatePurchaseCorrectionTotals = (
    document: PurchaseDocument,
    detail: PurchaseDetail,
    values: { quantity: string; costPerUnitType: string },
) => {
    const quantity = Number(values.quantity);
    const costPerUnitType = Number(values.costPerUnitType);
    if (
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(costPerUnitType) ||
        costPerUnitType <= 0
    )
        return null;

    const corrected = calculateGoodsReceiptDetailAmounts({
        quantity,
        costPerUnitType,
        base: detail.base,
        height: detail.height,
    });
    return calculatePurchaseTotals(
        document.details.map((row) => (row.id === detail.id ? { ...row, ...corrected } : row)),
    );
};
