import { ApiError } from '../../../shared/http/apiError.js';
import { readText } from '../../../shared/http/recordContract.js';
import { isRecord } from '../../../shared/utils/isRecord.js';
import { PURCHASE_CONFIG } from '../purchaseConfig.js';
import type {
    Decimal,
    PurchaseResource,
    PurchaseRow,
    PurchaseDocument,
    PurchaseDetail,
} from '../purchase.js';
import type { LookupItem } from '../../../shared/lookup.js';

const createInvalidResponseError = () =>
    new ApiError('El servidor devolvió una compra incompleta. Actualiza la consulta.');

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
        !isRecord(value.material) ||
        value.material.type !== PURCHASE_CONFIG[resource].type ||
        !['ACTIVE', 'CANCELED'].includes(String(value.status))
    )
        throw createInvalidResponseError();

    const material = value.material;
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

    const details = value.details.map((row) => normalizePurchaseDetail(row, resource));
    if (new Set(details.map((row) => row.id)).size !== details.length)
        throw createInvalidResponseError();

    return {
        ...normalizePurchaseRow(value, resource),
        observations: value.observations ?? '',
        details,
    };
};

export const mapPurchaseItemOption = (
    value: Record<string, unknown>,
    resource: PurchaseResource,
): LookupItem => {
    const material = readOptionalRelation(value.material);
    // El listado de inventario se filtra por endpoint y no incluye `type`.
    if (material.type !== undefined && material.type !== PURCHASE_CONFIG[resource].type)
        throw createInvalidResponseError();

    const id = readText(material, 'id');
    const name = readText(material, 'name');
    const presentation = readText(readOptionalRelation(material.presentation), 'name');
    return {
        id,
        title: [
            name,
            material.base != null && material.height != null
                ? `${material.base} × ${material.height}`
                : '',
            presentation,
        ]
            .filter(Boolean)
            .join(' · '),
        isDisabled: value.isActive === false,
        data: value,
    };
};
