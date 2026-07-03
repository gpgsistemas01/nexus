import { createSuccessResponseFromRequest } from "../../utils/responseUtils.js";
import { editUserPasswordRequest, editUserRequest, getAllUsersRequest, registerUserRequest } from "../../services/admin/userService.js";

export const getAllUsers = async (params = {}) => {

    const response = await getAllUsersRequest({ params });

    return response;
};

export const registerUser = async ({ formData }) => {

    const response = await registerUserRequest({ data: formData });

    return createSuccessResponseFromRequest({ response, dataKey: 'user' });
};

export const editUser = async ({ formData, id }) => {

    const response = await editUserRequest({ data: formData, id });

    return createSuccessResponseFromRequest({ response, dataKey: 'user' });
};

export const editUserPassword = async ({ formData, id }) => {

    const response = await editUserPasswordRequest({ data: formData, id });

    return createSuccessResponseFromRequest({ response });
};
