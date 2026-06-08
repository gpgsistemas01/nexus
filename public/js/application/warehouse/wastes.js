import { getSuccessMessage } from "../../constants/apiMessages.js";
import { editWasteRequest, editWasteStockRequest, getAllWastesRequest, registerWasteRequest } from "../../services/warehouse/wasteService.js";

export const getAllWastes = async (params = {}) => {

    const response = await getAllWastesRequest({ params });

    return response;
};

export const registerWaste = async ({ formData }) => {

    const response = await registerWasteRequest({ data: formData });

    const { data } = response;
    const { code, waste } = data;

    return {
        message: getSuccessMessage(code),
        data: waste
    };
};


export const editWaste = async ({ formData, id }) => {

    const response = await editWasteRequest({ data: formData, id });

    const { data } = response;
    const { code, waste } = data;

    return {
        message: getSuccessMessage(code),
        data: waste
    };
};


export const editWasteStock = async ({ formData, id }) => {

    const response = await editWasteStockRequest({ data: formData, id });

    const { data } = response;
    const { code, waste } = data;

    return {
        message: getSuccessMessage(code),
        data: waste
    };
};
