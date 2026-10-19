import { createVersionDto } from './versionDTO.js';
export const createUserDtoForRegister = (body) => ({
    name: body.name,
    password: body.password,
    personId: body.personId,
    roleId: body.roleId,
    departmentId: body.departmentId,
});

export const createUserDtoForEdit = (body) => ({
    ...createVersionDto(body),
    name: body.name,
    personId: body.personId,
    roleId: body.roleId,
    departmentId: body.departmentId,
});

export const createUserPasswordDtoForEdit = (body) => ({
    ...createVersionDto(body),
    password: body.password,
});

export const createUserDtoForToken = (id) => ({

    id

});