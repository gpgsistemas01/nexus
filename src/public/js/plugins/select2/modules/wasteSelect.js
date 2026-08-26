import { initReasonSelect, toggleReasonOption } from "../domains/reason.js";
import { setupSupplierSelect, toggleSupplierOption } from "../domains/supplier.js";
import { initWasteMaterialTemplateSelect, toggleWasteMaterialTemplateOption } from "../domains/wasteMaterialTemplate.js";
import { SELECT_SELECTORS } from "../../../constants/selectors.js";

let scoped = null;
const selectors = {
    material: SELECT_SELECTORS.MATERIAL,
    supplier: SELECT_SELECTORS.SUPPLIER,
    reason: SELECT_SELECTORS.REASON
};

export const initWasteSelect2 = ({ modalSelector }) => {

    scoped = Object.fromEntries(Object.entries(selectors).map(
        ([name, selector]) => [name, `${ modalSelector } ${ selector }`]
    ));

    [
        [initWasteMaterialTemplateSelect, {
            modalSelector,
            baseSelector: scoped.material,
            supplierSelector: scoped.supplier,
            data: () => ({ supplierId: $(scoped.supplier).val() })
        }],
        [setupSupplierSelect, {
            modalSelector,
            supplierSelector: SELECT_SELECTORS.SUPPLIER,
            allowCreate: false
        }],
        [initReasonSelect, {
            modalSelector,
            baseSelector: scoped.reason,
            allowCreate: false
        }]
    ].forEach(([initialize, options]) => initialize(options));

};

export const setWasteSelectOptions = ({ modalSelector, data = null }) => {

    [
        [toggleWasteMaterialTemplateOption, {
            selector: scoped.material,
            data: null
        }],
        [toggleSupplierOption, {
            selector: scoped.supplier,
            id: data?.supplier?.id,
            name: data?.supplier?.tradeName
        }],
        [toggleReasonOption, {
            selector: scoped.reason,
            id: data?.reason?.id,
            name: data?.reason?.name
        }]
    ].forEach(([toggleOption, options]) => toggleOption({
        ...options,
    }));
};
