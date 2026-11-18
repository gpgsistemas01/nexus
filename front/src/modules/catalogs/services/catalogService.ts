import { successCodeMessages } from '@nexus/api-success-codes';
import { apiClient } from '../../../shared/http/apiClient.js';
import { API_PATHS } from '../../../shared/http/apiPaths.js';
import { pageParams } from '../../../shared/http/pageParams.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { readText } from '../../../shared/http/recordContract.js';
import { confirmMutation } from '../../../shared/http/recordContract.js';
import { requestPage } from '../../../shared/http/pageRequest.js';
import { isRecord } from '../../../shared/utils/isRecord.js';
import type { CatalogEntry, CatalogName, CatalogQuery, CatalogTarget } from '../catalog.js';

const normalizeEntry = (value: unknown, catalog: CatalogName): CatalogEntry => {
    if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        !value.id ||
        typeof value.name !== 'string' ||
        (catalog !== 'materials' && typeof value.isActive !== 'boolean') ||
        !Number.isInteger(value.version) ||
        Number(value.version) < 0 ||
        (catalog === 'unit-measures' && typeof value.symbol !== 'string')
    )
        throw new ApiError('El servidor devolvió un registro de catálogo incompleto.');

    if (catalog === 'materials') {
        if (
            !['MATERIAL', 'CONSUMABLE'].includes(String(value.type)) ||
            !isRecord(value.presentation) ||
            !isRecord(value.unitMeasure)
        )
            throw new ApiError('El servidor devolvió un material de catálogo incompleto.');

        const decimal = (input: unknown) => {
            if (input === null) return '';

            if (
                (typeof input !== 'number' && typeof input !== 'string') ||
                !Number.isFinite(Number(input)) ||
                Number(input) < 0
            )
                throw new ApiError('El servidor devolvió una medida o mínimo inválido.');

            return String(input);
        };

        return {
            id: value.id,
            version: Number(value.version),
            name: value.name,
            symbol: '',
            type: String(value.type),
            hasSuppliers: !isRecord(value._count) || Number(value._count.supplierMaterials) > 0,
            presentationId: readText(value, 'presentationId'),
            unitMeasureId: readText(value, 'unitMeasureId'),
            presentation: readText(value.presentation, 'name'),
            unitMeasure: readText(value.unitMeasure, 'name'),
            unitSymbol: readText(value.unitMeasure, 'symbol'),
            base: decimal(value.base),
            height: decimal(value.height),
            minStock: decimal(value.minStock),
        };
    }

    // La clave estable interna nunca forma parte de la captura ni de la vista.
    return {
        id: value.id,
        name: value.name,
        symbol: typeof value.symbol === 'string' ? value.symbol : '',
        isActive: value.isActive as boolean,
        version: Number(value.version),
    };
};

export const catalogService = {
    async list(catalog: CatalogName, query: CatalogQuery, signal?: AbortSignal) {
        const params = pageParams(query);
        const result = await requestPage(`${API_PATHS.catalogs}/${catalog}?${params}`, signal);
        return { ...result, data: result.data.map((value) => normalizeEntry(value, catalog)) };
    },
    async save(
        catalog: CatalogName,
        target: CatalogTarget,
        payload: Record<string, unknown>,
        signal?: AbortSignal,
    ) {
        const result = await apiClient.request<{ code: string; data: unknown }>(
            `${API_PATHS.catalogs}/${catalog}${target.action === 'edit' ? `/${encodeURIComponent(target.row.id)}` : ''}`,
            {
                method: target.action === 'edit' ? 'PUT' : 'POST',
                data: payload,
                signal,
            },
        );
        const expected =
            target.action === 'edit'
                ? successCodeMessages.UPDATED_CATALOG_ENTRY
                : successCodeMessages.CREATED_CATALOG_ENTRY;
        confirmMutation(
            result,
            expected,
            'No se pudo confirmar la operación. Actualiza el catálogo antes de reintentar.',
        );

        const entry = normalizeEntry(result.data, catalog);
        if (
            catalog === 'materials' &&
            target.action === 'create' &&
            target.materialType &&
            entry.type !== target.materialType
        )
            throw new ApiError(
                'El servidor devolvió un artículo de otro catálogo. Actualiza las opciones antes de continuar.',
            );

        return entry;
    },
};
