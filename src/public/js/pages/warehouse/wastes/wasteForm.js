import { notifications } from '../../../plugins/swal/swalComponent.js';
import { resetFormSubmitState } from '../../../ui/forms/formStateUI.js';
import { closeModal } from '../../../ui/modalUI.js';
import { openWasteStockAdditionModal } from './wasteStockAdditionModal.js';
import { hasPermission, UI_PERMISSIONS } from '../../../constants/permissions.js';
import { getPresentation, isRollPresentation } from '../../../utils/warehouseInventoryUtils.js';
import { DOM_EVENT_NAMES } from '../../../constants/events.js';
import { updateWasteRollMeasurement } from '../../../ui/inventory/wasteFormUI.js';
import { useForm } from '../../../ui/forms/formUI.js';
import { editWaste, editWasteStock, registerWaste } from '../../../application/warehouse/wastes/wastes.js';
import { FORM_SELECTORS } from '../../../constants/selectors.js';
import { handleSubmit, pickFormFields, validateFields } from '../../../utils/formUtils.js';
import { wasteEditValidation, wasteStockValidation, wasteValidation } from '../../../utils/validations/validators.js';
import { wasteCreateFields, wasteEditFields, wasteStockFields } from './wasteFields.js';
import { isCreateMode, isEditMode, isStockMode } from '../../../constants/formModes.js';

useForm({
    selector: FORM_SELECTORS.WASTE,
    normalizeData: ({ form, formData }) => {

        const fields = isStockMode(form.dataset.mode) ? wasteStockFields
            : isEditMode(form.dataset.mode) ? wasteEditFields : wasteCreateFields;

        if (isCreateMode(form.dataset.mode) && isRollPresentation(getPresentation(form.wasteMaterialTemplate ?? {}))) {
            formData.base = form.elements.base.value;
            formData.height = form.elements.height.value;
        }

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
            presentationName: getPresentation(form.wasteMaterialTemplate ?? {})
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
            const existingWaste = err.data?.meta?.waste;
            if (!isCreateMode(form.dataset.mode) || err.data?.code !== 'WASTE_ALREADY_EXISTS'
                || !existingWaste?.id || !hasPermission(window.meta || {}, UI_PERMISSIONS.WASTES_ADD_STOCK)) throw err;

            const { isConfirmed } = await notifications.showConfirmation({
                title: 'Esta merma ya existe',
                text: `¿Abrir Agregar stock para revisar la cantidad y las observaciones de ${existingWaste.name || 'esta merma'}?`,
                confirmButtonText: 'Abrir Agregar stock'
            });
            if (!isConfirmed) {
                resetFormSubmitState(form);
                return;
            }

            closeModal(form);
            openWasteStockAdditionModal({
                data: existingWaste,
                quantity: formData.newStock,
                observations: formData.observations
            });
        }
    }
});

const form = document.querySelector(FORM_SELECTORS.WASTE);
form.addEventListener(DOM_EVENT_NAMES.INPUT, event => {
    if (['coneWeightKg', 'totalWeightKg'].includes(event.target.name)) {
        updateWasteRollMeasurement({ form });
    }
});
