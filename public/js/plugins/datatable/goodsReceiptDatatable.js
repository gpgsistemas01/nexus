import { openGoodsReceiptModal } from "../../pages/warehouse/goodsReceiptsPage.js";
import { createDataTable, refreshProductTable, renderActionButtons } from "./baseDatatable.js";
import { GOODS_RECEIPTS_API_ROUTE } from "../../services/warehouse/goodsReceiptService.js";

export let details = [];
const selectorProductTable = '#productTable';
const selectorTable = '#table';

export const createGoodsReceiptDatatable = () => {
    
    const table = createDataTable({
        options: {
            ajax: GOODS_RECEIPTS_API_ROUTE,
            columns: [
                { data: 'referenceNumber', title: 'Folio' },
                { 
                    data: null,
                    title: 'Recepción',
                    render: (data, type, row) => {

                        const name = `${ row.receivedBy.name } ${ row.receivedBy.lastName }`;
                        const date = new Date(row.receptionDate).toLocaleString();

                        return `<div>${ name }<br><small>${ date }</small></div>`;
                    }
                },
                { data: 'supplier.name', title: 'Proveedor' },
                {
                    data: null,
                    title: 'Aprobación',
                    render: (data, type, row) => {

                        if (!row.approverId || !row.approveDate) return '<small>Sin aprobar</small>';

                        const approver = `${ row.approver.name } ${ row.approver.lastName }`;
                        const approveDate = new Date(row.approveDate).toLocaleString();

                        return `<div>${ approver }<br><small>${ approveDate }</small></div>`;
                    }
                },
                { data: 'status.name', title: 'Estado' },
                {
                    data: 'id',
                    title: 'Acciones',
                    render: (data, type, row) => renderActionButtons(row.status?.name)
                }
            ],
            buttons: [
                {
                    text: 'Nueva recepción',
                    action: () => {
                        openGoodsReceiptModal({ mode: 'create' });
                    }
                }
            ]
        }
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-edit', async function() {

        const data = table.row($(this).closest('tr')).data();

        await openGoodsReceiptModal({ mode: 'edit', data });
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-view', function() {

        const data = table.row($(this).closest('tr')).data();

        openGoodsReceiptModal({ mode: 'view', data });
    });
}

export const initDetailsGoodsReceiptTable = (mode) => {

    if ($.fn.DataTable.isDataTable(selectorProductTable)) {
        $(selectorProductTable).DataTable().clear().destroy();
        $(selectorProductTable).empty();
    }

    const columns = [
        { data: 'name', title: 'Producto' },
        { data: 'base', title: 'Base' },
        { data: 'height', title: 'Altura' },
        { data: 'quantity', title: 'Cantidad' },
        { data: 'unitCost', title: 'Costo unitario' },
        { data: 'amount', title: 'Importe' },
        { 
            data: 'presentation', 
            title: 'Unidad',
            render: (data) => `PIEZA (${ data })`
        },
    ];

    if (mode !== 'view') columns.push({
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

    const table = createDataTable({
        selector: selectorProductTable, 
        options: {
            data: details,
            columns
        }
    });
}

$(selectorProductTable).on('click', '.delete-btn', function () {

    const index = $(this).data('index');

    details.splice(index, 1);

    refreshProductTable(details);
});
