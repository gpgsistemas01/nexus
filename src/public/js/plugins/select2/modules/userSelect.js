import { initDepartmentSelect, toggleDepartmentOption } from "../domains/department.js";
import { initRoleSelect, toggleRoleOption } from "../domains/role.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../../constants/selectors.js";

const modalSelector = MODAL_SELECTORS.USER;
const departmentSelector = FORM_SELECTORS.DEPARTMENT_ID;
const roleSelector = FORM_SELECTORS.ROLE_ID;

const departmentScopedSelector = `${ modalSelector } ${ departmentSelector }`;
const roleScopedSelector = `${ modalSelector } ${ roleSelector }`;

export const initUserFormSelect2 = () => {
    [
        [initDepartmentSelect, { modalSelector, baseSelector: departmentScopedSelector, allowCreate: false }],
        [initRoleSelect, { modalSelector, baseSelector: roleScopedSelector }]
    ].forEach(([initialize, options]) => initialize(options));
};

export const setUserFormSelectOptions = (data = null) => {
    [
        [toggleDepartmentOption, departmentScopedSelector, data?.departmentId, data?.departmentName],
        [toggleRoleOption, roleScopedSelector, data?.roleId, data?.roleName]
    ].forEach(([toggleOption, selector, id, name]) => toggleOption({ selector, id, name }));
};
