import { updateTotals } from "../../../ui/formUI.js";
import { DATATABLE_SELECTORS } from "../../../constants/selectors.js";
import { createDataTable, refreshDataTable } from "../baseDatatable.js";
import { buildDetailsColumns, buildDetailsHeader } from "./builderDetailDatatable.js";

export const refreshMaterialTable = data => refreshDataTable({
    selector: DATATABLE_SELECTORS.MATERIAL,
    data
});


export const initDetailsTable = ({ selector, type, mode, context, data }) => {

    const { isWarehouse = false, isSystem = false } = context.organization || {};

    const table = document.querySelector(selector);

    table.innerHTML = buildDetailsHeader({
        type,
        mode,
        isWarehouse,
        isSystem
    });

    const columns = buildDetailsColumns({
        type,
        mode,
        isWarehouse,
        isSystem
    });

    return createDataTable({
        selector,
        options: {
            data,
            columns
        }
    });
};

export const handleDelete = ({ id, details, context }) => {

    const index = details.findIndex(p => p.materialId === id);

    if (index < 0) return;

    const material = details[index];

    details.splice(index, 1);

    if (context === 'receipt') {

        updateTotals({
            quantity: material.quantity,
            net: material.netPurchaseAmount,
            gross: material.grossPurchaseAmount,
            operation: 'subtract'
        });
    }

    refreshMaterialTable(details);
};
