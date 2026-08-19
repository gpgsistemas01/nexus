import { getFulfillmentStatusOptions } from "../../../application/warehouse/fulfillmentStatuses.js";
import { initFilterSelect2 } from "../baseSelect.js";
import { FILTER_SELECTORS } from "../../../constants/selectors.js";

const fulfillmentStatusSelector = FILTER_SELECTORS.FULFILLMENT_STATUS;

export const initFulfillmentStatusFilterSelect = ({
    selectedId = null
} = {}) => initFilterSelect2({
    selector: fulfillmentStatusSelector,
    getOptions: getFulfillmentStatusOptions,
    placeholder: 'Filtrar por estado surtido',
    selectedId,
    clearWhenEmpty: false
});