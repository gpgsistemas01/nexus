import { DOM_EVENT_NAMES } from '../../../constants/events.js';
import { useForm } from "../../../application/form.js";
import { editGoodsReceiptHeader, registerGoodsReceipt, cancelGoodsReceiptDetail } from "../../../application/warehouse/goodsReceipts/goodsReceipts.js";
import { handleApiError } from "../../../api/errorHandler.js";
import { addGoodsReceiptMaterialValidation, goodsReceiptEditValidation, goodsReceiptValidation } from "../../../utils/validations/validators.js";
import { refreshMaterialTable } from "../../../plugins/datatable/shared/inventory/renderMaterialDatatable.js";
import { createGoodsReceiptDatatable, details, initDetailsGoodsReceiptTable } from "../../../plugins/datatable/warehouse/goodsReceipts/goodsReceiptDatatable.js";
import { GOODS_RECEIPT_SUPPLIER_CHANGED_EVENT, initGoodsReceiptFormSelect2, setGoodsReceiptFormSelectOptions } from "../../../plugins/select2/modules/goodsReceiptSelect.js";
import { normalizeFormErrors } from "../../../ui/forms/formErrorsUI.js";
import { setFormDisabled } from "../../../ui/forms/formStateUI.js";
import { toggleDetailFormActions, clearAddedMaterialInput } from "../../../ui/forms/detailFormUI.js";
import { setTotals, updateTotals } from "../../../ui/forms/totalsSummaryUI.js";
import { initializeInventoryCrudModal } from "../../../ui/inventory/inventoryCrudModalUI.js";
import { on } from "../../../utils/domUtils.js";
import { setDateTimePickerValue } from "../../../plugins/flatpickr/dateTimePicker.js";
import { handleSubmit, hasValidationErrors, toggleContainerElements, toggleDisabledElement, validateFields } from "../../../utils/formUtils.js";
import { buildModalTitle, openModal } from "../../../ui/modalUI.js";
import { BUTTON_SELECTORS, FORM_SELECTORS, HEADING_SELECTORS, INPUT_SELECTORS, MODAL_SELECTORS, SELECT_SELECTORS } from "../../../constants/selectors.js";
import { FORM_MODES } from "../../../constants/formModes.js";
import { GOODS_RECEIPT_STATUS_LABELS } from "../../../constants/goodsReceiptStatuses.js";
import { notifications } from "../../../plugins/swal/swalComponent.js";
import { GOODS_RECEIPT_CORRECTION_APPLIED_EVENT, initGoodsReceiptCorrection, openGoodsReceiptCorrectionModal } from "./corrections/correctionModal.js";
import { buildGoodsReceiptModalDetails, mapGoodsReceiptSelectionToDetail } from "./goodsReceiptDetails.js";
import { upsertDetail } from "../../../utils/detailCollectionUtils.js";

const modalId = MODAL_SELECTORS.GOODS_RECEIPT;
const formId = FORM_SELECTORS.GOODS_RECEIPT;
const INVOICE_VALUES = Object.freeze({
    INVOICE: 'invoice',
    NONE: 'none'
});
const GOODS_RECEIPT_ENTITY_NAME = 'compra';

const toggleInvoiceInput = (value) => {
    const invoiceContainer = document.getElementById('invoiceContainer');
    invoiceContainer.style.display = value === INVOICE_VALUES.INVOICE ? '' : 'none';
};
createGoodsReceiptDatatable();

let currentGoodsReceipt = null;

initGoodsReceiptCorrection();

