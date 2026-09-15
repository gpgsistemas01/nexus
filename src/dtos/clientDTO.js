const buildClientDto = (body = {}) => ({
    name: body.name.trim(),
    isActive: Boolean(body.isActive)
});

export const createClientDtoForRegister = (body = {}) => buildClientDto(body);

export const createClientDtoForEdit = (body = {}) => buildClientDto(body);
