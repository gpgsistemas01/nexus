import { useForm } from "../../application/form.js";
import { editGoodsReceiptHeader, registerGoodsReceipt, cancelGoodsReceiptDetail, returnGoodsReceipt } from "../../application/warehouse/goodsReceipts.js";
import { validateAddGoodsReceiptProductValidators, validateGoodsIssueReturnValidators, validateGoodsReceiptValidators } from "../../utils/validations/validators.js";
import { refreshProductTable } from "../../plugins/datatable/baseDatatable.js";
import { createGoodsReceiptDatatable, details, initDetailsGoodsReceiptTable } from "../../plugins/datatable/goodsReceiptDatatable.js";
import { GOODS_RECEIPT_SUPPLIER_CHANGED_EVENT, initGoodsReceiptFormSelect2, setGoodsReceiptFormSelectOptions } from "../../plugins/select2/modules/goodsReceiptSelect.js";
import { setFormReadOnly, setTotals, updateTotals, toggleButtons, clearAddedProductInput, toggleInvoiceInput, clearFormErrors, normalizeFormErrors, initForm } from "../../ui/formUI.js";
import { on } from "../../utils/domUtils.js";
import { setDateTimePickerValue } from "../../plugins/flatpickr/dateTimePicker.js";
import { handleSubmit, hasValidationErrors, toggleContainerElements, toggleDisabledElement, validateFields } from "../../utils/formUtils.js";
import { buildModalTitle, openModal } from "../../ui/modalUI.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";
import { FORM_MODES } from "../../constants/formModes.js";
import { roundTo } from "../../utils/formatUtils.js";
import {
    bindReturnDetailEvents,
    createReturnFormHandlers,
    replaceDetailsWithReturnState
} from "./returns/returnFormHelpers.js";
import { configureReturnModal } from "./returns/returnModalHelpers.js";
import { notifications } from "../../plugins/swal/swalComponent.js";
import { GOODS_RECEIPT_CORRECTION_APPLIED_EVENT, initGoodsReceiptCorrection, openGoodsReceiptCorrectionModal } from "./corrections/correctionModal.js";

const modalId = MODAL_SELECTORS.GOODS_RECEIPT;
const formId = FORM_SELECTORS.GOODS_RECEIPT;
const INVOICE_VALUES = Object.freeze({
    INVOICE: 'invoice',
    NONE: 'none'
});
const GOODS_RECEIPT_STATUS_LABELS = Object.freeze({
    OPEN: 'Abierta',
    CONFIRMED: 'Confirmada'
});
const GOODS_RECEIPT_DETAIL_STATUS = Object.freeze({
    CANCELED: 'CANCELED'
});
const GOODS_RECEIPT_ENTITY_NAME = 'compra';
const RETURN_SUBMIT_TEXT = 'Devolver';
const RETURN_READ_ONLY_HEADER_FIELD_NAMES = [
    'isInvoiced',
    'invoice',
    'receivedById',
    'receptionDate',
    'observations'
];


createGoodsReceiptDatatable();

const setGoodsReceiptReturnHeaderFieldsReadOnly = ({ form, isReadOnly }) => {

    RETURN_READ_ONLY_HEADER_FIELD_NAMES.forEach(fieldName => {
        form.querySelectorAll(`[name='${ fieldName }']`).forEach(field => {
            toggleDisabledElement({
                element: field,
                isDisabled: isReadOnly
            });
        });
    });
};

const returnForm = createReturnFormHandlers({
    details,
    validators: validateGoodsIssueReturnValidators,
    validateFields,
    returnUpdate: returnGoodsReceipt,
    emptyMessage: 'Debe seleccionar al menos un material a devolver'
});

let currentGoodsReceipt = null;

initGoodsReceiptCorrection();

