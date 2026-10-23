import { reportScopeError } from '../../../shared/report.js';
import type { ReportScope } from '../../../shared/report.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { requestPage } from '../../../shared/http/pageRequest.js';
import { recordParams } from '../../../shared/http/recordParams.js';
import { readText } from '../../../shared/http/recordContract.js';
import { requestExcel } from '../../../shared/http/requestExcel.js';
import { isRecord } from '../../../shared/utils/isRecord.js';
import type { LookupItem } from '../../../shared/lookup.js';
import { numberText } from '../../../shared/utils/formatNumbers.js';
import type { MovementQuery, MovementResource, MovementRow } from '../movement.js';

const decimal = (value: unknown): string | number | null => {
    if (value == null) return null;

    if (
        ((typeof value === 'string' && value.trim() !== '') || typeof value === 'number') &&
        Number.isFinite(Number(value))
    )
        return value as string | number;

    throw new ApiError('El servidor devolvió una cantidad de movimiento inválida.');
};

const normalizeRow = (value: unknown): MovementRow => {
    if (!isRecord(value) || typeof value.id !== 'string' || !value.id)
        throw new ApiError('El servidor devolvió un movimiento incompleto.');

    if (value.quantity == null)
        throw new ApiError('El servidor devolvió un movimiento sin cantidad.');

    return {
        id: value.id,
        date: readText(value, 'date'),
        type: readText(value, 'type'),
        referenceNumber: value.referenceNumber == null ? '—' : readText(value, 'referenceNumber'),
        materialName: readText(value, 'materialName'),
        supplierName: readText(value, 'supplierName'),
        materialBase: decimal(value.materialBase),
        materialHeight: decimal(value.materialHeight),
        previousStock: decimal(value.previousStock),
        quantity: decimal(value.quantity),
        newStock: decimal(value.newStock),
    };
};

const movementParams = (resource: MovementResource, query: MovementQuery) => {
    const params = recordParams(query);
    params.set('startDate', query.startDate);
    params.set('endDate', query.endDate);
    params.set('movementType', query.movementType);
    params.set('supplierId', query.supplierId);
    params.set(
        resource === 'wastes' ? 'wasteId' : 'materialId',
        query.supplierId ? query.itemId : '',
    );
    return params;
};

export const movementService = {
    async list(resource: MovementResource, query: MovementQuery, signal: AbortSignal) {
        const result = await requestPage(
            `/api/admin/movements/${resource}?${movementParams(resource, query)}`,
            signal,
        );
        return { ...result, data: result.data.map(normalizeRow) };
    },
    async export(
        resource: MovementResource,
        query: MovementQuery,
        report: ReportScope,
        signal: AbortSignal,
    ) {
        const error = reportScopeError(report);
        if (error) throw new Error(error);

        const params =
            report.mode === 'filtered'
                ? movementParams(resource, query)
                : new URLSearchParams({
                      'order[0][column]': String(query.orderColumn),
                      'order[0][dir]': query.direction,
                      monthlyReport: 'true',
                      reportMonth: report.mode === 'specific-month' ? report.month : '',
                  });
        params.delete('start');
        params.delete('length');
        return requestExcel(`/api/admin/reports/movements/${resource}/excel?${params}`, signal);
    },
    async lookup(
        resource: MovementResource | 'suppliers',
        search: string,
        page: number,
        supplierId: string,
        signal: AbortSignal,
    ) {
        const params = new URLSearchParams({
            search,
            start: String((page - 1) * 20),
            length: '20',
        });
        if (resource !== 'suppliers') params.set('supplierId', supplierId);

        const result = await requestPage(`/api/warehouse/${resource}?${params}`, signal);
        return {
            ...result,
            data: result.data.map((row): LookupItem => {
                if (resource === 'suppliers')
                    return {
                        id: readText(row, 'id'),
                        title: readText(row, 'tradeName'),
                        data: row,
                    };

                const item = resource === 'wastes' ? row : row.material;
                if (!isRecord(item))
                    throw new ApiError('El servidor devolvió una opción de inventario incompleta.');

                const presentation = isRecord(item.presentation) ? item.presentation.name : '';
                return {
                    id: readText(item, 'id'),
                    title: [
                        readText(item, 'name'),
                        presentation,
                        resource === 'consumables'
                            ? ''
                            : `${numberText(decimal(item.base))} × ${numberText(decimal(item.height))}`,
                    ]
                        .filter(Boolean)
                        .join(' · '),
                    data: row,
                };
            }),
        };
    },
};
