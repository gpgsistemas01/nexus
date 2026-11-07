import { successCodeMessages } from '@nexus/api-success-codes';
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
import { API_PATHS } from '../../../shared/http/apiPaths.js';
import { isRecord } from '../../../shared/utils/isRecord.js';
import type { DirectoryEntry, DirectoryResource, DirectoryTarget } from '../directory.js';

const mutationCodes = {
    clients: {
        create: successCodeMessages.CREATED_CLIENT,
        edit: successCodeMessages.UPDATED_CLIENT,
    },
    suppliers: {
        create: successCodeMessages.CREATED_SUPPLIER,
        edit: successCodeMessages.UPDATED_SUPPLIER,
    },
} as const;

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
            `${API_PATHS.directory[resource]}?${recordParams(query)}`,
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
            `${API_PATHS.directory[resource]}${target.action === 'edit' ? `/${encodeURIComponent(target.row.id)}` : ''}`,
            {
                method: target.action === 'edit' ? 'PUT' : 'POST',
                data: payload,
                signal,
            },
        );
        confirmMutation(result, mutationCodes[resource][target.action]);
        return normalizeEntry(
            resource,
            isRecord(result) ? result[resource === 'clients' ? 'client' : 'supplier'] : undefined,
        );
    },
    export(resource: DirectoryResource, query: RecordQuery, signal: AbortSignal) {
        return requestExcel(
            `${API_PATHS.reports.directory[resource]}?${recordParams(query, { paginate: false })}`,
            signal,
        );
    },
};
