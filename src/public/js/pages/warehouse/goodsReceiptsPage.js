import { useForm } from "../../application/form.js";
import { editGoodsReceiptHeader, registerGoodsReceipt, cancelGoodsReceiptDetail } from "../../application/warehouse/goodsReceipts.js";
import { validateAddGoodsReceiptProductValidators, validateGoodsReceiptValidators } from "../../utils/validations/validators.js";
import { refreshProductTable } from "../../plugins/datatable/baseDatatable.js";
import { createGoodsReceiptDatatable, details, initDetailsGoodsReceiptTable } from "../../plugins/datatable/goodsReceiptDatatable.js";
import { GOODS_RECEIPT_SUPPLIER_CHANGED_EVENT, initGoodsReceiptFormSelect2, setGoodsReceiptFormSelectOptions } from "../../plugins/select2/modules/goodsReceiptSelect.js";
import { setFormDisabled, setTotals, updateTotals, toggleButtons, clearAddedProductInput, toggleInvoiceInput, clearFormErrors, normalizeFormErrors, initForm } from "../../ui/formUI.js";
import { on } from "../../utils/domUtils.js";
import { setDateTimePickerValue } from "../../plugins/flatpickr/dateTimePicker.js";
import { handleSubmit, hasValidationErrors, toggleContainerElements, toggleDisabledElement, validateFields } from "../../utils/formUtils.js";
import { buildModalTitle, openModal } from "../../ui/modalUI.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";
import { FORM_MODES } from "../../constants/formModes.js";
import { roundTo } from "../../utils/formatUtils.js";
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
    CONFIRMED: 'Confirmada',
    CANCELED: 'Cancelada'
});
const GOODS_RECEIPT_DETAIL_STATUS = Object.freeze({
    CANCELED: 'CANCELED'
});
const GOODS_RECEIPT_ENTITY_NAME = 'compra';
createGoodsReceiptDatatable();

let currentGoodsReceipt = null;

initGoodsReceiptCorrection();

const buildGoodsReceiptModalDetails = ({ receipt, includeCanceledDetails = false }) => {
    const supplierName = receipt.supplierName;

    return receipt.details
        .filter(detail => includeCanceledDetails || detail.status !== GOODS_RECEIPT_DETAIL_STATUS.CANCELED)
        .map(detail => ({
            ...detail,
            supplierName,
            goodsReceiptStatusName: receipt.status?.name
        }));
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

    if (mode === FORM_MODES.EDIT) {
        const { supplierId, ...editableFormData } = formData;
        const newDetails = details.filter(detail => !detail.id);

        return {
            ...editableFormData,
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

        let validators = validateGoodsReceiptValidators;

        if (form.dataset.mode === FORM_MODES.EDIT) {
            const { supplierId, details, ...editableValidators } = validateGoodsReceiptValidators;
            validators = {
                ...editableValidators,
                details: (value) => value.length === 0 ? null : details(value)
            };
        }

        errors = validateFields(validators, formData);
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
            update: editGoodsReceiptHeader
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
    setFormDisabled({ form, isDisabled: false });
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

    if (mode === FORM_MODES.EDIT || mode === FORM_MODES.VIEW) {

        value = data.isInvoiced ? INVOICE_VALUES.INVOICE : INVOICE_VALUES.NONE;
        form.elements.observations.value = data.observations || '';
        setDateTimePickerValue(form.elements.receptionDate, data.receptionDate);
        details.push(...buildGoodsReceiptModalDetails({
            receipt: data,
            includeCanceledDetails: data.status?.name === GOODS_RECEIPT_STATUS_LABELS.CANCELED
        }));
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
            setFormDisabled({ form, isDisabled: true });
        }

        toggleButtons({
            mode,
            status: data.status?.name || GOODS_RECEIPT_STATUS_LABELS.CONFIRMED,
            showActions: false,
            showAddProduct: mode === FORM_MODES.EDIT && data.status?.name !== GOODS_RECEIPT_STATUS_LABELS.CANCELED
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
        text: 'Se marcará el detalle como cancelado, se descontará de los totales y se generará el ajuste de inventario correspondiente.',
        confirmButtonText: 'Cancelar detalle'
    });

    if (!confirmation.isConfirmed) return;

    const response = await cancelGoodsReceiptDetail({
        id: currentGoodsReceipt.id,
        detailId: detail.id
    });

    notifications.showSuccess(response.message);
    document.querySelector('#goodsReceiptCorrectionModal').dispatchEvent(new CustomEvent(GOODS_RECEIPT_CORRECTION_APPLIED_EVENT, {
        bubbles: true,
        detail: response.data
    }));
});

on(GOODS_RECEIPT_CORRECTION_APPLIED_EVENT, '#goodsReceiptCorrectionModal', (event) => {
    const updatedReceipt = event.detail?.updatedReceipt;

    if (!updatedReceipt || !currentGoodsReceipt || updatedReceipt.id !== currentGoodsReceipt.id) return;

    currentGoodsReceipt = {
        ...currentGoodsReceipt,
        ...updatedReceipt
    };

    details.length = 0;
    details.push(...buildGoodsReceiptModalDetails({ receipt: currentGoodsReceipt }));
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
