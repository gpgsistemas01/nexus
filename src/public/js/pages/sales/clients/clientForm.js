import { useForm } from "../../../ui/forms/formUI.js";
import { editClient, registerClient } from "../../../application/sales/clients/clients.js";
import { handleSubmit, validateFields } from "../../../utils/formUtils.js";
import { clientValidation } from "../../../utils/validations/validators.js";
import { FORM_SELECTORS } from "../../../constants/selectors.js";

const formId = FORM_SELECTORS.CLIENT;

useForm({
    selector: formId,
    normalizeData: ({ formData }) => formData,
    getErrors: ({ formData }) => validateFields(clientValidation, formData),
    sendRequest: async ({ formData, form }) => {

        const client = await handleSubmit({
            form,
            formData,
            create: registerClient,
            update: editClient
        });

        form.onSave?.(client);
    }
});
