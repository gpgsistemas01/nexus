import { initDepartmentSelect, toggleDepartmentOption } from "../domains/department.js";
import { initRoleSelect, toggleRoleOption } from "../domains/role.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../../constants/selectors.js";

const modalSelector = MODAL_SELECTORS.USER;
const departmentSelector = FORM_SELECTORS.DEPARTMENT_ID;
const roleSelector = FORM_SELECTORS.ROLE_ID;

const departmentScopedSelector = `${ modalSelector } ${ departmentSelector }`;
const roleScopedSelector = `${ modalSelector } ${ roleSelector }`;

export const initUserFormSelect2 = () => {
    initDepartmentSelect({
        modalSelector,
        baseSelector: departmentScopedSelector,
        allowCreate: false
    });

    initRoleSelect({
        modalSelector,
        baseSelector: roleScopedSelector
    });
};

export const setUserFormSelectOptions = (data = null) => {
    toggleDepartmentOption({
        selector: departmentScopedSelector,
        id: data?.departmentId,
        name: data?.departmentName
    });

    toggleRoleOption({
        selector: roleScopedSelector,
        id: data?.roleId,
        name: data?.roleName
    });
};