const replaceGoodsReceiptDetails = ({ receipt }) => {
    const supplierName = receipt.supplierName;
    replaceDetailsWithReturnState({
        targetDetails: details,
        sourceDetails: receipt.details.filter(detail => detail.status !== GOODS_RECEIPT_DETAIL_STATUS.CANCELED),
        getBaseQuantity: detail => detail.quantity,
        mapDetail: detail => ({
            ...detail,
            supplierName,
        })
    });
};

document.querySelector(modalId).addEventListener(GOODS_RECEIPT_SUPPLIER_CHANGED_EVENT, () => {
    details.length = 0;
    refreshProductTable(details);
    clearAddedProductInput();
});

const normalizeGoodsReceiptData = ({ form, formData }) => {

    const { mode } = form.dataset;

    formData.isInvoiced = document.querySelector('input[name="isInvoiced"]').checked;

    if (!formData.isInvoiced) delete formData.invoice;

    if (returnForm.isActive(form)) return returnForm.normalizeData({ form });

    if (mode === FORM_MODES.EDIT) {
        const newDetails = details.filter(detail => !detail.id);

        return {
            ...formData,
            details: newDetails
        };
    }

    return {
        ...formData,
        details
    };
};

useForm({
    selector: formId,
    normalizeData: normalizeGoodsReceiptData,
    getErrors: ({ form, formData }) => {
        
        const allowedUsername = /^[a-zA-Z0-9\-]+$/;
        let errors = {};

        errors = validateFields(validateGoodsReceiptValidators, formData);

        if (form.dataset.mode === FORM_MODES.EDIT) errors.details = null;
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
            update: returnForm.isActive(form) ? returnGoodsReceipt : editGoodsReceiptHeader
        });
    },
});


