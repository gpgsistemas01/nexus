import { renderMaterialName } from "./renderProductDatatable.js";
import { formatCurrency, formatDecimal } from "../../../utils/formatUtils.js";

export const renderWarehouseInventoryHeader = ({ tableElement, canSeeCost, canManageItems, stockTitle, costTitle }) => {

    if (!tableElement) return;

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

export const buildWarehouseInventoryColumns = ({ canSeeCost, canManageItems, costTitle, renderActions }) => {

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
        columns.push({ data: 'maxUnitCost', title: costTitle, render: formatCurrency });
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
