import { initPresentationSelect, togglePresentationOption } from "../domains/presentation.js";
import { initReasonSelect } from "../domains/reason.js";
import { setupSupplierSelect, toggleSupplierOption } from "../domains/supplier.js";
import { initUnitMeasureSelect, toggleUnitMeasureOption } from "../domains/unitMeasure.js";
import { FORM_SELECTORS } from "../../../constants/selectors.js";

let scoped = null;
const selectors = {
    supplier: FORM_SELECTORS.SUPPLIER,
    unitMeasure: FORM_SELECTORS.UNIT_MEASURE,
    presentation: FORM_SELECTORS.PRESENTATION,
    reason: FORM_SELECTORS.REASON
};

export const initMaterialFormSelect2 = ({
    modalSelector
}) => {

    if (!scoped) scoped = Object.fromEntries(Object.entries(selectors).map(
        ([name, selector]) => [name, `${ modalSelector } ${ selector }`]
    ));

    [
        [setupSupplierSelect, {
            modalSelector,
            supplierSelector: scoped.supplier,
        }],
        [initUnitMeasureSelect, {
            modalSelector,
            baseSelector: scoped.unitMeasure,
            allowCreate: false
        }],
        [initPresentationSelect, {
            modalSelector,
            baseSelector: scoped.presentation,
            allowCreate: false
        }],
        [initReasonSelect, {
            baseSelector: scoped.reason,
            allowCreate: false
        }]
    ].forEach(([initialize, options]) => initialize(options));
};

export const setMaterialFormSelectOptions = ({
    modalSelector,
    data = null
}) => {

    [
        [
            toggleSupplierOption, 
            scoped.supplier, 
            data?.supplier?.id, 
            `${ data?.supplier?.tradeName }`
        ],
        [
            toggleUnitMeasureOption, 
            scoped.unitMeasure, 
            data?.unitMeasure?.id, 
            `${ data?.unitMeasure?.symbol } - ${ data?.unitMeasure?.name }`
        ],
        [
            togglePresentationOption, 
            scoped.presentation, 
            data?.presentation?.id, 
            data?.presentation?.name
        ]
    ].forEach(([toggleOption, selector, id, name]) => toggleOption({
        selector,
        id,
        name
    }));
};
