import { DOM_EVENT_NAMES } from '../../../../constants/events.js';
import { FORM_MODES } from '../../../../constants/formModes.js';
import { getAllClients } from "../../../../application/sales/clients/clients.js";
import { exportClientReport } from "../../../../application/sales/report.js";
import { openClientModal } from "../../../../pages/sales/clients/clientModal.js";
import { createDataTable, renderActionButtons } from "../../core/baseDatatable.js";
import { buildExcelButton, buildTableExportParams } from "../../../../ui/tableUI.js";
import { getResponsiveRowData } from "../../core/responsive.js";
import { DATATABLE_SELECTORS } from "../../../../constants/selectors.js";
import { formatFileName } from "../../../../utils/formatters.js";

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
                {
                    text: 'Nuevo cliente',
                    action: () => openClientModal({ mode: FORM_MODES.CREATE })
                },
                buildExcelButton({
                    filename: formatFileName('reporte_clientes'),
                    allowMonthlyReport: false,
                    request: () => exportClientReport(buildTableExportParams(table))
                })
            ]
        }
    });

    $(`${ selector } tbody`).on(DOM_EVENT_NAMES.CLICK, '.btn-edit', function () {

        const data = getResponsiveRowData(table, this);

        openClientModal({ mode: FORM_MODES.EDIT, data });
    });
}
