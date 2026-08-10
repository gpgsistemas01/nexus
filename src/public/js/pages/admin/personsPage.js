import { registerPerson, updatePerson } from "../../application/admin/persons.js";
import { useForm } from "../../application/form.js";
import { createPersonsDatatable, initPersonAccessTable, personAccesses, refreshPersonAccessTable } from "../../plugins/datatable/personDatatable.js";
import { initPersonFormSelect2 } from "../../plugins/select2/modules/personSelect.js";
import { clearFormErrors, initForm, normalizeFormErrors } from "../../ui/formUI.js";
import { openModal } from "../../ui/modalUI.js";
import { handleSubmit, hasValidationErrors, validateFields } from "../../utils/formUtils.js";
import { personAccessValidation, personValidation } from "../../utils/validations/validators.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";
import { on } from "../../utils/domUtils.js";
import { clearSelectValue } from "../../plugins/select2/baseSelect.js";
import { hasPermission, UI_PERMISSIONS } from "../../constants/permissions.js";

const formId = FORM_SELECTORS.PERSON_FORM;
const modalId = MODAL_SELECTORS.PERSON;

const context = window.meta || {};
const canManagePersons = hasPermission(context, UI_PERMISSIONS.PERSONS_WRITE);

createPersonsDatatable({ canManagePersons });

useForm({
    selector: formId,
    normalizeData: ({ formData }) => {

        return {
            ...formData,
            accesses: personAccesses.map(({ departmentId, roleId }) => ({ departmentId, roleId }))
        }
    },
    getErrors: ({ formData }) => validateFields(personValidation, formData),
    sendRequest: async ({ formData, form }) => {

        await handleSubmit({
            form,
            formData,
            create: registerPerson,
            update: updatePerson
        });
    }
});

export const openPersonModal = ({ mode, data = null }) => {

    if (!canManagePersons) return;

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(modalId);

    initForm({ form, mode, id: data?.id || '' });
    clearFormErrors(form);
    initPersonFormSelect2({ modalSelector: modalId });
    initPersonAccessTable(data?.accesses || []);

    if (mode === 'create') {

        form.reset();
        modalElement.querySelector('#modalTitle').textContent = 'Registrar persona';
        form.querySelector('#submitBtn').textContent = 'Guardar';

    } 
    
    if (mode === 'edit') {

        form.elements.fullName.value = data.fullName;
        modalElement.querySelector('#modalTitle').textContent = 'Editar persona';
        form.querySelector('#submitBtn').textContent = 'Actualizar';
    }

    openModal(modalElement);
}

const addPersonAccess = () => {
    const form = document.querySelector(formId);
    const department = form.elements.personDepartment;
    const role = form.elements.personRole;
    const access = {
        departmentId: department.value,
        departmentName: department.options[department.selectedIndex]?.text,
        roleId: role.value,
        roleName: role.options[role.selectedIndex]?.text
    };
    const errors = validateFields(personAccessValidation, {
        ...access,
        accesses: personAccesses
    });

    normalizeFormErrors({
        form,
        errors: {
            personDepartment: errors.departmentId,
            personRole: errors.roleId
        }
    });
    if (hasValidationErrors(errors)) return;

    personAccesses.push(access);
    refreshPersonAccessTable();
    clearSelectValue(department);
    clearSelectValue(role);
};

on('click', '#addPersonAccessBtn', addPersonAccess);
