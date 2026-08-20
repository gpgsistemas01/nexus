import { DOM_EVENT_NAMES } from '../../../constants/events.js';
import { FORM_MODES } from '../../../constants/formModes.js';
import { hasPermission, UI_PERMISSIONS } from '../../../constants/permissions.js';
import { BUTTON_SELECTORS, FORM_SELECTORS, HEADING_SELECTORS, MODAL_SELECTORS } from '../../../constants/selectors.js';
import { initPersonAccessTable, personAccesses, refreshPersonAccessTable } from '../../../plugins/datatable/admin/persons/personDatatable.js';
import { clearSelectValue } from '../../../plugins/select2/baseSelect.js';
import { initPersonFormSelect2 } from '../../../plugins/select2/modules/personSelect.js';
import { clearFormErrors, normalizeFormErrors } from '../../../ui/forms/formErrorsUI.js';
import { initForm } from '../../../ui/forms/formStateUI.js';
import { openModal } from '../../../ui/modalUI.js';
import { on } from '../../../utils/domUtils.js';
import { hasValidationErrors, validateFields } from '../../../utils/formUtils.js';
import { personAccessValidation } from '../../../utils/validations/validators.js';

const formId = FORM_SELECTORS.PERSON;
const modalId = MODAL_SELECTORS.PERSON;
const canManagePersons = hasPermission(window.meta || {}, UI_PERMISSIONS.PERSONS_WRITE);

export const openPersonModal = ({ mode, data = null }) => {
    if (!canManagePersons) return;

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(modalId);

    initForm({ form, mode, id: data?.id || '' });
    clearFormErrors(form);
    initPersonFormSelect2({ modalSelector: modalId });
    initPersonAccessTable(data?.accesses || []);

    if (mode === FORM_MODES.CREATE) {
        form.reset();
        modalElement.querySelector(HEADING_SELECTORS.MODAL_TITLE).textContent = 'Registrar persona';
        form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = 'Guardar';
    }

    if (mode === FORM_MODES.EDIT) {
        form.elements.fullName.value = data.fullName;
        modalElement.querySelector(HEADING_SELECTORS.MODAL_TITLE).textContent = 'Editar persona';
        form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = 'Actualizar';
    }

    openModal(modalElement);
};

on(DOM_EVENT_NAMES.CLICK, '#addPersonAccessBtn', () => {
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
});
