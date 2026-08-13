import { getAllGoodsIssues } from "../../application/warehouse/goodsIssues/goodsIssues.js";
import { exportGoodsIssueReport } from "../../application/warehouse/report.js";
import { buildExcelButton, buildTableExportParams } from "../../ui/tableUI.js";
import { formatFileName } from "../../utils/formatters.js";
import { createDataTable, renderActionButtons } from "./baseDatatable.js";
import { createWarehouseIssueDetailsTable } from "./warehouseIssueDetailDatatable.js";
import { handleDelete } from "./utils/detailDatatableUtils.js";
import { DATATABLE_SELECTORS } from "../../constants/selectors.js";
import { bindIssueTableActions, buildIssueHeaderColumns, buildIssueTrackingColumns, setupIssueTableFilters } from './issueDatatable.js';
import { hasPermission, UI_PERMISSIONS } from '../../constants/permissions.js';

export let details = [];
const selectorMaterialTable = DATATABLE_SELECTORS.MATERIAL;
const tableSelector = DATATABLE_SELECTORS.MAIN;
let filters = {
    getValues: () => ({})
};

export const createGoodsIssueDatatable = async ({ context, onCreate, onEdit, onEditDetails, onReturnDetails }) => {

    let table;
    const canManage = hasPermission(context, UI_PERMISSIONS.GOODS_ISSUES_MANAGE);
    const canSupply = hasPermission(context, UI_PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE);

    const columns = buildIssueHeaderColumns({ context });

    columns.push(
        ...buildIssueTrackingColumns({ includeStatus: true }),
        {
            data: 'id',
            title: 'Acciones',
            render: (data, type, row) => renderActionButtons({
                status: row.status?.name,
                fulfillmentStatus: row.fulfillmentStatus?.name,
                context: 'goodsIssue',
                canManage,
                canSupply
            })
        }
    );

    filters = await setupIssueTableFilters();

    table = createDataTable({
        options: {
            ajax: {
                get: (params) => getAllGoodsIssues({
                    ...params,
                    ...filters.getValues()
                })
            },
            searchPlaceholder: 'Buscar por Folio o Proyecto',
            columns,
            order: [[0, 'desc']],
            buttons: [
                ...(canManage ? [{
                    text: 'Nueva salida',
                    action: onCreate
                }] : []),
                buildExcelButton({
                    filename: formatFileName('reporte_salidas'),
                    request: ({ monthlyReport = false } = {}) => exportGoodsIssueReport(buildTableExportParams(table, {
                        ...filters.getValues(),
                        monthlyReport
                    }))
                })
            ]
        }
    });

    bindIssueTableActions({
        table,
        tableSelector,
        onEdit,
        onEditDetails,
        onReturnDetails
    });

};

export const initDetailsGoodsIssueTable = (mode, context) => {
    return createWarehouseIssueDetailsTable({
        data: details,
        mode,
        context
    });
};

$(selectorMaterialTable).on('click', '.delete-btn', function () {

    const id = $(this).data('id');

    handleDelete({
        id,
        details,
        context: 'issue'
    })
});
