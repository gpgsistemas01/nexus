import { roundTo } from '@nexus/numbers';
import { isRecord } from '../../shared/utils/isRecord.js';
import { createUuid } from '../../shared/utils/createUuid.js';
import { getIssueReturnableQuantity } from './issueRules.js';
import type { LookupItem } from '../../shared/lookup.js';
import type { IssueDetail, IssueResource, IssueSupplyChanges } from './issue.js';

export const addIssueDetail = (rows: IssueDetail[], line: IssueDetail) => {
    const match = rows.find(
        (row) => row.itemId === line.itemId && row.supplierId === line.supplierId,
    );
    return match
        ? rows.map((row) =>
              row === match
                  ? {
                        ...row,
                        quantity: roundTo(row.quantity + line.quantity),
                        convertedQuantity: roundTo(row.convertedQuantity + line.convertedQuantity),
                    }
                  : row,
          )
        : [...rows, line];
};

export const getIssueDetailsToSupply = (details: IssueDetail[]) =>
    details.filter(
        (detail) => detail.isSupplied && !detail.isOriginallySupplied && !detail.isCanceled,
    );

export const getIssueDetailAmounts = (detail: IssueDetail, isHistorical = false) => {
    if (detail.isCanceled && !isHistorical) return { requested: null, delivered: null };

    const cost = detail.maxUnitCost;
    const requestedAmount = cost == null || cost <= 0 ? null : detail.convertedQuantity * cost;

    const requested = requestedAmount == null ? null : roundTo(requestedAmount, 2);

    if (isHistorical) return { requested, delivered: null };

    const delivered = getIssueReturnableQuantity(detail);

    return {
        requested,
        delivered:
            delivered <= 0
                ? 0
                : requestedAmount == null
                  ? null
                  : roundTo((requestedAmount * delivered) / detail.quantity, 2),
    };
};

export const getIssueTotals = (details: IssueDetail[], isHistorical = false) => {
    let requested: number | null = 0;
    let delivered: number | null = isHistorical ? null : 0;

    for (const detail of details) {
        if (detail.isCanceled && !isHistorical) continue;

        const amounts = getIssueDetailAmounts(detail, isHistorical);
        requested =
            requested == null || amounts.requested == null ? null : requested + amounts.requested;
        delivered =
            delivered == null || amounts.delivered == null ? null : delivered + amounts.delivered;
    }

    return { requested, delivered };
};

export const updateIssueDetailSupply = (
    details: IssueDetail[],
    detailId: string,
    changes: IssueSupplyChanges,
) =>
    details.map((detail) =>
        detail.id !== detailId || detail.isOriginallySupplied || detail.isCanceled
            ? detail
            : {
                  ...detail,
                  ...changes,
                  ...(changes.isSupplied === false
                      ? { projectConvertedQuantity: '', quantityToSupply: '' }
                      : {}),
              },
    );

export const createIssueDetailDraft = (
    option: LookupItem,
    quantity: number,
    resource: IssueResource,
): IssueDetail => {
    const data = option.data;
    const item = resource === 'wastes' ? data : isRecord(data.material) ? data.material : {};
    const presentation = isRecord(item.presentation) ? item.presentation : {};
    const unit = isRecord(item.unitMeasure) ? item.unitMeasure : {};
    const base = item.base == null ? null : Number(item.base);
    const height = item.height == null ? null : Number(item.height);
    const cost = Number(data.maxUnitCost);
    return {
        id: createUuid(),
        itemId: String(item.id),
        supplierId:
            resource === 'wastes'
                ? ''
                : String(
                      (isRecord(data.supplier) ? data.supplier.id : undefined) ?? data.supplierId,
                  ),
        supplierName: String((isRecord(data.supplier) ? data.supplier.tradeName : '') ?? ''),
        name: String(item.name),
        base,
        height,
        presentation: String(presentation.name ?? ''),
        unitMeasure: String(unit.symbol || unit.name || ''),
        quantity,
        convertedQuantity: base && height ? roundTo(base * height * quantity) : quantity,
        suppliedQuantity: 0,
        quantityToSupply: '',
        returnedQuantity: 0,
        maxUnitCost: Number.isFinite(cost) && cost > 0 ? cost : null,
        projectConvertedQuantity: '',
        isSupplied: false,
        isOriginallySupplied: false,
        isCanceled: false,
    };
};
