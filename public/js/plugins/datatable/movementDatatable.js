import { getAllMovements } from "../../application/admin/movements.js";
import { exportMovementReport } from "../../application/admin/report.js";
import { buildExcelButton, buildTableExportParams } from "../../ui/tableUI.js";
import { formatFileName } from "../../utils/formatters.js";
import { getMovementTypeSelectApi, getMovementTypeData, attachMovementTypeFilterHandler, initMovementTypeFilterSelect } from "../select2/domains/movementType.js";
import { createDataTable, renderActionButtons } from "./baseDatatable.js";
import { setupTableFilters } from "./utils/filters/tableFilter.js";
import { DATATABLE_SELECTORS } from "../../constants/selectors.js";

const selector = DATATABLE_SELECTORS.MAIN;
let filters = {
    getValues: () => ({})
};

export const createMovementDatatable = async () => {

    let table;

    filters = await setupTableFilters({
        fields: [
            'date',
            {
                key: 'movementType',
                isSelected: false,
                getSelectApi: getMovementTypeSelectApi,
                getOptions: getMovementTypeData,
                initSelect: initMovementTypeFilterSelect,
                attachHandler: ({ onChange }) => attachMovementTypeFilterHandler({
                    onChange
                })
            },
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
            order: [[2, 'desc']],
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
                { data: 'productBase', title: 'Base' },
                { data: 'productHeight', title: 'Altura' },
                { data: 'supplierName', title: 'Proveedor' },
                { data: 'previousStock', title: 'Stock Anterior' },
                { data: 'quantity', title: 'Movimiento' },
                { data: 'newStock', title: 'Stock Nuevo' },
            ],
            buttons: [
                buildExcelButton({
                    filename: formatFileName('reporte_movimientos'),
                    request: () => exportMovementReport(buildTableExportParams(table, filters.getValues()))
                })
            ]
        }
    });
}
