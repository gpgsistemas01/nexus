import { formatCurrency, formatDecimal } from "../../../../utils/formatUtils.js";
import { buildInventorySelectText, getBase, getCurrentStock, getHeight, getMaxUnitCost, getMinStock, getPresentation, getUnitMeasure } from "../../../../utils/warehouseInventoryUtils.js";

export const renderWarehouseInventoryHeader = ({ tableElement, canSeeCost, canManageItems, stockTitle, costTitle }) => {

    tableElement.innerHTML = `
        <thead>
            <tr>
                <th rowspan="2">Material</th>
                <th colspan="2" data-responsive-group="measures">Medidas</th>
                <th rowspan="2">${ stockTitle }</th>
                <th rowspan="2">Stock Mínimo</th>
                <th rowspan="2">Presentación</th>
                <th colspan="2" data-responsive-group="conversion">Conversión</th>
                ${ canSeeCost ? `<th rowspan="2">${ costTitle }</th>` : '' }
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
        { data: 'convertedQuantity', render: formatDecimal },
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

    if (canManageItems) {
        columns.push({
            data: null,
            title: 'Acciones',
            render: renderActions
        });
    }

    return columns;
};
