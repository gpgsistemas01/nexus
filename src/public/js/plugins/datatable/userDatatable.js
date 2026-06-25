import { getAllUsers } from '../../application/admin/users.js';
import { openUserModal } from '../../pages/admin/usersPage.js';
import { createDataTable } from './baseDatatable.js';
import { buildMdbActionButton } from '../mdb/actionButton.js';
import { getResponsiveRowData } from './utils/responsive.js';
import { DATATABLE_SELECTORS } from "../../constants/selectors.js";

const selectorTable = DATATABLE_SELECTORS.MAIN;

export const createUserDatatable = () => {

    const table = createDataTable({
        options: {
            ajax: {
                get: getAllUsers
            },
            columns: [
                { data: 'name', title: 'Usuario' },
                { data: 'profile.fullName', title: 'Perfil', defaultContent: '-' },
                {
                    data: null,
                    title: 'Acciones',
                    orderable: false,
                    render: () => [
                        buildMdbActionButton({
                            className: 'btn-edit',
                            colorClass: 'btn-primary',
                            iconClass: 'fa-solid fa-pencil',
                            title: 'Editar',
                            ariaLabel: 'Editar usuario'
                        }),
                        buildMdbActionButton({
                            className: 'btn-edit-password',
                            colorClass: 'btn-warning',
                            iconClass: 'fa-solid fa-key',
                            title: 'Cambiar contraseña',
                            ariaLabel: 'Cambiar contraseña',
                            rippleColor: 'dark'
                        })
                    ].join('')
                }
            ],
            buttons: [
                {
                    text: 'Nuevo usuario',
                    action: () => openUserModal({ mode: 'create' })
                }
            ]
        }
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-edit', function() {

        const data = getResponsiveRowData(table, this);

        openUserModal({ mode: 'edit', data });
    });

    $(`${ selectorTable } tbody`).on('click', '.btn-edit-password', function() {

        const data = getResponsiveRowData(table, this);

        openUserModal({ mode: 'edit-password', data });
    });
};
