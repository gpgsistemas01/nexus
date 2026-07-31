import { getMaterialOptions } from "../../../../application/warehouse/materials.js";
import { getSupplierOptions } from "../../../../application/warehouse/suppliers.js";
import { getFulfillmentStatusOptions } from "../../../../application/warehouse/fulfillmentStatuses.js";
import { getProfileOptions } from "../../../../application/admin/profiles.js";
import { initMaterialFilterSelect } from "../../../select2/domains/material.js";
import { initSupplierFilterSelect } from "../../../select2/domains/supplier.js";
import { initFulfillmentStatusFilterSelect } from "../../../select2/domains/fulfillmentStatus.js";
import { initClientFilterSelect } from "../../../select2/domains/client.js";
import { initDepartmentFilterSelect } from "../../../select2/domains/department.js";
import { initRoleFilterSelect } from "../../../select2/domains/role.js";
import { initProfileFilterSelect } from "../../../select2/domains/profile.js";
import { getMovementTypeData, initMovementTypeFilterSelect } from "../../../select2/domains/movementType.js";
import { FILTER_SELECTORS } from "../../../../constants/selectors.js";
import { buildDateFilterConfig } from "./modules/dateFilter.js";
import { attachSelectFilterHandler } from "./selectFilterEvents.js";


const attachTextFilterHandler = ({
    selector,
    onChange
}) => {

    $(selector).on('keydown', (event) => {
        if (event.key !== 'Enter') return;

        event.preventDefault();
        onChange?.();
    });
};

const buildTextFilterConfig = ({
    key,
    selector
}) => ({
    customGetValues: () => ({
        [key]: document.querySelector(selector)?.value?.trim() || ''
    }),
    attachHandler: ({ onChange }) => attachTextFilterHandler({
        selector,
        onChange
    })
});

const WAREHOUSE_PROFILE_FILTER_PARAMS = {
    department: 'ALMACÉN Y PROVEDURÍA',
    strictDepartmentFilter: true
};

const getWarehouseProfileFilterParams = (params = {}) => ({
    search: params.term,
    ...WAREHOUSE_PROFILE_FILTER_PARAMS
});

const selectFilterConfigs = {
    supplier: {
        key: 'supplierId',
        selector: FILTER_SELECTORS.SUPPLIER,
        isSelected: false,
        getOptions: getSupplierOptions,
        initSelect: initSupplierFilterSelect
    },
    material: {
        key: 'materialId',
        selector: FILTER_SELECTORS.MATERIAL,
        isSelected: false,
        getOptions: getMaterialOptions,
        initSelect: ({ selectedId }) => initMaterialFilterSelect({ selectedId, supplierFilterSelector: FILTER_SELECTORS.SUPPLIER })
    },
    fulfillmentStatus: {
        key: 'fulfillmentStatusId',
        selector: FILTER_SELECTORS.FULFILLMENT_STATUS,
        defaultSelectedLabel: 'Pendiente',
        getOptions: getFulfillmentStatusOptions,
        initSelect: initFulfillmentStatusFilterSelect
    },
    client: {
        key: 'clientId',
        selector: FILTER_SELECTORS.CLIENT,
        isSelected: false,
        initSelect: initClientFilterSelect
    },
    department: {
        key: 'departmentId',
        selector: FILTER_SELECTORS.DEPARTMENT,
        isSelected: false,
        initSelect: initDepartmentFilterSelect
    },
    role: {
        key: 'roleId',
        selector: FILTER_SELECTORS.ROLE,
        isSelected: false,
        initSelect: initRoleFilterSelect
    },
    profile: {
        key: 'profileId',
        selector: FILTER_SELECTORS.PROFILE,
        isSelected: false,
        initSelect: initProfileFilterSelect
    },
    independentProfile: {
        key: 'profileId',
        selector: FILTER_SELECTORS.PROFILE,
        isSelected: false,
        initSelect: ({ selectedId }) => initProfileFilterSelect({
            selectedId,
            departmentFilterSelector: null
        })
    },
    warehouseProfile: {
        key: 'profileId',
        selector: FILTER_SELECTORS.PROFILE,
        isSelected: false,
        getOptions: () => getProfileOptions(WAREHOUSE_PROFILE_FILTER_PARAMS),
        initSelect: ({ selectedId }) => initProfileFilterSelect({
            selectedId,
            departmentFilterSelector: null,
            data: getWarehouseProfileFilterParams
        })
    },
    movementType: {
        key: 'movementType',
        selector: FILTER_SELECTORS.MOVEMENT_TYPE,
        isSelected: false,
        getOptions: getMovementTypeData,
        initSelect: initMovementTypeFilterSelect
    },
    observations: buildTextFilterConfig({
        key: 'observationsSearch',
        selector: FILTER_SELECTORS.OBSERVATIONS
    })
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
        selector,
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
