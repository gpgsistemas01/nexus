import { deleteConsumableRequest, editConsumableRequest, editConsumableStockRequest, getAllConsumablesRequest, registerConsumableRequest } from '../../../services/warehouse/consumableService.js';
import { createCrudApplication } from '../../createCrudApplication.js';

const consumableApplication = createCrudApplication({
    requests: {
        getAll: getAllConsumablesRequest,
        register: registerConsumableRequest,
        edit: editConsumableRequest,
        editStock: editConsumableStockRequest,
        remove: deleteConsumableRequest
    },
    dataKeys: { register: 'material' },
    additionalMutations: ['editStock', 'remove']
});

export const getAllConsumables = consumableApplication.getAll;
export const registerConsumable = consumableApplication.register;
export const editConsumable = consumableApplication.edit;
export const editConsumableStock = consumableApplication.editStock;
export const deleteConsumable = consumableApplication.remove;
