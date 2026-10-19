import { getErrorMessage } from "../constants/apiMessages.js";
import { notifications } from "../plugins/swal/swalComponent.js";
import {
    clearFormErrors,
    getUnrenderedFormErrorMessages,
    normalizeFormErrors,
    scrollToFirstFormError
} from "../ui/forms/formErrorsUI.js";
import { resetFormSubmitState } from "../ui/forms/formStateUI.js";
import { mapServerErrors } from "../utils/formUtils.js";

const getFallbackMessage = (err) => {

    const data = err?.data ?? err?.response?.data ?? null;

    return data?.message || getErrorMessage(data) || data?.detail || data?.error || err?.message || 'Ocurrió un error inesperado.';
};

const getFallbackMessageWithCode = err => {
    const data = err?.data ?? err?.response?.data ?? null;
    const message = getFallbackMessage(err);

    return data?.code ? `${ message } (Código: ${ data.code })` : message;
};

export const normalizeJqAjaxError = (jqXHR, errorThrown = null) => {

    const data = jqXHR?.responseJSON ?? null;
    const message = data?.message || getErrorMessage(data) || data?.detail || data?.error || errorThrown || jqXHR?.statusText || 'No fue posible conectar con el servidor.';

    return {
        status: jqXHR?.status ?? 0,
        data,
        message,
        raw: jqXHR
    };
};

export const handleApiError = ({
    err,
    form = null,
    normalizeServerErrors = normalizeFormErrors,
    rethrow = true
}) => {

    const { status, data } = err;

    switch (status) {

        case 400:
        case 404: {
            if (status === 400 && data?.errors) {
                const serverErrors = mapServerErrors(data.errors);
                const hasFieldErrors = serverErrors && typeof serverErrors === 'object' && Object.keys(serverErrors).length > 0;

                if (form && hasFieldErrors) {
                    clearFormErrors(form);
                    normalizeServerErrors({ form, errors: serverErrors });
                    scrollToFirstFormError(form);
                }

                resetFormSubmitState(form);
                const unrenderedMessages = getUnrenderedFormErrorMessages({ form, errors: serverErrors });

                if (!form || !hasFieldErrors || unrenderedMessages.length) {
                    notifications.showModal({
                        title: 'Revise la información',
                        text: [...new Set(unrenderedMessages)].join('\n') || getFallbackMessage(err),
                        icon: 'warning'
                    });
                }

                return;
            }

            const modalData = data ?? err?.response?.data ?? null;
            const modalTitle = getErrorMessage(modalData) || 'No se pudo completar la acción';
            const modalMessage = getFallbackMessage(err);

            resetFormSubmitState(form);
            notifications.showModal({
                title: modalTitle,
                text: modalMessage === modalTitle ? null : modalMessage,
                icon: 'warning'
            });
            return;
        }

        case 401:
            localStorage.setItem('showErrorToast', getFallbackMessage(err));
            window.location.replace('/');
            return;

        case 403:
            resetFormSubmitState(form);
            notifications.showError(getFallbackMessage(err));
            return;

        case 409: {
            const modalData = data ?? err?.response?.data ?? null;

            resetFormSubmitState(form);
            notifications.showModal({
                title: modalData?.code || 'Conflicto',
                text: getFallbackMessage(err),
                icon: 'warning'
            });
            return;
        }

        default:
            notifications.showError(getFallbackMessageWithCode(err));
            if (rethrow) throw err;
    }
};

export const handleDataTableError = (err, table = null) => {

    const { status, data, message } = err;

    switch (status) {

        case 400:
            handleApiError({ err, rethrow: false });
            if (table) table.clear().draw();
            return [];

        case 401:
            localStorage.setItem('showErrorToast', getFallbackMessage(err));
            window.location.replace('/');
            return [];

        case 403:
            notifications.showError(getFallbackMessage(err));
            return [];

        case 404:
            notifications.showError(message || 'No se encontraron registros.');
            return [];

        case 409:
            notifications.showWarning(getFallbackMessage(err));
            return [];

        default:
            notifications.showError(
                data?.code
                    ? getFallbackMessageWithCode(err)
                    : message || 'No fue posible cargar la información.'
            );

            if (table) table.clear().draw();

            return [];
    }
};

// Frontera de acciones asíncronas del navegador, como consultar y abrir un modal.
export const runApiAction = async action => {
    try {
        return await action();
    } catch (err) {
        handleApiError({ err, rethrow: false });
    }
};
