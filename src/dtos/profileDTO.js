export const createProfileDTO = (body = {}) => ({

    fullName: body.fullName,
    accesses: body.accesses
});
