import { handleApiError } from "../../api/errorHandler.js";
import { DOM_EVENT_NAMES } from '../../constants/events.js';
import { BUTTON_SELECTORS } from '../../constants/selectors.js';
import { on } from "../../utils/domUtils.js";
import { hasValidationErrors } from "../../utils/formUtils.js";
import { resetFormSubmitState } from "./formStateUI.js";
import { toggleErrorMessages, normalizeFormErrors, scrollToFirstFormError } from "./formErrorsUI.js";

export const useForm = async ({ 
    selector,
    normalizeData = () => {},
    getPendingData = () => null,
    normalizeErrors = normalizeFormErrors,
    getErrors = () => {},
    sendRequest,
    normalizeServerErrors = normalizeFormErrors,
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
            toggleErrorMessages(form, errors);

            if (hasValidationErrors(errors)) {

                scrollToFirstFormError(form);
                return;
            }
            await sendRequest({ formData, form });

        } catch (err) {

            handleApiError({
                err,
                form,
                normalizeServerErrors,
                rethrow: false
            });
        } finally {
            resetFormSubmitState(form);
        }
    });
}
