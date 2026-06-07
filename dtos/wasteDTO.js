export const createWasteDto = (body = {}) => ({
    supplierId: body.supplierId,
    productId: body.productId,
    quantity: Number(body.quantity),
    base: Number(body.base),
    height: Number(body.height),
    ...Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations ? body.observations.trim() : null } : {},
    reasonId: body.reasonId
});
