import { apiClient } from '../../../shared/http/apiClient.js';
import { requestPage } from '../../../shared/http/pageRequest.js';
import { recordParams } from '../../../shared/http/recordParams.js';
import type { RecordQuery } from '../../../shared/list.js';
import {
    readRecord,
    readText,
    readState,
    confirmMutation,
} from '../../../shared/http/recordContract.js';
import { requestExcel } from '../../../shared/http/requestExcel.js';
import { DIRECTORY_CONFIG } from '../directory.js';
import type { DirectoryEntry, DirectoryResource, DirectoryTarget } from '../directory.js';

const normalizeEntry = (resource: DirectoryResource, value: unknown): DirectoryEntry => {
    const row = readRecord(value);
    return {
        id: row.id,
        version: row.version,
        isActive: readState(row),
        name: resource === 'clients' ? readText(row, 'name') : readText(row, 'tradeName'),
        legalName: resource === 'suppliers' ? readText(row, 'legalName') : '',
        tradeName: resource === 'suppliers' ? readText(row, 'tradeName') : '',
    };
};

export const directoryService = {
    async list(resource: DirectoryResource, query: RecordQuery, signal?: AbortSignal) {
        const result = await requestPage(
            `${DIRECTORY_CONFIG[resource].path}?${recordParams(query)}`,
            signal,
        );
        return { ...result, data: result.data.map((value) => normalizeEntry(resource, value)) };
    },
    async save(
        resource: DirectoryResource,
        target: DirectoryTarget,
        payload: Record<string, unknown>,
        signal: AbortSignal,
    ) {
        const result = await apiClient.request(
            `${DIRECTORY_CONFIG[resource].path}${target.action === 'edit' ? `/${encodeURIComponent(target.row.id)}` : ''}`,
            {
                method: target.action === 'edit' ? 'PUT' : 'POST',
                data: payload,
                signal,
            },
        );
        confirmMutation(
            result,
            `${target.action === 'create' ? 'CREATED' : 'UPDATED'}_${resource === 'clients' ? 'CLIENT' : 'SUPPLIER'}`,
        );
    },
    export(resource: DirectoryResource, query: RecordQuery, signal: AbortSignal) {
        return requestExcel(
            `${DIRECTORY_CONFIG[resource].reportPath}?${recordParams(query)}`,
            signal,
        );
    },
};
