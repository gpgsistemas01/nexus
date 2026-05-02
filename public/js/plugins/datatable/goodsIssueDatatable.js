import { openGoodsIssueModal } from "../../pages/warehouse/goodsIssuesPage.js";
import { GOODS_ISSUES_API_ROUTE } from "../../services/warehouse/goodsIssueService.js";
import { hasPermission } from "../../utils/permissions.js";
import { createDataTable, refreshProductTable, renderActionButtons } from "./baseDatatable.js";
import { buildDetailsColumns, buildDetailsHeader } from "./utils/builderDetailDatatable.js";
import { renderMaterialName } from "./utils/renderProductDatatable.js";

export let details = [];
const selectorProductTable = '#productTable';
const selectorTable = '#table';
let productTable;

export const createGoodsIssueDatatable = (context) => {

    const { isWarehouse, isSystem } = hasPermission(context);

    const columns = [
        { data: 'referenceNumber', title: 'Folio' },
        {
            data: null,
            title: 'Solicitud',
            render: (data, type, row) => {

                const name = row.requesterName;
                const date = new Date(row.requestDate).toLocaleString();

                return `<div>${ name }<br><small>${ date }</small></div>`;
            }
        }
    ];

    if (isWarehouse || isSystem) {
        columns.push({
            data: 'departmentName',
            title: 'Área'
        });
    }

    columns.push(
        {
            data: null,
            title: 'Proyecto',
            render: (data, type, row) => {

                return `<div>${ row.projectNumber }<br><small>${ row.clientName }</small></div>`;
            }
        },
        {
            data: null,
            title: 'Aprobación',
            render: (data, type, row) => {

                if (!row.approverId || !row.approvedDate) return '<small>Sin Autorizar</small>';

                const approver = `${ row.approver.name } ${ row.approver.lastName }`;
                const approvedDate = new Date(row.approvedDate).toLocaleString();

                return `<div>${ approver }<br><small>${ approvedDate }</small></div>`;
            }
        },
        {
            data: null,
            title: 'Entrega',
            render: (data, type, row) => {

                if (!row.warehouseStaff || !row.deliveryDate) return '<small>Sin entrega</small>';

                const deliveredBy = `${ row.warehouseStaff.name } ${ row.warehouseStaff.lastName }`;
                const deliveryDate = new Date(row.deliveryDate).toLocaleString();

                return `<div>${ deliveredBy }<br><small>${ deliveryDate }</small></div>`;
            }
        },
        { data: 'dispatchStatus', title: 'Estado surtido' },
        {
            data: 'id',
            title: 'Acciones',
            render: (data, type, row) => renderActionButtons({ status: row.status?.name, context: 'goodsIssue' })
        }
    );

    const table = createDataTable({
        options: {
            ajax: GOODS_ISSUES_API_ROUTE,
            columns,
            buttons: [
                {
                    text: 'Nueva salida',
                    action: () => openGoodsIssueModal({ mode: 'create' })
                }
            ]
        }
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-edit-detail', function() {

        const data = table.row($(this).closest('tr')).data();

        openGoodsIssueModal({ mode: 'edit-detail', data });
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-view', function() {

        const data = table.row($(this).closest('tr')).data();

        openGoodsIssueModal({ mode: 'view', data });
    });
};

export const initDetailsGoodsIssueTable = (mode, context) => {

    const { isWarehouse, isSystem, hasRole } = hasPermission(context);

    if ($.fn.DataTable.isDataTable(selectorProductTable)) {
        $(selectorProductTable).DataTable().clear().destroy();
        $(selectorProductTable).empty();
    }

    const table = document.querySelector(selectorProductTable);

    table.innerHTML = buildDetailsHeader({
        type: 'issue',
        mode,
        isWarehouse,
        isCoordinator: hasRole('Coordinador'),
        isSystem
    });

    const columns = buildDetailsColumns({
        type: 'issue',
        mode,
        render: (_, __, row) => renderMaterialName(row),
        isWarehouse,
        isCoordinator: hasRole('Coordinador'),
        isSystem
    });

    productTable = createDataTable({
        selector: selectorProductTable,
        options: { data: details, columns }
    });
};

$(selectorProductTable).on('click', '.delete-btn', function () {

    const index = $(this).data('index');

    details.splice(index, 1);

    refreshProductTable(details);
});

export const updateDetailRow = (input, product) => {

    const row = productTable.row(input.closest('tr'));
    const rowData = row.data();
    rowData.convertedQuantityDifference = product.convertedQuantityDifference;
    row.data(rowData).invalidate();
}