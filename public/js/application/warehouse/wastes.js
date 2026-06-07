import { getSuccessMessage } from "../../constants/apiMessages.js";
import { getAllWastesRequest, registerWasteRequest } from "../../services/warehouse/wasteService.js";

export const getAllWastes = async (params = {}) => {

    const response = await getAllWastesRequest({ params });

    return response;
};

export const registerWaste = async ({ formData }) => {

    const response = await registerWasteRequest({ data: formData });

    const { data } = response;
    const { code, product } = data;

    return {
        message: getSuccessMessage(code),
        data: product
    };
};
