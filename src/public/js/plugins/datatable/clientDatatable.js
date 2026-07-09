import { getAllClients } from "../../application/sales/clients.js";
import { exportClientReport } from "../../application/sales/report.js";
import { openClientModal } from "../../modules/clients/clientModal.js";
import { createDataTable, renderActionButtons } from "./baseDatatable.js";
import { buildExcelButton, buildTableExportParams } from "../../ui/tableUI.js";
import { getResponsiveRowData } from "./utils/responsive.js";
import { DATATABLE_SELECTORS } from "../../constants/selectors.js";
import { formatFileName } from "../../utils/formatters.js";

const selector = DATATABLE_SELECTORS.MAIN;

export const createClientDatatable = () => {

    const table = createDataTable({
        options: {
            ajax: {
                get: getAllClients
            },
            searchPlaceholder: 'Buscar por Nombre',
            columns: [
                { data: 'name', title: 'Nombre' },
                {
                    data: null,
                    title: 'Acciones',
                    render: () => renderActionButtons({ context: 'client' })
                }
            ],
            buttons: [
                buildExcelButton({
                    filename: formatFileName('reporte_clientes'),
                    allowMonthlyReport: false,
                    request: () => exportClientReport(buildTableExportParams(table))
                }),
                {
                    text: 'Nuevo cliente',
                    action: () => openClientModal({ mode: 'create' })
                }
            ]
        }
    });

    $(`${ selector } tbody`).on('click', '.btn-edit', function () {

        const data = getResponsiveRowData(table, this);

        openClientModal({ mode: 'edit', data });
    });
}
