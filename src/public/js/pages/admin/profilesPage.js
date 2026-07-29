import { registerProfile, updateProfile } from "../../application/admin/profiles.js";
import { useForm } from "../../application/form.js";
import { createProfilesDatatable } from "../../plugins/datatable/profileDatatable.js";
import { initProfileAccessTable, profileAccesses, refreshProfileAccessTable } from "../../plugins/datatable/profileAccessDatatable.js";
import { initProfileFormSelect2 } from "../../plugins/select2/modules/profileSelect.js";
import { clearFormErrors, initForm, normalizeFormErrors } from "../../ui/formUI.js";
import { openModal } from "../../ui/modalUI.js";
import { handleSubmit, hasValidationErrors, validateFields } from "../../utils/formUtils.js";
import { profileAccessValidators, profileValidators } from "../../utils/validations/validators.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";
import { hasPermission } from "../../utils/permissions.js";
import { on } from "../../utils/domUtils.js";

const formId = FORM_SELECTORS.PROFILE_FORM;
const modalId = MODAL_SELECTORS.PROFILE;

const context = window.meta || {};
const { hasAccess } = hasPermission(context);
const canManageProfiles = hasAccess({
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS'],
    roles: ['Administrador del sistema', 'Coordinador', 'Auxiliar', 'Almacenista']
});

createProfilesDatatable({ canManageProfiles });

useForm({
    selector: formId,
    normalizeData: ({ formData }) => {

        return {
            ...formData,
            accesses: profileAccesses.map(({ departmentId, roleId }) => ({ departmentId, roleId }))
        }
    },
    getErrors: ({ formData }) => validateFields(profileValidators, formData),
    sendRequest: async ({ formData, form }) => {

        await handleSubmit({
            form,
            formData,
            create: registerProfile,
            update: updateProfile
        });
    }
});

export const openProfileModal = ({ mode, data = null }) => {

    if (!canManageProfiles) return;

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(modalId);

    initForm({ form, mode, id: data?.id || '' });
    clearFormErrors(form);
    initProfileFormSelect2({ modalSelector: modalId });
    initProfileAccessTable(data?.accesses || []);

    if (mode === 'create') {

        form.reset();
        modalElement.querySelector('#modalTitle').textContent = 'Registrar perfil';
        form.querySelector('#submitBtn').textContent = 'Guardar';

    } 
    
    if (mode === 'edit') {

        form.elements.fullName.value = data.fullName;
        modalElement.querySelector('#modalTitle').textContent = 'Editar perfil';
        form.querySelector('#submitBtn').textContent = 'Actualizar';
    }

    openModal(modalElement);
}

const addProfileAccess = () => {
    const form = document.querySelector(formId);
    const department = form.elements.profileDepartment;
    const role = form.elements.profileRole;
    const access = {
        departmentId: department.value,
        departmentName: department.options[department.selectedIndex]?.text,
        roleId: role.value,
        roleName: role.options[role.selectedIndex]?.text
    };
    const errors = validateFields(profileAccessValidators, access);

    if (profileAccesses.some(item => item.departmentId === access.departmentId)) {
        errors.departmentId = 'Esta área ya está en la tabla; elimine la relación existente si necesita cambiar su rol';
    }

    normalizeFormErrors({
        form,
        errors: {
            profileDepartment: errors.departmentId,
            profileRole: errors.roleId
        }
    });
    if (hasValidationErrors(errors)) return;

    profileAccesses.push(access);
    refreshProfileAccessTable();
    $(department).val(null).trigger('change');
    $(role).val(null).trigger('change');
};

on('click', '#addProfileAccessBtn', addProfileAccess);
