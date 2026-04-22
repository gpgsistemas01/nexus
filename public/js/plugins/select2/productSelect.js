import { initbaseSelect2 } from "./baseSelect.js";
import { initSupplierSelect, toggleSupplierOption } from "./domains/supplier.js";

const modalSelector = '#productModal';
const supplierSelector = '.supplier-select';

export const initProductFormSelect2 = () => {

    initSupplierSelect({
        modalSelector,
        baseSelector: `${ modalSelector } ${ supplierSelector }`,
    });
};

export const setProductFormSelectOptions = (data = null) => {
    
    toggleSupplierOption({
        selector: `${ modalSelector } ${ supplierSelector }`,
        supplierId: data?.supplierId,
        supplierName: data?.supplierName
    });
};