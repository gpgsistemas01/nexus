import { initMdbModal, initMdbWrapperInput, updateMdbWrapperInput } from "../../../plugins/mdb/baseInstance.js";
import { initGoodsReceiptCorrectionSelect2 } from "../../../plugins/select2/modules/correctionSelect.js";
import { clearFormErrors } from "../../../ui/formUI.js";
import { formatCurrency } from "../../../utils/formatUtils.js";
import { GOODS_RECEIPT_CORRECTION_APPLIED_EVENT, initGoodsReceiptCorrectionForm } from "./correctionForm.js";

export { GOODS_RECEIPT_CORRECTION_APPLIED_EVENT };

const CORRECTION_MODAL_SELECTOR = '#goodsReceiptCorrectionModal';
const CORRECTION_FORM_SELECTOR = '#goodsReceiptCorrectionForm';
const CORRECTION_PRODUCT_SELECTOR = '#correctionProductInput';

const getModal = () => document.querySelector(CORRECTION_MODAL_SELECTOR);
const getForm = () => document.querySelector(CORRECTION_FORM_SELECTOR);

const setCorrectionTotalValue = ({ form, fieldName, value }) => {
    const field = form.elements[fieldName];

    if (!field) return;

    const instance = initMdbWrapperInput({
        selector: `#${ field.id }`,
        value
    });

    updateMdbWrapperInput(instance);
};

const updateCorrectionTotals = () => {
    const form = getForm();
    const detail = form?.correctionDetail;
    if (!form || !detail) return;

    const currentTotal = Number(detail.quantity || 0) * Number(detail.costPerUnitType || 0);
    const correctedTotal = Number(form.elements.quantity.value || 0) * Number(form.elements.costPerUnitType.value || 0);

    setCorrectionTotalValue({ form, fieldName: 'currentTotal', value: formatCurrency(currentTotal) });
    setCorrectionTotalValue({ form, fieldName: 'correctedTotal', value: formatCurrency(correctedTotal) });
    setCorrectionTotalValue({ form, fieldName: 'totalDifference', value: formatCurrency(correctedTotal - currentTotal) });
};

const setCorrectionFormValues = ({ form, receipt, detail }) => {
    form.reset();
    clearFormErrors(form);
    form.dataset.id = receipt.id;
    form.dataset.detailId = detail.id;
    form.dataset.submitting = 'false';
    form.correctionDetail = detail;
    form.querySelector('button[type="submit"]').disabled = false;
    form.elements.quantity.value = detail.quantity;
    form.elements.costPerUnitType.value = detail.costPerUnitType;
    form.elements.observations.value = `Corrección de compra ${ receipt.referenceNumber }: producto/costo registrado incorrectamente.`;
};

export const openGoodsReceiptCorrectionModal = ({ receipt, detail }) => {
    const modal = getModal();
    const form = getForm();

    setCorrectionFormValues({ form, receipt, detail });
    initGoodsReceiptCorrectionSelect2({ detail });
    updateCorrectionTotals();
    initMdbModal(modal).show();
};

export const initGoodsReceiptCorrectionModal = () => {
    document.addEventListener('input', (event) => {
        if (!event.target.closest(CORRECTION_FORM_SELECTOR)) return;
        updateCorrectionTotals();
    });

    document.addEventListener('change', (event) => {
        if (!event.target.closest(CORRECTION_FORM_SELECTOR)) return;
        updateCorrectionTotals();
    });
};

export const initGoodsReceiptCorrection = () => {
    initGoodsReceiptCorrectionForm();
    initGoodsReceiptCorrectionModal();
};
