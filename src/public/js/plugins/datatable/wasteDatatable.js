import { createDataTable, renderActionButtons } from "./baseDatatable.js";
import { setupTableFilters } from "./utils/filters/tableFilter.js";
import { hasPermission } from "../../utils/permissions.js";
import { renderMaterialName } from "./utils/renderProductDatatable.js";
import { getAllWastes } from "../../application/warehouse/wastes.js";
import { openWasteModal, openWasteStockAdjustmentModal } from "../../pages/warehouse/wastesPage.js";
import { configureResponsiveHeaderGroups, getResponsiveRowData } from "./utils/responsive.js";
import { formatCurrency, formatDecimal } from "../../utils/formatUtils.js";
import { DATATABLE_SELECTORS } from "../../constants/selectors.js";

const selectorTable = DATATABLE_SELECTORS.MAIN;
const tableElement = document.querySelector(selectorTable);

const renderWasteTableHeader = ({ canSeeCost, canManageWastes }) => {

    tableElement.innerHTML = `
        <thead>
            <tr>
                <th rowspan="2">Material</th>
                <th colspan="2" data-responsive-group="measures">Medidas</th>
                <th rowspan="2">Existencia</th>
                <th rowspan="2">Stock Mínimo</th>
                <th rowspan="2">Presentación</th>
                <th colspan="2" data-responsive-group="conversion">Conversión</th>
                ${ canSeeCost ? '<th rowspan="2">Costo Unitario de Conversión</th>' : '' }
                ${ canManageWastes ? '<th rowspan="2">Acciones</th>' : '' }
            </tr>
            <tr>
                <th data-responsive-parent="measures">Base</th>
                <th data-responsive-parent="measures">Altura</th>
                <th data-responsive-parent="conversion">Cantidad</th>
                <th data-responsive-parent="conversion">Unidad</th>
            </tr>
        </thead>
    `;
};

export const createWasteDatatable = async (context) => {

    const { isAdmin, isWarehouse, isSystem, isSales } = hasPermission(context);
    const canSeeCost = isWarehouse || isSystem || isSales;
    const canManageWastes = isWarehouse || isSystem;
    const canAdjustStock = isSystem && isAdmin;

    renderWasteTableHeader({ canSeeCost, canManageWastes });

    const filters = await setupTableFilters({
        fields: ['supplier']
    });

    const columns = [
        {
            data: null,
            title: 'Material',
            render: (data, type, row) => renderMaterialName(row)
        },
        { data: 'base', render: formatDecimal, title: 'Base' },
        { data: 'height', render: formatDecimal, title: 'Altura' },
        { data: 'currentStock', render: formatDecimal, title: 'Existencia' },
        { data: 'minStock', render: formatDecimal, title: 'Stock Mínimo' },
        { data: 'presentation.name', title: 'Presentación' },
        { data: 'convertedQuantity', render: formatDecimal, title: 'Cantidad' },
        { data: 'unitMeasure.name', title: 'Unidad' }
    ];

    if (canSeeCost) {
        columns.push({ data: 'maxUnitCost', title: 'Costo Unitario de Conversión', render: formatCurrency });
    }

    if (canManageWastes) {
        columns.push({
            data: null,
            title: 'Acciones',
            render: () => renderActionButtons({ status: 'Abierta', context: 'waste', canAdjustStock })
        });
    }

    const table = createDataTable({
        options: {
            ajax: {
                get: (params) => getAllWastes({
                    ...params,
                    ...filters.getValues()
                })
            },
            searchPlaceholder: 'Buscar por Material o Proveedor',
            columns,
            buttons: [
                ...(canManageWastes ? [{
                    text: 'Nueva merma',
                    action: () => openWasteModal({ mode: 'create' })
                }] : [])
            ]
        }
    });

    configureResponsiveHeaderGroups(table);

    $(`${ selectorTable } tbody`).on('click', '.btn-edit', async function() {

        const data = getResponsiveRowData(table, this);

        await openWasteModal({ mode: 'edit', data });
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-adjust-stock', async function() {

        const data = getResponsiveRowData(table, this);

        await openWasteStockAdjustmentModal({ mode: 'edit-stock', data });
    });

    return table;
};
