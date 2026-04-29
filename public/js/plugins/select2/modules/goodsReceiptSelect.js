import { openProductModal } from "../../../modules/products/productModal.js";
import { openSupplierModal } from "../../../modules/suppliers/supplierModal.js";
import { initMdbWrapperInput, updateMdbWrapperInput } from "../../mdb/baseInstance.js";
import { setupProductSelect, toggleProductOption } from "../domains/product.js";
import { initProfileSelect, toggleProfileOption } from "../domains/profile.js";
import { setupSupplierSelect, toggleSupplierOption } from "../domains/supplier.js";

const modalSelector = '#goodsReceiptModal';
const productSelector = '#productInput';
const supplierSelector = '.supplier-select';
const receivedBySelector = '#receivedByInput';

export const initGoodsReceiptFormSelect2 = () => {    

    setupSupplierSelect({
        modalSelector,
        supplierSelector
    });

    initProfileSelect({
        modalSelector, 
        baseSelector: `${ modalSelector } ${ receivedBySelector }`,
        placeholder: 'Buscar persona que recibe...',
        data: (params) => {

            return {
                search: params.term,
                department: 'ALMACÉN Y PROVEDURÍA',
                strictDepartmentFilter: true
            };
        },
        allowCreate: false,
    });

    setupProductSelect({
        modalSelector,
        supplierSelector,
        productSelector,
    });

    $(`${ modalSelector } ${ supplierSelector }`)
        .off('change.product-filter')
        .on('change.product-filter', () => {
            $(`${ modalSelector } ${ productSelector }`).val(null).trigger('change');
            const instance = initMdbWrapperInput({
                selector: '#presentationDisplayInput',
                value: ''
            });
            updateMdbWrapperInput(instance);
        });
}

export const setGoodsReceiptFormSelectOptions = (data = null) => {

    toggleSupplierOption({
        selector: `${ modalSelector } ${ supplierSelector }`,
        id: data?.supplier?.id,
        name: `${ data?.supplier?.tradeName }`
    });

    toggleProfileOption({
        selector: `${ modalSelector } ${ receivedBySelector }`,
        profileId: data?.receivedBy?.id,
        profileName: data?.receivedBy?.fullName,
    });

    toggleProductOption({
        selector: `${ modalSelector } ${ productSelector }`,
        data: {
            id: null,
            text: null,
        }
    });
}