import { getAllMovements } from "../../application/admin/movements.js";
import { exportMovementReport } from "../../application/admin/report.js";
import { buildExcelButton, buildTableExportParams } from "../../ui/tableUI.js";
import { formatFileName } from "../../utils/formatters.js";
import { createDataTable, renderActionButtons } from "./baseDatatable.js";
import { setupTableFilters } from "./utils/filters/tableFilter.js";
import { DATATABLE_SELECTORS } from "../../constants/selectors.js";
import { formatDecimal } from "../../utils/formatUtils.js";

const selector = DATATABLE_SELECTORS.MAIN;
let filters = {
    getValues: () => ({})
};

export const createMovementDatatable = async () => {

    let table;

    filters = await setupTableFilters({
        fields: [
            'date',
            'movementType',
            'supplier',
            'product'
        ]
    });

    table = createDataTable({
        options: {
            ajax: {
                get: (params) => getAllMovements({
                    ...params,
                    ...filters.getValues()
                })
            },
            order: [[0, 'desc']],
            searchPlaceholder: 'Buscar por Material, Proveedor o Folio',
            columns: [
                { data: 'date', title: 'Fecha' },
                {
                    data: 'type',
                    title: 'Tipo',
                    render: (data) => {

                        if (data === 'ENTRY') return 'Entrada';

                        if (data === 'ADJUSTMENT') return 'Ajuste';

                        if (data === 'ISSUE') return 'Salida';

                        return data;
                    }
                },
                { data: 'referenceNumber', title: 'Folio' },
                { data: 'productName', title: 'Material' },
                { data: 'productBase', render: formatDecimal, title: 'Base' },
                { data: 'productHeight', render: formatDecimal, title: 'Altura' },
                { data: 'supplierName', title: 'Proveedor' },
                { data: 'previousStock', render: formatDecimal, title: 'Stock Anterior' },
                { data: 'quantity', render: formatDecimal, title: 'Movimiento' },
                { data: 'newStock', render: formatDecimal, title: 'Stock Nuevo' },
            ],
            buttons: [
                buildExcelButton({
                    filename: formatFileName('reporte_movimientos'),
                    request: ({ monthlyReport = false } = {}) => exportMovementReport(buildTableExportParams(table, {
                        ...filters.getValues(),
                        monthlyReport
                    }))
                })
            ]
        }
    });
}
