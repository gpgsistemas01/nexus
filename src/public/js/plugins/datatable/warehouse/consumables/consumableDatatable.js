import { deleteConsumable, getAllConsumables } from '../../../../application/warehouse/consumables/consumables.js';
import { FORM_MODES } from '../../../../constants/formModes.js';
import { UI_PERMISSIONS, hasPermission } from '../../../../constants/permissions.js';
import { DATATABLE_SELECTORS } from '../../../../constants/selectors.js';
import { formatCurrency, formatDecimal } from '../../../../utils/formatUtils.js';
import {
    getCurrentStock,
    getIsActive,
    getMaterialName,
    getMaxUnitCost,
    getMinStock,
    getPresentation,
    getSupplierName,
    getUnitMeasure
} from '../../../../utils/warehouseInventoryUtils.js';
import { createDataTable } from '../../core/base/createDataTable.js';
import { renderActionButtons } from '../../core/base/actionButtons.js';
import { setupTableFilters } from '../../core/filters/tableFilter.js';
import { openMaterialModal } from '../../../../pages/warehouse/materials/materialModal.js';
import { buildExcelButton, buildTableExportParams } from '../../../../ui/tableUI.js';
import { exportWarehouseReport } from '../../../../application/warehouse/report.js';
import { formatFileName } from '../../../../utils/formatters.js';
import { configureRealtimeReload } from '../../core/base/tableOperations.js';
import { INVENTORY_RESOURCES, MATERIAL_TYPES } from '../../../../constants/inventory.js';
import { bindMaterialInventoryActions } from '../../shared/inventory/materialInventoryActions.js';

const tableElement = document.querySelector(DATATABLE_SELECTORS.MAIN);

const getConsumableName = (row) => {
    const supplierName = getSupplierName(row);
    const name = getMaterialName(row);

    return supplierName ? `${ name } · ${ supplierName }` : name;
};

const renderHeader = ({ canSeeActive, canSeeCost, canManageItems }) => {
    tableElement.innerHTML = `
        <thead>
            <tr>
                <th>Consumible</th>
                <th>Existencia</th>
                <th>Stock Mínimo</th>
                <th>Presentación</th>
                <th>Unidad de medida</th>
                ${ canSeeCost ? '<th>Costo Unitario</th>' : '' }
                ${ canSeeActive ? '<th>Activo</th>' : '' }
                ${ canManageItems ? '<th>Acciones</th>' : '' }
            </tr>
        </thead>
    `;
};

const buildColumns = ({ canSeeActive, canSeeCost, canManageItems, context }) => {
    const columns = [
        { data: null, render: (_, __, row) => getConsumableName(row) },
        { data: null, orderable: false, render: (_, __, row) => formatDecimal(getCurrentStock(row)) },
        { data: null, orderable: false, render: (_, __, row) => formatDecimal(getMinStock(row)) },
        { data: null, orderable: false, render: (_, __, row) => getPresentation(row) },
        { data: null, orderable: false, render: (_, __, row) => getUnitMeasure(row) }
    ];

    if (canSeeCost) {
        columns.push({ data: null, orderable: false, render: (_, __, row) => formatCurrency(getMaxUnitCost(row)) });
    }

    if (canSeeActive) {
        columns.push({ data: null, orderable: false, render: (_, __, row) => getIsActive(row) ? 'Sí' : 'No' });
    }

    if (canManageItems) {
        columns.push({
            data: null,
            orderable: false,
            render: (_, __, row) => renderActionButtons({
                status: 'Abierta',
                context: INVENTORY_RESOURCES.MATERIAL,
                canAdjustStock: hasPermission(context, UI_PERMISSIONS.MATERIALS_ADJUST_STOCK),
                canDeleteMaterial: row.canDelete
            })
        });
    }

    return columns;
};

export const createConsumableDatatable = async (context) => {
    const canSeeCost = hasPermission(context, UI_PERMISSIONS.INVENTORY_COSTS_READ);
    const canSeeActive = hasPermission(context, UI_PERMISSIONS.CATALOGS_MANAGE);
    const canManageItems = hasPermission(context, UI_PERMISSIONS.MATERIALS_WRITE);
    const filters = await setupTableFilters({ fields: ['supplier'] });

    renderHeader({ canSeeActive, canSeeCost, canManageItems });

    const table = createDataTable({
        options: {
            ajax: {
                get: params => getAllConsumables({
                    ...params,
                    ...filters.getValues()
                })
            },
            searchPlaceholder: 'Buscar por Consumible',
            columns: buildColumns({ canSeeActive, canSeeCost, canManageItems, context }),
            buttons: [
                ...(canManageItems ? [{
                text: 'Nuevo consumible',
                action: () => openMaterialModal({ mode: FORM_MODES.CREATE, resource: INVENTORY_RESOURCES.CONSUMABLE })
                }] : []),
                buildExcelButton({
                    filename: formatFileName('reporte_inventario_consumibles'),
                    allowMonthlyReport: false,
                    allowInventoryScope: true,
                    request: ({ inventoryScope } = {}) => exportWarehouseReport(buildTableExportParams(table, {
                        ...filters.getValues(),
                        inventoryScope,
                        type: MATERIAL_TYPES.CONSUMABLE
                    }))
                })
            ]
        }
    });

    configureRealtimeReload({ table, eventName: 'materials:updated' });

    bindMaterialInventoryActions({
        table,
        resource: INVENTORY_RESOURCES.CONSUMABLE,
        remove: deleteConsumable,
        deleteConfirmation: {
            title: '¿Eliminar consumible de este proveedor?',
            text: 'Se eliminará únicamente la relación entre el consumible y el proveedor mostrada en esta fila. Si es la última relación, también se eliminará el consumible. Esto sólo es posible cuando no tiene historial operativo. El proveedor no se eliminará.'
        },
        deleteSuccessMessage: '¡Relación entre consumible y proveedor eliminada exitosamente!'
    });

    return table;
};
