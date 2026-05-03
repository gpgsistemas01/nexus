import { useForm } from "../../application/form.js";
import { editProduct, registerProduct } from "../../application/warehouse/products.js";
import { toggleInputSelectErrors } from "../../ui/formUI.js";
import { handleSubmit, validateFields } from "../../utils/formUtils.js";
import { productValidators } from "../../utils/validations/validators.js";

const formId = '#productForm';

useForm({
    selector: formId,
    normalizeData: ({ formData }) => {

        formData.isActive = document.querySelector(`${ formId } #isActiveInput`).checked;
        
        return formData;
    },
    getErrors: ({ formData }) => validateFields(productValidators, formData),
    normalizeErrors: ({ form, errors }) => toggleInputSelectErrors(form, errors),
    normalizeServerErrors: (form, errors) => toggleInputSelectErrors(form, errors),
    sendRequest: async ({ formData, form }) => {

        const product = await handleSubmit({
            form,
            formData,
            create: registerProduct,
            update: editProduct
        });

        form.onSave?.(product);
    },
});