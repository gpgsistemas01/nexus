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

export const getClientOptions = async (params = {}) => {

    const response = await getAllClientsRequest({ params });

    const list = response.data?.data || [];

    return list.filter(client => client?.id && client?.name)
        .map(client => ({
            value: client.id,
            label: client.name
        }));
};

export const getAllClients = clientApplication.getAll;
export const registerClient = clientApplication.register;
export const editClient = clientApplication.edit;
