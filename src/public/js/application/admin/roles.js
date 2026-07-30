import { getAllRolesRequest } from "../../services/admin/roleService.js";

export const getRoleOptions = async (params = {}) => {
    const response = await getAllRolesRequest({ params });
    const list = response.data?.data || [];

    return list.filter(role => role?.id && role?.name)
        .map(role => ({
            id: role.id,
            text: role.name
        }));
};

export const getAllRoles = async (params = {}) => {
    const response = await getAllRolesRequest({ params });
    return response.data;
};
