import { getAllPresentations } from "../../../application/warehouse/presentations/presentations.js";
import { buildPaginatedSelectResults, initbaseSelect2, SELECT_RESULTS_LIMIT, toggleSelectOption } from "../baseSelect.js";

export const initPresentationSelect = ({ 
    modalSelector, 
    baseSelector, 
    allowCreate = true
}) => {

    initbaseSelect2({
        baseSelector,
        containerSelector: modalSelector,
        get: getAllPresentations,
        placeholder: 'Buscar presentación...',
        processResults: (data, params) => buildPaginatedSelectResults(data, params, {
            length: SELECT_RESULTS_LIMIT,
            mapItem: (p) => ({
                id: p.id,
                text: p.name,
            })
        }),
        ...(allowCreate && {
            tags: true,
            createTag: (params) => {

                const term = params.term.trim();

                if (!term) return null;

                return {
                    id: `new:${ term }`,
                    text: `${ term } (Nueva presentación)`,
                    newTag: true
                };
            }
        })
    });
};

export const togglePresentationOption = ({ 
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
