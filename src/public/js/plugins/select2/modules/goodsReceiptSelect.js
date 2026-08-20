import { updateTotals } from "../../../ui/forms/totalsSummaryUI.js";
import { MATERIAL_SELECT_RESULTS_LIMIT } from "../../../application/warehouse/materials.js";
import { toggleContainerElements } from "../../../utils/formUtils.js";
import { refreshMaterialTable } from "../../datatable/utils/renderMaterialDatatable.js";
import { details } from "../../datatable/goodsReceiptDatatable.js";
import { initMdbWrapperInput, updateMdbWrapperInput } from "../../mdb/baseInstance.js";
import { bindDisabledSelectDependency } from "../baseSelect.js";
import { setupMaterialSelect, toggleMaterialOption } from "../domains/material.js";
import { initPersonSelect, togglePersonOption } from "../domains/person.js";
import { setupSupplierSelect, toggleSupplierOption } from "../domains/supplier.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../../constants/selectors.js";

const modalSelector = MODAL_SELECTORS.GOODS_RECEIPT;
const materialSelector = FORM_SELECTORS.MATERIAL;
const supplierSelector = FORM_SELECTORS.SUPPLIER;
const receivedBySelector = FORM_SELECTORS.RECEIVED_BY;
const supplierScopedSelector = `${ modalSelector } ${ supplierSelector }`;
const materialScopedSelector = `${ modalSelector } ${ materialSelector }`;
const receivedByScopedSelector = `${ modalSelector } ${ receivedBySelector }`;
const presentationDisplayScopedSelector = `${ modalSelector } ${ FORM_SELECTORS.PRESENTATION_DISPLAY }`;
const supplierChangedEventName = 'goods-receipt:supplier-changed';

const clearMaterialSelection = () => {

    toggleMaterialOption({
        selector: materialScopedSelector,
        data: {
            id: null,
            text: null
        }
    });

    $(materialScopedSelector).val(null).trigger('change');
};

export const initGoodsReceiptFormSelect2 = () => {

    const modal = document.querySelector(modalSelector);

    bindDisabledSelectDependency({
        sourceSelector: supplierScopedSelector,
        targetSelector: materialScopedSelector,
        clearTarget: clearMaterialSelection,
        disabledMessage: 'Seleccione un proveedor antes de buscar material.',
        onChange: ({ value }) => {

            const isDisabled = !value;

            toggleContainerElements({
                selector: '.add-material-container',
                isDisabled,
                root: modal
            });

            details.length = 0;

            togglePersonOption({
                selector: receivedByScopedSelector,
                id: null,
                name: null
            });
            refreshMaterialTable(details);
            updateTotals();
            
            const instance = initMdbWrapperInput({
                selector: presentationDisplayScopedSelector,
                value: ''
            });

            updateMdbWrapperInput(instance);
            modal?.dispatchEvent(new Event(supplierChangedEventName));
        }
    });

    [
        [setupSupplierSelect, {
            modalSelector,
            supplierSelector
        }],
        [initPersonSelect, {
            modalSelector,
            baseSelector: receivedByScopedSelector,
            placeholder: 'Buscar persona que recibe...',
            data: (params) => {
                
                return {
                    search: params.term,
                    department: 'ALMACÉN Y PROVEDURÍA',
                    strictDepartmentFilter: true
                }
            },
            allowCreate: false,
        }]
    ].forEach(([initialize, options]) => initialize(options));

    setupMaterialSelect({
        modalSelector,
        supplierSelector,
        materialSelector,
        creationContext: 'goodsReceipt',
        resultsLimit: MATERIAL_SELECT_RESULTS_LIMIT
    });
};

export const GOODS_RECEIPT_SUPPLIER_CHANGED_EVENT = supplierChangedEventName;

export const setGoodsReceiptFormSelectOptions = (data = null) => {

    [
        [toggleSupplierOption, supplierScopedSelector, data?.supplierId, data?.supplierName],
        [togglePersonOption, receivedByScopedSelector, data?.receivedById, data?.receivedByName]
    ].forEach(([toggleOption, selector, id, name]) => toggleOption({
        selector,
        id,
        name
    }));

    clearMaterialSelection();
};
