import { DOM_EVENT_NAMES } from '../../../../constants/events.js';
import { FORM_MODES } from '../../../../constants/formModes.js';
import { getAllUsers } from '../../../../application/admin/users/users.js';
import { openUserModal } from '../../../../pages/admin/usersPage.js';
import { createDataTable } from '../../core/baseDatatable.js';
import { exportUserReport } from '../../../../application/admin/report.js';
import { buildExcelButton, buildTableExportParams } from '../../../../ui/tableUI.js';
import { formatFileName } from '../../../../utils/formatters.js';
import { buildMdbActionButton, buildMdbEditActionButton } from '../../../mdb/actionButton.js';
import { getResponsiveRowData } from '../../core/responsive.js';
import { DATATABLE_SELECTORS } from "../../../../constants/selectors.js";

const selectorTable = DATATABLE_SELECTORS.MAIN;

export const createUserDatatable = () => {

    const table = createDataTable({
        options: {
            ajax: {
                get: getAllUsers
            },
            searchPlaceholder: 'Buscar por Usuario',
            columns: [
                { data: 'name', title: 'Usuario' },
                { data: 'person.fullName', title: 'Persona', defaultContent: '-' },
                {
                    data: null,
                    title: 'Acciones',
                    orderable: false,
                    render: () => [
                        buildMdbEditActionButton({
                            className: 'btn-edit',
                            label: 'Editar usuario'
                        }),
                        buildMdbActionButton({
                            className: 'btn-edit-password',
                            colorClass: 'btn-warning',
                            iconClass: 'fa-solid fa-key',
                            label: 'Cambiar contraseña',
                            rippleColor: 'dark'
                        })
                    ].join('')
                }
            ],
            buttons: [
                {
                    text: 'Nuevo usuario',
                    action: () => openUserModal({ mode: FORM_MODES.CREATE })
                },
                buildExcelButton({
                    filename: formatFileName('reporte_usuarios'),
                    allowMonthlyReport: false,
                    request: () => exportUserReport(buildTableExportParams(table))
                })
            ]
        }
    });

    $(`${ selectorTable } tbody`).on(DOM_EVENT_NAMES.CLICK, '.btn-edit', function() {

        const data = getResponsiveRowData(table, this);

        openUserModal({ mode: FORM_MODES.EDIT, data });
    });

    $(`${ selectorTable } tbody`).on(DOM_EVENT_NAMES.CLICK, '.btn-edit-password', function() {

        const data = getResponsiveRowData(table, this);

        openUserModal({ mode: FORM_MODES.EDIT_PASSWORD, data });
    });
};
