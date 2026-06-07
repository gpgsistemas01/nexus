import { createDataTable, renderActionButtons } from "./baseDatatable.js";
import { hasPermission } from "../../utils/permissions.js";
import { renderMaterialName } from "./utils/renderProductDatatable.js";
import { getAllWastes } from "../../application/warehouse/wastes.js";
import { openWasteModal } from "../../pages/warehouse/wastesPage.js";
import { getResponsiveRowData } from "./utils/responsive.js";

const selectorTable = '#table';
const tableElement = document.querySelector(selectorTable);


const renderWasteTableHeader = ({ canSeeCost, canManageWastes }) => {

    tableElement.innerHTML = `
        <thead>
            <tr>
                <th rowspan="2">Material</th>
                <th colspan="2">Medidas</th>
                <th rowspan="2">Existencia</th>
                <th rowspan="2">Stock Mínimo</th>
                <th rowspan="2">Presentación</th>
                <th colspan="2">Conversión</th>
                ${ canSeeCost ? '<th rowspan="2">Costo Unitario</th>' : '' }
                ${ canManageWastes ? '<th rowspan="2">Acciones</th>' : '' }
            </tr>
            <tr>
                <th>Base</th>
                <th>Altura</th>
                <th>Cantidad</th>
                <th>Unidad</th>
            </tr>
        </thead>
    `;
};

export const createWasteDatatable = (context) => {

    const { isWarehouse, isSystem, isSales } = hasPermission(context);
    const canSeeCost = isWarehouse || isSystem || isSales;
    const canManageWastes = isWarehouse || isSystem;

    renderWasteTableHeader({ canSeeCost, canManageWastes });

    const columns = [
        { 
            data: null, 
            title: 'Material',
            render: (data, type, row) => renderMaterialName(row)
        },
        { data: 'base', title: 'Base' },
        { data: 'height', title: 'Altura' },
        { data: 'currentStock', title: 'Existencia' },
        { data: 'minStock', title: 'Stock Mínimo' },
        { data: 'presentation.name', title: 'Presentación' },
        { data: 'convertedQuantity', title: 'Cantidad' },
        { data: 'unitMeasure.name', title: 'Unidad' }
    ];

    if (canSeeCost) {
        columns.push({ data: 'maxUnitCost', title: 'Costo Unitario de Conversión' });
    }

    if (canManageWastes) {
        columns.push({
            data: null,
            title: 'Acciones',
            render: () => renderActionButtons({ status: 'Abierta', context: 'product' })
        });
    }

    const table = createDataTable({
        options: {
            ajax: {
                get: getAllWastes
            },
            columns,
            buttons: [
                ...(canManageWastes ? [{
                    text: 'Nueva merma',
                    action: () => openWasteModal({ mode: 'create' })
                }] : [])
            ]
        }
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-edit', async function() {

        const data = getResponsiveRowData(table, this);

        await openWasteModal({ mode: 'edit', data });
    });
};
