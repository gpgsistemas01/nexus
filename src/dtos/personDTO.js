const buildPersonDto = (body = {}) => ({

    fullName: body.fullName,
    accesses: body.accesses
});

export const createPersonDtoForRegister = (body = {}) => buildPersonDto(body);

export const createPersonDtoForEdit = (body = {}) => buildPersonDto(body);
