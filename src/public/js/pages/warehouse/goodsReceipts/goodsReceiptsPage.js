import { useForm } from "../../../application/form.js";
import { editGoodsReceiptHeader, registerGoodsReceipt, cancelGoodsReceiptDetail } from "../../../application/warehouse/goodsReceipts.js";
import { handleApiError } from "../../../api/errorHandler.js";
import { addGoodsReceiptMaterialValidation, goodsReceiptValidation } from "../../../utils/validations/validators.js";
import { refreshMaterialTable } from "../../../plugins/datatable/utils/renderMaterialDatatable.js";
import { createGoodsReceiptDatatable, details, initDetailsGoodsReceiptTable } from "../../../plugins/datatable/goodsReceiptDatatable.js";
import { GOODS_RECEIPT_SUPPLIER_CHANGED_EVENT, initGoodsReceiptFormSelect2, setGoodsReceiptFormSelectOptions } from "../../../plugins/select2/modules/goodsReceiptSelect.js";
import { setFormDisabled, setTotals, updateTotals, toggleButtons, clearAddedMaterialInput, toggleInvoiceInput, clearFormErrors, normalizeFormErrors, initForm } from "../../../ui/formUI.js";
import { on } from "../../../utils/domUtils.js";
import { setDateTimePickerValue } from "../../../plugins/flatpickr/dateTimePicker.js";
import { handleSubmit, hasValidationErrors, toggleContainerElements, toggleDisabledElement, validateFields } from "../../../utils/formUtils.js";
import { buildModalTitle, openModal } from "../../../ui/modalUI.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../../constants/selectors.js";
import { FORM_MODES } from "../../../constants/formModes.js";
import { GOODS_RECEIPT_STATUS_LABELS } from "../../../constants/goodsReceiptStatuses.js";
import { roundTo } from "../../../utils/formatUtils.js";
import { notifications } from "../../../plugins/swal/swalComponent.js";
import { GOODS_RECEIPT_CORRECTION_APPLIED_EVENT, initGoodsReceiptCorrection, openGoodsReceiptCorrectionModal } from "./corrections/correctionModal.js";
import { buildGoodsReceiptModalDetails } from "./goodsReceiptDetails.js";

const modalId = MODAL_SELECTORS.GOODS_RECEIPT;
const formId = FORM_SELECTORS.GOODS_RECEIPT;
const INVOICE_VALUES = Object.freeze({
    INVOICE: 'invoice',
    NONE: 'none'
});
const GOODS_RECEIPT_ENTITY_NAME = 'compra';
createGoodsReceiptDatatable();

let currentGoodsReceipt = null;

initGoodsReceiptCorrection();

const setGoodsReceiptViewMode = ({ form, modalElement, receipt }) => {
    form.dataset.mode = FORM_MODES.VIEW;
    modalElement.querySelector('#modalTitle').textContent = buildModalTitle({
        action: 'Ver',
        entityName: GOODS_RECEIPT_ENTITY_NAME,
        referenceNumber: receipt.referenceNumber
    });
    setFormDisabled({ form, isDisabled: true });
    toggleButtons({
        mode: FORM_MODES.VIEW,
        status: receipt.status?.name || GOODS_RECEIPT_STATUS_LABELS.CONFIRMED,
        showActions: false,
        showAddMaterial: false
    });
};

document.querySelector(modalId).addEventListener(GOODS_RECEIPT_SUPPLIER_CHANGED_EVENT, () => {
    details.length = 0;
    refreshMaterialTable(details);
    clearAddedMaterialInput();
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

        let validators = goodsReceiptValidation;

        if (form.dataset.mode === FORM_MODES.EDIT) {
            const { supplierId, details, ...editableValidation } = goodsReceiptValidation;
            validators = {
                ...editableValidation,
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
            showAddMaterial: true
        });
        toggleContainerElements({
            selector: '.add-material-container',
            root: modalElement,
            isDisabled: !form.elements.supplierId.value
        });
    }

    if (mode === FORM_MODES.EDIT || mode === FORM_MODES.VIEW) {

        value = data.isInvoiced ? INVOICE_VALUES.INVOICE : INVOICE_VALUES.NONE;
        form.elements.observations.value = data.observations || '';
        setDateTimePickerValue(form.elements.receptionDate, data.receptionDate);
        details.push(...buildGoodsReceiptModalDetails(data));
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
                selector: '.add-material-container',
                root: modalElement,
                isDisabled: false
            });
            toggleButtons({
                mode,
                status: data.status?.name || GOODS_RECEIPT_STATUS_LABELS.CONFIRMED,
                showActions: false,
                showAddMaterial: data.status?.name !== GOODS_RECEIPT_STATUS_LABELS.CANCELED
            });
        }

        if (mode === FORM_MODES.VIEW) {
            setGoodsReceiptViewMode({ form, modalElement, receipt: data });
        }
    }

    form.elements.invoice.value = data?.invoice || '';
    form.elements.isInvoiced.value = value;
    toggleInvoiceInput({ value, mode, form });

    initDetailsGoodsReceiptTable(mode);

    openModal(modalElement);
}

