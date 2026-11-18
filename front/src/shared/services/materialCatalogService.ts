import { API_PATHS } from '../http/apiPaths.js';
import { lookupParams } from '../http/pageParams.js';
import { requestPage } from '../http/pageRequest.js';
import { mapMaterialOption } from '../utils/mapMaterialOption.js';
import type { LookupQuery } from '../lookup.js';

export const materialCatalogService = {
    async list(resource: 'materials' | 'consumables', query: LookupQuery, signal: AbortSignal) {
        const params = lookupParams(query);
        params.set('catalog', 'true');
        const result = await requestPage(`${API_PATHS.inventory[resource]}?${params}`, signal);
        return {
            ...result,
            data: result.data.map((row) =>
                mapMaterialOption(row, resource === 'materials' ? 'MATERIAL' : 'CONSUMABLE'),
            ),
        };
    },
};
