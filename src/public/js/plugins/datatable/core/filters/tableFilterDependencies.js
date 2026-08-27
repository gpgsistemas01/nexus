import { DOM_EVENT_NAMES } from '../../../../constants/events.js';
import { FILTER_SELECTORS } from "../../../../constants/selectors.js";
import { bindDisabledSelectDependency } from "../../../select2/baseSelect.js";


const DEPENDENT_FILTER_MESSAGES = {
    materialRequiresSupplier: 'Seleccione un proveedor antes de filtrar por material.',
    wasteRequiresSupplier: 'Seleccione un proveedor antes de filtrar por merma.',
    personRequiresDepartment: 'Seleccione un área antes de filtrar por persona.'
};

const clearSelectFilter = (selector) => {

    $(selector).val(null).trigger(DOM_EVENT_NAMES.CHANGE);
};


const getSupplierInventoryFilterDependency = (filter) => {

    if (filter?.dependsOn !== 'supplierId' || !['materialId', 'wasteId'].includes(filter.key)) return null;

    return {
        sourceSelector: FILTER_SELECTORS.SUPPLIER,
        targetSelector: filter.selector,
        clearTarget: () => clearSelectFilter(filter.selector),
        disabledMessage: filter.key === 'wasteId'
            ? DEPENDENT_FILTER_MESSAGES.wasteRequiresSupplier
            : DEPENDENT_FILTER_MESSAGES.materialRequiresSupplier
    };
};

const bindSupplierInventoryFilterDependency = (filter) => {

    const dependency = getSupplierInventoryFilterDependency(filter);

    if (dependency) bindDisabledSelectDependency(dependency);
};

const bindDepartmentPersonFilterDependency = () => {

    bindDisabledSelectDependency({
        sourceSelector: FILTER_SELECTORS.DEPARTMENT,
        targetSelector: FILTER_SELECTORS.PERSON,
        clearTarget: () => clearSelectFilter(FILTER_SELECTORS.PERSON),
        disabledMessage: DEPENDENT_FILTER_MESSAGES.personRequiresDepartment
    });
};

export const bindTableFilterDependencies = (filters = []) => {

    const supplierInventoryFilter = filters.find(({ key, dependsOn }) => (
        dependsOn === 'supplierId' && ['materialId', 'wasteId'].includes(key)
    ));

    if (supplierInventoryFilter) bindSupplierInventoryFilterDependency(supplierInventoryFilter);

    if (filters.some(({ key, dependsOn }) => key === 'personId' && dependsOn === 'departmentId')) {
        bindDepartmentPersonFilterDependency();
    }
};
