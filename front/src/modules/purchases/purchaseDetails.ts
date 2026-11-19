import { GOODS_RECEIPT_DETAIL_STATUSES } from '@nexus/purchase-statuses';
import {
    calculateGoodsReceiptDetailAmounts,
    usesAutomaticTotalCost,
} from '@nexus/purchase-calculations';
import { isRecord } from '../../shared/utils/isRecord.js';
import { getLookupArticle } from '../../shared/utils/articleOptions.js';
import { createUuid } from '../../shared/utils/createUuid.js';
import type { LookupItem } from '../../shared/lookup.js';
import type { PurchaseDetail } from './purchase.js';

export const createPurchaseDetailDraft = (
    item: LookupItem,
    quantity: number,
    costPerUnitType: number,
    costIsTotal = false,
): PurchaseDetail => {
    const material = getLookupArticle(item);
    const presentation = isRecord(material.presentation) ? material.presentation : {};
    const unit = isRecord(material.unitMeasure) ? material.unitMeasure : {};
    return {
        id: createUuid(),
        materialId: item.id,
        name: String(material.name ?? item.title),
        base: material.base == null ? null : Number(material.base),
        height: material.height == null ? null : Number(material.height),
        presentation: String(presentation.name ?? ''),
        unitMeasure: String(unit.symbol || unit.name || ''),
        ...calculateGoodsReceiptDetailAmounts({
            quantity,
            costPerUnitType,
            costIsTotal: usesAutomaticTotalCost(material) || costIsTotal,
            base: material.base,
            height: material.height,
        }),
        status: GOODS_RECEIPT_DETAIL_STATUSES.ACTIVE,
        isNew: true,
    };
};
