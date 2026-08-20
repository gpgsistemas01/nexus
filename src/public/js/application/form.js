import { DOM_EVENT_NAMES } from '../constants/events.js';
import { handleApiError } from "../api/errorHandler.js";
import { toggleErrorMessages, normalizeFormErrors, scrollToFirstFormError } from "../ui/forms/formErrorsUI.js";
import { on } from "../utils/domUtils.js";
import { hasValidationErrors } from "../utils/formUtils.js";

export const useForm = async ({ 
    selector,
    normalizeData = () => {},
    normalizeErrors = normalizeFormErrors,
    getErrors = () => {},
    sendRequest,
    normalizeServerErrors = normalizeFormErrors,
}) => {

    on(DOM_EVENT_NAMES.SUBMIT, selector, async (e, form) => {

        e.preventDefault();

        let formData = Object.fromEntries(new FormData(form));

        formData = normalizeData({ form, formData });

        const errors = getErrors({ form, formData });

        normalizeErrors({ form, errors });
        toggleErrorMessages(form, errors);

        if (hasValidationErrors(errors)) {

            scrollToFirstFormError(form);
            return;
        }

        if (form.dataset.submitting === 'true') return false;

        form.dataset.submitting = 'true';

        const submitButton = form.querySelector('button[type=DOM_EVENT_NAMES.SUBMIT]');

        if (submitButton) {

            submitButton.disabled = true;
        }

        try {

            await sendRequest({ formData, form });

        } catch (err) {

            handleApiError({
                err,
                form,
                normalizeServerErrors
            });
        }
    });
}