import { createDataTable, renderActionButtons } from "./baseDatatable.js";
import { setupTableFilters } from "./utils/filters/tableFilter.js";
import { hasPermission } from "../../utils/permissions.js";
import { getAllWastes } from "../../application/warehouse/wastes.js";
import { openWasteModal, openWasteStockAdjustmentModal } from "../../modules/wastes/wasteModal.js";
import { configureResponsiveHeaderGroups, getResponsiveRowData } from "./utils/responsive.js";
import { DATATABLE_SELECTORS } from "../../constants/selectors.js";
import { buildWarehouseInventoryColumns, renderWarehouseInventoryHeader } from "./utils/warehouseInventoryDatatable.js";

const selectorTable = DATATABLE_SELECTORS.MAIN;
const tableElement = document.querySelector(selectorTable);

export const createWasteDatatable = async (context) => {
    const { isAdmin, isWarehouse, isSystem, isSales } = hasPermission(context);
    const canSeeCost = isWarehouse || isSystem || isSales;
    const canManageWastes = isWarehouse || isSystem;
    const canAdjustStock = isSystem && isAdmin;

    renderWarehouseInventoryHeader({
        tableElement,
        canSeeCost,
        canManageItems: canManageWastes,
        stockTitle: 'Existencia',
        costTitle: 'Costo Unitario de Conversión'
    });

    const filters = await setupTableFilters({
        fields: ['supplier']
    });

    const columns = buildWarehouseInventoryColumns({
        canSeeCost,
        canManageItems: canManageWastes,
        costTitle: 'Costo Unitario de Conversión',
        renderActions: () => renderActionButtons({ status: 'Abierta', context: 'waste', canAdjustStock })
    });

    const table = createDataTable({
        options: {
            ajax: {
                get: (params) => getAllWastes({
                    ...params,
                    ...filters.getValues()
                })
            },
            searchPlaceholder: 'Buscar por Material o Proveedor',
            columns,
            buttons: [
                ...(canManageWastes ? [{
                    text: 'Nueva merma',
                    action: () => openWasteModal({ mode: 'create' })
                }] : [])
            ]
        }
    });

    configureResponsiveHeaderGroups(table);

    $(`${ selectorTable } tbody`).on('click', '.btn-edit', async function() {

        const data = getResponsiveRowData(table, this);

        await openWasteModal({ mode: 'edit', data });
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-adjust-stock', async function() {

        const data = getResponsiveRowData(table, this);

        await openWasteStockAdjustmentModal({ mode: 'edit-stock', data });
    });

    return table;
};
