import { ResponseContractError } from '../../../shared/clientError.js';
import { GOODS_RECEIPT_DETAIL_STATUSES } from '@nexus/purchase-statuses';
import { mapUniqueRecords, readText } from '../../../shared/http/recordContract.js';
import { isRecord } from '../../../shared/utils/isRecord.js';
import { PURCHASE_CONFIG } from '../purchaseConfig.js';
import type {
    Decimal,
    PurchaseResource,
    PurchaseRow,
    PurchaseDocument,
    PurchaseDetail,
} from '../purchase.js';

const createInvalidResponseError = () =>
    new ResponseContractError('El servidor devolvió una compra incompleta. Actualiza la consulta.');

const readPurchaseDecimal = (value: unknown): Decimal => {
    if (
        (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) &&
        Number.isFinite(Number(value)) &&
        Number(value) >= 0
    )
        return value;

    throw createInvalidResponseError();
};

const readOptionalText = (value: unknown) => (typeof value === 'string' ? value : '');

const readOptionalRelation = (value: unknown) => (isRecord(value) ? value : {});

export const normalizePurchaseRow = (value: unknown, resource: PurchaseResource): PurchaseRow => {
    if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        !value.id ||
        value.type !== PURCHASE_CONFIG[resource].type ||
        typeof value.isInvoiced !== 'boolean' ||
        !isRecord(value.status)
    )
        throw createInvalidResponseError();

    const receptionDate = readText(value, 'receptionDate');
    if (!Number.isFinite(Date.parse(receptionDate))) throw createInvalidResponseError();

    return {
        id: value.id,
        referenceNumber: readText(value, 'referenceNumber'),
        receptionDate,
        supplierId: readText(value, 'supplierId'),
        supplierName: readText(value, 'supplierName'),
        receivedById: readText(value, 'receivedById'),
        receivedByName: readText(value, 'receivedByName'),
        isInvoiced: value.isInvoiced,
        invoice: value.isInvoiced ? readText(value, 'invoice') : '',
        status: readText(value.status, 'name'),
        totalQuantity: readPurchaseDecimal(value.totalQuantity),
        totalNetPurchaseAmount: readPurchaseDecimal(value.totalNetPurchaseAmount),
        totalGrossPurchaseAmount: readPurchaseDecimal(value.totalGrossPurchaseAmount),
    };
};

const normalizePurchaseDetail = (value: unknown, resource: PurchaseResource): PurchaseDetail => {
    if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        !value.id ||
        (value.costIsTotal !== undefined && typeof value.costIsTotal !== 'boolean') ||
        !Object.values(GOODS_RECEIPT_DETAIL_STATUSES).some((status) => status === value.status)
    )
        throw createInvalidResponseError();

    const material = value.materialSpecification ?? value.material;

    if (!isRecord(material) || material.type !== PURCHASE_CONFIG[resource].type)
        throw createInvalidResponseError();

    return {
        id: value.id,
        materialId: readText(value, 'materialId'),
        name: readText(value, 'materialName'),
        base: material.base == null ? null : readPurchaseDecimal(material.base),
        height: material.height == null ? null : readPurchaseDecimal(material.height),
        presentation: readText(readOptionalRelation(material.presentation), 'name'),
        unitMeasure:
            readOptionalText(readOptionalRelation(material.unitMeasure).symbol) ||
            readText(readOptionalRelation(material.unitMeasure), 'name'),
        quantity: readPurchaseDecimal(value.quantity),
        convertedQuantity: readPurchaseDecimal(value.convertedQuantity),
        ...(value.costIsTotal === true && { costIsTotal: true }),
        costPerUnitType: readPurchaseDecimal(value.costPerUnitType),
        conversionUnitCost: readPurchaseDecimal(value.conversionUnitCost),
        netPurchaseAmount: readPurchaseDecimal(value.netPurchaseAmount),
        grossPurchaseAmount: readPurchaseDecimal(value.grossPurchaseAmount),
        status: value.status as PurchaseDetail['status'],
        isNew: false,
    };
};

export const normalizePurchaseDocument = (
    value: unknown,
    resource: PurchaseResource,
): PurchaseDocument => {
    if (
        !isRecord(value) ||
        !Array.isArray(value.details) ||
        !Object.hasOwn(value, 'observations') ||
        (value.observations !== null && typeof value.observations !== 'string')
    )
        throw createInvalidResponseError();

    const details = mapUniqueRecords(
        value.details,
        (row) => normalizePurchaseDetail(row, resource),
        createInvalidResponseError,
    );

    return {
        ...normalizePurchaseRow(value, resource),
        observations: value.observations ?? '',
        details,
    };
};
