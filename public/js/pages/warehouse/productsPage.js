import { createProductDatatable } from "../../plugins/datatable/productDatatable.js";
import { useForm } from "../../application/form.js";
import { editProduct, registerProduct } from "../../application/warehouse/products.js";
import { productValidators } from "../../utils/validations/validators.js";
import { handleSubmit, validateFields } from "../../utils/formUtils.js";
import { setFormReadOnly, toggleInputSelectErrors } from "../../ui/formUI.js";

const context = window.PRODUCT_CONTEXT || {};
const formId = '#productForm';

createProductDatatable(context);

useForm({
    selector: formId,
    normalizeData: ({ formData }) => {
        formData.isActive = document.getElementById('isActiveInput').checked;
    },
    getErrors: (formData) => {
        
        let errors = {};

        errors = validateFields(productValidators, formData);

        return errors;
    },
    normalizeErrors: ({ form, errors }) => toggleInputSelectErrors(form, errors),
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
