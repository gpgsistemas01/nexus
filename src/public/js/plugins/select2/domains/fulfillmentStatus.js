import { getAllFulfillmentStatuses } from "../../../application/warehouse/catalogs/fulfillmentStatuses.js";
import { initFilterSelect2 } from "../baseSelect.js";
import { FILTER_SELECTORS } from "../../../constants/selectors.js";

const fulfillmentStatusSelector = FILTER_SELECTORS.FULFILLMENT_STATUS;

export const initFulfillmentStatusFilterSelect = ({
    selectedId = null
} = {}) => initFilterSelect2({
    selector: fulfillmentStatusSelector,
    getOptions: getAllFulfillmentStatuses,
    placeholder: 'Filtrar por estado surtido',
    selectedId,
    mapOption: (status) => ({ id: status.id, text: status.name }),
    clearWhenEmpty: false
});
