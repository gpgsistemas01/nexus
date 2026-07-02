import { useForm } from "../../application/form.js";
import { editGoodsReceiptHeader, registerGoodsReceipt, returnGoodsReceipt } from "../../application/warehouse/goodsReceipts.js";
import { validateAddGoodsReceiptProductValidators, validateGoodsIssueReturnValidators, validateGoodsReceiptValidators } from "../../utils/validations/validators.js";
import { refreshProductTable } from "../../plugins/datatable/baseDatatable.js";
import { createGoodsReceiptDatatable, details, initDetailsGoodsReceiptTable } from "../../plugins/datatable/goodsReceiptDatatable.js";
import { GOODS_RECEIPT_SUPPLIER_CHANGED_EVENT, initGoodsReceiptFormSelect2, setGoodsReceiptFormSelectOptions } from "../../plugins/select2/modules/goodsReceiptSelect.js";
import { setFormReadOnly, updateTotals, toggleButtons, clearAddedProductInput, toggleInvoiceInput, clearFormErrors, normalizeFormErrors, initForm } from "../../ui/formUI.js";
import { on } from "../../utils/domUtils.js";
import { formatDateLongWithTime } from "../../utils/formatters.js";
import { handleSubmit, hasValidationErrors, toggleContainerElements, toggleDisabledElement, validateFields } from "../../utils/formUtils.js";
import { buildModalTitle, openModal } from "../../ui/modalUI.js";
import { initMdbWrapperInput, updateMdbWrapperInput } from "../../plugins/mdb/baseInstance.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";
import {
    bindReturnDetailEvents,
    buildReturnDetailState,
    createReturnFormHandlers,
    RETURN_MODE
} from "./returns/returnFormHelpers.js";
import { configureReturnModal } from "./returns/returnModalHelpers.js";

const modalId = MODAL_SELECTORS.GOODS_RECEIPT;
const formId = FORM_SELECTORS.GOODS_RECEIPT;
const MODE_RETURN = RETURN_MODE;


createGoodsReceiptDatatable();

const returnForm = createReturnFormHandlers({
    details,
    validators: validateGoodsIssueReturnValidators,
    validateFields,
    returnUpdate: returnGoodsReceipt,
    defaultUpdate: editGoodsReceiptHeader,
    emptyMessage: 'Debe seleccionar al menos un material a devolver'
});

document.querySelector(modalId).addEventListener(GOODS_RECEIPT_SUPPLIER_CHANGED_EVENT, () => {
    details.length = 0;
    refreshProductTable(details);
    clearAddedProductInput();
});

useForm({
    selector: formId,
    normalizeData: ({ form, formData }) => {

        formData.isInvoiced = document.querySelector('input[name="isInvoiced"]').checked;

        if (!formData.isInvoiced) delete formData.invoice;

        if (returnForm.isActive(form)) return returnForm.normalizeData({ form });

        if (form.dataset.mode === 'edit') {
            formData.supplierId = document.querySelector(`${ formId } ${ FORM_SELECTORS.SUPPLIER }`)?.value;
        } else {
            formData.details = details;
        }

        return formData;
    },
    getErrors: ({ form, formData }) => {
        
        const allowedUsername = /^[a-zA-Z0-9\-]+$/;
        let errors = {};

        errors = validateFields(validateGoodsReceiptValidators, formData);

        if (form.dataset.mode === 'edit') errors.details = null;
        if (returnForm.isActive(form)) return returnForm.getErrors();

        if (formData.isInvoiced) {

            if (!formData.invoice) errors.invoice = 'El número de factura es obligatorio';
            else if (typeof formData.invoice !== 'string') errors.invoice = 'El número de factura no es una cadena de texto';
            else if (!allowedUsername.test(formData.invoice)) errors.invoice = 'El número de factura debe tener solo letras, números y guiones.';
            else if (formData.invoice.length > 50) errors.invoice = 'El número de factura no debe exceder los 50 caracteres';
            else errors.invoice = null;

        } else {

            errors.invoice = null;
        }

        return errors;
    },
    sendRequest: async ({ formData, form }) => {

        await handleSubmit({
            form,
            formData,
            create: registerGoodsReceipt,
            update: returnForm.resolveUpdate(form)
        });
    },
});


