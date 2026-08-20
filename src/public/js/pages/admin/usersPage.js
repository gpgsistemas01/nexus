import { useForm } from '../../application/form.js';
import { editUser, editUserPassword, registerUser } from '../../application/admin/users/users.js';
import { createUserDatatable } from '../../plugins/datatable/admin/users/userDatatable.js';
import { initUserFormSelect2, setUserFormSelectOptions } from '../../plugins/select2/modules/userSelect.js';
import { clearFormErrors } from '../forms/formErrorsUI.js';
import { initForm, setFormDisabled } from '../forms/formStateUI.js';
import { openModal } from '../../ui/modalUI.js';
import { handleSubmit, validateFields } from '../../utils/formUtils.js';
import { userEditValidation, userPasswordValidation, userValidation } from '../../utils/validations/validators.js';
import { BUTTON_SELECTORS, FORM_SELECTORS, HEADING_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";
import { FORM_MODES } from "../../constants/formModes.js";

const formId = FORM_SELECTORS.USER;
const userModalId = MODAL_SELECTORS.USER;

const setModeFields = ({ form, mode }) => {

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
};

export const openUserModal = ({ mode = FORM_MODES.CREATE, data = null }) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(userModalId);

    initForm({ form, mode, id: data?.id });
    clearFormErrors(form);
    initUserFormSelect2();
    setModeFields({ form, mode });
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

createUserDatatable();

useForm({
    selector: formId,
    normalizeData: ({ formData, form }) => {

        const normalizedData = {
            ...formData,
            name: formData.name?.trim(),
        };

        if (form.dataset.mode === FORM_MODES.EDIT_PASSWORD) return {
            password: formData.password
        };

        if (form.dataset.mode === FORM_MODES.EDIT) delete normalizedData.password;

        return normalizedData;
    },
    getErrors: ({ form, formData }) => {

        if (form.dataset.mode === FORM_MODES.EDIT_PASSWORD) return validateFields(userPasswordValidation, formData);

        if (form.dataset.mode === FORM_MODES.EDIT) return validateFields(userEditValidation, formData);

        return validateFields(userValidation, formData);
    },
    sendRequest: async ({ formData, form }) => {

        if (form.dataset.mode === FORM_MODES.EDIT_PASSWORD) return handleSubmit({
            form,
            formData,
            update: editUserPassword
        });

        return handleSubmit({
            form,
            formData,
            create: registerUser,
            update: editUser
        });
    }
});
