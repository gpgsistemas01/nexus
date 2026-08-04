export const createPersonDTO = (body = {}) => ({

    fullName: body.fullName,
    accesses: body.accesses
});
