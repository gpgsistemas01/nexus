export const createGoodsReceiptDtoForRegister = (body = {}) => ({
    supplierId: body.supplierId.trim(),
    receivedById: body.receivedById.trim(),
    receptionDate: new Date(body.receptionDate),
    observations: body.observations?.trim() || null,
    details: (body.details).map(d => ({
        productId: d.productId.trim(),
        quantity: Number(d.quantity),
        unitCost: Number(d.unitCost),
        amount: Number(d.amount)
    }))
});
