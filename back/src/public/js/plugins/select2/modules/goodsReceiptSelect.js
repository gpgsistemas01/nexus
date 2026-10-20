import { toggleContainerElements } from '../../../ui/forms/formStateUI.js';
import { initMdbWrapperInput, updateMdbWrapperInput } from "../../mdb/baseInstance.js";
import { bindDisabledSelectDependency } from "../baseSelect.js";
import { setupMaterialSelect, toggleMaterialOption } from "../domains/material.js";
import { initPersonSelect, togglePersonOption } from "../domains/person.js";
import { setupSupplierSelect, toggleSupplierOption } from "../domains/supplier.js";
import { INPUT_SELECTORS, MODAL_SELECTORS, SELECT_SELECTORS } from "../../../constants/selectors.js";

const modalSelector = MODAL_SELECTORS.GOODS_RECEIPT;
const materialSelector = SELECT_SELECTORS.MATERIAL;
const supplierSelector = SELECT_SELECTORS.SUPPLIER;
const receivedBySelector = SELECT_SELECTORS.RECEIVED_BY;
const supplierScopedSelector = `${ modalSelector } ${ supplierSelector }`;
const materialScopedSelector = `${ modalSelector } ${ materialSelector }`;
const receivedByScopedSelector = `${ modalSelector } ${ receivedBySelector }`;
const presentationDisplayScopedSelector = `${ modalSelector } ${ INPUT_SELECTORS.PRESENTATION_DISPLAY }`;
const supplierChangedEventName = 'goods-receipt:supplier-changed';

const clearMaterialSelection = () => {

    toggleMaterialOption({
        selector: materialScopedSelector,
        data: {
            id: null,
            text: null
        }
    });
};

export const initGoodsReceiptFormSelect2 = ({ resource, onCreateSupplier, onCreateMaterial }) => {

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

            togglePersonOption({
                selector: receivedByScopedSelector,
                id: null,
                name: null
            });

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
            supplierSelector,
            onCreate: onCreateSupplier
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
        onCreate: onCreateMaterial,
        resource
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
