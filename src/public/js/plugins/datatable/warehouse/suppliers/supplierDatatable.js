import { DOM_EVENT_NAMES } from '../../../../constants/events.js';
import { FORM_MODES } from '../../../../constants/formModes.js';
import { getAllSuppliers } from "../../../../application/warehouse/suppliers/suppliers.js";
import { exportSupplierReport } from "../../../../application/warehouse/report.js";
import { openSupplierModal } from "../../../../pages/warehouse/suppliers/supplierModal.js";
import { createDataTable } from '../../core/base/createDataTable.js';
import { renderActionButtons } from '../../core/base/actionButtons.js';
import { buildExcelButton, buildTableExportParams } from "../../../../ui/tableUI.js";
import { getResponsiveRowData } from '../../core/responsive/rowData.js';
import { DATATABLE_SELECTORS } from "../../../../constants/selectors.js";
import { formatFileName } from "../../../../utils/formatters.js";
import { hasPermission, UI_PERMISSIONS } from "../../../../constants/permissions.js";

const selector = DATATABLE_SELECTORS.MAIN;

export const createSupplierDatatable = (context) => {

    const canSeeActive = hasPermission(context, UI_PERMISSIONS.CATALOGS_MANAGE);

    const table = createDataTable({
        options: {
            ajax: {
                get: getAllSuppliers
            },
            searchPlaceholder: 'Buscar por Nombre comercial o Razón social',
            columns: [
                { data: 'tradeName', title: 'Nombre comercial' },
                { data: 'legalName', title: 'Razón social' },
                ...(canSeeActive ? [{
                    data: 'isActive',
                    title: 'Activo',
                    render: value => value ? 'Sí' : 'No'
                }] : []),
                {
                    data: null,
                    title: 'Acciones',
                    render: () => renderActionButtons({ context: 'supplier' })
                }
            ],
            buttons: [
                {
                    text: 'Nuevo proveedor',
                    action: () => openSupplierModal({ mode: FORM_MODES.CREATE })
                },
                buildExcelButton({
                    filename: formatFileName('reporte_proveedores'),
                    allowMonthlyReport: false,
                    request: () => exportSupplierReport(buildTableExportParams(table))
                })
            ]
        }
    });

    $(`${ selector } tbody`).on(DOM_EVENT_NAMES.CLICK, '.btn-edit', function () {

        const data = getResponsiveRowData(table, this);

        openSupplierModal({ mode: FORM_MODES.EDIT, data });
    });
}
