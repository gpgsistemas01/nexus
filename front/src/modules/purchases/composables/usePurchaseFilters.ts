import { computed, reactive } from 'vue';
import { PERMISSIONS } from '@nexus/permissions';
import { useRemoteLookup } from '../../../shared/composables/useRemoteLookup.js';
import { purchaseLookupService } from '../services/purchaseLookupService.js';
import { emptyPurchaseFilters } from '../purchaseForm.js';
import type { PurchaseResource } from '../purchase.js';

export const usePurchaseFilters = (
    resource: PurchaseResource,
    has: (permission: string) => boolean,
) => {
    const values = reactive(emptyPurchaseFilters());
    const canSuppliers = computed(() => has(PERMISSIONS.SUPPLIERS_READ));
    const canPersons = computed(() => has(PERMISSIONS.PERSONS_READ));
    const suppliers = useRemoteLookup(
        (search, page, signal) =>
            purchaseLookupService.list('suppliers', resource, search, page, signal),
        canSuppliers,
    );
    const persons = useRemoteLookup(
        (search, page, signal) =>
            purchaseLookupService.list('persons', resource, search, page, signal),
        canPersons,
    );

    const clear = () => {
        Object.assign(values, emptyPurchaseFilters());
        suppliers.updateSearch('');
        persons.updateSearch('');
    };

    return { values, suppliers, persons, canSuppliers, canPersons, clear };
};
