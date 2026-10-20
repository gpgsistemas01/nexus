import { DOM_EVENT_NAMES } from '../../../../constants/events.js';
import { createDataTable } from '../../core/base/createDataTable.js';
import { refreshDataTable, resetDataTable } from '../../core/base/tableOperations.js';
import { buildMdbDeleteActionButton } from '../../../mdb/actionButton.js';

const personAccessTableSelector = '#personAccessesTable';

export const personAccesses = [];

export const refreshPersonAccessTable = () => refreshDataTable({
    selector: personAccessTableSelector,
    data: personAccesses
});

export const initPersonAccessTable = (accesses = []) => {
    personAccesses.length = 0;
    personAccesses.push(...accesses.map(access => ({
        departmentId: access.department.id,
        departmentName: access.department.name,
        roleId: access.role.id,
        roleName: access.role.name
    })));

    resetDataTable(personAccessTableSelector);

    createDataTable({
        selector: personAccessTableSelector,
        options: {
            data: personAccesses,
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
                    render: (data, type, row, meta) => buildMdbDeleteActionButton({
                        className: 'delete-btn',
                        label: `Eliminar acceso de ${ row.departmentName } con rol ${ row.roleName }`,
                        htmlAttrs: {
                            'data-index': meta.row
                        }
                    })
                }
            ]
        }
    });
};

$(personAccessTableSelector).on(DOM_EVENT_NAMES.CLICK, '.delete-btn', function() {
    personAccesses.splice($(this).data('index'), 1);
    refreshPersonAccessTable();
});
