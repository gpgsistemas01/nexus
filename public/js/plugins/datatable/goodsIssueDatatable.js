import { openGoodsIssueModal } from "../../pages/warehouse/goodsIssuesPage.js";
import { hasPermission } from "../../utils/permissions.js";
import { createDataTable, refreshProductTable, renderActionButtons } from "./baseDatatable.js";

export let details = [];
const selectorProductTable = '#productTable';
const selectorTable = '#table';

export const createGoodsIssueDatatable = (context) => {

    const { isWarehouse, isSystem } = hasPermission(context);

    const columns = [
        { data: 'referenceNumber', title: 'Folio' },
        {
            data: null,
            title: 'Solicitud',
            render: (data, type, row) => {

                const name = `${ row.requester.name } ${ row.requester.lastName }`;
                const date = new Date(row.requestDate).toLocaleString();

                return `<div>${ name }<br><small>${ date }</small></div>`;
            }
        }
    ];

    if (isWarehouse || isSystem) {
        columns.push({
            data: 'department.name',
            title: 'Área'
        });
    }

    columns.push(
        {
            data: null,
            title: 'Proyecto',
            render: (data, type, row) => {

                const projectDate = new Date(row.project.date).toLocaleDateString();
                return `<div>${ row.project.referenceNumber } - ${ row.project.name }<br><small>${ row.project.client } | ${ projectDate }</small></div>`;
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
        { data: 'status.name', title: 'Estado' },
        {
            data: 'id',
            title: 'Acciones',
            render: (data, type, row) => renderActionButtons(row.status?.name)
        }
    );

    const table = createDataTable({
        options: {
            ajax: {
                url: '/api/warehouse/goods-issues/',
                data: (d) => {
                    d.department = context.department || '';
                }
            },
            columns,
            buttons: [
                {
                    text: 'Nueva salida',
                    action: () => {
                        openGoodsIssueModal({ mode: 'create' });
                    }
                }
            ]
        }
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-edit', async function() {

        const data = table.row($(this).closest('tr')).data();

        await openGoodsIssueModal({ mode: 'edit', data });
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-view', function() {

        const data = table.row($(this).closest('tr')).data();

        openGoodsIssueModal({ mode: 'view', data });
    });
};

export const initDetailsGoodsIssueTable = (mode, context) => {

    const { isWarehouse, isSystem } = hasPermission(context);

    if ($.fn.DataTable.isDataTable(selectorProductTable)) {
        $(selectorProductTable).DataTable().clear().destroy();
        $(selectorProductTable).empty();
    }

    const columns = [
        { 
            data: null, 
            title: 'Material',
            render: (data, type, row) => {

                let name;

                if (!row.base || !row.height) name = `${ row.name } || ${ row.supplier }`;
                else name = `${ row.name } (${ row.base } x ${ row.height }) || ${ row.supplier }`;

                return name;
            },
        },
        { data: 'base', title: 'Base' },
        { data: 'height', title: 'Altura' },
        { data: 'quantity', title: 'Cantidad' },
        { data: 'presentation', title: 'Presentación' },
        { data: 'totalArea', title: 'm2 Totales' },
        { data: 'unitMeasure', title: 'Unidad' },
    ];

    if (isWarehouse || isSystem) {
        columns.push(...[
            { data: 'unitCost', title: 'Costo unitario' },
            // { data: 'projectQuantity', title: 'Cantidad de proyecto' },
            // { data: 'difference', title: 'Diferencia' }
        ]);
    }

    if (mode !== 'view') {
        columns.push({
            title: 'Acciones',
            data: null,
            render: (data, type, row, meta) => {
                return `
                    <button class="btn btn-danger btn-sm delete-btn" data-index="${meta.row}">
                        Eliminar
                    </button>
                `;
            }
        });
    }

    createDataTable({
        selector: selectorProductTable,
        options: {
            data: details,
            columns
        }
    });
};

$(selectorProductTable).on('click', '.delete-btn', function () {

    const index = $(this).data('index');

    details.splice(index, 1);

    refreshProductTable(details);
});