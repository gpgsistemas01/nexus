import { roundTo } from '@nexus/numbers';
import { isRecord } from '../../shared/utils/isRecord.js';
import type { LookupItem } from '../../shared/lookup.js';
import type { IssueDetail, IssueResource } from './issue.js';

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

export const updateIssueDetailSupply = (
    details: IssueDetail[],
    detailId: string,
    changes: Partial<Pick<IssueDetail, 'isSupplied' | 'projectConvertedQuantity'>>,
) =>
    details.map((detail) =>
        detail.id !== detailId || detail.isOriginallySupplied || detail.isCanceled
            ? detail
            : {
                  ...detail,
                  ...changes,
                  ...(changes.isSupplied === false ? { projectConvertedQuantity: '' } : {}),
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
    return {
        id: crypto.randomUUID(),
        itemId: String(item.id),
        supplierId:
            resource === 'wastes'
                ? ''
                : String(
                      (isRecord(data.supplier) ? data.supplier.id : undefined) ?? data.supplierId,
                  ),
        name: String(item.name),
        base,
        height,
        presentation: String(presentation.name ?? ''),
        unitMeasure: String(unit.symbol || unit.name || ''),
        quantity,
        convertedQuantity: base && height ? roundTo(base * height * quantity) : quantity,
        suppliedQuantity: 0,
        returnedQuantity: 0,
        maxUnitCost: null,
        projectConvertedQuantity: '',
        isSupplied: false,
        isOriginallySupplied: false,
        isCanceled: false,
    };
};
