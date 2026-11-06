import { successCodeMessages } from '@nexus/api-success-codes';
import { INVENTORY_IMPORT_LIMITS } from '@nexus/inventory-imports';
import { UUID_V4_PATTERN } from '@nexus/input-validation';
import { apiClient } from '../../../shared/http/apiClient.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { requestExcel } from '../../../shared/http/requestExcel.js';
import { confirmMutation, readRecord } from '../../../shared/http/recordContract.js';
import { isRecord } from '../../../shared/utils/isRecord.js';
import type { InventoryResource } from '../inventory.js';
import type {
    InventoryImportBatch,
    InventoryImportMode,
    PendingInventoryImport,
} from '../inventoryImport.js';

const base = '/api/warehouse/inventory-imports';

const invalid = () =>
    new ApiError('No se pudo leer la importación. Revisa su estado antes de reintentar.');

const scalarRecord = (value: unknown) =>
    value === null ||
    (isRecord(value) &&
        Object.values(value).every(
            (item) => item === null || ['string', 'number', 'boolean'].includes(typeof item),
        ));

const readBatch = (
    value: unknown,
    expected: { id?: string; resource?: InventoryResource; mode?: InventoryImportMode } = {},
): InventoryImportBatch => {
    if (!isRecord(value)) throw invalid();

    const batch = readRecord(value.batch);
    if (
        !UUID_V4_PATTERN.test(batch.id) ||
        (expected.id !== undefined && batch.id !== expected.id) ||
        (expected.resource !== undefined && batch.resource !== expected.resource) ||
        (expected.mode !== undefined && batch.mode !== expected.mode) ||
        !['materials', 'consumables', 'wastes'].includes(String(batch.resource)) ||
        !['create', 'update'].includes(String(batch.mode)) ||
        !['DRAFT', 'COMPLETED', 'CANCELED', 'EXPIRED'].includes(String(batch.status)) ||
        typeof batch.filename !== 'string' ||
        typeof batch.expiresAt !== 'string'
    )
        throw invalid();

    if (
        (batch.status === 'DRAFT' && batch.preview === null) ||
        (batch.status === 'COMPLETED' && batch.result === null)
    )
        throw invalid();

    for (const data of [batch.preview, batch.result]) {
        if (data === null) continue;

        if (!isRecord(data) || !isRecord(data.summary)) throw invalid();

        const summary = data.summary;
        if (
            !['total', 'creates', 'updates', 'unchanged', 'errors'].every(
                (key) =>
                    Number.isInteger(summary[key]) &&
                    Number(summary[key]) >= 0 &&
                    Number(summary[key]) <= INVENTORY_IMPORT_LIMITS.maxRows,
            ) ||
            !Array.isArray(data.rows) ||
            data.rows.length > INVENTORY_IMPORT_LIMITS.maxRows
        )
            throw invalid();

        for (const row of data.rows) {
            if (
                !isRecord(row) ||
                !Number.isInteger(row.row) ||
                typeof row.name !== 'string' ||
                !['create', 'update', 'unchanged', 'error'].includes(String(row.action)) ||
                !scalarRecord(row.before) ||
                !scalarRecord(row.after) ||
                !isRecord(row.details) ||
                !scalarRecord(row.details) ||
                !Array.isArray(row.errors) ||
                !row.errors.every(
                    (error) =>
                        isRecord(error) &&
                        typeof error.column === 'string' &&
                        typeof error.message === 'string' &&
                        typeof error.code === 'string',
                ) ||
                !Array.isArray(row.warnings) ||
                !row.warnings.every((warning) => typeof warning === 'string')
            )
                throw invalid();
        }
    }

    return batch as unknown as InventoryImportBatch;
};

export const inventoryImportService = {
    template(
        resource: InventoryResource,
        mode: InventoryImportMode,
        query: { supplierId: string; search: string; page: number },
        signal: AbortSignal,
    ) {
        const params = new URLSearchParams({
            mode,
            search: query.search,
            page: String(query.page),
        });
        if (query.supplierId) params.set('supplierId', query.supplierId);

        return requestExcel(`${base}/${resource}/template?${params}`, signal);
    },
    async preview(
        resource: InventoryResource,
        mode: InventoryImportMode,
        file: File,
        signal: AbortSignal,
    ) {
        const data = new FormData();
        data.append('file', file);
        const result = await apiClient.request(`${base}/${resource}/preview?mode=${mode}`, {
            method: 'POST',
            data,
            signal,
            timeout: 45000,
        });
        confirmMutation(result, successCodeMessages.INVENTORY_IMPORT_PREVIEW);
        return readBatch(result, { resource, mode });
    },
    async get(id: string, signal: AbortSignal) {
        return readBatch(await apiClient.request(`${base}/${encodeURIComponent(id)}`, { signal }), {
            id,
        });
    },
    async confirm(pending: PendingInventoryImport, signal: AbortSignal) {
        const result = await apiClient.request(
            `${base}/${encodeURIComponent(pending.id)}/confirm`,
            {
                method: 'POST',
                data: {
                    expectedVersion: pending.expectedVersion,
                    operationId: pending.operationId,
                },
                signal,
                timeout: 45000,
            },
        );
        confirmMutation(result, successCodeMessages.INVENTORY_IMPORT_COMPLETED);
        const batch = readBatch(result, { id: pending.id });
        if (batch.status !== 'COMPLETED') throw invalid();

        return batch;
    },
    async cancel(id: string, signal: AbortSignal) {
        const result = await apiClient.request(`${base}/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            signal,
        });
        confirmMutation(result, successCodeMessages.INVENTORY_IMPORT_CANCELED);
        return readBatch(result, { id });
    },
    errors(id: string, signal: AbortSignal) {
        return requestExcel(`${base}/${encodeURIComponent(id)}/errors/excel`, signal);
    },
};
