import { initDepartmentSelect } from "../domains/department.js";
import { initRoleSelect } from "../domains/role.js";
import { scopeSelectors } from "../../../utils/domUtils.js";

let scoped = null;
const selectors = {
    department: '#personDepartmentInput',
    role: '#personRoleInput'
};

export const initPersonFormSelect2 = ({ modalSelector }) => {

    scoped = scopeSelectors({ scopeSelector: modalSelector, selectors });
    
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
