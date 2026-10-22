import { isRecord } from '../../../shared/utils/isRecord.js';
import { inventoryParams } from './inventoryPageRequest.js';
import { requestPage } from '../../../shared/http/pageRequest.js';
import type { LookupItem } from '../inventory.js';

const text = (value: unknown) => (typeof value === 'string' ? value : '');

const record = (value: unknown) => (isRecord(value) ? value : {});

export const inventoryCatalogService = {
    async lookup(path: string, search = '', page = 1, supplierId = '', signal?: AbortSignal) {
        const params = inventoryParams({ search, page, supplierId, length: 20 });
        if (path === 'suppliers') params.set('onlyActive', 'true');

        const result = await requestPage(`/api/warehouse/${path}?${params}`, signal);
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
};
