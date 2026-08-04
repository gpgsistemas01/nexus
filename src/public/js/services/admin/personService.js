import { apiRequest } from "../axiosInstanceApi.js";

export const PERSONS_API_ROUTE = '/api/admin/persons';

export const getAllPersonsRequest = ({ params }) => apiRequest({
    method: 'get',
    url: `${ PERSONS_API_ROUTE }`,
    params
});

export const registerPersonRequest = ({ data }) => apiRequest({
    method: 'post',
    url: `${ PERSONS_API_ROUTE }`,
    data
});

export const updatePersonRequest = ({ data, id }) => apiRequest({
    method: 'put',
    url: `${ PERSONS_API_ROUTE }/${ id }/`,
    data
});
