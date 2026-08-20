import { createMovementDatatable } from "../../../plugins/datatable/admin/movements/movementDatatable.js";
import { setupTableFilters } from "../../../plugins/datatable/core/filters/tableFilter.js";

const movementContext = document.querySelector('#movementPage')?.dataset.movementContext;
if (movementContext) {
    const filters = await setupTableFilters({
        fields: ['date', 'movementType', 'supplier', 'material'],
        selector: `#${ movementContext }MovementTable`
    });

    createMovementDatatable({
        context: movementContext,
        filters,
        selector: `#${ movementContext }MovementTable`
    });
}
