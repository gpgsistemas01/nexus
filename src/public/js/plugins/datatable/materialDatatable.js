import { openMaterialModal } from "../../modules/materials/materialModal.js";
import { createDataTable, renderActionButtons } from "./baseDatatable.js";
import { setupTableFilters } from "./utils/filters/tableFilter.js";
import { notifications } from "../swal/swalComponent.js";
import { deleteMaterial, getAllMaterials } from "../../application/warehouse/materials.js";
import { getResponsiveRowData } from "./utils/responsive.js";
import { buildExcelButton, buildTableExportParams } from "../../ui/tableUI.js";
import { hasPermission, UI_PERMISSIONS } from "../../constants/permissions.js";
import { exportWarehouseReport } from "../../application/warehouse/report.js";
import { formatFileName } from "../../utils/formatters.js";
import { DATATABLE_SELECTORS } from "../../constants/selectors.js";
import { buildWarehouseInventoryColumns, renderWarehouseInventoryHeader } from "./utils/warehouseInventoryDatatable.js";
import { handleApiError } from "../../api/errorHandler.js";

const selectorTable = DATATABLE_SELECTORS.MAIN;
const tableElement = document.querySelector(selectorTable);
const MATERIALS_RELOAD_DELAY_MS = 100;
let lastLowStockNotification = '';
let materialsSocketConfigured = false;
let materialsReloadTimer = null;

const configureMaterialsRealtime = (table) => {
let stockReloadTimer = null;
const STOCK_RELOAD_DEBOUNCE_MS = 150;

    if (materialsSocketConfigured) return;

    materialsSocketConfigured = true;

    window.addEventListener('materials:updated', () => {
        clearTimeout(materialsReloadTimer);

        // Una compra o salida puede modificar varios materiales. La recarga completa
        // conserva la página y vuelve a aplicar filtros, orden y cálculos del servidor.
        materialsReloadTimer = setTimeout(() => {
            clearTimeout(stockReloadTimer);
        stockReloadTimer = setTimeout(() => {
            table.ajax.reload(null, false);
        }, MATERIALS_RELOAD_DELAY_MS);
        }, STOCK_RELOAD_DEBOUNCE_MS);
    });
};

export const createMaterialDatatable = async (context) => {

    const { isWarehouse = false, isSystem = false, isSales = false } = context.organization || {};
    const canSeeCost = isWarehouse || isSystem || isSales;
    const canManageMaterials = hasPermission(context, UI_PERMISSIONS.MATERIALS_WRITE);
    const canDeleteMaterials = canManageMaterials;
    const canAdjustStock = hasPermission(context, UI_PERMISSIONS.MATERIALS_ADJUST_STOCK);
    const canCreateMaterialsFromModule = canManageMaterials;

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
        renderActions: (_, __, row) => renderActionButtons({
            status: 'Abierta',
            context: 'material',
            canAdjustStock,
            canDeleteMaterial: canDeleteMaterials && row.canDelete
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
    configureMaterialsRealtime(table);

    $(`${ selectorTable } tbody`).on('click', '.btn-edit', function () {

        const data = getResponsiveRowData(table, this);

        openMaterialModal({ mode: 'edit', data });
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-adjust-stock', function() {

        const data = getResponsiveRowData(table, this);

        openMaterialModal({ mode: 'edit-stock', data });
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-delete-material', async function() {

        const data = getResponsiveRowData(table, this);

        const result = await notifications.showConfirmation({
            title: '¿Eliminar material de este proveedor?',
            text: 'Se eliminará únicamente la relación entre el material y el proveedor mostrada en esta fila. Si es la última relación del material, también se eliminará el material. Esto solo es posible si el material no tiene historial de compras, salidas, requisiciones, mermas, movimientos ni ajustes de stock. El proveedor no se eliminará.',
            icon: 'warning',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            variant: 'danger'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await deleteMaterial(data.supplierMaterialId);

            notifications.showSuccess(response.message || '¡Relación entre material y proveedor eliminada exitosamente!');
            table.ajax.reload(null, false);
        } catch (err) {
            handleApiError({ err, rethrow: false });
        }
    });

}