const setGoodsReceiptViewMode = ({ form, modalElement, receipt }) => {
    form.dataset.mode = FORM_MODES.VIEW;
    modalElement.querySelector(HEADING_SELECTORS.MODAL_TITLE).textContent = buildModalTitle({
        action: 'Ver',
        entityName: GOODS_RECEIPT_ENTITY_NAME,
        referenceNumber: receipt.referenceNumber
    });
    setFormDisabled({ form, isDisabled: true });
    toggleDetailFormActions({
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

        const validators = form.dataset.mode === FORM_MODES.EDIT
            ? goodsReceiptEditValidation
            : goodsReceiptValidation;

        return validateFields(validators, formData);
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

    initializeInventoryCrudModal({ form, mode, data });
    currentGoodsReceipt = data;
    toggleDisabledElement({
        element: form.querySelector(SELECT_SELECTORS.SUPPLIER),
        isDisabled: false
    });

    details.length = 0;

    initDetailsGoodsReceiptTable(mode);
    initGoodsReceiptFormSelect2();
    setGoodsReceiptFormSelectOptions(data);

    if (mode === FORM_MODES.CREATE) {

        form.reset();
        value = INVOICE_VALUES.INVOICE;
        modalElement.querySelector(HEADING_SELECTORS.MODAL_TITLE).textContent = 'Registrar compra';
        form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = 'Confirmar';
        form.querySelector(INPUT_SELECTORS.PRESENTATION_DISPLAY).value = '';
        toggleDetailFormActions({
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
            modalElement.querySelector(HEADING_SELECTORS.MODAL_TITLE).textContent = buildModalTitle({ action: 'Editar', entityName: GOODS_RECEIPT_ENTITY_NAME, referenceNumber: data?.referenceNumber });
            form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = 'Actualizar';
            toggleDisabledElement({
                element: form.querySelector(SELECT_SELECTORS.SUPPLIER),
                isDisabled: true
            });
            toggleContainerElements({
                selector: '.add-material-container',
                root: modalElement,
                isDisabled: false
            });
            toggleDetailFormActions({
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
    toggleInvoiceInput(value);

    refreshMaterialTable(details);

    openModal(modalElement);
}

const addMaterial = () => {

    const option = document.querySelector(`${ SELECT_SELECTORS.MATERIAL } option:checked`);
    if (!option) return;

    const { material, supplier } = option.dataset;
    const selectedMaterial = material ? JSON.parse(material) : {};
    const materialId = selectedMaterial.id;

    const quantity = Number(document.querySelector(INPUT_SELECTORS.QUANTITY).value);
    const costPerUnitType = Number(document.querySelector(INPUT_SELECTORS.COST_PER_UNIT).value);
    const errors = validateFields(addGoodsReceiptMaterialValidation, {
        materialId,
        quantity,
        costPerUnitType
    });

    normalizeFormErrors({ form: document.querySelector(formId), errors });

    if (hasValidationErrors(errors)) return;

    const newDetail = mapGoodsReceiptSelectionToDetail({
        optionData: { material, supplier },
        quantity,
        costPerUnitType
    });
    const previousDetail = upsertDetail({
        details,
        detail: newDetail,
        matches: detail => detail.materialId === materialId
    });

    if (previousDetail) {
        updateTotals({
            quantity: previousDetail.quantity,
            net: previousDetail.netPurchaseAmount,
            gross: previousDetail.grossPurchaseAmount,
            operation: 'subtract'
        });
    }

    refreshMaterialTable(details);
    clearAddedMaterialInput();

    updateTotals({
        quantity,
        net: newDetail.netPurchaseAmount,
        gross: newDetail.grossPurchaseAmount,
        operation: 'add'
    });
}

on(DOM_EVENT_NAMES.CLICK, BUTTON_SELECTORS.ADD_MATERIAL, addMaterial);

on(DOM_EVENT_NAMES.CLICK, '#materialTable .correct-detail-btn', (event, button) => {
    const detail = details.find(item => item.id === button.dataset.id);

    if (!detail || !currentGoodsReceipt) return;

    openGoodsReceiptCorrectionModal({
        receipt: currentGoodsReceipt,
        detail
    });
});


on(DOM_EVENT_NAMES.CLICK, '#materialTable .cancel-receipt-detail-btn', async (event, button) => {
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
        document.querySelector(MODAL_SELECTORS.GOODS_RECEIPT_CORRECTION).dispatchEvent(new CustomEvent(GOODS_RECEIPT_CORRECTION_APPLIED_EVENT, {
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

on(GOODS_RECEIPT_CORRECTION_APPLIED_EVENT, MODAL_SELECTORS.GOODS_RECEIPT_CORRECTION, (event) => {
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

    radio.addEventListener(DOM_EVENT_NAMES.CHANGE, () => {

        if (radio.checked) toggleInvoiceInput(radio.value);
    });
});
