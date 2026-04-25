export const createGoodsReceiptDtoForRegister = (body = {}) => ({
    supplierId: body.supplierId.trim(),
    receivedById: body.receivedById.trim(),
    ...(Object.prototype.hasOwnProperty.call(body, 'invoice') ? { invoice: body.invoice.trim() } : {}),
    receptionDate: new Date(body.receptionDate),
    ...(Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations.trim() } : {}),
    details: (body.details).map(d => ({
        productId: d.productId.trim(),
        quantity: Number(d.quantity),
        unitCostByQuantity: Number(d.unitCostByQuantity)
    }))
});
