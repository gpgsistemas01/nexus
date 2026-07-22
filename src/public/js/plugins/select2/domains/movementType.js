import { initFilterSelect2 } from "../baseSelect.js";
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
} = {}) => initFilterSelect2({
    selector: movementTypeSelector,
    getOptions: async () => getMovementTypeData(),
    placeholder: 'Filtrar por tipo de movimiento',
    selectedId,
    mapOption: (status) => ({
        ...status
    }),
    clearWhenEmpty: false
});
