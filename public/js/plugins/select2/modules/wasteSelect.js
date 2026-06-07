import { bindDisabledSelectDependency } from "../baseSelect.js";
import { initReasonSelect, toggleReasonOption } from "../domains/reason.js";
import { setupProductSelect, toggleProductOption } from "../domains/product.js";
import { setupSupplierSelect, toggleSupplierOption } from "../domains/supplier.js";
import { mapProductToSelectData } from "../../../utils/productSelectUtils.js";

const productSelector = '#productInput';
const supplierSelector = '.supplier-select';
const reasonSelector = '#reasonInput';

export const initWasteSelect2 = ({ modalSelector }) => {

    setupSupplierSelect({
        modalSelector,
        supplierSelector,
        allowCreate: false
    });

    setupProductSelect({
        modalSelector,
        supplierSelector,
        productSelector,
        allowCreate: false
    });

    initReasonSelect({
        modalSelector,
        baseSelector: `${ modalSelector } ${ reasonSelector }`,
        allowCreate: false
    });

    bindDisabledSelectDependency({
        sourceSelector: `${ modalSelector } ${ supplierSelector }`,
        targetSelector: `${ modalSelector } ${ productSelector }`,
        clearTarget: () => {
            toggleProductOption({
                selector: `${ modalSelector } ${ productSelector }`,
                data: null
            });

            $(`${ modalSelector } ${ productSelector }`).val(null).trigger('change');
        }
    });
};

export const setWasteSelectOptions = ({ modalSelector, data = null }) => {

    toggleSupplierOption({
        selector: `${ modalSelector } ${ supplierSelector }`,
        id: data?.supplier?.id,
        name: data?.supplier?.tradeName
    });

    toggleProductOption({
        selector: `${ modalSelector } ${ productSelector }`,
        data: data ? mapProductToSelectData(data) : null
    });

    toggleReasonOption({
        selector: `${ modalSelector } ${ reasonSelector }`,
        id: data?.reason?.id,
        name: data?.reason?.name
    });
};
