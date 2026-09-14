import { clearFormErrors } from "../../../ui/forms/formErrorsUI.js";
import { initForm } from "../../../ui/forms/formStateUI.js";
import { openModal } from "../../../ui/modalUI.js";
import { BUTTON_SELECTORS, FORM_SELECTORS, HEADING_SELECTORS, MODAL_SELECTORS } from "../../../constants/selectors.js";
import { FORM_MODES } from "../../../constants/formModes.js";

const clientModalId = MODAL_SELECTORS.CLIENT;
const formId = FORM_SELECTORS.CLIENT;

export const openClientModal = ({ 
    mode = FORM_MODES.CREATE,
    data = null, 
    onSave = null 
}) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(clientModalId);

    initForm({ form, mode, id: data?.id });
    clearFormErrors(form);

    form.reset();

    form.elements.name.value = data?.name || '';
    form.elements.isActive.checked = data?.isActive ?? true;

    if (mode === FORM_MODES.CREATE) {

        modalElement.querySelector(HEADING_SELECTORS.MODAL_TITLE).textContent = 'Registrar cliente';
        form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = 'Guardar';
    }

    if (mode === FORM_MODES.EDIT) {

        modalElement.querySelector(HEADING_SELECTORS.MODAL_TITLE).textContent = 'Editar cliente';
        form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = 'Actualizar';
    }

    form.onSave = onSave;

    openModal(modalElement);
}
