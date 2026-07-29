import { initDepartmentSelect } from "../domains/department.js";
import { initRoleSelect } from "../domains/role.js";

const departmentSelector = '#profileDepartmentInput';
const roleSelector = '#profileRoleInput';

export const initProfileFormSelect2 = ({ modalSelector }) => {
    initDepartmentSelect({
        modalSelector,
        clearOnOpen: false,
        multiple: false,
        baseSelector: `${ modalSelector } ${ departmentSelector }`,
        allowCreate: false
    });
    initRoleSelect({
        modalSelector,
        baseSelector: `${ modalSelector } ${ roleSelector }`
    });
};
