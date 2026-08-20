import { FORM_MODES } from '../../../constants/formModes.js';
import { BUTTON_SELECTORS, FORM_SELECTORS, HEADING_SELECTORS, MODAL_SELECTORS } from '../../../constants/selectors.js';
import { initUserFormSelect2, setUserFormSelectOptions } from '../../../plugins/select2/modules/userSelect.js';
import { clearFormErrors } from '../../../ui/forms/formErrorsUI.js';
import { initForm, setFormDisabled } from '../../../ui/forms/formStateUI.js';
import { openModal } from '../../../ui/modalUI.js';

const formId = FORM_SELECTORS.USER;
const userModalId = MODAL_SELECTORS.USER;

export const openUserModal = ({ mode = FORM_MODES.CREATE, data = null }) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(userModalId);

    initForm({ form, mode, id: data?.id });
    clearFormErrors(form);
    initUserFormSelect2();
    setFormDisabled({
        form,
        isDisabled: false
    });

    if (mode === FORM_MODES.EDIT_PASSWORD) setFormDisabled({
        form,
        fields: ['name', 'departmentId', 'roleId'],
        isDisabled: true
    });

    if (mode === FORM_MODES.EDIT) setFormDisabled({
        form,
        fields: ['password'],
        isDisabled: true
    });

    setUserFormSelectOptions(data);

    form.elements.name.value = data?.name || '';
    form.elements.password.value = '';

    if (mode === FORM_MODES.CREATE) {

        form.reset();
        modalElement.querySelector(HEADING_SELECTORS.MODAL_TITLE).textContent = 'Registrar usuario';
        form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = 'Guardar';
    }

    if (mode === FORM_MODES.EDIT) {

        modalElement.querySelector(HEADING_SELECTORS.MODAL_TITLE).textContent = 'Editar usuario';
        form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = 'Actualizar';
    }

    if (mode === FORM_MODES.EDIT_PASSWORD) {

        modalElement.querySelector(HEADING_SELECTORS.MODAL_TITLE).textContent = 'Editar contraseña';
        form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = 'Actualizar contraseña';
    }

    openModal(modalElement);
};
