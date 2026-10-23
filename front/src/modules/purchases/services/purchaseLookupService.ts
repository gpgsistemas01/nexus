import { requestPage } from '../../../shared/http/pageRequest.js';
import { readText } from '../../../shared/http/recordContract.js';
import { mapPurchaseItemOption } from '../mappers/purchaseResponseMapper.js';
import type { LookupItem } from '../../../shared/lookup.js';
import type { PurchaseResource } from '../purchase.js';

export const purchaseLookupService = {
    async list(
        kind: 'suppliers' | 'persons' | 'items',
        resource: PurchaseResource,
        search: string,
        page: number,
        signal: AbortSignal,
        options: { supplierId?: string; capture?: boolean } = {},
    ) {
        const params = new URLSearchParams({
            search,
            start: String((page - 1) * 20),
            length: '20',
        });
        if (kind === 'suppliers' && options.capture) params.set('onlyActive', 'true');

        if (kind === 'persons') {
            params.set('department', 'ALMACÉN Y PROVEDURÍA');
            params.set('strictDepartmentFilter', 'true');
        }

        if (kind === 'items') params.set('supplierId', options.supplierId ?? '');

        const path =
            kind === 'persons'
                ? '/api/admin/persons'
                : `/api/warehouse/${kind === 'items' ? resource : kind}`;
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
