import { useForm } from "../../application/form.js";
import { editSupplier, registerSupplier } from "../../application/warehouse/suppliers.js";
import { FORM_SELECTORS } from "../../constants/selectors.js";

import { handleSubmit, validateFields } from "../../utils/formUtils.js";
import { supplierValidators } from "../../utils/validations/validators.js";

const formId = FORM_SELECTORS.SUPPLIER_FORM;

useForm({
    selector: formId,
    normalizeData: ({ formData }) => {

        formData.isActive = document.querySelector(`${ formId } #isActiveInput`).checked;

        return formData;
    },
    getErrors: ({ formData }) => validateFields(supplierValidators, formData),
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
