import { getAllMovements } from "../../application/admin/movements.js";
import { exportMovementReport } from "../../application/admin/report.js";
import { buildExcelButton, buildTableExportParams } from "../../ui/tableUI.js";
import { formatFileName } from "../../utils/formatters.js";
import { createDataTable } from "./baseDatatable.js";
import { formatDecimal } from "../../utils/formatUtils.js";

const movementColumns = [
    { data: 'date', title: 'Fecha' },
    { data: 'type', title: 'Tipo' },
    { data: 'referenceNumber', title: 'Folio' },
    { data: 'materialName', title: 'Material' },
    { data: 'materialBase', render: formatDecimal, title: 'Base' },
    { data: 'materialHeight', render: formatDecimal, title: 'Altura' },
    { data: 'supplierName', title: 'Proveedor' },
    { data: 'previousStock', render: formatDecimal, title: 'Stock Anterior' },
    { data: 'quantity', render: formatDecimal, title: 'Movimiento' },
    { data: 'newStock', render: formatDecimal, title: 'Stock Nuevo' }
];

const MOVEMENT_CONTEXTS = Object.freeze({
    material: { api: 'materials', filename: 'reporte_movimientos' },
    waste: { api: 'wastes', filename: 'reporte_movimientos_merma' }
});

export const createMovementDatatable = ({ context, filters, selector }) => {
    const config = MOVEMENT_CONTEXTS[context];
    if (!config) return null;

    let table;

    table = createDataTable({
        selector,
        options: {
            ajax: {
                get: (params) => getAllMovements({
                    context: config.api,
                    params: { ...params, ...filters.getValues() }
                })
            },
            order: [[0, 'desc']],
            searchPlaceholder: 'Buscar por Material, Proveedor o Folio',
            columns: movementColumns,
            buttons: [buildExcelButton({
                filename: formatFileName(config.filename),
                request: ({ monthlyReport = false } = {}) => exportMovementReport({
                    context: config.api,
                    params: buildTableExportParams(table, {
                        ...filters.getValues(),
                        monthlyReport
                    })
                })
            })]
        }
    });

    return table;
};
