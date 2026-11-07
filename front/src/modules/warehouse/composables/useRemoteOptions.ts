import { computed } from 'vue';
import type { InventoryCatalogPath } from '../../../shared/http/apiPaths.js';
import type { Ref } from 'vue';
import { useRemoteLookup } from '../../../shared/composables/useRemoteLookup.js';
import { inventoryCatalogService } from '../services/inventoryCatalogService.js';

export const useRemoteOptions = (
    path: InventoryCatalogPath,
    isEnabled: Ref<boolean>,
    supplierId?: Ref<string>,
) =>
    useRemoteLookup(
        (search, page, signal) =>
            inventoryCatalogService.lookup(
                { path, search, page, supplierId: supplierId?.value },
                signal,
            ),
        computed(() => isEnabled.value && (!supplierId || !!supplierId.value)),
        { dependency: supplierId },
    );