const addMaterial = () => {

    const option = document.querySelector(`${ FORM_SELECTORS.MATERIAL } option:checked`);

    let { materialBase, materialHeight, presentationName, unitMeasureName, supplierName, materialName } = option?.dataset;
    materialHeight = isNaN(Number(materialHeight)) ? null : Number(materialHeight);
    materialBase = isNaN(Number(materialBase)) ? null : Number(materialBase);

    const materialId = option.value;

    const quantity = Number(document.querySelector(FORM_SELECTORS.QUANTITY).value);
    const costPerUnitType = Number(document.querySelector(FORM_SELECTORS.COST_PER_UNIT).value);
    const errors = validateFields(addGoodsReceiptMaterialValidation, {
        materialId,
        quantity,
        costPerUnitType
    });

    normalizeFormErrors({ form: document.querySelector(formId), errors });

    if (hasValidationErrors(errors)) return;

    if (!option) return null;

    const netPurchaseAmount = roundTo(quantity * costPerUnitType);
    let convertedQuantity;

    if (!materialBase || !materialHeight) convertedQuantity = quantity;
    else convertedQuantity = roundTo(materialBase * materialHeight * quantity);

    const conversionUnitCost = roundTo(netPurchaseAmount / convertedQuantity);
    const grossPurchaseAmount = roundTo(netPurchaseAmount * 1.16);
    const material = {
        materialId,
        materialName,
        materialBase,
        materialHeight,
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
    details.push(material);

    refreshMaterialTable(details);
    clearAddedMaterialInput();

    updateTotals({
        quantity,
        net: netPurchaseAmount,
        gross: grossPurchaseAmount,
        operation: 'add'
    });
}

on('click', '#addMaterialBtn', addMaterial);

on('click', '#materialTable .correct-detail-btn', (event, button) => {
    const detail = details.find(item => item.id === button.dataset.id);

    if (!detail || !currentGoodsReceipt) return;

    openGoodsReceiptCorrectionModal({
        receipt: currentGoodsReceipt,
        detail
    });
});


on('click', '#materialTable .cancel-receipt-detail-btn', async (event, button) => {
    const detail = details.find(item => item.id === button.dataset.id);

    if (!detail || !currentGoodsReceipt) return;

    const confirmation = await notifications.showConfirmation({
        title: '¿Cancelar detalle de compra?',
        text: 'Se marcará el detalle como cancelado, se descontará de los totales y se generará el ajuste de inventario correspondiente.',
        confirmButtonText: 'Cancelar detalle'
    });

    if (!confirmation.isConfirmed) return;

    try {
        const response = await cancelGoodsReceiptDetail({
            id: currentGoodsReceipt.id,
            detailId: detail.id
        });

        notifications.showSuccess(response.message);
        document.querySelector('#goodsReceiptCorrectionModal').dispatchEvent(new CustomEvent(GOODS_RECEIPT_CORRECTION_APPLIED_EVENT, {
            bubbles: true,
            detail: response.data
        }));
    } catch (err) {
        handleApiError({
            err,
            rethrow: false
        });
    }
});

on(GOODS_RECEIPT_CORRECTION_APPLIED_EVENT, '#goodsReceiptCorrectionModal', (event) => {
    const updatedReceipt = event.detail?.updatedReceipt;

    if (!updatedReceipt || !currentGoodsReceipt || updatedReceipt.id !== currentGoodsReceipt.id) return;

    currentGoodsReceipt = {
        ...currentGoodsReceipt,
        ...updatedReceipt
    };
    const isCanceledReceipt = currentGoodsReceipt.status?.name === GOODS_RECEIPT_STATUS_LABELS.CANCELED;

    details.length = 0;
    details.push(...buildGoodsReceiptModalDetails(currentGoodsReceipt));

    if (isCanceledReceipt) {
        const form = document.querySelector(formId);
        const modalElement = document.querySelector(modalId);

        setGoodsReceiptViewMode({ form, modalElement, receipt: currentGoodsReceipt });
        initDetailsGoodsReceiptTable(FORM_MODES.VIEW);
    } else {
        refreshMaterialTable(details);
    }

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
