export const createSupplierDtoForRegister = (body = {}) => ({
    legalName: body.legalName.trim(),
    tradeName: body.tradeName.trim(),
    isActive: Boolean(body.isActive)
});
