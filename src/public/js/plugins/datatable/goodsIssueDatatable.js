import { getAllGoodsIssues } from "../../application/warehouse/goodsIssues/goodsIssues.js";
import { exportGoodsIssueReport } from "../../application/warehouse/report.js";
import { buildExcelButton, buildTableExportParams } from "../../ui/tableUI.js";
import { formatFileName } from "../../utils/formatters.js";
import { createWarehouseIssueDetailsTable } from "./warehouseIssueDetailDatatable.js";
import { handleDelete } from "./utils/detailDatatableUtils.js";
import { DATATABLE_SELECTORS } from "../../constants/selectors.js";
import { createIssueDatatable } from './issueDatatable.js';
import { hasPermission, UI_PERMISSIONS } from '../../constants/permissions.js';

export let details = [];
const selectorMaterialTable = DATATABLE_SELECTORS.MATERIAL;
const tableSelector = DATATABLE_SELECTORS.MAIN;
let filters = {
    getValues: () => ({})
};

export const createGoodsIssueDatatable = async ({ context, onCreate, onEdit, onEditDetails, onReturnDetails }) => {

    const canManage = hasPermission(context, UI_PERMISSIONS.GOODS_ISSUES_MANAGE);
    const canSupply = hasPermission(context, UI_PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE);
    let table;
    const buttons = [
        ...(canManage ? [{ text: 'Nueva salida', action: onCreate }] : []),
        buildExcelButton({
            filename: formatFileName('reporte_salidas'),
            request: ({ monthlyReport = false } = {}) => exportGoodsIssueReport(buildTableExportParams(table, {
                ...filters.getValues(),
                monthlyReport
            }))
        })
    ];
    const issueDatatable = await createIssueDatatable({
        context,
        getIssues: getAllGoodsIssues,
        actionContext: 'goodsIssue',
        canManage,
        canSupply,
        includeStatus: true,
        searchPlaceholder: 'Buscar por Folio o Proyecto',
        order: [[0, 'desc']],
        buttons,
        tableSelector,
        onEdit,
        onEditDetails,
        onReturnDetails
    });

    table = issueDatatable.table;
    filters = issueDatatable.filters;
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
