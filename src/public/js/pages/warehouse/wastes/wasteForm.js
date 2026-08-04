import { useForm } from '../../../application/form.js';
import { editWaste, editWasteStock, registerWaste } from '../../../application/warehouse/wastes.js';
import { FORM_SELECTORS } from '../../../constants/selectors.js';
import { handleSubmit, validateFields } from '../../../utils/formUtils.js';
import { wasteDataValidators, wasteStockValidators, wasteValidators } from '../../../utils/validations/validators.js';
import { pickWasteFields, wasteCreateFields, wasteDataFields, wasteStockFields } from './wasteFields.js';

const stockMode = 'edit-stock';
const isStockMode = (form) => form.dataset.mode === stockMode;
useForm({
    selector: FORM_SELECTORS.WASTE_FORM,
    normalizeData: ({ form, formData }) => {

        const fields = isStockMode(form)
            ? wasteStockFields
            : form.dataset.mode === 'edit' ? wasteDataFields : wasteCreateFields;

        return pickWasteFields(formData, fields);
    },
    getErrors: ({ form, formData }) => {

        if (isStockMode(form)) return validateFields(wasteStockValidators, formData);
        if (form.dataset.mode === 'edit') return validateFields(wasteDataValidators, formData);

        return validateFields(wasteValidators, formData);
    },
    sendRequest: ({ formData, form }) => handleSubmit({
        form,
        formData,
        create: registerWaste,
        update: isStockMode(form) ? editWasteStock : editWaste
    })
});
