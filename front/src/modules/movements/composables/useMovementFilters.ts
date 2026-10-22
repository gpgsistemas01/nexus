import { computed, reactive, toRef, watch } from 'vue';
import { PERMISSIONS } from '@nexus/permissions';
import { useRemoteLookup } from '../../../shared/composables/useRemoteLookup.js';
import { movementService } from '../services/movementService.js';
import { emptyMovementFilters, MOVEMENT_TYPES } from '../movement.js';
import type { MovementFilters, MovementType, MovementResource } from '../movement.js';

export const useMovementFilters = (
    resource: MovementResource,
    has: (permission: string) => boolean,
) => {
    const values = reactive(emptyMovementFilters());
    const supplierId = toRef(values, 'supplierId');
    const canSelectSupplier = computed(() => has(PERMISSIONS.SUPPLIERS_READ));
    const canSelectItem = computed(
        () =>
            canSelectSupplier.value &&
            has(resource === 'wastes' ? PERMISSIONS.WASTES_READ : PERMISSIONS.MATERIALS_READ),
    );
    const suppliers = useRemoteLookup(
        (search, page, signal) => movementService.lookup('suppliers', search, page, '', signal),
        computed(() => has(PERMISSIONS.MOVEMENTS_READ) && canSelectSupplier.value),
    );
    const items = useRemoteLookup(
        (search, page, signal) =>
            movementService.lookup(resource, search, page, supplierId.value, signal),
        computed(
            () => has(PERMISSIONS.MOVEMENTS_READ) && canSelectItem.value && !!supplierId.value,
        ),
        supplierId,
    );
    watch(
        supplierId,
        () => {
            values.itemId = '';
        },
        { flush: 'sync' },
    );

    const update = (field: keyof MovementFilters, value: string) => {
        if (field === 'movementType')
            values.movementType = MOVEMENT_TYPES.some((item) => item.value === value)
                ? (value as MovementType)
                : '';
        else values[field] = value;
    };

    const clear = () => {
        Object.assign(values, emptyMovementFilters());
        suppliers.updateSearch('');
    };

    return {
        values,
        update,
        clear,
        suppliers,
        items,
        canSelectSupplier,
        canSelectItem,
        supplierState: suppliers.state,
        itemState: items.state,
    };
};
