import { getAllPersons } from "../../../application/admin/persons.js";
import { initDomainSelect2, initFilterSelect2, toggleSelectOption } from "../baseSelect.js";
import { FILTER_SELECTORS } from "../../../constants/selectors.js";
import { getSelectedOptionText } from "../../../utils/domUtils.js";

const personFilterSelector = FILTER_SELECTORS.PERSON;

export const initPersonFilterSelect = ({
    selectedId = null,
    departmentFilterSelector = FILTER_SELECTORS.DEPARTMENT,
    data: resolveData = null
} = {}) => initFilterSelect2({
    selector: personFilterSelector,
    getOptions: getAllPersons,
    placeholder: 'Filtrar por persona',
    selectedId,
    paginated: true,
    mapOption: (person) => ({ id: person.id, text: person.fullName }),
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

export const initPersonSelect = ({
    modalSelector,
    baseSelector,
    placeholder,
    clearOnOpen = true,
    data,
    allowCreate = true
}) => initDomainSelect2({
    selector: baseSelector,
    containerSelector: modalSelector,
    get: getAllPersons,
    clearOnOpen,
    data,
    placeholder,
    mapOption: (person) => ({
        id: person.id,
        text: person.fullName
    }),
    allowCreate,
    newTagLabel: 'Nueva persona'
});

export const togglePersonOption = ({
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
