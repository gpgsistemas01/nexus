import { createSuccessResponseFromRequest } from "../../utils/responseUtils.js";
import { editWasteRequest, editWasteStockRequest, getAllWastesRequest, registerWasteRequest } from "../../services/warehouse/wasteService.js";
import { createCrudApplication } from '../createCrudApplication.js';

const wasteApplication = createCrudApplication({
    requests: {
        getAll: getAllWastesRequest,
        register: registerWasteRequest,
        edit: editWasteRequest
    },
    dataKey: 'waste'
});

export const getAllWastes = wasteApplication.getAll;
export const registerWaste = wasteApplication.register;
export const editWaste = wasteApplication.edit;

export const editWasteStock = async ({ formData, id }) => {

    const response = await editWasteStockRequest({ data: formData, id });

    return createSuccessResponseFromRequest({ response, dataKey: 'waste' });
};
