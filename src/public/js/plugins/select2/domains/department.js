import { getAllDepartments, getDepartmentOptions } from "../../../application/admin/departments.js";
import { initDomainSelect2, initFilterSelect2, toggleSelectOption, toggleSelectOptions } from "../baseSelect.js";
import { FILTER_SELECTORS } from "../../../constants/selectors.js";

const departmentFilterSelector = FILTER_SELECTORS.DEPARTMENT;

export const getDepartmentSelectApi = () => ({
    getSelect: () => document.querySelector(departmentFilterSelector),
    getValue: () => document.querySelector(departmentFilterSelector)?.value || ''
});

export const getSelectedDepartmentName = (selector = departmentFilterSelector) => {

    const departmentFilter = document.querySelector(selector);

    if (!departmentFilter?.value) return '';

    return departmentFilter.options[departmentFilter.selectedIndex]?.text || '';
};

export const initDepartmentFilterSelect = ({
    selectedId = null
} = {}) => initFilterSelect2({
    selector: departmentFilterSelector,
    getOptions: getDepartmentOptions,
    placeholder: 'Filtrar por área',
    selectedId
});

export const initDepartmentSelect = ({ 
    multiple = false,
    clearOnOpen = true,
    modalSelector, 
    baseSelector, 
    allowCreate = true
}) => initDomainSelect2({
    selector: baseSelector,
    containerSelector: modalSelector,
    multiple,
    clearOnOpen,
    get: getAllDepartments,
    placeholder: 'Buscar área...',
    mapOption: (department) => ({
        id: department.id,
        text: department.name,
    }),
    allowCreate,
    newTagLabel: 'Nueva área'
});

export const toggleDepartmentOption = ({ 
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

export const toggleDepartmentOptions = ({ 
    selector, 
    data = []
}) => {

    const options = data.map(d => ({
        id: d.id,
        text: d.name
    }));

    toggleSelectOptions({
        selector,
        data: options
    });
};
