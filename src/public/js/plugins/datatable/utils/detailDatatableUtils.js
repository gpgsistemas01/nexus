import { updateTotals } from "../../../ui/formUI.js";
import { createDataTable } from "../baseDatatable.js";
import { buildDetailsColumns, buildDetailsHeader } from "./builderDetailDatatable.js";
import { refreshMaterialTable } from "./renderMaterialDatatable.js";
import { buildInventorySelectText } from "../../../utils/materialSelectUtils.js";

export const renderWarehouseItemName = (row, supplierOverride, { useRowDimensions = false } = {}) => {
    return buildInventorySelectText(row, {
        supplierName: supplierOverride,
        useRowDimensions
    });
};


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

    const index = details.findIndex(material => material.materialId === id);

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
