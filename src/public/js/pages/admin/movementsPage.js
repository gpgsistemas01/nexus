import { createMovementDatatable } from "../../plugins/datatable/movementDatatable.js";
import { setupTableFilters } from "../../plugins/datatable/utils/filters/tableFilter.js";

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
