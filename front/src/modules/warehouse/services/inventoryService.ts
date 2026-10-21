import { apiClient, ApiError, isRecord } from '../../../shared/services/apiClient.js';
import type {
    InventoryAction,
    InventoryPayload,
    InventoryQuery,
    InventoryResource,
    InventoryRow,
    LookupItem,
    Numeric,
    PageResult,
} from '../inventory.js';

const numberValue = (value: unknown): Numeric =>
    typeof value === 'number' || typeof value === 'string' ? value : null;
const text = (value: unknown) => (typeof value === 'string' ? value : '');
const record = (value: unknown) => (isRecord(value) ? value : {});

export const normalizeInventoryRow = (raw: Record<string, unknown>): InventoryRow => {
    const material = isRecord(raw.material) ? raw.material : raw;
    const supplier = record(raw.supplier);
    const presentation = record(material.presentation);
    const unit = record(material.unitMeasure);
    if (
        typeof raw.id !== 'string' ||
        typeof material.id !== 'string' ||
        !Number.isInteger(raw.version) ||
        (isRecord(raw.material) && !Number.isInteger(material.version))
    ) {
        throw new ApiError('El servidor devolvió un registro de inventario inesperado.');
    }
    return {
        id: raw.id,
        entityId: material.id,
        version: Number(raw.version),
        materialVersion: isRecord(raw.material) ? Number(material.version) : undefined,
        name: text(material.name),
        supplierId: text(supplier.id) || text(raw.supplierId),
        supplierName: text(supplier.tradeName),
        presentationId: text(presentation.id),
        presentation: text(presentation.name),
        unitMeasureId: text(unit.id),
        unitMeasure: text(unit.symbol) || text(unit.name),
        base: numberValue(material.base),
        height: numberValue(material.height),
        minStock: numberValue(material.minStock),
        currentStock: numberValue(raw.currentStock),
        convertedQuantity: numberValue(raw.convertedQuantity),
        ...(raw.maxUnitCost !== undefined ? { maxUnitCost: numberValue(raw.maxUnitCost) } : {}),
        isActive: raw.isActive === true,
        canDelete: raw.canDelete === true,
        coneWeightKg: numberValue(raw.coneWeightKg),
        totalWeightKg: numberValue(raw.totalWeightKg),
        weightKg: numberValue(raw.weightKg),
        referenceRollTotalWeightKg: numberValue(raw.referenceRollTotalWeightKg),
        sampleLengthM: numberValue(raw.sampleLengthM),
        sampleNetWeightKg: numberValue(raw.sampleNetWeightKg),
    };
};

const paramsFor = (query: Partial<InventoryQuery>) =>
    new URLSearchParams({
        start: String(((query.page ?? 1) - 1) * (query.length ?? 10)),
        length: String(query.length ?? 10),
        search: query.search ?? '',
        supplierId: query.supplierId ?? '',
        'order[0][column]': '0',
        'order[0][dir]': query.direction ?? 'asc',
    });

const listPage = async (
    url: string,
    signal?: AbortSignal,
): Promise<PageResult<Record<string, unknown>>> => {
    const page = await apiClient.request<PageResult<unknown>>(url, { signal });
    if (
        !Array.isArray(page.data) ||
        !page.data.every(isRecord) ||
        !Number.isFinite(page.recordsFiltered) ||
        !Number.isFinite(page.recordsTotal)
    ) {
        throw new ApiError('El servidor devolvió un listado inesperado.');
    }
    return page as PageResult<Record<string, unknown>>;
};

export const inventoryService = {
    async list(resource: InventoryResource, query: InventoryQuery, signal?: AbortSignal) {
        const page = await listPage(`/api/warehouse/${resource}?${paramsFor(query)}`, signal);
        return { ...page, data: page.data.map(normalizeInventoryRow) };
    },
    async lookup(path: string, search = '', page = 1, supplierId = '', signal?: AbortSignal) {
        const params = paramsFor({ search, page, supplierId, length: 20 });
        if (path === 'suppliers') params.set('onlyActive', 'true');
        const result = await listPage(`/api/warehouse/${path}?${params}`, signal);
        return {
            ...result,
            data: result.data.map(
                (data) =>
                    ({
                        id: text(data.id),
                        title:
                            path === 'wastes/material-templates'
                                ? `${text(data.name)} · ${text(record(data.presentation).name)} · ${data.base ?? '—'} × ${data.height ?? '—'}`
                                : text(data.tradeName) || text(data.name),
                        data,
                    }) satisfies LookupItem,
            ),
        };
    },
    async mutate(
        resource: InventoryResource,
        action: InventoryAction,
        payload: InventoryPayload,
        id?: string,
        signal?: AbortSignal,
    ) {
        const suffix =
            action === 'create'
                ? ''
                : `/${encodeURIComponent(id ?? '')}${action === 'stock' ? '/stock' : action === 'add-stock' ? '/stock-additions' : ''}`;
        const method =
            action === 'delete'
                ? 'DELETE'
                : action === 'create' || action === 'add-stock'
                  ? 'POST'
                  : 'PATCH';
        const result = await apiClient.request<{ code: string }>(
            `/api/warehouse/${resource}${suffix}`,
            {
                method,
                headers: { 'Content-Type': 'application/json' },
                ...(action !== 'delete' ? { body: JSON.stringify(payload) } : {}),
                signal,
            },
        );
        const expected =
            action === 'create'
                ? resource === 'wastes'
                    ? 'CREATED_WASTE'
                    : 'CREATED_MATERIAL'
                : action === 'delete'
                  ? 'DELETED_MATERIAL'
                  : resource === 'wastes'
                    ? 'UPDATED_WASTE'
                    : 'UPDATED_MATERIAL';
        if (result.code !== expected)
            throw new ApiError(
                'No se pudo confirmar la operación. Revisa el inventario antes de reintentar.',
            );
        return result;
    },
    async export(
        resource: InventoryResource,
        query: InventoryQuery,
        inventoryScope: string,
        signal?: AbortSignal,
    ) {
        const params = paramsFor(query);
        params.set('inventoryScope', inventoryScope);
        if (resource !== 'wastes')
            params.set('type', resource === 'consumables' ? 'CONSUMABLE' : 'MATERIAL');
        return apiClient.request<Blob>(
            `/api/warehouse/reports/${resource === 'wastes' ? 'wastes' : 'inventory'}/excel?${params}`,
            { signal },
            true,
        );
    },
};
