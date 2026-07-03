import { getProductOptions } from "../../../../application/warehouse/products.js";
import { getSupplierOptions } from "../../../../application/warehouse/suppliers.js";
import { getFulfillmentStatusOptions } from "../../../../application/warehouse/fulfillmentStatuses.js";
import { getProductSelectApi, initProductFilterSelect } from "../../../select2/domains/product.js";
import { getSupplierSelectApi, initSupplierFilterSelect } from "../../../select2/domains/supplier.js";
import { getFulfillmentStatusSelectApi, initFulfillmentStatusFilterSelect } from "../../../select2/domains/fulfillmentStatus.js";
import { getClientSelectApi, initClientFilterSelect } from "../../../select2/domains/client.js";
import { getDepartmentSelectApi, initDepartmentFilterSelect } from "../../../select2/domains/department.js";
import { getProfileSelectApi, initProfileFilterSelect } from "../../../select2/domains/profile.js";
import { getMovementTypeSelectApi, getMovementTypeData, initMovementTypeFilterSelect } from "../../../select2/domains/movementType.js";
import { FILTER_SELECTORS } from "../../../../constants/selectors.js";
import { buildDateFilterConfig } from "./modules/dateFilter.js";
import { attachSelectFilterHandler } from "./selectFilterEvents.js";

const selectFilterConfigs = {
    supplier: {
        key: 'supplierId',
        selector: FILTER_SELECTORS.SUPPLIER,
        isSelected: false,
        getSelectApi: getSupplierSelectApi,
        getOptions: getSupplierOptions,
        initSelect: initSupplierFilterSelect
    },
    product: {
        key: 'productId',
        selector: FILTER_SELECTORS.PRODUCT,
        isSelected: false,
        getSelectApi: getProductSelectApi,
        getOptions: getProductOptions,
        initSelect: ({ selectedId }) => initProductFilterSelect({ selectedId, supplierFilterSelector: FILTER_SELECTORS.SUPPLIER })
    },
    fulfillmentStatus: {
        key: 'fulfillmentStatusId',
        selector: FILTER_SELECTORS.FULFILLMENT_STATUS,
        getSelectApi: getFulfillmentStatusSelectApi,
        getOptions: getFulfillmentStatusOptions,
        initSelect: initFulfillmentStatusFilterSelect
    },
    client: {
        key: 'clientId',
        selector: FILTER_SELECTORS.CLIENT,
        isSelected: false,
        getSelectApi: getClientSelectApi,
        initSelect: initClientFilterSelect
    },
    department: {
        key: 'departmentId',
        selector: FILTER_SELECTORS.DEPARTMENT,
        isSelected: false,
        getSelectApi: getDepartmentSelectApi,
        initSelect: initDepartmentFilterSelect
    },
    profile: {
        key: 'profileId',
        selector: FILTER_SELECTORS.PROFILE,
        isSelected: false,
        getSelectApi: getProfileSelectApi,
        initSelect: initProfileFilterSelect
    },
    movementType: {
        key: 'movementType',
        selector: FILTER_SELECTORS.MOVEMENT_TYPE,
        isSelected: false,
        getSelectApi: getMovementTypeSelectApi,
        getOptions: getMovementTypeData,
        initSelect: initMovementTypeFilterSelect
    }
};

const resolveTableFilterConfig = ({
    field,
    onChange
}) => {

    if (typeof field !== 'string') return field;

    if (field === 'date') return buildDateFilterConfig({ onChange });

    const selectFilterConfig = selectFilterConfigs[field];

    if (!selectFilterConfig) return null;

    const { selector, ...filterConfig } = selectFilterConfig;

    return {
        ...filterConfig,
        attachHandler: () => attachSelectFilterHandler({
            selector,
            onChange
        })
    };
};

export const buildTableFilterConfigs = ({
    fields,
    onChange
}) => fields
    .map((field) => resolveTableFilterConfig({ field, onChange }))
    .filter(Boolean);
