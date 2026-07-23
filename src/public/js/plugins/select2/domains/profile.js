import { getAllProfiles, getProfileOptions } from "../../../application/admin/profiles.js";
import { initDomainSelect2, initFilterSelect2, toggleSelectOption } from "../baseSelect.js";
import { FILTER_SELECTORS } from "../../../constants/selectors.js";
import { getSelectedDepartmentName } from "./department.js";

const profileFilterSelector = FILTER_SELECTORS.PROFILE;

export const getProfileSelectApi = () => ({
    getSelect: () => document.querySelector(profileFilterSelector),
    getValue: () => document.querySelector(profileFilterSelector)?.value || ''
});

export const initProfileFilterSelect = ({
    selectedId = null,
    departmentFilterSelector = FILTER_SELECTORS.DEPARTMENT,
    data: resolveData = null
} = {}) => initFilterSelect2({
    selector: profileFilterSelector,
    getOptions: getProfileOptions,
    placeholder: 'Filtrar por perfil',
    selectedId,
    data: (params) => {

        if (typeof resolveData === 'function') return resolveData(params);

        const departmentName = departmentFilterSelector
            ? getSelectedDepartmentName(departmentFilterSelector)
            : '';

        return {
            search: params.term,
            ...(departmentName && {
                department: departmentName,
                strictDepartmentFilter: true
            })
        };
    }
});

export const initProfileSelect = ({ 
    modalSelector, 
    baseSelector, 
    placeholder, 
    clearOnOpen = true,
    data, 
    allowCreate = true 
}) => initDomainSelect2({
    selector: baseSelector,
    containerSelector: modalSelector,
    get: getAllProfiles,
    clearOnOpen,
    data,
    placeholder,
    mapOption: (profile) => ({
        id: profile.id,
        text: profile.fullName
    }),
    allowCreate,
    newTagLabel: 'Nuevo perfil'
});

export const toggleProfileOption = ({ 
    selector, 
    id = null, 
    name = null
}) => toggleSelectOption({
    selector,
    data: {
        id,
        text: name
    }
});
