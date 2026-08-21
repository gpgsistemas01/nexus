import { useForm } from "../../../ui/forms/formUI.js";
import { editSupplier, registerSupplier } from "../../../application/warehouse/suppliers/suppliers.js";
import { FORM_SELECTORS } from "../../../constants/selectors.js";

import { handleSubmit, validateFields } from "../../../utils/formUtils.js";
import { supplierValidation } from "../../../utils/validations/validators.js";

const formId = FORM_SELECTORS.SUPPLIER;

useForm({
    selector: formId,
    normalizeData: ({ formData }) => {

        formData.isActive = document.querySelector(`${ formId } #isActiveInput`).checked;

        return formData;
    },
    getErrors: ({ formData }) => validateFields(supplierValidation, formData),
    sendRequest: async ({ formData, form }) => {

        const supplier = await handleSubmit({
            form,
            formData,
            create: registerSupplier,
            update: editSupplier,
        });

        form.onSave?.(supplier);
    }
});
