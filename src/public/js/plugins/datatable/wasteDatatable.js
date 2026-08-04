import { createDataTable, renderActionButtons } from "./baseDatatable.js";
import { setupTableFilters } from "./utils/filters/tableFilter.js";
import { getAllWastes } from "../../application/warehouse/wastes.js";
import { openWasteModal, openWasteStockAdjustmentModal } from "../../pages/warehouse/wastes/wasteModal.js";
import { configureResponsiveHeaderGroups, getResponsiveRowData } from "./utils/responsive.js";
import { UI_PERMISSIONS } from "../../constants/permissions.js";
import { DATATABLE_SELECTORS } from "../../constants/selectors.js";
import { buildWarehouseInventoryColumns, renderWarehouseInventoryHeader } from "./utils/warehouseInventoryDatatable.js";
import { buildExcelButton, buildTableExportParams } from "../../ui/tableUI.js";
import { exportWasteReport } from "../../application/warehouse/report.js";
import { formatFileName } from "../../utils/formatters.js";

const selectorTable = DATATABLE_SELECTORS.MAIN;
const tableElement = document.querySelector(selectorTable);

export const createWasteDatatable = async (context) => {
    const { isWarehouse = false, isSystem = false, isSales = false } = context.organization || {};
    const canSeeCost = isWarehouse || isSystem || isSales;
    const canManageWastes = context.permissions?.includes(UI_PERMISSIONS.WASTES_WRITE) ?? false;
    const canAdjustStock = context.permissions?.includes(UI_PERMISSIONS.WASTES_ADJUST_STOCK) ?? false;

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
                }] : []),
                buildExcelButton({
                    filename: formatFileName('reporte_mermas'),
                    allowMonthlyReport: false,
                    request: () => exportWasteReport(buildTableExportParams(table, filters.getValues()))
                })
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
