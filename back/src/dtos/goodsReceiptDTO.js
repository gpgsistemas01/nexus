const normalizeInvoice = (invoice) => invoice.trim().toUpperCase();

export const createGoodsReceiptDtoForRegister = (body = {}) => {
    const isInvoiced = body.isInvoiced;

    return {
        supplierId: body.supplierId.trim(),
        receivedById: body.receivedById.trim(),
        ...(isInvoiced ? { isInvoiced } : {}),
        ...(isInvoiced ? { invoice: normalizeInvoice(body.invoice) } : {}),
        receptionDate: body.receptionDate,
        ...(Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations.trim() } : {}),
        details: (body.details).map(d => ({
            materialId: d.materialId.trim(),
            quantity: d.quantity,
            costPerUnitType: d.costPerUnitType
        }))
    }
};


export const createGoodsReceiptDtoForEdit = (body = {}) => {
    const isInvoiced = body.isInvoiced;

    return {
        supplierId: body.supplierId.trim(),
        receivedById: body.receivedById.trim(),
        isInvoiced,
        ...(isInvoiced ? { invoice: normalizeInvoice(body.invoice) } : { invoice: null }),
        receptionDate: body.receptionDate,
        ...(Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations.trim() } : {}),
        details: (body.details || []).map(d => ({
            ...(d.id ? { id: d.id.trim() } : {}),
            materialId: d.materialId.trim(),
            quantity: d.quantity,
            costPerUnitType: d.costPerUnitType
        }))
    };
};


export const createGoodsReceiptDtoForCorrection = (body = {}) => ({
    quantity: body.quantity,
    costPerUnitType: body.costPerUnitType
});
