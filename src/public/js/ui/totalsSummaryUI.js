import { formatCurrency, formatDecimal, roundTo } from "../utils/formatUtils.js";

const TOTAL_FIELDS = {
    quantity: '#totalQuantityDisplayValue',
    net: '#totalNetPurchaseAmountDisplayValue',
    gross: '#totalGrossPurchaseAmountDisplayValue'
};

const getTotalSummaryValue = (selector) => {
    const element = document.querySelector(selector);

    return Number(element?.dataset.value) || 0;
};

const setTotalSummaryValue = ({ selector, value, formatter }) => {
    const element = document.querySelector(selector);

    if (!element) return;

    const rawValue = Number(value) || 0;
    element.dataset.value = String(rawValue);
    element.textContent = formatter(rawValue);
};



export const setTextSummaryValue = ({ selector, value, emptyValue = '-' }) => {
    const element = document.querySelector(selector);

    if (!element) return;

    const displayValue = value || emptyValue;

    element.textContent = displayValue;
    element.dataset.value = displayValue;
};

export const setTextSummaryValues = (items = []) => {
    items.forEach(setTextSummaryValue);
};

export const setSummaryValues = (items = []) => {

    items.forEach(({ selector, value, formatter = formatDecimal }) => {
        setTotalSummaryValue({ selector, value, formatter });
    });
};

export const updateTotals = ({
    quantity = 0,
    net = 0,
    gross = 0,
    operation = 'none'
} = {}) => {

    if (operation === 'none') {

        setTotals();
        return;
    }

    let totalQuantity = getTotalSummaryValue(TOTAL_FIELDS.quantity);
    let totalNetPurchaseAmount = getTotalSummaryValue(TOTAL_FIELDS.net);
    let totalGrossPurchaseAmount = getTotalSummaryValue(TOTAL_FIELDS.gross);

    const op = operation === 'add' ? 1 : operation === 'subtract' ? -1 : 0;

    totalQuantity += quantity * op;
    totalNetPurchaseAmount += net * op;
    totalGrossPurchaseAmount += gross * op;

    setTotals({
        quantity: roundTo(totalQuantity),
        net: roundTo(totalNetPurchaseAmount),
        gross: roundTo(totalGrossPurchaseAmount)
    });
}

export const setTotals = ({
    quantity = '',
    net = '',
    gross = ''
} = {}) => {

    setTotalSummaryValue({
        selector: TOTAL_FIELDS.quantity,
        value: quantity,
        formatter: formatDecimal
    });
    setTotalSummaryValue({
        selector: TOTAL_FIELDS.net,
        value: net,
        formatter: formatCurrency
    });
    setTotalSummaryValue({
        selector: TOTAL_FIELDS.gross,
        value: gross,
        formatter: formatCurrency
    });
}
