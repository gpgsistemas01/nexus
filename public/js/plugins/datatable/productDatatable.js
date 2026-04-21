import { openProductModal } from "../../components/modals/productModal.js";
import { createDataTable } from "./baseDatatable.js";
import { notifications } from "../swal/swalComponent.js";

const selectorTable = '#table';
let lastLowStockNotification = '';
let stockSocketConfigured = false;

const table = document.querySelector(selectorTable);

table.innerHTML = `
    <thead>
        <tr>
            <th rowspan="2">Código</th>
            <th rowspan="2">Nombre</th>
            <th colspan="2">Medidas</th>
            <th colspan="3">Existencias</th>
            <th rowspan="2">Stock mínimo</th>
            <th rowspan="2">Acciones</th>
        </tr>
        <tr>
            <th>Base</th>
            <th>Altura</th>
            <th>Stock</th>
            <th>Merma</th>
            <th>Total</th>
        </tr>
    </thead>
`;

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
        { data: 'sku', title: 'Código' },
        { data: 'name', title: 'Nombre' },
        { data: 'base', title: 'Base' },
        { data: 'height', title: 'Altura' },
        { data: 'currentStock', title: 'Stock' },
        { data: 'totalWaste', title: 'Merma' },
        { 
            data: null,
            title: 'Total',
            render: (data) => {
                const total = Number(data.currentStock) + Number(data.totalWaste);
                return isNaN(total) ? 'N/A' : total;
            }
        },
        { data: 'minStock', title: 'Stock mínimo' },
    ];

    if (isWarehouseDepartment || isSystemDepartment) {
        columns.push({
            data: null,
            title: 'Acciones',
            render: () => {
                return `
                    <button class="btn-edit">✏️</button>
                `;
            }
        });
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
