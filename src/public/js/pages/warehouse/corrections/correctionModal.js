import { initMdbModal } from "../../../plugins/mdb/baseInstance.js";
import { initGoodsReceiptCorrectionSelect2 } from "../../../plugins/select2/modules/correctionSelect.js";
import { clearFormErrors } from "../../../ui/formUI.js";
import { formatCurrency, formatDecimal } from "../../../utils/formatUtils.js";
import { GOODS_RECEIPT_CORRECTION_APPLIED_EVENT, initGoodsReceiptCorrectionForm } from "./correctionForm.js";

export { GOODS_RECEIPT_CORRECTION_APPLIED_EVENT };

const CORRECTION_MODAL_SELECTOR = '#goodsReceiptCorrectionModal';
const CORRECTION_FORM_SELECTOR = '#goodsReceiptCorrectionForm';
const CORRECTION_TOTAL_SELECTORS = {
    totalQuantity: '#correctionTotalQuantity',
    totalNetPurchaseAmount: '#correctionTotalNetPurchaseAmount',
    totalGrossPurchaseAmount: '#correctionTotalGrossPurchaseAmount'
};

const getModal = () => document.querySelector(CORRECTION_MODAL_SELECTOR);
const getForm = () => document.querySelector(CORRECTION_FORM_SELECTOR);

const IVA_RATE = 1.16;

const calculateCorrectionTotals = ({ receipt, currentDetail, formData }) => {
    const correctedQuantity = Number(formData.quantity || 0);
    const correctedNetPurchaseAmount = correctedQuantity * Number(formData.costPerUnitType || 0);
    const correctedGrossPurchaseAmount = correctedNetPurchaseAmount * IVA_RATE;

    return {
        totalQuantity: Number(receipt?.totalQuantity || 0) - Number(currentDetail.quantity || 0) + correctedQuantity,
        totalNetPurchaseAmount: Number(receipt?.totalNetPurchaseAmount || 0) - Number(currentDetail.netPurchaseAmount || 0) + correctedNetPurchaseAmount,
        totalGrossPurchaseAmount: Number(receipt?.totalGrossPurchaseAmount || 0) - Number(currentDetail.grossPurchaseAmount || 0) + correctedGrossPurchaseAmount
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
    form.querySelector('button[type="submit"]').disabled = false;
    form.elements.quantity.value = detail.quantity;
    form.elements.costPerUnitType.value = detail.costPerUnitType;
    form.elements.observations.value = `Corrección de compra ${ receipt.referenceNumber }: producto/cantidad/costo registrado incorrectamente.`;
};

export const openGoodsReceiptCorrectionModal = ({ receipt, detail }) => {
    const modal = getModal();
    const form = getForm();

    setCorrectionFormValues({ form, receipt, detail });
    initGoodsReceiptCorrectionSelect2({ detail });
    updateCorrectionTotalsSummary();
    initMdbModal(modal).show();
};

export const initGoodsReceiptCorrection = () => {
    initGoodsReceiptCorrectionForm();

    document.addEventListener('input', (event) => {
        if (event.target.closest(CORRECTION_FORM_SELECTOR)) updateCorrectionTotalsSummary();
    });

    document.addEventListener('change', (event) => {
        if (event.target.closest(CORRECTION_FORM_SELECTOR)) updateCorrectionTotalsSummary();
    });
};
