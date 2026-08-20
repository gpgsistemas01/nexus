import { createClientRequest, editClientRequest, getAllClientsRequest } from "../../services/sales/clientService.js";
import { createCrudApplication } from '../createCrudApplication.js';

const clientApplication = createCrudApplication({
    requests: {
        getAll: getAllClientsRequest,
        register: createClientRequest,
        edit: editClientRequest
    },
    dataKey: 'client'
});

export const getAllClients = clientApplication.getAll;
export const registerClient = clientApplication.register;
export const editClient = clientApplication.edit;
