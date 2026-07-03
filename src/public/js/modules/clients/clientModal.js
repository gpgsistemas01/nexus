import { clearFormErrors, initForm } from "../../ui/formUI.js";
import { openModal } from "../../ui/modalUI.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";

const clientModalId = MODAL_SELECTORS.CLIENT;
const formId = FORM_SELECTORS.CLIENT_FORM;

export const openClientModal = ({ 
    mode = 'create', 
    data = null, 
    onSave = null 
}) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(clientModalId);

    initForm({ form, mode, id: data?.id });
    clearFormErrors(form);

    form.elements.name.value = data?.name || '';

    if (mode === 'create') {

        modalElement.querySelector('#modalTitle').textContent = 'Registrar cliente';
        form.querySelector('#submitBtn').textContent = 'Guardar';
    }

    if (mode === 'edit') {

        modalElement.querySelector('#modalTitle').textContent = 'Editar cliente';
        form.querySelector('#submitBtn').textContent = 'Actualizar';
    }

    form.onSave = onSave;

    openModal(modalElement);
}
