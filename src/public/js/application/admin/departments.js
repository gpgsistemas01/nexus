import { getAllDepartmentsRequest } from "../../services/admin/departmentService.js";

export const getDepartmentOptions = async (params = {}) => {

    const response = await getAllDepartmentsRequest({ params });

    const list = response.data?.data || [];

    return list.filter(department => department?.id && department?.name)
        .map(department => ({
            value: department.id,
            label: department.name
        }));
};

export const getAllDepartments = async (params = {}) => {

    const response = await getAllDepartmentsRequest({ params });

    return response;
};
