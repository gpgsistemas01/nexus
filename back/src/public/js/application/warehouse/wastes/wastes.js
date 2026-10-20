import { addWasteStockRequest, editWasteRequest, editWasteStockRequest, getAllWastesRequest, getWasteMaterialTemplatesRequest, registerWasteRequest } from "../../../services/warehouse/wasteService.js";
import { createApplicationList, createCrudApplication } from '../../createCrudApplication.js';

const wasteApplication = createCrudApplication({
    requests: {
        getAll: getAllWastesRequest,
        register: registerWasteRequest,
        edit: editWasteRequest,
        editStock: editWasteStockRequest,
        addStock: addWasteStockRequest
    },
    dataKey: 'waste',
    additionalMutations: ['editStock', 'addStock']
});

export const getAllWastes = wasteApplication.getAll;
export const getWasteMaterialTemplates = createApplicationList(getWasteMaterialTemplatesRequest);
export const registerWaste = wasteApplication.register;
export const editWaste = wasteApplication.edit;

export const editWasteStock = wasteApplication.editStock;
export const addWasteStock = wasteApplication.addStock;
