import { getAllProfiles } from "../../application/admin/profiles.js";
import { openProfileModal } from "../../pages/admin/profilesPage.js";
import { createDataTable, renderActionButtons } from "./baseDatatable.js";
import { getResponsiveRowData } from "./utils/responsive.js";
import { setupTableFilters } from "./utils/filters/tableFilter.js";
import { getSelectedDepartmentName } from "../select2/domains/department.js";
import { DATATABLE_SELECTORS } from "../../constants/selectors.js";

const selector = DATATABLE_SELECTORS.MAIN;

export const createProfilesDatatable = async () => {

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
                    render: () => renderActionButtons({ context: 'profile' })
                }
            ],
            buttons: [
                {
                    text: 'Nuevo perfil',
                    action: () => openProfileModal({ mode: 'create' })
                }
            ]
        }
    });

    $(`${ selector } tbody`).on('click', '.btn-edit', function () {

        const data = getResponsiveRowData(table, this);

        openProfileModal({ mode: 'edit', data });
    });
}
