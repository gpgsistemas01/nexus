import { apiRequest } from "./axiosInstanceApi.js";

const route = '/api/auth';

export const loginRequest = ({ data }) => apiRequest({ 
    method: 'post', 
    url: `${ route }/login`, 
    data,
    requiresAuth: false
});

export const registerRequest = ({ data }) => apiRequest({ 
    method: 'post', 
    url: `${ route }/register`, 
    data 
});

export const resetPasswordRequest = ({ data }) => apiRequest({ 
    method: 'patch', 
    url: `${ route }/reset`, 
    data 
});
