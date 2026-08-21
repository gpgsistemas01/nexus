import { DOM_EVENT_NAMES } from '../../../../constants/events.js';
import { FORM_MODES } from '../../../../constants/formModes.js';
import { openGoodsReceiptModal } from "../../../../pages/warehouse/goodsReceipts/goodsReceiptsPage.js";
import { createDataTable } from '../../core/base/createDataTable.js';
import { renderActionButtons } from '../../core/base/actionButtons.js';
import { resetDataTable } from '../../core/base/tableOperations.js';
import { getAllGoodsReceipts } from "../../../../application/warehouse/goodsReceipts/goodsReceipts.js";
import { exportGoodsReceiptReport } from "../../../../application/warehouse/report.js";
import { buildDetailsColumns } from '../../shared/issues/detailBuilder/detailColumns.js';
import { buildDetailsHeader } from '../../shared/issues/detailBuilder/detailHeader.js';
import { removeDetail } from "../../../../utils/detailCollectionUtils.js";
import { getResponsiveRowData } from '../../core/responsive/rowData.js';
import { buildExcelButton, buildTableExportParams } from "../../../../ui/tableUI.js";
import { formatDateTimeDisplay, formatFileName } from "../../../../utils/formatters.js";
import { setupTableFilters } from "../../core/filters/tableFilter.js";
import { DATATABLE_SELECTORS } from "../../../../constants/selectors.js";
import { GOODS_RECEIPT_STATUS_LABELS } from "../../../../constants/goodsReceiptStatuses.js";
import { updateTotals } from "../../../../ui/forms/totalsSummaryUI.js";
import { refreshMaterialTable } from "../../shared/inventory/renderMaterialDatatable.js";

export let details = [];
let filters = {
    getValues: () => ({})
};
const selectorMaterialTable = DATATABLE_SELECTORS.MATERIAL;
const selectorTable = DATATABLE_SELECTORS.MAIN;

export const createGoodsReceiptDatatable = async () => {

    let table;
    filters = await setupTableFilters({
        fields: ['date', 'supplier', 'warehousePerson']
    });

    table = createDataTable({
        options: {
            ajax: {
                get: (params) => getAllGoodsReceipts({
                    ...params,
                    ...filters.getValues()
                })
            },
            order: [[0, 'desc']],
            searchPlaceholder: 'Buscar por Folio o N° Factura',
            columns: [
                { data: 'referenceNumber', title: 'Folio' },
                {
                    data: null,
                    title: 'Recepción',
                    render: (data, type, row) => {

                        const name = row.receivedByName;
                        const date = formatDateTimeDisplay(row.receptionDate);

                        return `<div>${ name }<br><small>${ date }</small></div>`;
                    }
                },
                { data: 'supplierName', title: 'Proveedor' },
                {
                    data: null,
                    title: 'N° Factura',
                    render: (_, __, row) => row.isInvoiced ? row.invoice : 'Sin factura'
                },
                { data: 'status.name', title: 'Estado' },
                {
                    data: 'id',
                    title: 'Acciones',
                    render: (_, __, row) => renderActionButtons({
                        status: row.status?.name,
                        context: 'goodsReceipt'
                    })
                }
            ],
            buttons: [
                {
                    text: 'Nueva compra',
                    action: () => openGoodsReceiptModal({ mode: FORM_MODES.CREATE })
                },
                buildExcelButton({
                    filename: formatFileName('reporte_compras'),
                    request: ({ monthlyReport = false } = {}) => exportGoodsReceiptReport(buildTableExportParams(table, {
                        ...filters.getValues(),
                        monthlyReport
                    }))
                })
            ]
        }
    });

    $(`${ selectorTable } tbody`).on(DOM_EVENT_NAMES.CLICK, '.btn-edit', function() {

        const data = getResponsiveRowData(table, this);

        openGoodsReceiptModal({
            mode: data.status?.name === GOODS_RECEIPT_STATUS_LABELS.CANCELED
                ? FORM_MODES.VIEW
                : FORM_MODES.EDIT,
            data
        });
    });
}

export const initDetailsGoodsReceiptTable = (mode) => {

    const table = document.querySelector(selectorMaterialTable);

    resetDataTable(selectorMaterialTable);

    table.innerHTML = buildDetailsHeader({
        type: 'receipt',
        mode
    });

    const columns = buildDetailsColumns({
        type: 'receipt',
        mode
    });

    createDataTable({
        selector: selectorMaterialTable,
        options: {
            data: details,
            columns,
            responsive: true,
            autoWidth: false
        }
    });
};

$(selectorMaterialTable).on(DOM_EVENT_NAMES.CLICK, '.delete-btn', function () {

    const id = $(this).data('id');

    const material = removeDetail({
        details,
        matches: detail => detail.materialId === id
    });

    if (!material) return;

    updateTotals({
        quantity: material.quantity,
        net: material.netPurchaseAmount,
        gross: material.grossPurchaseAmount,
        operation: 'subtract'
    });
    refreshMaterialTable(details);
});
