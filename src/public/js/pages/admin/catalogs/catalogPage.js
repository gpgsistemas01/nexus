import { getSuccessMessage } from '../../../constants/apiMessages.js';
import { createDataTable } from '../../../plugins/datatable/core/base/createDataTable.js';
import { getResponsiveRowData } from '../../../plugins/datatable/core/responsive/rowData.js';
import { notifications } from '../../../plugins/swal/swalComponent.js';
import { closeModal, openModal } from '../../../ui/modalUI.js';
import {
    createCatalogEntryRequest,
    deleteCatalogEntryRequest,
    getCatalogEntriesRequest,
    updateCatalogEntryRequest
} from '../../../services/admin/catalogService.js';

const config = window.catalogConfig;
const form = document.querySelector('#catalogForm');
const modal = document.querySelector('#catalogModal');
const modalTitle = modal.querySelector('#modalTitle');

const renderActions = () => `
    <button type="button" class="btn btn-link btn-sm btn-edit" aria-label="Editar registro"><i class="fa-solid fa-pen"></i></button>
    <button type="button" class="btn btn-link btn-sm text-danger btn-delete" aria-label="Eliminar registro"><i class="fa-solid fa-trash"></i></button>`;

const columns = [
    ...config.fields.map(field => ({
        data: field.name,
        title: field.label,
        ...(field.type === 'checkbox' && { render: value => value ? 'Sí' : 'No' })
    })),
    { data: null, title: 'Acciones', orderable: false, searchable: false, render: renderActions }
];

const table = createDataTable({
    options: {
        ajax: { get: params => getCatalogEntriesRequest({ route: config.apiRoute, params }) },
        searchPlaceholder: 'Buscar por nombre',
        columns,
        buttons: [{ text: 'Nuevo registro', action: () => openCatalogModal() }]
    }
});

const openCatalogModal = (entry = null) => {
    form.reset();
    form.dataset.id = entry?.id || '';
    modalTitle.textContent = entry ? `Editar ${ config.title.toLowerCase() }` : `Registrar ${ config.title.toLowerCase() }`;

    config.fields.forEach(field => {
        const input = form.elements[field.name];
        if (field.type === 'checkbox') input.checked = entry ? Boolean(entry[field.name]) : true;
        else input.value = entry?.[field.name] || '';
    });

    openModal(modal);
};

form.addEventListener('submit', async event => {
    event.preventDefault();
    const data = Object.fromEntries(config.fields.map(field => [
        field.name,
        field.type === 'checkbox' ? form.elements[field.name].checked : form.elements[field.name].value
    ]));

    try {
        const response = form.dataset.id
            ? await updateCatalogEntryRequest({ route: config.apiRoute, id: form.dataset.id, data })
            : await createCatalogEntryRequest({ route: config.apiRoute, data });

        notifications.showSuccess(getSuccessMessage(response.data.code));
        closeModal(form);
        table.ajax.reload(null, false);
    } catch (error) {
        notifications.showError(error.message);
    }
});

$('#table tbody').on('click', '.btn-edit', function () {
    openCatalogModal(getResponsiveRowData(table, this));
});

$('#table tbody').on('click', '.btn-delete', async function () {
    const entry = getResponsiveRowData(table, this);
    const result = await notifications.showConfirmation({
        title: 'Eliminar registro',
        text: `Se eliminará “${ entry.name }”.`,
        confirmButtonText: 'Eliminar'
    });

    if (!result.isConfirmed) return;

    try {
        const response = await deleteCatalogEntryRequest({ route: config.apiRoute, id: entry.id });
        notifications.showSuccess(getSuccessMessage(response.data.code));
        table.ajax.reload(null, false);
    } catch (error) {
        notifications.showError(error.message);
    }
});
