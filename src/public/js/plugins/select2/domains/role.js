import { getAllRoles } from '../../../application/admin/roles.js';
import { buildPaginatedSelectParams, buildPaginatedSelectResults, initbaseSelect2, initFilterSelect2, SELECT_RESULTS_LIMIT, toggleSelectOption } from '../baseSelect.js';
import { FILTER_SELECTORS } from '../../../constants/selectors.js';

const roleFilterSelector = FILTER_SELECTORS.ROLE;

export const initRoleFilterSelect = ({ selectedId = null } = {}) => {
    initFilterSelect2({
        selector: roleFilterSelector,
        getOptions: getAllRoles,
        placeholder: 'Filtrar por rol',
        selectedId,
        mapOption: (role) => ({ id: role.id, text: role.name }),
        data: (params) => buildPaginatedSelectParams(params, { length: SELECT_RESULTS_LIMIT })
    });
};

export const initRoleSelect = ({
    modalSelector,
    baseSelector
}) => {

    initbaseSelect2({
        baseSelector,
        containerSelector: modalSelector,
        get: getAllRoles,
        placeholder: 'Buscar rol...',
        processResults: (data, params) => buildPaginatedSelectResults(data, params, {
            length: SELECT_RESULTS_LIMIT,
            mapItem: (role) => ({
                id: role.id,
                text: role.name
            })
        })
    });
};

export const toggleRoleOption = ({
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
