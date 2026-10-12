import { formatCurrency, formatDecimal } from "../../../../utils/formatUtils.js";
import { buildInventorySelectText, getBase, getCurrentStock, getHeight, getIsActive, getMaxUnitCost, getMinStock, getPresentation, getUnitMeasure } from "../../../../utils/warehouseInventoryUtils.js";

export const renderWarehouseInventoryHeader = ({ tableElement, canSeeActive, canSeeCost, canManageItems, showWeight = false }) => {

    tableElement.innerHTML = `
        <thead>
            <tr>
                <th rowspan="2">Material</th>
                <th colspan="2" data-responsive-group="measures">Medidas</th>
                <th rowspan="2">Existencia</th>
                <th rowspan="2">Stock Mínimo</th>
                <th rowspan="2">Presentación</th>
                ${ showWeight ? '<th rowspan="2">Peso unitario (kg)</th>' : '' }
                <th colspan="2" data-responsive-group="conversion">Conversión</th>
                ${ canSeeCost ? '<th rowspan="2">Costo Unitario de Conversión</th>' : '' }
                ${ canSeeActive ? '<th rowspan="2">Activo</th>' : '' }
                ${ canManageItems ? '<th rowspan="2">Acciones</th>' : '' }
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

export const buildWarehouseInventoryColumns = ({ canSeeActive, canSeeCost, canManageItems, renderActions, showWeight = false }) => {

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

    if (showWeight) columns.splice(6, 0, {
        data: 'weightKg',
        orderable: false,
        render: value => value === null || value === undefined ? '—' : formatDecimal(value)
    });

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

    if (canManageItems) {
        columns.push({
            data: null,
            title: 'Acciones',
            render: renderActions
        });
    }

    return columns;
};
