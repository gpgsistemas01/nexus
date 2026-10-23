import { calculateGoodsReceiptDetailAmounts } from '@nexus/purchase-calculations';
import { isRecord } from '../../shared/utils/isRecord.js';
import type { LookupItem } from '../../shared/lookup.js';
import type { PurchaseDetail } from './purchase.js';

export const createPurchaseDetailDraft = (
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
