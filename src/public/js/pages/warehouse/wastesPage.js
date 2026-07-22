import { useForm } from "../../application/form.js";
import { editWaste, editWasteStock, registerWaste } from "../../application/warehouse/wastes.js";
import { createWasteDatatable } from "../../plugins/datatable/wasteDatatable.js";
import { handleSubmit, validateFields } from "../../utils/formUtils.js";
import { wasteDataValidators, wasteStockValidators, wasteValidators } from "../../utils/validations/validators.js";
import { FORM_SELECTORS } from "../../constants/selectors.js";

const context = window.meta || {};

createWasteDatatable(context);

const formId = FORM_SELECTORS.WASTE_FORM;
const stockMode = 'edit-stock';
const isStockMode = (form) => form.dataset.mode === stockMode;

useForm({
    selector: formId,
    getErrors: ({ form, formData }) => {

        if (isStockMode(form)) return validateFields(wasteStockValidators, formData);

        if (form.dataset.mode === 'edit') return validateFields(wasteDataValidators, formData);

        return validateFields(wasteValidators, formData);
    },
    sendRequest: async ({ formData, form }) => {

        await handleSubmit({
            form,
            formData,
            create: registerWaste,
            update: isStockMode(form) ? editWasteStock : editWaste
        });
    }
});
