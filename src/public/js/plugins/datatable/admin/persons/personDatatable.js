import { DOM_EVENT_NAMES } from '../../../../constants/events.js';
import { FORM_MODES } from '../../../../constants/formModes.js';
import { getAllPersons } from "../../../../application/admin/persons/persons.js";
import { exportPersonReport } from "../../../../application/admin/report.js";
import { openPersonModal } from "../../../../pages/admin/persons/personModal.js";
import { createDataTable } from '../../core/base/createDataTable.js';
import { renderActionButtons } from '../../core/base/actionButtons.js';
import { buildExcelButton, buildTableExportParams } from "../../../../ui/tableUI.js";
import { formatFileName } from "../../../../utils/formatters.js";
import { getResponsiveRowData } from '../../core/responsive/rowData.js';
import { setupTableFilters } from "../../core/filters/tableFilter.js";
import { getSelectedOptionText } from "../../../../utils/domUtils.js";
import { DATATABLE_SELECTORS, FILTER_SELECTORS } from "../../../../constants/selectors.js";

const selector = DATATABLE_SELECTORS.MAIN;

export const createPersonsDatatable = async ({ canManagePersons = false } = {}) => {

    const filters = await setupTableFilters({
        fields: ['department', 'role']
    });

    const table = createDataTable({
        options: {
            ajax: {
                get: (data) => getAllPersons({
                    ...data,
                    includeAccesses: true,
                    department: getSelectedOptionText(FILTER_SELECTORS.DEPARTMENT),
                    role: getSelectedOptionText(FILTER_SELECTORS.ROLE),
                    strictDepartmentFilter: Boolean(filters.getValues().departmentId)
                })
            },
            searchPlaceholder: 'Buscar por Nombre',
            columns: [
                { data: 'fullName', title: 'Nombre' },
                {
                    data: 'accesses',
                    title: 'Accesos (área / rol)',
                    render: (data) => data.map(access =>
                        `${ access.department.name } — ${ access.role.name }`
                    ).join('<br>')
                },
                {
                    data: null,
                    title: 'Acciones',
                    render: () => canManagePersons ? renderActionButtons({ context: 'person' }) : ''
                }
            ],
            buttons: [
                ...(canManagePersons ? [{
                    text: 'Nueva persona',
                    action: () => openPersonModal({ mode: FORM_MODES.CREATE })
                },
                buildExcelButton({
                    filename: formatFileName('reporte_personas'),
                    allowMonthlyReport: false,
                    request: () => exportPersonReport(buildTableExportParams(table, {
                        includeAccesses: true,
                        department: getSelectedOptionText(FILTER_SELECTORS.DEPARTMENT),
                        role: getSelectedOptionText(FILTER_SELECTORS.ROLE),
                        strictDepartmentFilter: Boolean(filters.getValues().departmentId)
                    }))
                })] : [])
            ]
        }
    });

    $(`${ selector } tbody`).on(DOM_EVENT_NAMES.CLICK, '.btn-edit', function () {

        const data = getResponsiveRowData(table, this);

        openPersonModal({ mode: FORM_MODES.EDIT, data });
    });
}
