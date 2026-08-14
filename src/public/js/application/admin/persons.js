import { getAllPersonsRequest, registerPersonRequest, updatePersonRequest } from "../../services/admin/personService.js";
import { createCrudApplication } from '../createCrudApplication.js';

const personApplication = createCrudApplication({
    requests: {
        getAll: getAllPersonsRequest,
        register: registerPersonRequest,
        edit: updatePersonRequest
    },
    dataKey: 'person'
});

export const getPersonOptions = async (params = {}) => {

    const response = await getAllPersonsRequest({ params });

    const list = response.data?.data || [];

    return list.filter(person => person?.id && person?.fullName)
        .map(person => ({
            value: person.id,
            label: person.fullName
        }));
};

export const getAllPersons = personApplication.getAll;
export const registerPerson = personApplication.register;
export const updatePerson = personApplication.edit;
