import { getErrorMessage } from '../constants/apiMessages.js';
import { notifications } from '../plugins/swal/swalComponent.js';
import {
    clearFormErrors,
    normalizeFormErrors,
    scrollToFirstFormError
} from '../ui/forms/formErrorsUI.js';
import { mapServerErrors } from './utils.js';

export const handleApiError = ({ err, form = null }) => {
    const { status, data, requiresAuth = true } = err;
    let validationMessage = null;

    if (status === 400 && data?.errors) {
        const serverErrors = mapServerErrors(data.errors);
        const hasFieldErrors = serverErrors && typeof serverErrors === 'object' && Object.keys(serverErrors).length > 0;
        let hasVisibleFieldErrors = false;

        if (form && hasFieldErrors) {
            clearFormErrors(form);
            normalizeFormErrors({ form, errors: serverErrors });
            hasVisibleFieldErrors = scrollToFirstFormError(form);
        }

        validationMessage = hasFieldErrors ? Object.entries(serverErrors).find(([field, message]) => {
            if (typeof message !== 'string') return false;
            const feedback = form?.querySelector(`[data-error-for="${ field }"]`);
            return !feedback || feedback.closest('.d-none, [hidden]');
        })?.[1] : null;

        if (hasVisibleFieldErrors && !validationMessage) return;
    }

    const message = validationMessage || data?.message || getErrorMessage(data) || err.message || 'Ocurrió un error inesperado.';
    if (status === 401 && requiresAuth) {
        localStorage.setItem('showErrorToast', message);
        window.location.replace('/');
        return;
    }

    if (status === 403) {
        notifications.showError(message);
        return;
    }

    const isWarning = [400, 401, 404, 409].includes(status);
    const title = isWarning
        ? validationMessage || getErrorMessage(data) || 'No se pudo completar la acción'
        : 'No se pudo completar la acción';
    const text = !isWarning && data?.code ? `${ message } (Código: ${ data.code })` : message;

    notifications.showModal({
        title,
        text: text === title ? null : text,
        icon: isWarning ? 'warning' : 'error'
    });
};

// Una acción asíncrona presenta el rechazo una sola vez en su frontera de UI.
export const runApiAction = async action => {
    try {
        return await action();
    } catch (err) {
        handleApiError({ err });
    }
};
