import { openProductModal } from "../../modules/products/productModal.js";
import { openSupplierModal } from "../../modules/suppliers/supplierModal.js";
import { initMdbWrapperInput, updateMdbWrapperInput } from "../mdb/baseInstance.js";
import { setupProductSelect, toggleProductOption } from "./domains/product.js";
import { initProfileSelect, toggleProfileOption } from "./domains/profile.js";
import { setupSupplierSelect, toggleSupplierOption } from "./domains/supplier.js";

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
                department: 'Almacén',
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
}

export const setGoodsReceiptFormSelectOptions = (data = null) => {

    toggleSupplierOption({
        selector: `${ modalSelector } ${ supplierSelector }`,
        supplierId: data?.supplier?.id,
        supplierName: data?.supplier?.tradeName
    });

    toggleProfileOption({
        selector: `${ modalSelector } ${ receivedBySelector }`,
        profileId: data?.receivedBy?.id,
        profileName: `${data?.receivedBy?.name} ${data?.receivedBy?.lastName}`,
    });

    toggleProductOption({
        selector: `${ modalSelector } ${ productSelector }`,
        id: data?.product?.id,
        name: data?.name
    })
}