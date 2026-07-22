import { openProductModal, openStockAdjustmentModal } from "../../modules/products/productModal.js";
import { createDataTable, renderActionButtons } from "./baseDatatable.js";
import { setupTableFilters } from "./utils/filters/tableFilter.js";
import { notifications } from "../swal/swalComponent.js";
import { hasPermission } from "../../utils/permissions.js";
import { deleteProduct, getAllProducts } from "../../application/warehouse/products.js";
import { configureResponsiveHeaderGroups, getResponsiveRowData } from "./utils/responsive.js";
import { buildExcelButton, buildTableExportParams } from "../../ui/tableUI.js";
import { exportWarehouseReport } from "../../application/warehouse/report.js";
import { formatFileName } from "../../utils/formatters.js";
import { DATATABLE_SELECTORS } from "../../constants/selectors.js";
import { buildWarehouseInventoryColumns, renderWarehouseInventoryHeader } from "./utils/warehouseInventoryDatatable.js";
import { handleApiError } from "../../api/errorHandler.js";

const selectorTable = DATATABLE_SELECTORS.MAIN;
let lastLowStockNotification = '';
let stockSocketConfigured = false;

const tableElement = document.querySelector(selectorTable);

const configureStockRealtime = (table) => {

    if (stockSocketConfigured) return;

    stockSocketConfigured = true;

    window.addEventListener('stock:updated', () => {
        table.ajax.reload(null, false);
    });
};

export const createProductDatatable = async (context) => {

    const { hasRole, isAdmin, isWarehouse, isSystem, isSales } = hasPermission(context);
    const isWarehouseProductManager = isWarehouse && (hasRole('Almacenista') || hasRole('Coordinador') || hasRole('Auxiliar'));
    const canSeeCost = isWarehouse || isSystem || isSales;
    const canManageProducts = isAdmin || isWarehouseProductManager;
    const canDeleteProducts = isSystem || isWarehouse;
    const canAdjustStock = isSystem && isAdmin;
    const canCreateProductsFromModule = canAdjustStock || isWarehouseProductManager;

    renderWarehouseInventoryHeader({
        tableElement,
        canSeeCost,
        canManageItems: canManageProducts,
        stockTitle: 'Compra',
        costTitle: 'Costo Unitario'
    });

    const filters = await setupTableFilters({
        fields: ['supplier']
    });

    const columns = buildWarehouseInventoryColumns({
        canSeeCost,
        canManageItems: canManageProducts,
        costTitle: 'Costo Unitario de Conversión',
        renderActions: () => renderActionButtons({
            status: 'Abierta',
            context: 'product',
            canAdjustStock,
            canDeleteProduct: canDeleteProducts
        })
    });

    const table = createDataTable({
        options: {
            ajax: {
                get: (params) => getAllProducts({
                    ...params,
                    ...filters.getValues()
                })
            },
            searchPlaceholder: 'Buscar por Material',
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
            },
            buttons: [
                ...(canCreateProductsFromModule ? [{
                    text: 'Nuevo producto',
                    action: () => openProductModal({
                        mode: 'create',
                        includeStockAdjustmentOnCreate: canAdjustStock
                    })
                }] : []),
                buildExcelButton({
                    filename: formatFileName('reporte_inventario_productos'),
                    allowMonthlyReport: false,
                    request: () => exportWarehouseReport(buildTableExportParams(table, filters.getValues()))
                })
            ]
        }
    });

    configureResponsiveHeaderGroups(table);
    configureStockRealtime(table);

    $(`${ selectorTable } tbody`).on('click', '.btn-edit', function () {

        const data = getResponsiveRowData(table, this);
    
        openProductModal({ mode: 'edit', data });
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-adjust-stock', function() {

        const data = getResponsiveRowData(table, this);

        openStockAdjustmentModal({ mode: 'edit-stock', data });
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-delete-product', async function() {

        const data = getResponsiveRowData(table, this);

        const result = await notifications.showConfirmation({
            title: '¿Eliminar producto?',
            text: 'Se eliminará la relación del producto con el proveedor y el producto. El proveedor no se eliminará.',
            icon: 'warning',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            variant: 'danger'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await deleteProduct(data.id);

            notifications.showSuccess(response.message || '¡Producto eliminado exitosamente!');
            table.ajax.reload(null, false);
        } catch (err) {
            handleApiError({ err, rethrow: false });
        }
    });

}
