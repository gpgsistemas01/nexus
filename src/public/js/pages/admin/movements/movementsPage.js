import { createMovementDatatable } from "../../../plugins/datatable/admin/movements/movementDatatable.js";
import { setupTableFilters } from "../../../plugins/datatable/core/filters/tableFilter.js";
import { FILTER_SELECTORS } from '../../../constants/selectors.js';
import { setupWasteSelect } from '../../../plugins/select2/domains/waste.js';

const movementContext = document.querySelector('#movementPage')?.dataset.movementContext;
if (movementContext) {
    const inventoryFilter = movementContext === 'waste'
        ? {
            key: 'wasteId',
            selector: FILTER_SELECTORS.MATERIAL,
            dependsOn: 'supplierId',
            isSelected: false,
            initSelect: () => setupWasteSelect({
                modalSelector: 'body',
                supplierSelector: FILTER_SELECTORS.SUPPLIER,
                wasteSelector: FILTER_SELECTORS.MATERIAL
            })
        }
        : 'material';
    const filters = await setupTableFilters({
        fields: ['date', 'movementType', 'supplier', inventoryFilter],
        selector: `#${ movementContext }MovementTable`
    });

    createMovementDatatable({
        context: movementContext,
        filters,
        selector: `#${ movementContext }MovementTable`
    });
}
