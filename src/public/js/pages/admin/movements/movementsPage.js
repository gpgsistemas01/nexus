import { createMovementDatatable } from "../../../plugins/datatable/admin/movements/movementDatatable.js";
import { setupTableFilters } from "../../../plugins/datatable/core/filters/tableFilter.js";
import { FILTER_SELECTORS } from '../../../constants/selectors.js';
import { initWasteFilterSelect } from '../../../plugins/select2/domains/waste.js';

const movementContext = document.querySelector('#movementPage')?.dataset.movementContext;
if (movementContext) {
    const inventoryFilter = movementContext === 'waste'
        ? {
            key: 'materialId',
            selector: FILTER_SELECTORS.MATERIAL,
            isSelected: false,
            initSelect: initWasteFilterSelect
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
