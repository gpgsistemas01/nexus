import { ApiError } from '../../../shared/http/apiError.js';
import { readText } from '../../../shared/http/recordContract.js';
import { isRecord } from '../../../shared/utils/isRecord.js';
import { PURCHASE_CONFIG } from '../purchase.js';
import type {
    Decimal,
    PurchaseResource,
    PurchaseRow,
    PurchaseDocument,
    PurchaseDetail,
} from '../purchase.js';
import type { LookupItem } from '../../../shared/lookup.js';

const invalid = () =>
    new ApiError('El servidor devolvió una compra incompleta. Actualiza la consulta.');

export const purchaseDecimal = (value: unknown): Decimal => {
    if (
        (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) &&
        Number.isFinite(Number(value)) &&
        Number(value) >= 0
    )
        return value;

    throw invalid();
};

const text = (value: unknown) => (typeof value === 'string' ? value : '');

const relation = (value: unknown) => (isRecord(value) ? value : {});

export const normalizePurchaseRow = (value: unknown, resource: PurchaseResource): PurchaseRow => {
    if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        !value.id ||
        value.type !== PURCHASE_CONFIG[resource].type ||
        typeof value.isInvoiced !== 'boolean' ||
        !isRecord(value.status)
    )
        throw invalid();

    const receptionDate = readText(value, 'receptionDate');
    if (!Number.isFinite(Date.parse(receptionDate))) throw invalid();

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
        totalQuantity: purchaseDecimal(value.totalQuantity),
        totalNetPurchaseAmount: purchaseDecimal(value.totalNetPurchaseAmount),
        totalGrossPurchaseAmount: purchaseDecimal(value.totalGrossPurchaseAmount),
    };
};

export const normalizePurchaseDetail = (
    value: unknown,
    resource: PurchaseResource,
): PurchaseDetail => {
    if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        !value.id ||
        !isRecord(value.material) ||
        value.material.type !== PURCHASE_CONFIG[resource].type ||
        !['ACTIVE', 'CANCELED'].includes(String(value.status))
    )
        throw invalid();

    const material = value.material;
    return {
        id: value.id,
        materialId: readText(value, 'materialId'),
        name: readText(value, 'materialName'),
        base: material.base == null ? null : purchaseDecimal(material.base),
        height: material.height == null ? null : purchaseDecimal(material.height),
        presentation: readText(relation(material.presentation), 'name'),
        unitMeasure:
            text(relation(material.unitMeasure).symbol) ||
            readText(relation(material.unitMeasure), 'name'),
        quantity: purchaseDecimal(value.quantity),
        convertedQuantity: purchaseDecimal(value.convertedQuantity),
        costPerUnitType: purchaseDecimal(value.costPerUnitType),
        conversionUnitCost: purchaseDecimal(value.conversionUnitCost),
        netPurchaseAmount: purchaseDecimal(value.netPurchaseAmount),
        grossPurchaseAmount: purchaseDecimal(value.grossPurchaseAmount),
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
        throw invalid();

    const details = value.details.map((row) => normalizePurchaseDetail(row, resource));
    if (new Set(details.map((row) => row.id)).size !== details.length) throw invalid();

    return {
        ...normalizePurchaseRow(value, resource),
        observations: value.observations ?? '',
        details,
    };
};

export const purchaseItemOption = (
    value: Record<string, unknown>,
    resource: PurchaseResource,
): LookupItem => {
    const material = relation(value.material);
    if (material.type !== PURCHASE_CONFIG[resource].type) throw invalid();

    const id = readText(material, 'id');
    const name = readText(material, 'name');
    const presentation = readText(relation(material.presentation), 'name');
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
