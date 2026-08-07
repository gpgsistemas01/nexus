import { useForm } from '../../../application/form.js';
import { editWaste, editWasteStock, registerWaste } from '../../../application/warehouse/wastes.js';
import { FORM_SELECTORS } from '../../../constants/selectors.js';
import { handleSubmit, validateFields } from '../../../utils/formUtils.js';
import { wasteSecondaryDataValidators, wasteStockValidators, newWasteValidators } from '../../../utils/validations/validators.js';
import { pickWasteFields, wasteCreateFields, wasteDataFields, wasteSecondaryDataFields, wasteStockFields } from './wasteFields.js';

const isStockMode = (mode) => mode === 'edit-stock';
const isEditMode = (mode) => mode === 'edit';

useForm({
    selector: FORM_SELECTORS.WASTE_FORM,
    normalizeData: ({ form, formData }) => {

        const fields = isStockMode(form.dataset.mode)
            ? wasteStockFields
            : isEditMode(form.dataset.mode) ? wasteSecondaryDataFields : wasteCreateFields;

        if (!isStockMode(form.dataset.mode)) {
            
            if (!formData.minStock) delete formData.minStock;
            
            formData.isActive = document.querySelector(`${ FORM_SELECTORS.WASTE_FORM } #isActiveInput`).checked;
        }

        return pickWasteFields(formData, fields);
    },
    getErrors: ({ form, formData }) => {

        if (isStockMode(form.dataset.mode)) return validateFields(wasteStockValidators, formData);
        if (isEditMode(form.dataset.mode)) return validateFields(wasteSecondaryDataValidators, formData);

        return validateFields(newWasteValidators, formData);
    },
    sendRequest: ({ formData, form }) => handleSubmit({
        form,
        formData,
        create: registerWaste,
        update: isStockMode(form.dataset.mode) ? editWasteStock : editWaste
    })
});
