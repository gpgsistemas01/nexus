import { createMovementDatatable } from "../../../plugins/datatable/admin/movements/movementDatatable.js";
import { setupTableFilters } from "../../../plugins/datatable/core/filters/tableFilter.js";
import { FILTER_SELECTORS } from '../../../constants/selectors.js';
import { setupWasteSelect } from '../../../plugins/select2/domains/waste.js';
import { initMaterialFilterSelect } from '../../../plugins/select2/domains/material.js';
import { INVENTORY_RESOURCES } from '../../../../../shared/constants/inventory.js';

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
        : {
            key: 'materialId',
            selector: FILTER_SELECTORS.MATERIAL,
            dependsOn: 'supplierId',
            isSelected: false,
            initSelect: ({ selectedId }) => initMaterialFilterSelect({
                selectedId,
                supplierFilterSelector: FILTER_SELECTORS.SUPPLIER,
                resource: movementContext === 'consumable' ? INVENTORY_RESOURCES.CONSUMABLE : INVENTORY_RESOURCES.MATERIAL
            })
        };
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
