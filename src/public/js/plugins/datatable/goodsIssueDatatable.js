import { openGoodsIssueModal } from "../../pages/warehouse/goodsIssues/goodsIssuesPage.js";
import { getAllGoodsIssues } from "../../application/warehouse/goodsIssues/goodsIssues.js";
import { exportGoodsIssueReport } from "../../application/warehouse/report.js";
import { buildExcelButton, buildTableExportParams } from "../../ui/tableUI.js";
import { formatFileName } from "../../utils/formatters.js";
import { createDataTable, renderActionButtons } from "./baseDatatable.js";
import { createWarehouseIssueDetailsTable } from "./warehouseIssueDetailDatatable.js";
import { handleDelete } from "./utils/detailDatatableUtils.js";
import { getResponsiveRowData } from "./utils/responsive.js";
import { setupTableFilters } from "./utils/filters/tableFilter.js";
import { DATATABLE_SELECTORS } from "../../constants/selectors.js";
import { FORM_MODES } from "../../constants/formModes.js";
import { FULFILLMENT_STATUS_NAMES } from "../../constants/fulfillmentStatuses.js";
import { buildIssueHeaderColumns } from './issueDatatable.js';
import { hasPermission, UI_PERMISSIONS } from '../../constants/permissions.js';

export let details = [];
const selectorMaterialTable = DATATABLE_SELECTORS.MATERIAL;
const tableSelector = DATATABLE_SELECTORS.MAIN;
let filters = {
    getValues: () => ({})
};

export const createGoodsIssueDatatable = async (context) => {

    let table;
    const canManage = hasPermission(context, UI_PERMISSIONS.GOODS_ISSUES_MANAGE);
    const canSupply = hasPermission(context, UI_PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE);

    const columns = buildIssueHeaderColumns({ context });

    columns.push(
        { data: 'projectNumber', title: 'Proyecto' },
        { data: 'clientName', title: 'Cliente' },
        { data: 'status.name', title: 'Estado' },
        { data: 'fulfillmentStatus.name', title: 'Estado surtido' },
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

    filters = await setupTableFilters({
        fields: ['date', 'client', 'department', 'independentPerson', 'fulfillmentStatus', 'observations']
    });

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
                    action: () => openGoodsIssueModal({ mode: FORM_MODES.CREATE })
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

    $(`${ tableSelector } tbody`).on('click', '.btn-edit', function () {

        const data = getResponsiveRowData(table, this);
        const mode = data?.status?.name === 'Cancelada'
            ? FORM_MODES.VIEW
            : data?.fulfillmentStatus?.name === FULFILLMENT_STATUS_NAMES.PENDING
                ? FORM_MODES.EDIT
                : FORM_MODES.EDIT_HEADER;

        openGoodsIssueModal({ mode, data });
    })

    $(`${ tableSelector } tbody`).on('click', '.btn-edit-detail', function() {

        const data = getResponsiveRowData(table, this);

        openGoodsIssueModal({ mode: FORM_MODES.EDIT_DETAIL, data });
    });

    $(`${ tableSelector } tbody`).on('click', '.btn-return-detail', function() {

        const data = getResponsiveRowData(table, this);

        openGoodsIssueModal({ mode: FORM_MODES.RETURN, data });
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
