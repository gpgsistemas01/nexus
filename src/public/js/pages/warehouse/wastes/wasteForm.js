import { notifications } from '../../../plugins/swal/swalComponent.js';
import { resetFormSubmitState } from '../../../ui/forms/formStateUI.js';
import { closeModal } from '../../../ui/modalUI.js';
import { openWasteStockAdditionModal } from './wasteStockAdditionModal.js';
import { hasPermission, UI_PERMISSIONS } from '../../../constants/permissions.js';
import { DOM_EVENT_NAMES } from '../../../constants/events.js';
import { getWasteMaterialTemplate, updateWasteRollMeasurement } from '../../../ui/inventory/wasteFormUI.js';
import { useForm } from '../../../ui/forms/formUI.js';
import { editWaste, editWasteStock, registerWaste } from '../../../application/warehouse/wastes/wastes.js';
import { INPUT_SELECTORS, FORM_SELECTORS } from '../../../constants/selectors.js';
import { handleSubmit, pickFormFields, validateFields } from '../../../utils/formUtils.js';
import { wasteEditValidation, wasteStockValidation, wasteValidation } from '../../../utils/validations/validators.js';
import { wasteCreateFields, wasteEditFields, wasteStockFields } from './wasteFields.js';
import { isEditMode, isStockMode } from '../../../constants/formModes.js';

useForm({
    selector: FORM_SELECTORS.WASTE,
    normalizeData: ({ form, formData }) => {

        const fields = isStockMode(form.dataset.mode) ? wasteStockFields
            : isEditMode(form.dataset.mode) ? wasteEditFields : wasteCreateFields;

        if (!isStockMode(form.dataset.mode)) {
            
            if (!formData.minStock) delete formData.minStock;
            
            formData.isActive = document.querySelector(`${ FORM_SELECTORS.WASTE } #isActiveInput`).checked;
        }

        return pickFormFields(formData, fields);
    },
    getErrors: ({ form, formData }) => {

        if (isStockMode(form.dataset.mode)) return validateFields(wasteStockValidation, formData);
        if (isEditMode(form.dataset.mode)) return validateFields(wasteEditValidation, formData);

        return validateFields(wasteValidation, {
            ...formData,
            material: getWasteMaterialTemplate({ form }),
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
                resetFormSubmitState(form);
                const { isConfirmed } = await notifications.showConfirmation({
                    title: 'Esta merma ya existe',
                    text: '¿Quieres agregar esta cantidad al stock existente?',
                    confirmButtonText: 'Agregar al stock'
                });
                if (isConfirmed) {
                    closeModal(form);
                    openWasteStockAdditionModal({
                        data: err.data.meta.waste,
                        quantity: formData.newStock,
                        observations: formData.observations
                    });
                }
                return;
            }
            throw err;
        }
    }
});

const form = document.querySelector(FORM_SELECTORS.WASTE);
form.addEventListener(DOM_EVENT_NAMES.INPUT, event => {
    if (['coneWeightKg', 'totalWeightKg', 'base', 'height'].includes(event.target.name)) {
        updateWasteRollMeasurement({ form });
    }
});
