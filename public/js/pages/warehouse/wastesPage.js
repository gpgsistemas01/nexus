import { useForm } from "../../application/form.js";
import { registerWaste } from "../../application/warehouse/wastes.js";
import { createWasteDatatable } from "../../plugins/datatable/wasteDatatable.js";
import { initWasteSelect2, setWasteSelectOptions } from "../../plugins/select2/modules/wasteSelect.js";
import { clearFormErrors, initForm } from "../../ui/formUI.js";
import { openModal } from "../../ui/modalUI.js";
import { handleSubmit, validateFields } from "../../utils/formUtils.js";
import { wasteValidators } from "../../utils/validations/validators.js";

const context = window.meta || {};

createWasteDatatable(context);

const wasteModalId = '#wasteModal';
const formId = '#wasteForm';
export const openWasteModal = ({
    mode = 'create',
    data = null
} = {}) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(wasteModalId);

    initForm({ form, mode, id: data?.id || '' });
    initWasteSelect2({ modalSelector: wasteModalId });
    setWasteSelectOptions({ modalSelector: wasteModalId, data });
    clearFormErrors(form);

    modalElement.querySelector('#modalTitle').textContent = mode === 'edit'
        ? 'Registrar merma del producto'
        : 'Registrar merma';
    form.querySelector('#submitBtn').textContent = 'Guardar';

    openModal(modalElement);
};

useForm({
    selector: formId,
    getErrors: ({ formData }) => validateFields(wasteValidators, formData),
    sendRequest: async ({ formData, form }) => {

        await handleSubmit({
            form,
            formData,
            create: registerWaste
        });
    }
});
