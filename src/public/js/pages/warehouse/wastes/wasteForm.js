import { openWasteStockAdditionModal } from './wasteStockAdditionModal.js';
import { hasPermission, UI_PERMISSIONS } from '../../../constants/permissions.js';
import { DOM_EVENT_NAMES } from '../../../constants/events.js';
import { LENGTH_SOURCES } from '../../../utils/wasteRollUtils.js';
import { updateWasteRollMeasurement } from '../../../ui/inventory/inventorySelectUI.js';
import { useForm } from '../../../ui/forms/formUI.js';
import { editWaste, editWasteStock, registerWaste } from '../../../application/warehouse/wastes/wastes.js';
import { INPUT_SELECTORS, FORM_SELECTORS } from '../../../constants/selectors.js';
import { handleSubmit, pickFormFields, validateFields } from '../../../utils/formUtils.js';
import { wasteEditValidation, wasteStockValidation, wasteValidation } from '../../../utils/validations/validators.js';
import { wasteCreateFields, wasteEditFields, wasteStockFields } from './wasteFields.js';
import { isCreateMode, isEditMode, isStockMode } from '../../../constants/formModes.js';

useForm({
    selector: FORM_SELECTORS.WASTE,
    normalizeData: ({ form, formData }) => {

        const fields = isStockMode(form.dataset.mode) ? wasteStockFields
            : isEditMode(form.dataset.mode) ? wasteEditFields : wasteCreateFields;

        if (!isStockMode(form.dataset.mode)) {
            
            if (!formData.minStock) delete formData.minStock;
            
            formData.isActive = document.querySelector(`${ FORM_SELECTORS.WASTE } #isActiveInput`).checked;
        }

        if (isCreateMode(form.dataset.mode) && formData.lengthSource === LENGTH_SOURCES.ESTIMATED) {
            formData.height = form.elements.height.value;
        }
        return pickFormFields(formData, fields);
    },
    getErrors: ({ form, formData }) => {

        if (isStockMode(form.dataset.mode)) return validateFields(wasteStockValidation, formData);
        if (isEditMode(form.dataset.mode)) return validateFields(wasteEditValidation, formData);

        return validateFields(wasteValidation, {
            ...formData,
            rollReference: JSON.parse(form.dataset.rollReference || '{}'),
            presentationName: form.querySelector(INPUT_SELECTORS.WASTE_PRESENTATION_DISPLAY).textContent
        });
    },
    sendRequest: async ({ formData, form }) => {
        try {
            return await handleSubmit({
                form,
                formData,
                create: registerWaste,
                update: isStockMode(form.dataset.mode) ? editWasteStock : editWaste
            });
        } catch (err) {
            if (err.data?.code === 'WASTE_ALREADY_EXISTS' && err.data.meta?.waste && hasPermission(window.meta || {}, UI_PERMISSIONS.WASTES_ADD_STOCK)) {
                form.dataset.duplicateWaste = JSON.stringify(err.data.meta.waste);
                form.querySelector('#wasteDuplicateStockButton').classList.remove('d-none');
            }
            throw err;
        }
    }
});

const form = document.querySelector(FORM_SELECTORS.WASTE);
form.addEventListener(DOM_EVENT_NAMES.INPUT, event => {
    if (['coneWeightKg', 'totalWeightKg', 'base', 'lengthSource'].includes(event.target.name)) {
        updateWasteRollMeasurement({ form });
    }
    if (['name', 'base', 'height', 'coneWeightKg', 'totalWeightKg', 'lengthSource'].includes(event.target.name)) {
        delete form.dataset.duplicateWaste;
        form.querySelector('#wasteDuplicateStockButton').classList.add('d-none');
    }
});
form.addEventListener(DOM_EVENT_NAMES.CHANGE, event => {
    if (event.target.name === 'lengthSource' && event.target.value === 'MEASURED') form.elements.height.value = '';
    if (event.target.name === 'lengthSource') updateWasteRollMeasurement({ form });
});
form.querySelector('#wasteDuplicateStockButton').addEventListener(DOM_EVENT_NAMES.CLICK, () => {
    if (!form.dataset.duplicateWaste) return;
    openWasteStockAdditionModal({ data: JSON.parse(form.dataset.duplicateWaste) });
    const additionForm = document.querySelector(FORM_SELECTORS.WASTE_STOCK_ADDITION);
    const quantity = additionForm.elements.quantity;
    quantity.value = Number(form.elements.newStock.value) > 0 ? form.elements.newStock.value : '';
    quantity.dispatchEvent(new Event(DOM_EVENT_NAMES.INPUT, { bubbles: true }));
    additionForm.elements.observations.value = form.elements.observations.value;
});
