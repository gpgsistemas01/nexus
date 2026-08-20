import { getAllReasons } from "../../../application/warehouse/reasons/reasons.js";
import { buildPaginatedSelectResults, initbaseSelect2, SELECT_RESULTS_LIMIT, toggleSelectOption } from "../baseSelect.js";
import { toggleDisabledElement } from '../../../utils/formUtils.js';

export const initReasonSelect = ({ 
    modalSelector, 
    baseSelector, 
    clearOnOpen = true,
    data, 
    allowCreate = true 
}) => {

    initbaseSelect2({
        baseSelector,
        containerSelector: modalSelector,
        get: getAllReasons,
        clearOnOpen,
        data,
        placeholder: 'Seleccione una razón...',
        processResults: (data, params) => buildPaginatedSelectResults(data, params, {
            length: SELECT_RESULTS_LIMIT,
            mapItem: (p) => ({
                id: p.id,
                text: p.name
            })
        }),
        ...(allowCreate && {
            tags: true,
            createTag: (params) => {

                const term = params.term.trim();

                if (!term) return null;

                return {
                    id: `new:${ term }`,
                    text: `${ term } (Nueva razón)`,
                    newTag: true
                };
            }
        })
    });
};

export const toggleReasonOption = ({ 
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

export const setReasonVisualOption = ({
    selector,
    name,
    isDisabled = false
}) => {

    if (name) toggleReasonOption({ selector, id: `visual:${ name }`, name });

    toggleDisabledElement({
        element: document.querySelector(selector),
        isDisabled
    });
};
