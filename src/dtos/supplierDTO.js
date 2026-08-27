const buildSupplierDto = (body = {}) => ({
    legalName: body.legalName.trim(),
    tradeName: body.tradeName.trim(),
    isActive: Boolean(body.isActive)
});

export const createSupplierDtoForRegister = (body = {}) => buildSupplierDto(body);

export const createSupplierDtoForEdit = (body = {}) => buildSupplierDto(body);