export const openGoodsReceiptModal = ({ mode, data = null }) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(modalId);
    let value;

    initForm({ form, mode, id: data?.id || '' });
    clearFormErrors(form);
    setFormReadOnly({ form, isReadOnly: false });
    toggleDisabledElement({
        element: form.querySelector(FORM_SELECTORS.SUPPLIER),
        isDisabled: false
    });

    details.length = 0;

    toggleContainerElements({ selector: '.add-product-container' });
    initGoodsReceiptFormSelect2();
    setGoodsReceiptFormSelectOptions(data);

    if (mode === 'create') {
        
        form.reset();
        value = 'invoice';
        modalElement.querySelector('#modalTitle').textContent = 'Registrar compra';
        form.querySelector('#submitBtn').textContent = 'Confirmar';
        form.querySelector('#presentationDisplayInput').value = '';

        toggleButtons({
            mode,
            status: 'Abierta',
            showActions: true
        });
    }

    if (mode === 'edit' || mode === 'view' || mode === MODE_RETURN) {

        value = data.isInvoiced ? 'invoice' : 'none';
        const supplierName = data.supplierName;
        form.elements.observations.value = data.observations || '';
        form.elements.receptionDate.value = formatDateLongWithTime(data.receptionDate);
        details.push(...data.details.map(detail => ({
            id: detail.id,
            productId: detail.productId,
            productName: detail.productName,
            productBase: detail.productBase,
            productHeight: detail.productHeight,
            quantity: detail.quantity,
            presentationName: detail.presentationName,
            convertedQuantity: detail.convertedQuantity,
            unitMeasureName: detail.unitMeasureName,
            conversionUnitCost: detail.conversionUnitCost,
            costPerUnitType: detail.costPerUnitType,
            netPurchaseAmount: detail.netPurchaseAmount,
            grossPurchaseAmount: detail.grossPurchaseAmount,
            supplierName,
            ...buildReturnDetailState({
                detail,
                baseQuantity: detail.quantity
            })
        })));

        form.elements.totalQuantityDisplayInput.value = data.totalQuantity;
        form.elements.totalNetPurchaseAmountDisplayInput.value = data.totalNetPurchaseAmount;
        form.elements.totalGrossPurchaseAmountDisplayInput.value = data.totalGrossPurchaseAmount;

        if (mode === 'edit') {
            modalElement.querySelector('#modalTitle').textContent = buildModalTitle({ action: 'Editar', entityName: 'compra', referenceNumber: data?.referenceNumber });
            form.querySelector('#submitBtn').textContent = 'Actualizar';
            toggleDisabledElement({
                element: form.querySelector(FORM_SELECTORS.SUPPLIER),
                isDisabled: true
            });
            toggleContainerElements({ selector: '.add-product-container', root: modalElement });
        }

        if (mode === 'view') {
            modalElement.querySelector('#modalTitle').textContent = buildModalTitle({ action: 'Ver', entityName: 'compra', referenceNumber: data?.referenceNumber });
            setFormReadOnly({ form, isReadOnly: true });
        }

        if (mode === MODE_RETURN) {
            configureReturnModal({
                modalElement,
                form,
                buildModalTitle,
                referenceNumber: data?.referenceNumber,
                entityName: 'compra',
                action: 'Devolver',
                submitText: 'Registrar devolución',
                toggleContainerElements,
                toggleDisabledElement,
                disabledElement: form.querySelector(FORM_SELECTORS.SUPPLIER)
            });
        }

        toggleButtons({
            mode,
            status: 'Confirmada',
            showActions: false
        });
    }
    
    form.elements.invoice.value = data?.invoice || '';
    form.elements.isInvoiced.value = value;
    toggleInvoiceInput({ value, mode, form });

    initDetailsGoodsReceiptTable(mode);

    openModal(modalElement);
}

const addProduct = () => {

    const option = document.querySelector(`${ FORM_SELECTORS.PRODUCT } option:checked`);

    let { productBase, productHeight, presentationName, unitMeasureName, supplierName, productName } = option?.dataset;
    productHeight = isNaN(Number(productHeight)) ? null : Number(productHeight);
    productBase = isNaN(Number(productBase)) ? null : Number(productBase);

    const productId = option.value;

    const quantity = Number(document.querySelector(FORM_SELECTORS.QUANTITY).value);
    const costPerUnitType = Number(document.querySelector(FORM_SELECTORS.COST_PER_UNIT).value);
    const errors = validateFields(validateAddGoodsReceiptProductValidators, {
        productId,
        quantity,
        costPerUnitType
    });

    normalizeFormErrors({ form: document.querySelector(formId), errors });

    if (hasValidationErrors(errors)) return;

    if (!option) return null;

    const netPurchaseAmount = Number((quantity * costPerUnitType).toFixed(2));
    let convertedQuantity;

    if (!productBase || !productHeight) convertedQuantity = quantity;
    else convertedQuantity = Number(((productBase * productHeight) * quantity).toFixed(2));

    const conversionUnitCost = Number((netPurchaseAmount / convertedQuantity).toFixed(2));
    const grossPurchaseAmount = Number((netPurchaseAmount * 1.16).toFixed(2));
    const product = {
        productId,
        productName,
        productBase,
        productHeight,
        quantity,
        unitMeasureName,
        presentationName,
        costPerUnitType,
        conversionUnitCost,
        netPurchaseAmount,
        grossPurchaseAmount,
        convertedQuantity,
        supplierName,
    };
    details.push(product);

    refreshProductTable(details);
    clearAddedProductInput();

    updateTotals({
        quantity,
        net: netPurchaseAmount,
        gross: grossPurchaseAmount,
        operation: 'add'
    });
}

on('click', '#addProductBtn', addProduct);

bindReturnDetailEvents({
    details,
    selectorPrefix: `${ formId } `
});

const invoiceContainer = document.getElementById('invoiceContainer');
const invoiceRadios = document.querySelectorAll('input[name="isInvoiced"]');

invoiceRadios.forEach(radio => {

    radio.addEventListener('change', () => {

        if (radio.checked) toggleInvoiceInput({ value: radio.value, mode: 'update', form: document.querySelector(formId) });
    });
});
