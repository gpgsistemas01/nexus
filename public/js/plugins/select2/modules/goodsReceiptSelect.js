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
const supplierChangedEventName = 'goods-receipt:supplier-changed';

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

    const supplierInput = document.querySelector(`${ modalSelector } ${ supplierSelector }`);
    const productInput = document.querySelector(`${ modalSelector } ${ productSelector }`);

    if (supplierInput) {
        if (supplierInput.dataset.productFilterBound === 'true') return;
        supplierInput.dataset.productFilterBound = 'true';

        supplierInput.addEventListener('change', () => {
            if (productInput) {
                productInput.value = '';
                productInput.dispatchEvent(new Event('change', { bubbles: true }));
            }

            const instance = initMdbWrapperInput({
                selector: '#presentationDisplayInput',
                value: ''
            });
            updateMdbWrapperInput(instance);

            document.dispatchEvent(new Event(supplierChangedEventName));
        });
    }
}

export const GOODS_RECEIPT_SUPPLIER_CHANGED_EVENT = supplierChangedEventName;

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
