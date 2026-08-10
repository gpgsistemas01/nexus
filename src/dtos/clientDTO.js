const buildClientDto = (body = {}) => ({
    name: body.name.trim(),
});

export const createClientDtoForRegister = (body = {}) => buildClientDto(body);

export const createClientDtoForEdit = (body = {}) => buildClientDto(body);
