import { handleDataTableError, normalizeJqAjaxError } from "../../api/errorHandler.js";

export const createDataTable = ({ selector = '#table', options = {} }) => {

    const ajaxUrl = options.ajax || null;

    return $(selector).DataTable({
        ...options,
        ajax: ajaxUrl ? async (data, callback) => {

            try {

                const response = await $.ajax({
                    url: ajaxUrl,
                    method: 'GET',
                    data
                });

                callback(response);

            } catch (jdqXHR) {

                const err = normalizeJqAjaxError(jdqXHR);

                handleDataTableError(err);

                callback({
                    draw: data.draw,
                    data: [],
                    recordsTotal: 0,
                    recordsFiltered: 0
                });
            }
        } : undefined,
        dom: 'Bfrtip',
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
        },
        responsive: true,
        autoWidth: false,
        serverSide: options.ajax ? true : false,
        processing: options.ajax ? true : false,
    });
}

export const reloadMainTable = () => {

    const table = $('#table').DataTable();
    table.ajax.reload(null, false);
}

export const refreshProductTable = (details) => {

    const table = $('#productTable').DataTable();
    table.clear();
    table.rows.add(details);
    table.draw();
}

export const renderActionButtons = ({ status, context }) => {

    const actions = [];

    if (status === 'Abierta') actions.push('<button class="btn-edit"><i class="fa-solid fa-pencil"></i></button>');

    if (status === 'Aprobada' && context === 'goodsIssue') actions.push('<button class="btn-edit-detail"><i class="fa fa-edit"></i></button>');

    if (context !== 'product') actions.push('<button class="btn-view"><i class="fa fa-eye"></i></button>');

    return actions.join('');
}