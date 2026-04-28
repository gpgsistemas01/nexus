import { openGoodsReceiptModal } from "../../pages/warehouse/goodsReceiptsPage.js";
import { createDataTable, refreshProductTable } from "./baseDatatable.js";
import { GOODS_RECEIPTS_API_ROUTE } from "../../services/warehouse/goodsReceiptService.js";
import { initMdbWrapperInput, updateMdbWrapperInput } from "../mdb/baseInstance.js";
import { updateTotals } from "../../ui/formUI.js";

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
                { data: 'supplier.tradeName', title: 'Proveedor' },
                {
                    data: 'id',
                    title: 'Acciones',
                    render: () => '<button class="btn-view">👁️</button>'
                }
            ],
            buttons: [
                {
                    text: 'Nueva compra',
                    action: () => {
                        openGoodsReceiptModal({ mode: 'create' });
                    }
                }
            ]
        }
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
        { 
            data: null, 
            title: 'Material',
            render: (data, type, row) => {

                let name;
                const select = document.querySelector('.supplier-select');
                const supplier = select.options[select.selectedIndex].text;

                if (!row.base || !row.height) name = `${ row.name } || ${ supplier }`;
                else name = `${ row.name } (${ row.base } x ${ row.height }) || ${ supplier }`;

                return name;
            },
        },
        { data: 'base', title: 'Base' },
        { data: 'height', title: 'Altura' },
        { data: 'quantity', title: 'Cantidad' },
        { data: 'presentation', title: 'Presentación' },
        { data: 'totalArea', title: 'm2 Totales' },
        { data: 'unitMeasure', title: 'Unidad' },
        { data: 'unitCostByArea', title: 'Costo m2' },
        { data: 'area', title: 'm2' },
        { data: 'unitCostByQuantity', title: 'Costo por Rollo s/ IVA' },
        { data: 'netPurchaseAmount', title: 'Valor de Compra s/ IVA' },
        { data: 'grossPurchaseAmount', title: 'Valor de Compra c/ IVA' },
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
    const product = details[index];

    details.splice(index, 1);

    updateTotals({
        quantity: product.quantity,
        net: product.netPurchaseAmount,
        gross: product.grossPurchaseAmount,
        operation: 'substract'
    });

    refreshProductTable(details);
});
