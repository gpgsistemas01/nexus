import { initDepartmentSelect, toggleDepartmentOption } from "../domains/department.js";
import { initRoleSelect, toggleRoleOption } from "../domains/role.js";
import { FORM_SELECTORS, MODAL_SELECTORS, SELECT_SELECTORS } from "../../../constants/selectors.js";

let scoped = null;
const selectors = {
    department: SELECT_SELECTORS.DEPARTMENT_ID,
    role: SELECT_SELECTORS.ROLE_ID
};
const modalSelector = MODAL_SELECTORS.USER;

export const initUserFormSelect2 = () => {

    if (!scoped) scoped = Object.fromEntries(Object.entries(selectors).map(
        ([name, selector]) => [name, `${ MODAL_SELECTORS.USER } ${ selector }`]
    ));

    [
        [initDepartmentSelect, { modalSelector, baseSelector: scoped.department, allowCreate: false }],
        [initRoleSelect, { modalSelector, baseSelector: scoped.role, allowCreate: false }]
    ].forEach(([initialize, options]) => initialize(options));
};

export const setUserFormSelectOptions = (data = null) => {
    
    [
        [toggleDepartmentOption, scoped.department, data?.departmentId, data?.departmentName],
        [toggleRoleOption, scoped.role, data?.roleId, data?.roleName]
    ].forEach(([toggleOption, selector, id, name]) => toggleOption({ selector, id, name }));
};
