import { updateTotals } from "../../../ui/formUI.js";
import { toggleContainerElements } from "../../../utils/formUtils.js";
import { refreshProductTable } from "../../datatable/baseDatatable.js";
import { details } from "../../datatable/goodsReceiptDatatable.js";
import { initMdbWrapperInput, updateMdbWrapperInput } from "../../mdb/baseInstance.js";
import { bindDisabledSelectDependency } from "../baseSelect.js";
import { setupProductSelect, toggleProductOption } from "../domains/product.js";
import { initProfileSelect, toggleProfileOption } from "../domains/profile.js";
import { setupSupplierSelect, toggleSupplierOption } from "../domains/supplier.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../../constants/selectors.js";

const modalSelector = MODAL_SELECTORS.GOODS_RECEIPT;
const productSelector = FORM_SELECTORS.PRODUCT;
const supplierSelector = FORM_SELECTORS.SUPPLIER;
const receivedBySelector = FORM_SELECTORS.RECEIVED_BY;
const supplierScopedSelector = `${ modalSelector } ${ supplierSelector }`;
const productScopedSelector = `${ modalSelector } ${ productSelector }`;
const receivedByScopedSelector = `${ modalSelector } ${ receivedBySelector }`;
const presentationDisplayScopedSelector = `${ modalSelector } ${ FORM_SELECTORS.PRESENTATION_DISPLAY }`;
const supplierChangedEventName = 'goods-receipt:supplier-changed';

const clearProductSelection = () => {

    toggleProductOption({
        selector: productScopedSelector,
        data: {
            id: null,
            text: null
        }
    });

    $(productScopedSelector).val(null).trigger('change');
};

const clearPresentationDisplay = () => {

    const instance = initMdbWrapperInput({
        selector: presentationDisplayScopedSelector,
        value: ''
    });

    updateMdbWrapperInput(instance);
};

export const initGoodsReceiptFormSelect2 = () => {

    const modal = document.querySelector(modalSelector);

    bindDisabledSelectDependency({
        sourceSelector: supplierScopedSelector,
        targetSelector: productScopedSelector,
        clearTarget: clearProductSelection,
        onChange: ({ value }) => {

            const isDisabled = !value;

            toggleContainerElements({
                selector: '.add-product-container',
                isDisabled,
                root: modal
            });

            details.length = 0;

            refreshProductTable(details);

            updateTotals();
            clearPresentationDisplay();

            modal?.dispatchEvent(new Event(supplierChangedEventName));
        }
    });

    setupSupplierSelect({
        modalSelector,
        supplierSelector
    });

    initProfileSelect({
        modalSelector, 
        baseSelector: receivedByScopedSelector,
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
        includeStockAdjustmentOnCreate: false,
        productCreationContext: 'goodsReceipt'
    });
};

export const GOODS_RECEIPT_SUPPLIER_CHANGED_EVENT = supplierChangedEventName;


export const setGoodsReceiptFormSelectOptions = (data = null) => {

    toggleSupplierOption({
        selector: supplierScopedSelector,
        id: data?.supplierId,
        name: `${ data?.supplierName }`
    });

    toggleProfileOption({
        selector: receivedByScopedSelector,
        id: data?.receivedById,
        name: data?.receivedByName,
    });

    clearProductSelection();
};
