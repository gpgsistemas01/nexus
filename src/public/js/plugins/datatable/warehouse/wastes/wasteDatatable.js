import { DOM_EVENT_NAMES } from '../../../../constants/events.js';
import { FORM_MODES } from '../../../../constants/formModes.js';
import { configureRealtimeReload } from '../../core/base/tableOperations.js';
import { createDataTable } from '../../core/base/createDataTable.js';
import { renderActionButtons } from '../../core/base/actionButtons.js';
import { setupTableFilters } from "../../core/filters/tableFilter.js";
import { getAllWastes } from "../../../../application/warehouse/wastes/wastes.js";
import { openWasteModal } from "../../../../pages/warehouse/wastes/wasteModal.js";
import { getResponsiveRowData } from '../../core/responsive/rowData.js';
import { hasPermission, UI_PERMISSIONS } from "../../../../constants/permissions.js";
import { DATATABLE_SELECTORS } from "../../../../constants/selectors.js";
import { buildWarehouseInventoryColumns, renderWarehouseInventoryHeader } from "../../shared/inventory/warehouseInventoryDatatable.js";
import { buildExcelButton, buildTableExportParams } from "../../../../ui/tableUI.js";
import { exportWasteReport } from "../../../../application/warehouse/report.js";
import { formatFileName } from "../../../../utils/formatters.js";

const selectorTable = DATATABLE_SELECTORS.MAIN;
const tableElement = document.querySelector(selectorTable);

export const createWasteDatatable = async (context) => {
    const { isWarehouse = false, isSystem = false, isSales = false } = context.organization || {};
    const canSeeCost = isWarehouse || isSystem || isSales;
    const canManageWastes = hasPermission(context, UI_PERMISSIONS.WASTES_WRITE);
    const canAdjustStock = hasPermission(context, UI_PERMISSIONS.WASTES_ADJUST_STOCK);

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
        renderActions: () => renderActionButtons({
            status: 'Abierta',
            context: 'waste',
            canAdjustStock
        })
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
                    action: () => openWasteModal({ mode: FORM_MODES.CREATE })
                }] : []),
                buildExcelButton({
                    filename: formatFileName('reporte_mermas'),
                    allowMonthlyReport: false,
                    request: () => exportWasteReport(buildTableExportParams(table, filters.getValues()))
                })
            ]
        }
    });

    configureRealtimeReload({
        table,
        eventName: 'wastes:updated'
    });

    $(`${ selectorTable } tbody`).on(DOM_EVENT_NAMES.CLICK, '.btn-edit', async function() {

        const data = getResponsiveRowData(table, this);

        await openWasteModal({ mode: FORM_MODES.EDIT, data });
    });

    $(`${ selectorTable } tbody`).on(DOM_EVENT_NAMES.CLICK, '.btn-adjust-stock', async function() {

        const data = getResponsiveRowData(table, this);

        await openWasteModal({ mode: FORM_MODES.EDIT_STOCK, data });
    });

    return table;
};
