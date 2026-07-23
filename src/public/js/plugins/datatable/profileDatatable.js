import { getAllProfiles } from "../../application/admin/profiles.js";
import { exportProfileReport } from "../../application/admin/report.js";
import { openProfileModal } from "../../pages/admin/profilesPage.js";
import { createDataTable, renderActionButtons } from "./baseDatatable.js";
import { buildExcelButton, buildTableExportParams } from "../../ui/tableUI.js";
import { formatFileName } from "../../utils/formatters.js";
import { getResponsiveRowData } from "./utils/responsive.js";
import { setupTableFilters } from "./utils/filters/tableFilter.js";
import { getSelectedDepartmentName } from "../select2/domains/department.js";
import { DATATABLE_SELECTORS } from "../../constants/selectors.js";

const selector = DATATABLE_SELECTORS.MAIN;

export const createProfilesDatatable = async ({ canManageProfiles = false } = {}) => {

    const filters = await setupTableFilters({
        fields: ['department']
    });

    const table = createDataTable({
        options: {
            ajax: {
                get: (data) => getAllProfiles({
                    ...data,
                    includeDepartments: true,
                    department: getSelectedDepartmentName(),
                    strictDepartmentFilter: Boolean(filters.getValues().departmentId)
                })
            },
            searchPlaceholder: 'Buscar por Nombre',
            columns: [
                { data: 'fullName', title: 'Nombre' },
                { 
                    data: 'departments',
                    title: 'Áreas',
                    render: (data) => data.map(d => d.name).join(', ')
                },
                {
                    data: null,
                    title: 'Acciones',
                    render: () => canManageProfiles ? renderActionButtons({ context: 'profile' }) : ''
                }
            ],
            buttons: [
                ...(canManageProfiles ? [{
                    text: 'Nuevo perfil',
                    action: () => openProfileModal({ mode: 'create' })
                },
                buildExcelButton({
                    filename: formatFileName('reporte_perfiles'),
                    allowMonthlyReport: false,
                    request: () => exportProfileReport(buildTableExportParams(table, {
                        includeDepartments: true,
                        department: getSelectedDepartmentName(),
                        strictDepartmentFilter: Boolean(filters.getValues().departmentId)
                    }))
                })] : [])
            ]
        }
    });

    $(`${ selector } tbody`).on('click', '.btn-edit', function () {

        const data = getResponsiveRowData(table, this);

        openProfileModal({ mode: 'edit', data });
    });
}
