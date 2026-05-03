import { getErrorMessage } from "../constants/apiMessages.js";
import { notifications } from "../plugins/swal/swalComponent.js";
import { toggleErrorMessages } from "../ui/formUI.js";
import { on } from "../utils/domUtils.js";
import { mapServerErrors } from "../utils/formUtils.js";

export const useForm = async ({ 
    selector,
    normalizeData = () => {},
    normalizeErrors = () => {},
    getErrors = () => {},
    sendRequest,
    normalizeServerErrors = () => {},
}) => {

    on('submit', selector, async (e, form) => {

        e.preventDefault();

        let formData = Object.fromEntries(new FormData(form));

        formData = normalizeData({ form, formData });

        const errors = getErrors({ form, formData });

        normalizeErrors({ form, errors });
        toggleErrorMessages(form, errors);

        const hasErrors = Object.values(errors).some(error => error);

        if (hasErrors) return;

        try {

            await sendRequest({ formData, form });

        } catch (err) {

            if (err.response) {

                const { status, data } = err.response;
                const { errors, code } = data;

                const message = getErrorMessage(code);

                switch (status) {
                    case 400: {
                        const serverErrors = mapServerErrors(errors);
                        normalizeServerErrors(form, serverErrors);
                        toggleErrorMessages(form, serverErrors);
                        return;
                    }

                    case 401:
                        localStorage.setItem('showErrorToast', message);
                        window.location.replace('/');
                        return;
                    
                    case 404:
                        notifications.showError(err.message);
                        return;
                    
                    default:
                        throw err;
                }
            }
            
            throw err;
        }
    });
}
