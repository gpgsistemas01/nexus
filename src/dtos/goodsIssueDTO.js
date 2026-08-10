const buildGoodsIssueDto = (body = {}) => ({
    requesterId: body.requesterId.trim(),
    advisorId: body.advisorId.trim(),
    clientId: body.clientId.trim(),
    departmentId: body.departmentId.trim(),
    projectNumber: body.projectNumber.trim(),
    requestDate: new Date(body.requestDate),
    ...(Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations.trim() } : {}),
    details: (body.details).map(d => ({
        materialId: d.materialId.trim(),
        supplierId: d.supplierId.trim(),
        ...(d.presentationId ? { presentationId: d.presentationId.trim() } : {}),
        quantity: Number(d.quantity)
    }))
});

export const createGoodsIssueDtoForRegister = (body = {}) => buildGoodsIssueDto(body);

export const createGoodsIssueDtoForEdit = (body = {}) => buildGoodsIssueDto(body);

export const createGoodsIssueDetailsDtoForEdit = (body = {}) => ({
    details: (body.details).map(d => ({
        id: d.id,
        isSupplied: Boolean(d.isSupplied),
        projectConvertedQuantity: Number(d.projectConvertedQuantity)
    }))
});


export const createGoodsIssueHeaderDtoForEdit = (body = {}) => ({
    requesterId: body.requesterId.trim(),
    advisorId: body.advisorId.trim(),
    clientId: body.clientId.trim(),
    departmentId: body.departmentId.trim(),
    projectNumber: body.projectNumber.trim(),
    requestDate: new Date(body.requestDate),
    ...(Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations.trim() } : {})
});


export const createGoodsIssueDtoForReturn = (body = {}) => ({
    returnQuantity: Number(body.returnQuantity),
    ...(Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations.trim() } : {})
});
