import { FORM_MODES } from '../../constants/formModes.js';
import { reloadMainTable } from '../../plugins/datatable/core/base/tableOperations.js';
import { notifications } from '../../plugins/swal/swalComponent.js';
import { closeModal } from '../modalUI.js';
import { handleApiError } from "../../api/errorHandler.js";
import { DOM_EVENT_NAMES } from '../../constants/events.js';
import { BUTTON_SELECTORS } from '../../constants/selectors.js';
import { on } from "../../utils/domUtils.js";
import { hasValidationErrors } from "../../utils/formUtils.js";
import { resetFormSubmitState } from "./formStateUI.js";
import { normalizeFormErrors, scrollToFirstFormError } from "./formErrorsUI.js";

export const useForm = async ({
    selector,
    normalizeData = () => {},
    getPendingData = () => null,
    normalizeErrors = normalizeFormErrors,
    getErrors = () => {},
    sendRequest
}) => {

    on(DOM_EVENT_NAMES.SUBMIT, selector, async (e, form) => {

        e.preventDefault();
        if (form.dataset.submitting === 'true') return false;

        form.dataset.submitting = 'true';
        const submitButton = form.querySelector(BUTTON_SELECTORS.SUBMIT);
        if (submitButton) submitButton.disabled = true;

        try {
            const pendingData = getPendingData({ form });
            const formData = pendingData || normalizeData({ form, formData: Object.fromEntries(new FormData(form)) });
            // La recuperación usa la captura original, aunque el modal se haya reabierto vacío.
            // El servidor vuelve a validar el contrato antes de recuperar el recibo.
            const errors = pendingData ? {} : getErrors({ form, formData });

            normalizeErrors({ form, errors });

            if (hasValidationErrors(errors)) {

                scrollToFirstFormError(form);
                return;
            }
            await sendRequest({ formData, form });

        } catch (err) {

            handleApiError({ err, form });
        } finally {
            resetFormSubmitState(form);
        }
    });
}

export const handleSubmit = async ({ form, formData, create, update, reloadTable = true }) => {

    const id = form.dataset.id;
    const mode = form.dataset.mode;
    let response;

    if (mode === FORM_MODES.CREATE) response = await create({ formData });
    else {

        if (!id) {

            notifications.showError('No hay registro seleccionado.');
            return;
        }

        response = await update({
            formData: {
                ...formData,
                ...(mode !== FORM_MODES.ADD_STOCK && form.dataset.version !== undefined && { expectedVersion: Number(form.dataset.version) }),
                ...(form.dataset.materialVersion !== undefined && { expectedMaterialVersion: Number(form.dataset.materialVersion) })
            },
            id
        });
    }

    notifications.showSuccess(response.message);
    closeModal(form);
    if (reloadTable) reloadMainTable({ resetPaging: mode === FORM_MODES.CREATE });

    return response.data;
}

export const handleAction = async ({ action, formId }) => {

    try {

        const form = document.querySelector(formId);
        const id = form.dataset.id;

        if (!id) {

            notifications.showError('No hay registro seleccionado.');
            return;
        }

        const response = await action(id);

        notifications.showSuccess(response.message);
        closeModal(form);
        reloadMainTable();

    } catch (err) {

        handleApiError({ err });
    }
}
