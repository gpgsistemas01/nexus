import { initDepartmentSelect } from "../domains/department.js";
import { initRoleSelect } from "../domains/role.js";

const departmentSelector = '#personDepartmentInput';
const roleSelector = '#personRoleInput';

export const initPersonFormSelect2 = ({ modalSelector }) => {
    [
        [initDepartmentSelect, {
            modalSelector,
            clearOnOpen: false,
            baseSelector: `${ modalSelector } ${ departmentSelector }`,
            allowCreate: false
        }],
        [initRoleSelect, {
            modalSelector,
            baseSelector: `${ modalSelector } ${ roleSelector }`
        }]
    ].forEach(([initialize, options]) => initialize(options));
};
