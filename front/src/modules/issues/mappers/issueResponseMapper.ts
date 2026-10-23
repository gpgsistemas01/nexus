import { FULFILLMENT_STATUS_NAMES } from '@nexus/issue-statuses';
import { ApiError } from '../../../shared/http/apiError.js';
import { readText } from '../../../shared/http/recordContract.js';
import { isRecord } from '../../../shared/utils/isRecord.js';
import { ISSUE_CONFIG } from '../issueConfig.js';
import type { IssueDocument, IssueRow, IssueDetail, IssueResource } from '../issue.js';
import type { LookupItem } from '../../../shared/lookup.js';

const createInvalidResponseError = () =>
    new ApiError('El servidor devolvió una salida incompleta. Actualiza la consulta.');

const readOptionalRelation = (value: unknown): Record<string, unknown> =>
    isRecord(value) ? value : {};

const readIssueDecimal = (value: unknown): number => {
    if (
        (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) &&
        Number.isFinite(Number(value)) &&
        Number(value) >= 0
    )
        return Number(value);

    throw createInvalidResponseError();
};

export const normalizeIssueRow = (value: unknown, resource: IssueResource): IssueRow => {
    if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        !value.id ||
        (resource !== 'wastes' && value.type !== ISSUE_CONFIG[resource].type)
    )
        throw createInvalidResponseError();

    const requestDate = readText(value, 'requestDate');
    if (!Number.isFinite(Date.parse(requestDate))) throw createInvalidResponseError();

    const fields = [
        'referenceNumber',
        'requesterId',
        'requesterName',
        'advisorId',
        'advisorName',
        'clientId',
        'clientName',
        'departmentId',
        'departmentName',
        'projectNumber',
    ] as const;
    const header = Object.fromEntries(fields.map((key) => [key, readText(value, key)])) as Pick<
        IssueRow,
        (typeof fields)[number]
    >;
    if (value.observations != null && typeof value.observations !== 'string')
        throw createInvalidResponseError();

    return {
        ...header,
        id: value.id,
        requestDate,
        observations: value.observations ?? '',
        status: readText(readOptionalRelation(value.status), 'name'),
        fulfillmentStatus: readText(readOptionalRelation(value.fulfillmentStatus), 'name'),
    };
};

const normalizeIssueDetail = (value: unknown, resource: IssueResource): IssueDetail => {
    if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        !value.id ||
        typeof value.isSupplied !== 'boolean'
    )
        throw createInvalidResponseError();

    const item = readOptionalRelation(resource === 'wastes' ? value.waste : value.material);
    if (
        !Object.keys(item).length ||
        (resource !== 'wastes' && item.type !== ISSUE_CONFIG[resource].type)
    )
        throw createInvalidResponseError();

    const unit = readOptionalRelation(item.unitMeasure);
    return {
        id: value.id,
        itemId: readText(value, resource === 'wastes' ? 'wasteId' : 'materialId'),
        supplierId: resource === 'wastes' ? '' : readText(value, 'supplierId'),
        name: readText(value, 'materialName'),
        base: item.base == null ? null : readIssueDecimal(item.base),
        height: item.height == null ? null : readIssueDecimal(item.height),
        presentation: readText(readOptionalRelation(item.presentation), 'name'),
        unitMeasure: typeof unit.symbol === 'string' ? unit.symbol : readText(unit, 'name'),
        quantity: readIssueDecimal(value.quantity),
        convertedQuantity: readIssueDecimal(value.convertedQuantity),
        suppliedQuantity: readIssueDecimal(value.suppliedQuantity),
        returnedQuantity: readIssueDecimal(value.returnedQuantity),
        maxUnitCost: value.maxUnitCost == null ? null : readIssueDecimal(value.maxUnitCost),
        projectConvertedQuantity:
            value.projectConvertedQuantity == null
                ? ''
                : String(readIssueDecimal(value.projectConvertedQuantity)),
        isSupplied: value.isSupplied,
        isOriginallySupplied: value.isSupplied,
        isCanceled:
            readOptionalRelation(value.fulfillmentStatus).name ===
            FULFILLMENT_STATUS_NAMES.CANCELED,
    };
};

export const normalizeIssueDocument = (value: unknown, resource: IssueResource): IssueDocument => {
    if (!isRecord(value) || !Array.isArray(value.details)) throw createInvalidResponseError();

    const details = value.details.map((row) => normalizeIssueDetail(row, resource));
    if (new Set(details.map((row) => row.id)).size !== details.length)
        throw createInvalidResponseError();

    return { ...normalizeIssueRow(value, resource), details };
};

export const mapIssueItemOption = (
    row: Record<string, unknown>,
    resource: IssueResource,
): LookupItem => {
    const item = resource === 'wastes' ? row : readOptionalRelation(row.material);
    // El listado de inventario se filtra por endpoint y no incluye `type`.
    if (
        resource !== 'wastes' &&
        item.type !== undefined &&
        item.type !== ISSUE_CONFIG[resource].type
    )
        throw createInvalidResponseError();

    const id = readText(item, 'id');
    const supplier =
        resource === 'wastes' ? '' : readText(readOptionalRelation(row.supplier), 'id');
    const name = readText(item, 'name');
    return {
        id: supplier ? `${id}:${supplier}` : id,
        title: [
            name,
            item.base != null && item.height != null ? `${item.base} × ${item.height}` : '',
            readText(readOptionalRelation(item.presentation), 'name'),
            resource === 'wastes' ? '' : readText(readOptionalRelation(row.supplier), 'tradeName'),
        ]
            .filter(Boolean)
            .join(' · '),
        data: row,
        isDisabled: row.isActive === false || item.isActive === false,
    };
};
