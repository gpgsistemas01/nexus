import { updateTotals } from "../../../ui/formUI.js";
import { refreshMaterialTable } from "./renderMaterialDatatable.js";
import { buildInventorySelectText } from "../../../utils/warehouseInventoryUtils.js";

export const renderWarehouseItemName = (row, supplierOverride, { useRowDimensions = false } = {}) => {
    return buildInventorySelectText(row, {
        supplierName: supplierOverride,
        useRowDimensions
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
