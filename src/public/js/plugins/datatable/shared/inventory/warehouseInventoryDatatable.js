import { formatCurrency, formatDecimal } from "../../../../utils/formatUtils.js";
import { buildInventorySelectText, getBase, getCurrentStock, getHeight, getMaxUnitCost, getMinStock, getPresentation, getUnitMeasure } from "../../../../utils/warehouseInventoryUtils.js";

const CENTERED_CELL_CLASS = 'text-center align-middle';

export const renderWarehouseInventoryHeader = ({ tableElement, canSeeCost, canManageItems }) => {

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

export const buildWarehouseInventoryColumns = ({ canSeeCost, canManageItems, renderActions }) => {

    const columns = [
        {
            data: null,
            className: CENTERED_CELL_CLASS,
            render: (data, type, row) => buildInventorySelectText(row)
        },
        { 
            data: null,
            className: CENTERED_CELL_CLASS,
            render: (_, __, row) => formatDecimal(getBase(row))
        },
        { 
            data: null,
            className: CENTERED_CELL_CLASS,
            render: (_, __, row) => formatDecimal(getHeight(row))
        },
        { 
            data: null,
            className: CENTERED_CELL_CLASS,
            render: (_, __, row) => formatDecimal(getCurrentStock(row))
        },
        { 
            data: null,
            className: CENTERED_CELL_CLASS,
            render: (_, __, row) => formatDecimal(getMinStock(row))
        },
        { 
            data: null,
            className: CENTERED_CELL_CLASS,
            render: (_, __, row) => getPresentation(row)
        },
        {
            data: 'convertedQuantity',
            className: CENTERED_CELL_CLASS,
            render: formatDecimal
        },
        { 
            data: null,
            className: CENTERED_CELL_CLASS,
            render: (_, __, row) => getUnitMeasure(row)
        }
    ];

    if (canSeeCost) {
        columns.push({ 
            data: null,
            className: CENTERED_CELL_CLASS,
            render: (_, __, row) => formatCurrency (getMaxUnitCost(row))
        });
    }

    if (canManageItems) {
        columns.push({
            data: null,
            title: 'Acciones',
            className: CENTERED_CELL_CLASS,
            render: renderActions
        });
    }

    return columns;
};
