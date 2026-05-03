import { getErrorMessage } from "../constants/apiMessages.js";
import { reloadMainTable } from "../plugins/datatable/baseDatatable.js";
import { notifications } from "../plugins/swal/swalComponent.js";
import { closeModal } from "../ui/modalUI.js";

export const handleSubmit = async ({ form, formData, create, update }) => {
    
    const id = form.dataset.id;
    const mode = form.dataset.mode;
    let response;

    if (mode === 'create') response = await create(formData);
    else {

        if (!id) notifications.showError('No hay registro seleccionado.');
        response = await update(formData, id);
    }

    notifications.showSuccess(response.message);
    closeModal(form);
    reloadMainTable();

    return response.data;
}

export const handleAction = async ({ action, formId }) => {

    try {

        const form = document.querySelector(formId);
        const id = form.dataset.id;

        if (!id) notifications.showError('No hay registro seleccionado.');

        const response = await action(id);

        notifications.showSuccess(response.message);
        closeModal(form);
        reloadMainTable();

    } catch (err) {

        notifications.showError(err.message);
    }
}

export const cleanForm = (form) => {

    form.reset();
    form.dataset.id = '';
    form.dataset.mode = '';
}

export const validateFields = (validators, formData) => {

    const errors = {};

    Object.keys(validators).forEach(field => {
        errors[field] = validators[field](formData[field]);
    });

    return errors;
}

export const validateDetailsFields = (validators, details) => {

    const errors = {};

    details.forEach(detail => {

        const detailErrors = validateFields(validators, detail);

        if (Object.keys(detailErrors).length > 0) errors[detail.id] = detailErrors;
    })

    return errors;
}

export const mapServerErrors = (serverErrors) => {

    const errors = {};

    for (const field in serverErrors) {

        const error = serverErrors[field];
        errors[field] = getErrorMessage(error);
    }

    return errors;
}