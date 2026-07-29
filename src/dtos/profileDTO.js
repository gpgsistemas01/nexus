export const createProfileDTO = (body = {}) => ({

    fullName: body.fullName,
    roleId: body.roleId,
    departments: body.departments
});
