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


export const createGoodsReceiptDtoForEdit = (body = {}) => {
    const isInvoiced = Object.prototype.hasOwnProperty.call(body, 'isInvoiced') ? Boolean(body.isInvoiced) : null;

    return {
        receivedById: body.receivedById.trim(),
        isInvoiced: Boolean(isInvoiced),
        ...(isInvoiced ? { invoice: body.invoice.trim() } : { invoice: null }),
        receptionDate: new Date(body.receptionDate),
        ...(Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations.trim() } : {})
    };
};

export const createGoodsReceiptReturnDto = (body = {}) => ({
    details: (body.details || []).map(d => ({
        id: d.id?.trim?.() || d.id,
        isReturned: Boolean(d.isReturned),
        returnedQuantity: Number(d.returnedQuantity)
    }))
});


export const createGoodsReceiptCorrectionDto = (body = {}) => ({
    quantity: Number(body.quantity),
    costPerUnitType: Number(body.costPerUnitType)
});
