import { addWasteStock } from '../../../application/warehouse/wastes/wastes.js';
import { FORM_SELECTORS } from '../../../constants/selectors.js';
import { useForm } from '../../../ui/forms/formUI.js';
import { handleSubmit, pickFormFields, validateFields } from '../../../utils/formUtils.js';
import { wasteStockAdditionValidation } from '../../../utils/validations/validators.js';
import { wasteStockAdditionFields } from './wasteFields.js';

useForm({
    selector: FORM_SELECTORS.WASTE_STOCK_ADDITION,
    normalizeData: ({ formData }) => pickFormFields(formData, wasteStockAdditionFields),
    getErrors: ({ formData }) => validateFields(wasteStockAdditionValidation, formData),
    sendRequest: ({ formData, form }) => handleSubmit({
        form,
        formData,
        update: addWasteStock
    })
});
