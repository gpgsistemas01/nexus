import { on } from "../../../utils/domUtils.js";
import { validateReturnDetails } from "../../../utils/validations/validators.js";

export const RETURN_MODE = 'return';

export const buildReturnDetailState = ({
    detail,
    baseQuantity,
    returnedQuantityTotal = detail.returnedQuantityTotal || 0
}) => {
    const normalizedReturnedTotal = Number(returnedQuantityTotal || 0);

    return {
        returnedQuantityTotal: normalizedReturnedTotal,
        availableReturnQuantity: Number(baseQuantity || 0) - normalizedReturnedTotal,
        returnedQuantity: '',
        isReturned: false
    };
};

export const createReturnFormHandlers = ({
    details,
    validators,
    validateFields,
    returnUpdate,
    defaultUpdate,
    emptyMessage
}) => ({
    isActive: (form) => form?.dataset?.mode === RETURN_MODE,
    normalizeData: ({ form }) => ({
        id: form.dataset.id,
        details: details
            .filter(({ isReturned }) => isReturned)
            .map(({ id, returnedQuantity }) => ({
                id,
                isReturned: true,
                returnedQuantity: Number(returnedQuantity)
            }))
    }),
    getErrors: () => validateReturnDetails({
        details,
        validators,
        validateFields,
        emptyMessage
    }),
    resolveUpdate: (form) => (form?.dataset?.mode === RETURN_MODE ? returnUpdate : defaultUpdate)
});

const updateReturnDetail = (params) => {
    const { details, detailId, isReturned, returnedQuantity } = params;
    const detail = details.find(({ id, productId }) => (id || productId) === detailId);

    if (!detail) return null;

    if (Object.prototype.hasOwnProperty.call(params, 'isReturned')) {
        detail.isReturned = Boolean(isReturned);
        if (!detail.isReturned) detail.returnedQuantity = '';
    }

    if (Object.prototype.hasOwnProperty.call(params, 'returnedQuantity')) {
        detail.returnedQuantity = returnedQuantity;
    }

    return detail;
};

export const bindReturnDetailEvents = ({
    details,
    selectorPrefix = ''
}) => {
    on('change', `${ selectorPrefix }.return-checkbox`, (_event, checkbox) => {
        const detail = updateReturnDetail({
            details,
            detailId: checkbox.dataset.detailId,
            isReturned: checkbox.checked
        });

        const input = checkbox
            .closest('tr')
            ?.querySelector(`.return-quantity-input[data-detail-id="${ checkbox.dataset.detailId }"]`);

        if (!input) return;

        input.disabled = !checkbox.checked;
        input.value = detail?.returnedQuantity || '';
    });

    on('input', `${ selectorPrefix }.return-quantity-input`, (_event, input) => {
        updateReturnDetail({
            details,
            detailId: input.dataset.detailId,
            returnedQuantity: input.value
        });
    });
};
