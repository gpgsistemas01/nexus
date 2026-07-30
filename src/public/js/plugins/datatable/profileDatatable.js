import { getAllProfiles } from "../../application/admin/profiles.js";
import { exportProfileReport } from "../../application/admin/report.js";
import { openProfileModal } from "../../pages/admin/profilesPage.js";
import { createDataTable, refreshDataTable, renderActionButtons, resetDataTable } from "./baseDatatable.js";
import { buildExcelButton, buildTableExportParams } from "../../ui/tableUI.js";
import { formatFileName } from "../../utils/formatters.js";
import { getResponsiveRowData } from "./utils/responsive.js";
import { setupTableFilters } from "./utils/filters/tableFilter.js";
import { getSelectedOptionText } from "../../utils/domUtils.js";
import { DATATABLE_SELECTORS, FILTER_SELECTORS } from "../../constants/selectors.js";
import { buildMdbActionButton } from "../mdb/actionButton.js";

const selector = DATATABLE_SELECTORS.MAIN;

export const createProfilesDatatable = async ({ canManageProfiles = false } = {}) => {

    const filters = await setupTableFilters({
        fields: ['department', 'role']
    });

    const table = createDataTable({
        options: {
            ajax: {
                get: (data) => getAllProfiles({
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
                        includeAccesses: true,
                        department: getSelectedOptionText(FILTER_SELECTORS.DEPARTMENT),
                        role: getSelectedOptionText(FILTER_SELECTORS.ROLE),
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

const profileAccessTableSelector = '#profileAccessesTable';

export const profileAccesses = [];

export const refreshProfileAccessTable = () => refreshDataTable({
    selector: profileAccessTableSelector,
    data: profileAccesses
});

export const initProfileAccessTable = (accesses = []) => {
    profileAccesses.length = 0;
    profileAccesses.push(...accesses.map(access => ({
        departmentId: access.department.id,
        departmentName: access.department.name,
        roleId: access.role.id,
        roleName: access.role.name
    })));

    resetDataTable(profileAccessTableSelector);

    createDataTable({
        selector: profileAccessTableSelector,
        options: {
            data: profileAccesses,
            paging: false,
            searching: false,
            dom: 'rtip',
            language: { emptyTable: 'No se han agregado accesos.' },
            columns: [
                { data: 'departmentName', title: 'Área' },
                { data: 'roleName', title: 'Rol' },
                {
                    data: null,
                    title: 'Acciones',
                    render: (data, type, row, meta) => buildMdbActionButton({
                        className: 'delete-btn',
                        colorClass: 'btn-danger',
                        iconClass: 'fa-solid fa-trash',
                        title: 'Eliminar acceso',
                        ariaLabel: `Eliminar acceso de ${ row.departmentName } con rol ${ row.roleName }`,
                        htmlAttrs: {
                            'data-index': meta.row
                        }
                    })
                }
            ]
        }
    });
};

$(profileAccessTableSelector).on('click', '.delete-btn', function() {
    profileAccesses.splice($(this).data('index'), 1);
    refreshProfileAccessTable();
});
