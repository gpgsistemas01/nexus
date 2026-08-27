import { useForm } from '../../../ui/forms/formUI.js';
import { editWaste, editWasteStock, registerWaste } from '../../../application/warehouse/wastes/wastes.js';
import { FORM_SELECTORS } from '../../../constants/selectors.js';
import { handleSubmit, pickFormFields, validateFields } from '../../../utils/formUtils.js';
import { wasteEditValidation, wasteStockValidation, wasteValidation } from '../../../utils/validations/validators.js';
import { wasteCreateFields, wasteSecondaryDataFields, wasteStockFields } from './wasteFields.js';
import { isEditMode, isStockMode } from '../../../constants/formModes.js';

useForm({
    selector: FORM_SELECTORS.WASTE,
    normalizeData: ({ form, formData }) => {

        const fields = isStockMode(form.dataset.mode)
            ? wasteStockFields
            : isEditMode(form.dataset.mode) ? wasteSecondaryDataFields : wasteCreateFields;

        if (!isStockMode(form.dataset.mode)) {
            
            if (!formData.minStock) delete formData.minStock;
            
            formData.isActive = document.querySelector(`${ FORM_SELECTORS.WASTE } #isActiveInput`).checked;
        }

        return pickFormFields(formData, fields);
    },
    getErrors: ({ form, formData }) => {

        if (isStockMode(form.dataset.mode)) return validateFields(wasteStockValidation, formData);
        if (isEditMode(form.dataset.mode)) return validateFields(wasteEditValidation, formData);

        return validateFields(wasteValidation, formData);
    },
    sendRequest: ({ formData, form }) => handleSubmit({
        form,
        formData,
        create: registerWaste,
        update: isStockMode(form.dataset.mode) ? editWasteStock : editWaste
    })
});
