import { computed } from 'vue';
import type { Ref } from 'vue';
import { useRemoteLookup } from '../../../shared/composables/useRemoteLookup.js';
import { inventoryCatalogService } from '../services/inventoryCatalogService.js';

export const useRemoteOptions = (path: string, isEnabled: Ref<boolean>, supplierId?: Ref<string>) =>
    useRemoteLookup(
        (search, page, signal) =>
            inventoryCatalogService.lookup(path, search, page, supplierId?.value, signal),
        computed(() => isEnabled.value && (!supplierId || !!supplierId.value)),
        supplierId,
    );
