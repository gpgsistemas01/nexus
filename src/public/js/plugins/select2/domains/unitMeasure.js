import { getAllUnitMeasures } from "../../../application/warehouse/unitMeasures.js";
import { buildPaginatedSelectResults, initbaseSelect2, SELECT_RESULTS_LIMIT, toggleSelectOption } from "../baseSelect.js";

export const initUnitMeasureSelect = ({ 
    modalSelector, 
    baseSelector, 
    allowCreate = true
}) => {

    initbaseSelect2({
        baseSelector,
        containerSelector: modalSelector,
        get: getAllUnitMeasures,
        placeholder: 'Buscar unidad...',
        processResults: (data, params) => buildPaginatedSelectResults(data, params, {
            length: SELECT_RESULTS_LIMIT,
            mapItem: (u) => ({
                id: u.id,
                text: `${ u.symbol } - ${ u.name }`,
            })
        }),
        ...(allowCreate && {
            tags: true,
            createTag: (params) => {

                const term = params.term.trim();

                if (!term) return null;

                return {
                    id: `new:${ term }`,
                    text: `${ term } (Nueva unidad)`,
                    newTag: true
                };
            }
        })
    });
};

export const toggleUnitMeasureOption = ({ 
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
