import { requestPage } from '../../../shared/http/pageRequest.js';
import { API_PATHS } from '../../../shared/http/apiPaths.js';
import { lookupParams } from '../../../shared/http/pageParams.js';
import { readText } from '../../../shared/http/recordContract.js';
import { mapPurchaseItemOption } from '../mappers/purchaseResponseMapper.js';
import type { LookupItem, LookupQuery } from '../../../shared/lookup.js';
import type { PurchaseResource } from '../purchase.js';

interface PurchaseLookupRequest extends LookupQuery {
    kind: 'suppliers' | 'persons' | 'items';
    resource: PurchaseResource;
    supplierId?: string;
    capture?: boolean;
}

export const purchaseLookupService = {
    async list(query: PurchaseLookupRequest, signal: AbortSignal) {
        const { kind, resource } = query;
        const params = lookupParams(query);
        if (kind === 'suppliers' && query.capture) params.set('onlyActive', 'true');

        if (kind === 'persons') {
            params.set('department', 'ALMACÉN Y PROVEDURÍA');
            params.set('strictDepartmentFilter', 'true');
        }

        if (kind === 'items') params.set('supplierId', query.supplierId ?? '');

        const path =
            kind === 'persons'
                ? API_PATHS.identity.persons
                : kind === 'items'
                  ? API_PATHS.inventory[resource]
                  : API_PATHS.directory.suppliers;
        const result = await requestPage(`${path}?${params}`, signal);
        return {
            ...result,
            data: result.data.map((row): LookupItem =>
                kind === 'items'
                    ? mapPurchaseItemOption(row, resource)
                    : {
                          id: readText(row, 'id'),
                          title: readText(row, kind === 'persons' ? 'fullName' : 'tradeName'),
                          data: row,
                      },
            ),
        };
    },
};
