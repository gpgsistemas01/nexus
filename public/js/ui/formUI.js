import { initMdbWrapperInput, updateMdbWrapperInput } from "../plugins/mdb/baseInstance.js";

const TOTAL_FIELDS = {
    quantity: '#totalQuantityDisplayInput',
    net: '#totalNetPurchaseAmountDisplayInput',
    gross: '#totalGrossPurchaseAmountDisplayInput',
}

export const toggleErrorMessages = (form, errors) => {

    Object.entries(errors).forEach(([field, message]) => {

        const input = form.querySelector(`[name='${ field }']`);
        const feedback = form.querySelector(`[data-error-for='${ field }']`);

        if (!input || !feedback) return;

        if (message) {

            feedback.textContent = message;
            input.classList.add('is-invalid');

        } else {

            feedback.textContent = null;
            input.classList.remove('is-invalid');
        }
    });
}

const setInputSelectError = (form, key, message = null) => {

    const feedback = form.querySelector(`[data-error-for='${ key }']`);

    if (!feedback) return;

    if (message) {

        feedback.textContent = message;
        feedback.classList.add('d-block');

    } else {

        feedback.textContent = null;
        feedback.classList.remove('d-block');
    }
}

export const toggleInputSelectErrors = (form, errors) => {

    form.querySelectorAll('select').forEach(input => {

        const key = input.name;
        const value = errors[key];
        
        setInputSelectError(form, key, value);

        if ($(input).hasClass('select2-hidden-accessible')) {

            if (value) $(input).next('.select2-container').find('.select2-selection').addClass('is-invalid');
            else $(input).next('.select2-container').find('.select2-selection').removeClass('is-invalid');
        }
    });
}

const setTableError = (form, key, message = null) => {

    const feedback = form.querySelector(`[data-error-for=${ key }]`);

    if (!feedback) return;

    if (message) {

        feedback.textContent = message;
        feedback.classList.remove('d-none');

    } else {

        feedback.textContent = null;
        feedback.classList.add('d-none');
    }
}

export const toggleTableErrors = (form, errors) => {

    const key = 'details';
    const value = errors[key];
    setTableError(form, key, value);
}

export const setFormReadOnly = ({
    form,
    isReadOnly
}) => {
    
    const elements = form.querySelectorAll('input, select, textarea');

    elements.forEach(el => {
        if (isReadOnly) {
            el.setAttribute('disabled', 'disabled');
        } else {
            el.removeAttribute('disabled');
        }
    });

    form.querySelector('#submitBtn').classList.toggle('d-none', isReadOnly);
};

export const toggleButtons = ({
    mode,
    status = 'Cerrada',
    showActions = true,
    withoutTotal = true
}) => {

    const isView = mode === 'view';
    document.querySelector('.add-product-container').classList.toggle('d-none', isView);
    document.querySelector('.total-container').classList.toggle('d-none', withoutTotal);
    const approveContainer = document.querySelector('.approve-container');

    if (approveContainer) {
        
        const canApprove = !showActions || !(isView && status === 'Abierta');
        approveContainer.classList.toggle('d-none', canApprove);
    }
}

export const updateTotals = ({
    quantity = 0,
    net = 0,
    gross = 0,
    operation
}) => {

    const totalQuantityEl = document.querySelector(TOTAL_FIELDS.quantity);
    const totalNetPurchaseAmountEl = document.querySelector(TOTAL_FIELDS.net);
    const totalGrossPurchaseAmountEl = document.querySelector(TOTAL_FIELDS.gross);

    let totalQuantity = Number(totalQuantityEl.value) || 0;
    let totalNetPurchaseAmount = Number(totalNetPurchaseAmountEl.value) || 0;
    let totalGrossPurchaseAmount = Number(totalGrossPurchaseAmountEl.value) || 0;

    const op = operation === 'add' ? 1 : -1;

    totalQuantity += quantity * op;
    totalNetPurchaseAmount += net * op;
    totalGrossPurchaseAmount += gross * op;

    const instanceTotalQuantity = initMdbWrapperInput({
        selector: TOTAL_FIELDS.quantity,
        value: totalQuantity
    });
    const instanceTotalNetPurchaseAmount = initMdbWrapperInput({
        selector: TOTAL_FIELDS.net,
        value: totalNetPurchaseAmount
    });
    const instanceTotalGrossPurchaseAmount = initMdbWrapperInput({
        selector: TOTAL_FIELDS.gross,
        value: totalGrossPurchaseAmount
    });

    updateMdbWrapperInput(instanceTotalQuantity);
    updateMdbWrapperInput(instanceTotalNetPurchaseAmount);
    updateMdbWrapperInput(instanceTotalGrossPurchaseAmount);
}

export const cleanAddedProductInput = () => {

    $('#productInput').empty().trigger('change');
    document.querySelector('#quantityInput').value = '';
    document.querySelector('#presentationDisplayInput').value = '';
    const display = document.querySelector('#unitCostByQuantityInput');

    if (display) display.value = '';
}

export const toggleInvoiceInput = (value) => {

    const invoiceContainer = document.getElementById('invoiceContainer');

    if (value === 'invoice') {

        invoiceContainer.style.display = '';
        invoiceContainer.querySelector('#invoiceInput').value = '';

    } else {
        
        invoiceContainer.style.display = 'none';
    }
}