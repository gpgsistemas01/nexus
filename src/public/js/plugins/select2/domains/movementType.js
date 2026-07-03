import { initbaseSelect2 } from "../baseSelect.js";
import { FILTER_SELECTORS } from "../../../constants/selectors.js";

const movementTypeSelector = FILTER_SELECTORS.MOVEMENT_TYPE;
export const getMovementTypeData = () => ([
    {
        id: 'ENTRY',
        text: 'Entrada'
    },
    {
        id: 'ISSUE',
        text: 'Salida'
    },
    {
        id: 'ADJUSTMENT',
        text: 'Ajuste'
    }
]);

export const getMovementTypeSelectApi = () => ({
    getSelect: () => document.querySelector(movementTypeSelector),
    getValue: () => document.querySelector(movementTypeSelector)?.value || ''
});

export const initMovementTypeFilterSelect = ({
    selectedId = null
}) => {

    initbaseSelect2({
        baseSelector: movementTypeSelector,
        containerSelector: 'body',
        get: async () => ({
            data: getMovementTypeData()
        }),
        clearOnOpen: false,
        placeholder: 'Filtrar por tipo de movimiento',
        data: (params) => ({
            search: params.term,
        }),
        processResults: (data) => {

            const list = data.data || data;

            return {
                results: list.map(status => ({
                    ...status
                }))
            };
        }
    });

    if (!selectedId) return;

    const currentOption = $(`${ movementTypeSelector } option[value=\"${ selectedId }\"]`);

    if (currentOption.length) $(movementTypeSelector).val(selectedId).trigger('change');
}
