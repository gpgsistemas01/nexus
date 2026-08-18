import { initDepartmentSelect } from "../domains/department.js";
import { initRoleSelect } from "../domains/role.js";

let scoped = null;
const selectors = {
    department: '#personDepartmentInput',
    role: '#personRoleInput'
};

export const initPersonFormSelect2 = ({ modalSelector }) => {

    if (!scoped) scoped = Object.fromEntries(Object.entries(selectors).map(
        ([name, selector]) => [name, `${ modalSelector } ${ selector }`]
    ));
    
    [
        [initDepartmentSelect, {
            modalSelector,
            clearOnOpen: false,
            baseSelector: scoped.department,
            allowCreate: false
        }],
        [initRoleSelect, {
            modalSelector,
            baseSelector: scoped.role
        }]
    ].forEach(([initialize, options]) => initialize(options));
};
