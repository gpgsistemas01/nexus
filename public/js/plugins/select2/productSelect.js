import { openSupplierModal } from "../../modules/suppliers/supplierModal.js";
import { initPresentationSelect, togglePresentationOption } from "./domains/presentations.js";
import { setupSupplierSelect, toggleSupplierOption } from "./domains/supplier.js";
import { initUnitMeasureSelect, toggleUnitMeasureOption } from "./domains/unitMeasures.js";

const modalSelector = '#productModal';
const supplierSelector = '.supplier-select';
const unitMeasureSelector = '#unitMeasureInput';
const presentationSelector = '#presentationInput';

export const initProductFormSelect2 = () => {

    setupSupplierSelect({
        modalSelector,
        supplierSelector
    });

    initUnitMeasureSelect({
        modalSelector,
        baseSelector: unitMeasureSelector,
        allowCreate: false
    });

    initPresentationSelect({
        modalSelector,
        baseSelector: presentationSelector,
        allowCreate: false
    });
};

export const setProductFormSelectOptions = (data = null) => {
    console.log(data)
    toggleSupplierOption({
        selector: `${ modalSelector } ${ supplierSelector }`,
        id: data?.supplier?.id,
        name: `${ data?.supplier?.code } - ${ data?.supplier?.tradeName }`
    });

    toggleUnitMeasureOption({
        selector: `${ modalSelector } ${ unitMeasureSelector }`,
        id: data?.unitMeasure?.id,
        name: data?.unitMeasure?.name
    });

    togglePresentationOption({
        selector: `${ modalSelector } ${ presentationSelector }`,
        id: data?.presentation?.id,
        name: data?.presentation?.name
    });
};