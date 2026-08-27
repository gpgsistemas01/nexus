import { editWasteRequest, editWasteStockRequest, getAllWastesRequest, getWasteMaterialTemplatesRequest, registerWasteRequest } from "../../../services/warehouse/wasteService.js";
import { createApplicationList, createCrudApplication } from '../../createCrudApplication.js';

const wasteApplication = createCrudApplication({
    requests: {
        getAll: getAllWastesRequest,
        register: registerWasteRequest,
        edit: editWasteRequest,
        editStock: editWasteStockRequest
    },
    dataKey: 'waste',
    additionalMutations: ['editStock']
});

export const getAllWastes = wasteApplication.getAll;
export const getWasteMaterialTemplates = createApplicationList(getWasteMaterialTemplatesRequest);
export const registerWaste = wasteApplication.register;
export const editWaste = wasteApplication.edit;

export const editWasteStock = wasteApplication.editStock;
