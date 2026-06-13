import { getProductOptions } from "../../../../application/warehouse/products.js";
import { getSupplierOptions } from "../../../../application/warehouse/suppliers.js";
import { getFulfillmentStatusOptions } from "../../../../application/warehouse/fulfillmentStatuses.js";
import { attachProductFilterHandler, getProductSelectApi, initProductFilterSelect } from "../../../select2/domains/product.js";
import { attachSupplierFilterHandler, getSupplierSelectApi, initSupplierFilterSelect } from "../../../select2/domains/supplier.js";
import { attachFulfillmentStatusFilterHandler, getFulfillmentStatusSelectApi, initFulfillmentStatusFilterSelect } from "../../../select2/domains/fulfillmentStatus.js";
import { attachClientFilterHandler, getClientSelectApi, initClientFilterSelect } from "../../../select2/domains/client.js";
import { attachDepartmentFilterHandler, getDepartmentSelectApi, initDepartmentFilterSelect } from "../../../select2/domains/department.js";
import { attachProfileFilterHandler, getProfileSelectApi, initProfileFilterSelect } from "../../../select2/domains/profile.js";
import { FILTER_SELECTORS } from "../../../../constants/selectors.js";

export const getDateFilterApi = () => ({
    getValues: () => ({
        startDate: document.querySelector(FILTER_SELECTORS.START_DATE)?.value || '',
        endDate: document.querySelector(FILTER_SELECTORS.END_DATE)?.value || ''
    })
});

export const attachDateFilterHandler = ({
    onChange
}) => {

    $(FILTER_SELECTORS.START_DATE).on('change', () => {
        onChange?.();
    });

    $(FILTER_SELECTORS.END_DATE).on('change', () => {
        onChange?.();
    });
};

const buildDateFilterConfig = ({
    onChange
}) => ({
    customGetValues: () => ({
        startDate: document.querySelector(FILTER_SELECTORS.START_DATE)?.value || '',
        endDate: document.querySelector(FILTER_SELECTORS.END_DATE)?.value || ''
    }),
    attachHandler: () => attachDateFilterHandler({
        onChange
    })
});

const buildSupplierFilterConfig = ({
    onChange
}) => ({
    key: 'supplierId',
    isSelected: false,
    getSelectApi: getSupplierSelectApi,
    getOptions: getSupplierOptions,
    initSelect: initSupplierFilterSelect,
    attachHandler: () => attachSupplierFilterHandler({
        onChange
    })
});

const buildProductFilterConfig = ({
    onChange
}) => ({
    key: 'productId',
    isSelected: false,
    getSelectApi: getProductSelectApi,
    getOptions: getProductOptions,
    initSelect: ({ selectedId }) => initProductFilterSelect({ selectedId, supplierFilterSelector: FILTER_SELECTORS.SUPPLIER }),
    attachHandler: () => attachProductFilterHandler({
        onChange
    })
});

const buildFulfillmentStatusFilterConfig = ({
    onChange
}) => ({
    key: 'fulfillmentStatusId',
    getSelectApi: getFulfillmentStatusSelectApi,
    getOptions: getFulfillmentStatusOptions,
    initSelect: initFulfillmentStatusFilterSelect,
    attachHandler: () => attachFulfillmentStatusFilterHandler({
        onChange
    })
});

const buildClientFilterConfig = ({
    onChange
}) => ({
    key: 'clientId',
    isSelected: false,
    getSelectApi: getClientSelectApi,
    getOptions: async () => [],
    initSelect: initClientFilterSelect,
    attachHandler: () => attachClientFilterHandler({ onChange })
});

const buildDepartmentFilterConfig = ({
    onChange
}) => ({
    key: 'departmentId',
    isSelected: false,
    getSelectApi: getDepartmentSelectApi,
    getOptions: async () => [],
    initSelect: initDepartmentFilterSelect,
    attachHandler: () => attachDepartmentFilterHandler({ onChange })
});

const buildProfileFilterConfig = ({
    onChange
}) => ({
    key: 'profileId',
    isSelected: false,
    getSelectApi: getProfileSelectApi,
    getOptions: async () => [],
    initSelect: ({ selectedId }) => initProfileFilterSelect({ selectedId, departmentFilterSelector: FILTER_SELECTORS.DEPARTMENT }),
    attachHandler: () => attachProfileFilterHandler({ onChange })
});

const tableFilterConfigBuilders = {
    date: buildDateFilterConfig,
    supplier: buildSupplierFilterConfig,
    product: buildProductFilterConfig,
    fulfillmentStatus: buildFulfillmentStatusFilterConfig,
    client: buildClientFilterConfig,
    department: buildDepartmentFilterConfig,
    profile: buildProfileFilterConfig
};

const resolveTableFilterConfig = ({
    field,
    onChange
}) => {

    if (typeof field !== 'string') return field;

    return tableFilterConfigBuilders[field]?.({ onChange });
};

export const buildTableFilterConfigs = ({
    fields,
    onChange
}) => fields
    .map((field) => resolveTableFilterConfig({ field, onChange }))
    .filter(Boolean);
