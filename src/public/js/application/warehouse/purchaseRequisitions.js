import { createSuccessResponseFromRequest } from "../../utils/responseUtils.js";
import {
    cancelPurchaseRequisitionRequest,
    confirmPurchaseRequisitionRequest,
    editPurchaseRequisitionRequest,
    registerPurchaseRequisitionRequest
} from "../../services/warehouse/purchaseRequisitionService.js";

export const registerPurchaseRequisition = async ({ formData }) => {

    const response = await registerPurchaseRequisitionRequest({ data: formData });

    return createSuccessResponseFromRequest({ response });
};

export const editPurchaseRequisition = async ({ formData, id }) => {

    const response = await editPurchaseRequisitionRequest({ data: formData, id });

    return createSuccessResponseFromRequest({ response });
};

export const confirmPurchaseRequisition = async (id) => {

    const response = await confirmPurchaseRequisitionRequest({ id });

    return createSuccessResponseFromRequest({ response });
};

export const cancelPurchaseRequisition = async (id) => {

    const response = await cancelPurchaseRequisitionRequest({ id });

    return createSuccessResponseFromRequest({ response });
};
