import { openProductModal } from "../../modules/products/productModal.js";
import { createDataTable } from "./baseDatatable.js";
import { notifications } from "../swal/swalComponent.js";

const selectorTable = '#table';
let lastLowStockNotification = '';
let stockSocketConfigured = false;

const table = document.querySelector(selectorTable);

const configureStockRealtime = (table) => {

    if (stockSocketConfigured) return;

    stockSocketConfigured = true;

    window.addEventListener('stock:updated', () => {
        table.ajax.reload(null, false);
    });
};

export const createProductDatatable = (context) => {

    const isWarehouseDepartment = context.department === 'Almacén';
    const isSystemDepartment = context.department === 'Sistemas';

    const columns = [
        { 
            data: null, 
            title: 'Material',
            render: (data) => `${ data.name } || ${ data.supplier.code } - ${ data.supplier.tradeName }`
        },
        { data: 'base', title: 'Base' },
        { data: 'height', title: 'Altura' },
        { data: 'currentStock', title: 'Existencia' },
        { data: 'minStock', title: 'Stock Mínimo' },
        { data: 'presentation.name', title: 'Presentación' },
        { data: 'convertedQuantity', title: 'Cantidad' },
        { data: 'unitMeasure.name', title: 'Unidad' }
    ];

    if (isWarehouseDepartment || isSystemDepartment) {
        columns.push(...[
            { data: 'unitCost', title: 'Costo Unitario' },
            {
                data: null,
                title: 'Acciones',
                render: () => {
                    return `
                        <button class="btn-edit">✏️</button>
                    `;
                }
            }
        ]);
    }

    const table = createDataTable({
        options: {
            ajax: '/api/warehouse/products/',
            columns,
            createdRow: (row, data) => {

                if (Number(data.currentStock) < Number(data.minStock)) {
                    row.classList.add('table-warning');
                }
            },
            drawCallback: function() {

                const currentData = this.api().rows({ page: 'current' }).data().toArray();
                const lowStockProducts = currentData.filter((product) => Number(product.currentStock) < Number(product.minStock));

                if (!lowStockProducts.length) {
                    lastLowStockNotification = '';
                    return;
                }

                const lowStockSignature = lowStockProducts.map((product) => product.id).join(',');

                if (lastLowStockNotification === lowStockSignature) return;

                lastLowStockNotification = lowStockSignature;

                const productNames = lowStockProducts
                    .slice(0, 3)
                    .map((product) => product.name)
                    .join(', ');

                notifications.showWarning(
                    `Hay ${lowStockProducts.length} producto(s) por debajo del stock mínimo: ${productNames}${lowStockProducts.length > 3 ? '...' : ''}`
                );
            }
        }
    });

    configureStockRealtime(table);

    $(`${ selectorTable } tbody`).on('click', '.btn-edit', async function() {

        const data = table.row($(this).closest('tr')).data();

        await openProductModal({ mode: 'edit', data });
    });

}
