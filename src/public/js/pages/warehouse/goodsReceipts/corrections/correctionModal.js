import { DOM_EVENT_NAMES } from '../../../../constants/events.js';
import { FORM_SELECTORS, MODAL_SELECTORS } from '../../../../constants/selectors.js';
import { initMdbModal } from "../../../../plugins/mdb/baseInstance.js";
import { clearFormErrors } from "../../../../ui/forms/formErrorsUI.js";
import { formatCurrency, formatDecimal, roundTo } from "../../../../utils/formatUtils.js";
import { on } from "../../../../utils/domUtils.js";
import { GOODS_RECEIPT_CORRECTION_APPLIED_EVENT, initGoodsReceiptCorrectionForm } from "./correctionForm.js";
import { calculateGoodsReceiptDetailAmounts } from '../goodsReceiptDetails.js';

export { GOODS_RECEIPT_CORRECTION_APPLIED_EVENT };

const CORRECTION_MODAL_SELECTOR = MODAL_SELECTORS.GOODS_RECEIPT_CORRECTION;
const CORRECTION_FORM_SELECTOR = FORM_SELECTORS.GOODS_RECEIPT_CORRECTION;
const CORRECTION_TOTAL_SELECTORS = {
    totalQuantity: '#correctionTotalQuantity',
    totalNetPurchaseAmount: '#correctionTotalNetPurchaseAmount',
    totalGrossPurchaseAmount: '#correctionTotalGrossPurchaseAmount'
};

const getModal = () => document.querySelector(CORRECTION_MODAL_SELECTOR);
const getForm = () => document.querySelector(CORRECTION_FORM_SELECTOR);

const calculateCorrectionTotals = ({ receipt, currentDetail, formData }) => {
    const corrected = calculateGoodsReceiptDetailAmounts({
        quantity: formData.quantity || 0,
        costPerUnitType: formData.costPerUnitType || 0,
        base: currentDetail.base ?? currentDetail.material?.base,
        height: currentDetail.height ?? currentDetail.material?.height
    });

    return {
        totalQuantity: roundTo(Number(receipt?.totalQuantity || 0) - Number(currentDetail.quantity || 0) + corrected.quantity),
        totalNetPurchaseAmount: roundTo(Number(receipt?.totalNetPurchaseAmount || 0) - Number(currentDetail.netPurchaseAmount || 0) + corrected.netPurchaseAmount),
        totalGrossPurchaseAmount: roundTo(Number(receipt?.totalGrossPurchaseAmount || 0) - Number(currentDetail.grossPurchaseAmount || 0) + corrected.grossPurchaseAmount)
    };
};

const formatCorrectionTotals = (totals) => ({
    totalQuantity: formatDecimal(totals.totalQuantity),
    totalNetPurchaseAmount: formatCurrency(totals.totalNetPurchaseAmount),
    totalGrossPurchaseAmount: formatCurrency(totals.totalGrossPurchaseAmount)
});

const updateCorrectionTotalsSummary = () => {
    const form = getForm();

    if (!form?.correctionReceipt || !form?.correctionDetail) return;

    const totals = formatCorrectionTotals(calculateCorrectionTotals({
        receipt: form.correctionReceipt,
        currentDetail: form.correctionDetail,
        formData: {
            quantity: form.elements.quantity.value,
            costPerUnitType: form.elements.costPerUnitType.value
        }
    }));

    Object.entries(CORRECTION_TOTAL_SELECTORS).forEach(([key, selector]) => {
        const element = document.querySelector(selector);

        if (element) element.textContent = totals[key];
    });
};

const setCorrectionFormValues = ({ form, receipt, detail }) => {
    form.reset();
    clearFormErrors(form);
    form.dataset.id = receipt.id;
    form.dataset.detailId = detail.id;
    form.dataset.submitting = 'false';
    form.correctionDetail = detail;
    form.correctionReceipt = receipt;
    form.querySelector('button[type=DOM_EVENT_NAMES.SUBMIT]').disabled = false;
    form.elements.quantity.value = detail.quantity;
    form.elements.costPerUnitType.value = detail.costPerUnitType;
};

export const openGoodsReceiptCorrectionModal = ({ receipt, detail }) => {
    const modal = getModal();
    const form = getForm();

    setCorrectionFormValues({ form, receipt, detail });
    updateCorrectionTotalsSummary();
    initMdbModal(modal).show();
};

export const initGoodsReceiptCorrection = () => {
    initGoodsReceiptCorrectionForm();

    on(DOM_EVENT_NAMES.INPUT, CORRECTION_FORM_SELECTOR, updateCorrectionTotalsSummary);
    on(DOM_EVENT_NAMES.CHANGE, CORRECTION_FORM_SELECTOR, updateCorrectionTotalsSummary);
};
