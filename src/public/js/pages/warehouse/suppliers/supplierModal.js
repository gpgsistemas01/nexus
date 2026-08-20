import { clearFormErrors } from "../../../ui/forms/formErrorsUI.js";
import { initForm } from "../../../ui/forms/formStateUI.js";
import { openModal } from "../../../ui/modalUI.js";
import { BUTTON_SELECTORS, FORM_SELECTORS, HEADING_SELECTORS, MODAL_SELECTORS } from "../../../constants/selectors.js";
import { FORM_MODES } from "../../../constants/formModes.js";

const modalId = MODAL_SELECTORS.SUPPLIER;
const formId = FORM_SELECTORS.SUPPLIER;

export const openSupplierModal = ({ 
    mode = FORM_MODES.CREATE,
    data = null, 
    onSave = null 
}) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(modalId);

    initForm({ form, mode, id: data?.id || '' });
    clearFormErrors(form);

    form.reset();

    if (form.elements.isActive) form.elements.isActive.checked = true;
    
    form.elements.tradeName.value = data?.tradeName || '';
    form.elements.legalName.value = data?.legalName || '';
    form.elements.numberphone.value = data?.numberphone || '';

    if (mode === FORM_MODES.CREATE) {

        modalElement.querySelector(HEADING_SELECTORS.MODAL_TITLE).textContent = 'Registrar proveedor';
        form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = 'Guardar';
    }

    if (mode === FORM_MODES.EDIT) {

        modalElement.querySelector(HEADING_SELECTORS.MODAL_TITLE).textContent = 'Editar proveedor';
        form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = 'Actualizar';
    }
    
    form.onSave = onSave;

    openModal(modalElement);
}
