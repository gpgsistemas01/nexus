export const createGoodsReceiptDtoForRegister = (body = {}) => {
    const isInvoiced = Object.prototype.hasOwnProperty.call(body, 'isInvoiced') ? Boolean(body.isInvoiced) : null;

    return {
        supplierId: body.supplierId.trim(),
        receivedById: body.receivedById.trim(),
        ...(isInvoiced ? { isInvoiced } : {}),
        ...(isInvoiced ? { invoice: body.invoice.trim() } : {}),
        receptionDate: new Date(body.receptionDate),
        ...(Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations.trim() } : {}),
        details: (body.details).map(d => ({
            productId: d.productId.trim(),
            quantity: Number(d.quantity),
            costPerUnitType: Number(d.costPerUnitType)
        }))
    }
};
