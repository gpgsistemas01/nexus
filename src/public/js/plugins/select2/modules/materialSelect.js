import { initPresentationSelect, togglePresentationOption } from "../domains/presentation.js";
import { initReasonSelect } from "../domains/reason.js";
import { setupSupplierSelect, toggleSupplierOption } from "../domains/supplier.js";
import { initUnitMeasureSelect, toggleUnitMeasureOption } from "../domains/unitMeasure.js";
import { FORM_SELECTORS } from "../../../constants/selectors.js";

const supplierSelector = FORM_SELECTORS.SUPPLIER;
const unitMeasureSelector = FORM_SELECTORS.UNIT_MEASURE;
const presentationSelector = FORM_SELECTORS.PRESENTATION;
const reasonSelector = FORM_SELECTORS.REASON;

export const initMaterialFormSelect2 = ({
    modalSelector
}) => {

    const supplierScopedSelector = `${ modalSelector } ${ supplierSelector }`;
    const unitMeasureScopedSelector = `${ modalSelector } ${ unitMeasureSelector }`;
    const presentationScopedSelector = `${ modalSelector } ${ presentationSelector }`;
    const reasonScopedSelector = `${ modalSelector } ${ reasonSelector }`;

    setupSupplierSelect({
        modalSelector,
        supplierSelector
    });

    initUnitMeasureSelect({
        modalSelector,
        baseSelector: unitMeasureScopedSelector,
        allowCreate: false
    });

    initPresentationSelect({
        modalSelector,
        baseSelector: presentationScopedSelector,
        allowCreate: false
    });

    initReasonSelect({
        modalSelector,
        baseSelector: reasonScopedSelector,
        allowCreate: false
    });
};

export const setMaterialFormSelectOptions = ({
    modalSelector,
    data = null
}) => {

    const supplierScopedSelector = `${ modalSelector } ${ supplierSelector }`;
    const unitMeasureScopedSelector = `${ modalSelector } ${ unitMeasureSelector }`;
    const presentationScopedSelector = `${ modalSelector } ${ presentationSelector }`;
    toggleSupplierOption({
        selector: supplierScopedSelector,
        id: data?.supplier?.id,
        name: `${ data?.supplier?.tradeName }`
    });

    toggleUnitMeasureOption({
        selector: unitMeasureScopedSelector,
        id: data?.unitMeasure?.id,
        name: `${ data?.unitMeasure?.symbol } - ${ data?.unitMeasure?.name }`
    });

    togglePresentationOption({
        selector: presentationScopedSelector,
        id: data?.presentation?.id,
        name: data?.presentation?.name
    });
};
