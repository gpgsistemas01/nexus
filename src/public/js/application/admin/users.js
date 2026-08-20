import { editUserPasswordRequest, editUserRequest, getAllUsersRequest, registerUserRequest } from "../../services/admin/userService.js";
import { createCrudApplication } from '../createCrudApplication.js';

const userApplication = createCrudApplication({
    requests: {
        getAll: getAllUsersRequest,
        register: registerUserRequest,
        edit: editUserRequest,
        editPassword: editUserPasswordRequest
    },
    dataKey: 'user',
    dataKeys: { editPassword: null },
    additionalMutations: ['editPassword']
});

export const getAllUsers = userApplication.getAll;
export const registerUser = userApplication.register;
export const editUser = userApplication.edit;
export const editUserPassword = userApplication.editPassword;
