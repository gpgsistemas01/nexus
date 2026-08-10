const buildPurchaseRequisitionDto = (body = {}) => ({
    projectId: body.projectId.trim(),
    requestDate: new Date(body.requestDate),
    observations: body.observations?.trim() || null,
    details: body.details.map(d => ({
        materialId: d.materialId.trim(),
        quantity: Number(d.quantity)
    }))
});

export const createPurchaseRequisitionDtoForRegister = (body = {}) => buildPurchaseRequisitionDto(body);

export const createPurchaseRequisitionDtoForEdit = (body = {}) => buildPurchaseRequisitionDto(body);