export const openGoodsReceiptModal = ({ mode, data = null }) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(modalId);
    let value;

    initForm({ form, mode, id: data?.id || '' });
    currentGoodsReceipt = data;
    clearFormErrors(form);
    setFormReadOnly({ form, isReadOnly: false });
    toggleDisabledElement({
        element: form.querySelector(FORM_SELECTORS.SUPPLIER),
        isDisabled: false
    });

    details.length = 0;

    initGoodsReceiptFormSelect2();
    setGoodsReceiptFormSelectOptions(data);

    if (mode === FORM_MODES.CREATE) {
        
        form.reset();
        value = INVOICE_VALUES.INVOICE;
        modalElement.querySelector('#modalTitle').textContent = 'Registrar compra';
        form.querySelector('#submitBtn').textContent = 'Confirmar';
        form.querySelector('#presentationDisplayInput').value = '';

        toggleButtons({
            mode,
            status: GOODS_RECEIPT_STATUS_LABELS.OPEN,
            showActions: true,
            showAddProduct: true
        });
    }

    if (mode === FORM_MODES.EDIT || mode === FORM_MODES.VIEW || mode === FORM_MODES.RETURN) {

        value = data.isInvoiced ? INVOICE_VALUES.INVOICE : INVOICE_VALUES.NONE;
        form.elements.observations.value = data.observations || '';
        setDateTimePickerValue(form.elements.receptionDate, data.receptionDate);
        replaceGoodsReceiptDetails({ receipt: data });
        setTotals({
            quantity: data.totalQuantity,
            net: data.totalNetPurchaseAmount,
            gross: data.totalGrossPurchaseAmount
        });

        if (mode === FORM_MODES.EDIT) {
            modalElement.querySelector('#modalTitle').textContent = buildModalTitle({ action: 'Editar', entityName: GOODS_RECEIPT_ENTITY_NAME, referenceNumber: data?.referenceNumber });
            form.querySelector('#submitBtn').textContent = 'Actualizar';
            toggleDisabledElement({
                element: form.querySelector(FORM_SELECTORS.SUPPLIER),
                isDisabled: true
            });
            toggleContainerElements({
                selector: '.add-product-container',
                root: modalElement,
                isDisabled: false
            });
        }

        if (mode === FORM_MODES.VIEW) {
            modalElement.querySelector('#modalTitle').textContent = buildModalTitle({ action: 'Ver', entityName: GOODS_RECEIPT_ENTITY_NAME, referenceNumber: data?.referenceNumber });
            setFormReadOnly({ form, isReadOnly: true });
        }

        if (mode === FORM_MODES.RETURN) {
            configureReturnModal({
                modalElement,
                form,
                buildModalTitle,
                referenceNumber: data?.referenceNumber,
                entityName: GOODS_RECEIPT_ENTITY_NAME,
                action: RETURN_SUBMIT_TEXT,
                submitText: RETURN_SUBMIT_TEXT,
                toggleContainerElements,
                setFormReadOnly,
                toggleDisabledElement,
                disabledElement: form.querySelector(FORM_SELECTORS.SUPPLIER)
            });

            setGoodsReceiptReturnHeaderFieldsReadOnly({
                form,
                isReadOnly: true
            });
        }

        toggleButtons({
            mode,
            status: GOODS_RECEIPT_STATUS_LABELS.CONFIRMED,
            showActions: false,
            showAddProduct: mode === FORM_MODES.EDIT
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

    const netPurchaseAmount = roundTo(quantity * costPerUnitType);
    let convertedQuantity;

    if (!productBase || !productHeight) convertedQuantity = quantity;
    else convertedQuantity = roundTo(productBase * productHeight * quantity);

    const conversionUnitCost = roundTo(netPurchaseAmount / convertedQuantity);
    const grossPurchaseAmount = roundTo(netPurchaseAmount * 1.16);
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

on('click', '#productTable .correct-detail-btn', (event, button) => {
    const detail = details.find(item => item.id === button.dataset.id);

    if (!detail || !currentGoodsReceipt) return;

    openGoodsReceiptCorrectionModal({
        receipt: currentGoodsReceipt,
        detail
    });
});


on('click', '#productTable .cancel-receipt-detail-btn', async (event, button) => {
    const detail = details.find(item => item.id === button.dataset.id);

    if (!detail || !currentGoodsReceipt) return;

    const confirmation = await notifications.showConfirmation({
        title: '¿Cancelar detalle de compra?',
        text: 'Se marcará el detalle como cancelado, se dejará en cero y se generará el ajuste de inventario correspondiente.',
        confirmButtonText: 'Cancelar detalle'
    });

    if (!confirmation.isConfirmed) return;

    const response = await cancelGoodsReceiptDetail({
        id: currentGoodsReceipt.id,
        detailId: detail.id
    });

    notifications.showSuccess(response.message);
    document.querySelector('#goodsReceiptCorrectionModal').dispatchEvent(new CustomEvent(GOODS_RECEIPT_CORRECTION_APPLIED_EVENT, {
        detail: response.data
    }));
});

document.querySelector('#goodsReceiptCorrectionModal').addEventListener(GOODS_RECEIPT_CORRECTION_APPLIED_EVENT, (event) => {
    const updatedReceipt = event.detail?.updatedReceipt;

    if (!updatedReceipt || !currentGoodsReceipt || updatedReceipt.id !== currentGoodsReceipt.id) return;

    currentGoodsReceipt = {
        ...currentGoodsReceipt,
        ...updatedReceipt
    };

    replaceGoodsReceiptDetails({ receipt: currentGoodsReceipt });
    refreshProductTable(details);
    setTotals({
        quantity: currentGoodsReceipt.totalQuantity,
        net: currentGoodsReceipt.totalNetPurchaseAmount,
        gross: currentGoodsReceipt.totalGrossPurchaseAmount
    });
});

const invoiceRadios = document.querySelectorAll('input[name="isInvoiced"]');

invoiceRadios.forEach(radio => {

    radio.addEventListener('change', () => {

        if (radio.checked) toggleInvoiceInput({ value: radio.value, mode: 'update', form: document.querySelector(formId) });
    });
});
