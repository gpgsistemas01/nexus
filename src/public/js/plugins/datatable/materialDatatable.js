import { openMaterialModal, openStockAdjustmentModal } from "../../modules/materials/materialModal.js";
import { createDataTable, renderActionButtons } from "./baseDatatable.js";
import { setupTableFilters } from "./utils/filters/tableFilter.js";
import { notifications } from "../swal/swalComponent.js";
import { hasPermission } from "../../utils/permissions.js";
import { deleteMaterial, getAllMaterials } from "../../application/warehouse/materials.js";
import { configureResponsiveHeaderGroups, getResponsiveRowData } from "./utils/responsive.js";
import { buildExcelButton, buildTableExportParams } from "../../ui/tableUI.js";
import { exportWarehouseReport } from "../../application/warehouse/report.js";
import { formatFileName } from "../../utils/formatters.js";
import { DATATABLE_SELECTORS } from "../../constants/selectors.js";
import { buildWarehouseInventoryColumns, renderWarehouseInventoryHeader } from "./utils/warehouseInventoryDatatable.js";
import { handleApiError } from "../../api/errorHandler.js";

const selectorTable = DATATABLE_SELECTORS.MAIN;
const tableElement = document.querySelector(selectorTable);
let lastLowStockNotification = '';
let stockSocketConfigured = false;

const configureStockRealtime = (table) => {

    if (stockSocketConfigured) return;

    stockSocketConfigured = true;

    window.addEventListener('stock:updated', () => {
        table.ajax.reload(null, false);
    });
};

export const createMaterialDatatable = async (context) => {

    const { hasRole, isAdmin, isWarehouse, isSystem, isSales } = hasPermission(context);
    const isWarehouseMaterialManager = isWarehouse && (hasRole('Almacenista') || hasRole('Coordinador') || hasRole('Auxiliar'));
    const canSeeCost = isWarehouse || isSystem || isSales;
    const canManageMaterials = isAdmin || isWarehouseMaterialManager;
    const canDeleteMaterials = isSystem || isWarehouse;
    const canAdjustStock = isSystem && isAdmin;
    const canCreateMaterialsFromModule = canAdjustStock || isWarehouseMaterialManager;

    renderWarehouseInventoryHeader({
        tableElement,
        canSeeCost,
        canManageItems: canManageMaterials,
        stockTitle: 'Compra',
        costTitle: 'Costo Unitario'
    });

    const filters = await setupTableFilters({
        fields: ['supplier']
    });

    const columns = buildWarehouseInventoryColumns({
        canSeeCost,
        canManageItems: canManageMaterials,
        costTitle: 'Costo Unitario de Conversión',
        renderActions: () => renderActionButtons({
            status: 'Abierta',
            context: 'material',
            canAdjustStock,
            canDeleteMaterial: canDeleteMaterials
        })
    });

    const table = createDataTable({
        options: {
            ajax: {
                get: (params) => getAllMaterials({
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
                const lowStockMaterials = currentData.filter((material) => Number(material.currentStock) < Number(material.minStock));

                if (!lowStockMaterials.length) {
                    lastLowStockNotification = '';
                    return;
                }

                const lowStockSignature = lowStockMaterials.map((material) => material.id).join(',');

                if (lastLowStockNotification === lowStockSignature) return;

                lastLowStockNotification = lowStockSignature;

                const materialNames = lowStockMaterials
                    .slice(0, 3)
                    .map((material) => material.name)
                    .join(', ');

                notifications.showWarning(
                    `Hay ${lowStockMaterials.length} material(es) por debajo del stock mínimo: ${materialNames}${lowStockMaterials.length > 3 ? '...' : ''}`
                );
            },
            buttons: [
                ...(canCreateMaterialsFromModule ? [{
                    text: 'Nuevo material',
                    action: () => openMaterialModal({ mode: 'create' })
                }] : []),
                buildExcelButton({
                    filename: formatFileName('reporte_inventario_materiales'),
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

        openMaterialModal({ mode: 'edit', data });
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-adjust-stock', function() {

        const data = getResponsiveRowData(table, this);

        openStockAdjustmentModal({ mode: 'edit-stock', data });
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-delete-material', async function() {

        const data = getResponsiveRowData(table, this);

        const result = await notifications.showConfirmation({
            title: '¿Eliminar material?',
            text: 'Se eliminará la relación del material con el proveedor y el material. El proveedor no se eliminará.',
            icon: 'warning',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            variant: 'danger'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await deleteMaterial(data.id);

            notifications.showSuccess(response.message || '¡Material eliminado exitosamente!');
            table.ajax.reload(null, false);
        } catch (err) {
            handleApiError({ err, rethrow: false });
        }
    });

}
