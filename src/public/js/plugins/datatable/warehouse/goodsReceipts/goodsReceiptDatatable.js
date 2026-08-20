import { DOM_EVENT_NAMES } from '../../../../constants/events.js';
import { FORM_MODES } from '../../../../constants/formModes.js';
import { openGoodsReceiptModal } from "../../../../pages/warehouse/goodsReceipts/goodsReceiptsPage.js";
import { createDataTable, renderActionButtons, resetDataTable } from "../../core/baseDatatable.js";
import { getAllGoodsReceipts } from "../../../../application/warehouse/goodsReceipts/goodsReceipts.js";
import { exportGoodsReceiptReport } from "../../../../application/warehouse/report.js";
import { initMdbWrapperInput, updateMdbWrapperInput } from "../../../mdb/baseInstance.js";
import { buildDetailsColumns, buildDetailsHeader } from "../../shared/issues/builderDetailDatatable.js";
import { removeDetail } from "../../../../utils/detailCollectionUtils.js";
import { getResponsiveRowData } from "../../core/responsive.js";
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
const table = document.querySelector(selectorMaterialTable);
table.innerHTML = `
    <thead>
        <tr>
            <th rowspan="2">Material</th>
            <th colspan="2">Medidas</th>
            <th rowspan="2">Compra</th>
            <th rowspan="2">Presentación</th>
            <th colspan="2">Conversión</th>
            <th rowspan="2">Costo Unitario de Conversión</th>
            <th rowspan="2">Costo por Presentación</th>
            <th rowspan="2">Monto s/ IVA</th>
            <th rowspan="2">Monto c/ IVA</th>
            <th rowspan="2">Acciones</th>
        </tr>
        <tr>
            <th>Base</th>
            <th>Altura</th>
            <th>Cantidad</th>
            <th>Unidad</th>
        </tr>
    </thead>
`;

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
