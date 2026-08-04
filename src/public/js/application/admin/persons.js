import { createSuccessResponseFromRequest } from "../../utils/responseUtils.js";
import { getAllPersonsRequest, registerPersonRequest, updatePersonRequest } from "../../services/admin/personService.js";

export const getPersonOptions = async (params = {}) => {

    const response = await getAllPersonsRequest({ params });

    const list = response.data?.data || [];

    return list.filter(person => person?.id && person?.fullName)
        .map(person => ({
            value: person.id,
            label: person.fullName
        }));
};

export const getAllPersons = async (params = {}) => {

    const response = await getAllPersonsRequest({ params });

    return response;
};

export const registerPerson = async ({ formData }) => {

    const response = await registerPersonRequest({ data: formData });

    return createSuccessResponseFromRequest({ response, dataKey: 'person' });
}

export const updatePerson = async ({ formData, id }) => {

    const response = await updatePersonRequest({ data: formData, id });

    return createSuccessResponseFromRequest({ response, dataKey: 'person' });
}
