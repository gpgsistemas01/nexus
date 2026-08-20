import { getAllDepartments } from "../../../application/admin/departments/departments.js";
import { initDomainSelect2, initFilterSelect2, toggleSelectOption, toggleSelectOptions } from "../baseSelect.js";
import { FILTER_SELECTORS } from "../../../constants/selectors.js";

const departmentFilterSelector = FILTER_SELECTORS.DEPARTMENT;

export const initDepartmentFilterSelect = ({
    selectedId = null
} = {}) => initFilterSelect2({
    selector: departmentFilterSelector,
    getOptions: getAllDepartments,
    placeholder: 'Filtrar por área',
    selectedId,
    mapOption: (department) => ({ id: department.id, text: department.name })
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
