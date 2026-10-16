import { formatCurrency, formatDecimal } from "../../../../utils/formatUtils.js";
import { buildInventorySelectText, getBase, getCurrentStock, getHeight, getIsActive, getMaxUnitCost, getMinStock, getPresentation, getUnitMeasure, isRollPresentation } from "../../../../utils/warehouseInventoryUtils.js";

export const renderWarehouseInventoryHeader = ({ tableElement, canSeeActive, canSeeCost, canManageItems, showRollWeights = false }) => {

    tableElement.innerHTML = `
        <thead>
            <tr>
                <th rowspan="2">Material</th>
                <th colspan="2" data-responsive-group="measures">Medidas</th>
                <th rowspan="2">Stock actual</th>
                <th rowspan="2">Stock Mínimo</th>
                <th rowspan="2">Presentación</th>
                <th colspan="2" data-responsive-group="conversion">Conversión</th>
                ${ canSeeCost ? '<th rowspan="2">Costo Unitario de Conversión</th>' : '' }
                ${ canSeeActive ? '<th rowspan="2">Activo</th>' : '' }
                ${ showRollWeights ? '<th colspan="3" data-responsive-group="weights">Pesos por unidad (kg)</th>' : '' }
                ${ canManageItems ? '<th rowspan="2">Acciones</th>' : '' }
            </tr>
            <tr>
                <th data-responsive-parent="measures">Base</th>
                <th data-responsive-parent="measures">Altura</th>
                <th data-responsive-parent="conversion">Cantidad</th>
                <th data-responsive-parent="conversion">Unidad</th>
                ${ showRollWeights ? '<th data-responsive-parent="weights">Cono</th><th data-responsive-parent="weights">Total con cono</th><th data-responsive-parent="weights">Neto</th>' : '' }
            </tr>
        </thead>
    `;
};

export const buildWarehouseInventoryColumns = ({ canSeeActive, canSeeCost, canManageItems, renderActions, showRollWeights = false }) => {

    const columns = [
        {
            data: null,
            render: (data, type, row) => buildInventorySelectText(row)
        },
        { 
            data: null,
            render: (_, __, row) => formatDecimal(getBase(row))
        },
        { 
            data: null,
            render: (_, __, row) => formatDecimal(getHeight(row))
        },
        { 
            data: null,
            render: (_, __, row) => formatDecimal(getCurrentStock(row))
        },
        { 
            data: null,
            render: (_, __, row) => formatDecimal(getMinStock(row))
        },
        { 
            data: null,
            render: (_, __, row) => getPresentation(row)
        },
        {
            data: 'convertedQuantity',
            render: formatDecimal
        },
        { 
            data: null,
            render: (_, __, row) => getUnitMeasure(row)
        }
    ];

    if (canSeeCost) {
        columns.push({ 
            data: null,
            render: (_, __, row) => formatCurrency (getMaxUnitCost(row))
        });
    }

    if (canSeeActive) {
        columns.push({
            data: null,
            render: (_, __, row) => getIsActive(row) ? 'Sí' : 'No'
        });
    }

    if (showRollWeights) {
        columns.push(...['coneWeightKg', 'totalWeightKg', 'weightKg'].map(field => ({
            data: field,
            orderable: false,
            render: (value, _, row) => isRollPresentation(getPresentation(row)) && value != null
                ? formatDecimal(value) : '—'
        })));
    }

    if (canManageItems) {
        columns.push({
            data: null,
            title: 'Acciones',
            render: renderActions
        });
    }

    return columns;
};
