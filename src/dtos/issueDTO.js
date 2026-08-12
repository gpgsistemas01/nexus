export const createIssueHeaderDto = (body = {}) => ({
    requesterId: body.requesterId.trim(),
    advisorId: body.advisorId.trim(),
    clientId: body.clientId.trim(),
    departmentId: body.departmentId.trim(),
    projectNumber: body.projectNumber.trim(),
    requestDate: new Date(body.requestDate),
    ...(Object.prototype.hasOwnProperty.call(body, 'observations') && {
        observations: typeof body.observations === 'string'
            ? body.observations.trim()
            : null
    })
});

export const createIssueDetailsDto = (
    details = [],
    { itemIdField, mapAdditionalFields = () => ({}) }
) => details.map(detail => ({
    [itemIdField]: detail[itemIdField].trim(),
    quantity: Number(detail.quantity),
    ...mapAdditionalFields(detail)
}));
