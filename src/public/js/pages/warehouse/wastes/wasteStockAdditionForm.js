import { WASTE_OPERATION_ACTIONS } from '../../../constants/inventory.js';
import { addWasteStock } from '../../../application/warehouse/wastes/wastes.js';
import { FORM_SELECTORS } from '../../../constants/selectors.js';
import { useForm } from '../../../ui/forms/formUI.js';
import { handleSubmit, pickFormFields, validateFields } from '../../../utils/formUtils.js';
import { wasteStockAdditionValidation } from '../../../utils/validations/validators.js';
import { wasteStockAdditionFields } from './wasteFields.js';

import { getPendingWasteOperation, submitWasteOperation } from '../../../ui/inventory/wasteOperationUI.js';

useForm({
    selector: FORM_SELECTORS.WASTE_STOCK_ADDITION,
    getPendingData: ({ form }) => getPendingWasteOperation({ action: WASTE_OPERATION_ACTIONS.ADD_STOCK, id: form.dataset.id }),
    normalizeData: ({ formData }) => pickFormFields(formData, wasteStockAdditionFields),
    getErrors: ({ formData }) => validateFields(wasteStockAdditionValidation, formData),
    sendRequest: ({ formData, form }) => submitWasteOperation({
        action: WASTE_OPERATION_ACTIONS.ADD_STOCK, id: form.dataset.id, form, formData,
        submit: data => handleSubmit({ form, formData: data, update: addWasteStock })
    })
});
