import { initMdbModal, showModal, initMdbWrapperInput, updateMdbWrapperInput } from '../../../plugins/mdb/baseInstance.js';
import { refreshProductTable } from '../../../plugins/datatable/baseDatatable.js';
import { clearFormErrors, resetFormSubmitState } from '../../../ui/formUI.js';
import { setSummaryValues } from '../../../ui/totalsSummaryUI.js';
import { on } from '../../../utils/domUtils.js';
import { FULFILLMENT_STATUS_NAMES } from '../../../constants/fulfillmentStatuses.js';
import { GOODS_ISSUE_RETURN_APPLIED_EVENT, initGoodsIssueReturnForm } from './returnForm.js';

const RETURN_MODAL_SELECTOR = '#goodsIssueReturnModal';
const RETURN_FORM_SELECTOR = '#goodsIssueReturnForm';
const RETURN_QUANTITY_INPUT_SELECTOR = '#goodsIssueReturnQuantityInput';
const RETURN_OBSERVATIONS_INPUT_SELECTOR = '#goodsIssueReturnObservationsInput';
const RETURN_SUMMARY_SELECTORS = {
    suppliedQuantity: '#goodsIssueReturnSuppliedQuantity',
    returnedQuantity: '#goodsIssueReturnReturnedQuantity',
    availableQuantity: '#goodsIssueReturnAvailableQuantity'
};


let currentReturnDetail = null;
let returnQuantityInputInstance = null;
let returnObservationsInputInstance = null;
let details = [];

const getModal = () => document.querySelector(RETURN_MODAL_SELECTOR);
const getForm = () => document.querySelector(RETURN_FORM_SELECTOR);

export const openGoodsIssueReturnModal = ({ goodsIssue, detail, issueDetails }) => {
    const modalElement = getModal();
    const form = getForm();
    const suppliedQuantity = Number(detail.suppliedQuantity ?? 0);
    const returnedQuantity = Number(detail.returnedQuantity ?? 0);
    const availableQuantity = suppliedQuantity - returnedQuantity;

    currentReturnDetail = detail;
    details = issueDetails;

    setSummaryValues([
        { selector: RETURN_SUMMARY_SELECTORS.suppliedQuantity, value: suppliedQuantity },
        { selector: RETURN_SUMMARY_SELECTORS.returnedQuantity, value: returnedQuantity },
        { selector: RETURN_SUMMARY_SELECTORS.availableQuantity, value: availableQuantity }
    ]);

    form.reset();
    clearFormErrors(form);
    resetFormSubmitState(form);
    form.dataset.id = goodsIssue.id;
    form.dataset.detailId = detail.id;
    form.dataset.availableQuantity = String(availableQuantity);
    form.querySelector('button[type="submit"]').disabled = false;

    returnQuantityInputInstance = initMdbWrapperInput({ selector: RETURN_QUANTITY_INPUT_SELECTOR, value: '' });
    returnObservationsInputInstance = initMdbWrapperInput({ selector: RETURN_OBSERVATIONS_INPUT_SELECTOR, value: '' });
    updateMdbWrapperInput(returnQuantityInputInstance);
    updateMdbWrapperInput(returnObservationsInputInstance);

    showModal(initMdbModal(modalElement));
};

export const initGoodsIssueReturnModal = () => {
    initGoodsIssueReturnForm();

    on(GOODS_ISSUE_RETURN_APPLIED_EVENT, RETURN_MODAL_SELECTOR, (event) => {
        if (!currentReturnDetail) return;

        const returnedDetail = event.detail.goodsIssueReturn?.detail;

        if (!returnedDetail) {
            refreshProductTable(details);
            return;
        }

        const detailIndex = details.findIndex(detail => detail.id === returnedDetail.id);

        if (returnedDetail.fulfillmentStatus?.name === FULFILLMENT_STATUS_NAMES.CANCELED) {
            if (detailIndex >= 0) details.splice(detailIndex, 1);
        } else if (detailIndex >= 0) {
            details[detailIndex] = { ...details[detailIndex], ...returnedDetail };
        } else {
            details.push(returnedDetail);
        }

        refreshProductTable(details);
    });
};
