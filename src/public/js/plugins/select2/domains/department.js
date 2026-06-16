import { getAllDepartments, getDepartmentOptions } from "../../../application/admin/departments.js";
import { initbaseSelect2, toggleSelectOption, toggleSelectOptions } from "../baseSelect.js";
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
} = {}) => {

    initbaseSelect2({
        baseSelector: departmentFilterSelector,
        containerSelector: 'body',
        get: async (params) => ({
            data: await getDepartmentOptions(params)
        }),
        clearOnOpen: false,
        placeholder: 'Filtrar por área',
        data: (params) => ({
            search: params.term
        }),
        processResults: (data) => {
            const list = data.data || data;
            return {
                results: list.map(department => ({
                    id: department.value,
                    text: department.label
                }))
            };
        }
    });

    if (!selectedId) {

        $(departmentFilterSelector).val('').trigger('change');
        return;
    }

    const currentOption = $(`${ departmentFilterSelector } option[value=\"${ selectedId }\"]`);

    if (currentOption.length) $(departmentFilterSelector).val(selectedId).trigger('change');
};

export const initDepartmentSelect = ({ 
    multiple = false,
    clearOnOpen = true,
    modalSelector, 
    baseSelector, 
    allowCreate = true
}) => {

    initbaseSelect2({
        baseSelector,
        clearOnOpen,
        containerSelector: modalSelector,
        multiple,
        get: getAllDepartments,
        placeholder: 'Buscar área...',
        processResults: (data) => {

            const list = data.data || data;

            return {
                results: list.map(d => ({
                    id: d.id,
                    text: d.name,
                }))
            };
        },
        ...(allowCreate && {
            tags: true,
            createTag: (params) => {

                const term = params.term.trim();

                if (!term) return null;

                return {
                    id: `new:${ term }`,
                    text: `${ term } (Nueva área)`,
                    newTag: true
                };
            }
        })
    });
};

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
