import { createDataTable } from "./baseDatatable.js";

const selector = '#profileAccessesTable';

export const profileAccesses = [];

export const refreshProfileAccessTable = () => {
    const table = $(selector).DataTable();
    table.clear();
    table.rows.add(profileAccesses);
    table.draw();
};

export const initProfileAccessTable = (accesses = []) => {
    profileAccesses.length = 0;
    profileAccesses.push(...accesses.map(access => ({
        departmentId: access.department.id,
        departmentName: access.department.name,
        roleId: access.role.id,
        roleName: access.role.name
    })));

    if ($.fn.DataTable.isDataTable(selector)) {
        $(selector).DataTable().clear().destroy();
        $(selector).empty();
    }

    createDataTable({
        selector,
        options: {
            data: profileAccesses,
            paging: false,
            searching: false,
            info: false,
            language: { emptyTable: 'No se han agregado accesos.' },
            columns: [
                { data: 'departmentName', title: 'Área' },
                { data: 'roleName', title: 'Rol' },
                {
                    data: null,
                    title: 'Acciones',
                    render: (data, type, row, meta) => `
                        <button type="button" class="btn btn-outline-danger btn-sm delete-btn" data-index="${ meta.row }">
                            Eliminar
                        </button>
                    `
                }
            ]
        }
    });
};

$(selector).on('click', '.delete-btn', function() {
    profileAccesses.splice($(this).data('index'), 1);
    refreshProfileAccessTable();
});
