import { getAllProfiles } from "../../../application/admin/profiles.js";
import { initDomainSelect2, initFilterSelect2, toggleSelectOption } from "../baseSelect.js";
import { FILTER_SELECTORS } from "../../../constants/selectors.js";
import { getSelectedOptionText } from "../../../utils/domUtils.js";

const profileFilterSelector = FILTER_SELECTORS.PROFILE;

export const initProfileFilterSelect = ({
    selectedId = null,
    departmentFilterSelector = FILTER_SELECTORS.DEPARTMENT,
    data: resolveData = null
} = {}) => initFilterSelect2({
    selector: profileFilterSelector,
    getOptions: getAllProfiles,
    placeholder: 'Filtrar por perfil',
    selectedId,
    paginated: true,
    mapOption: (profile) => ({ id: profile.id, text: profile.fullName }),
    data: (params) => {

        if (typeof resolveData === 'function') return resolveData(params);

        const departmentName = departmentFilterSelector
            ? getSelectedOptionText(departmentFilterSelector)
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
