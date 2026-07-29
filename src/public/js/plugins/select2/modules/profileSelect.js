import { initDepartmentSelect, toggleDepartmentOptions } from "../domains/department.js";
import { initRoleSelect, toggleRoleOption } from "../domains/role.js";

const departmentSelector = '.department-select';
const roleSelector = '.role-select';

export const initProfileFormSelect2 = ({ modalSelector }) => {

    const departmentSelectorScoped = `${ modalSelector } ${ departmentSelector }`;

    initDepartmentSelect({
        modalSelector,
        clearOnOpen: false,
        multiple: true,
        baseSelector: departmentSelectorScoped,
        allowCreate: false
    });

    initRoleSelect({
        modalSelector,
        baseSelector: `${ modalSelector } ${ roleSelector }`
    });
}

export const setProfileFormSelectOptions = ({
    modalSelector,
    data = null 
}) => {

    toggleDepartmentOptions({
        selector: departmentSelector,
        data: data?.departments ? data.departments : []
    });

    toggleRoleOption({
        selector: `${ modalSelector } ${ roleSelector }`,
        id: data?.roleId,
        name: data?.roleName
    });
}
