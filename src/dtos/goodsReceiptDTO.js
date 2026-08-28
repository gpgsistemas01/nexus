const normalizeInvoice = (invoice) => invoice.trim().toUpperCase();

export const createGoodsReceiptDtoForRegister = (body = {}) => {
    const isInvoiced = Object.prototype.hasOwnProperty.call(body, 'isInvoiced') ? Boolean(body.isInvoiced) : null;

    return {
        supplierId: body.supplierId.trim(),
        receivedById: body.receivedById.trim(),
        ...(isInvoiced ? { isInvoiced } : {}),
        ...(isInvoiced ? { invoice: normalizeInvoice(body.invoice) } : {}),
        receptionDate: new Date(body.receptionDate),
        ...(Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations.trim() } : {}),
        details: (body.details).map(d => ({
            materialId: d.materialId.trim(),
            quantity: Number(d.quantity),
            costPerUnitType: Number(d.costPerUnitType)
        }))
    }
};


export const createGoodsReceiptDtoForEdit = (body = {}) => {
    const isInvoiced = Object.prototype.hasOwnProperty.call(body, 'isInvoiced') ? Boolean(body.isInvoiced) : null;

    return {
        supplierId: body.supplierId.trim(),
        receivedById: body.receivedById.trim(),
        isInvoiced: Boolean(isInvoiced),
        ...(isInvoiced ? { invoice: normalizeInvoice(body.invoice) } : { invoice: null }),
        receptionDate: new Date(body.receptionDate),
        ...(Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations.trim() } : {}),
        details: (body.details || []).map(d => ({
            ...(d.id ? { id: d.id.trim() } : {}),
            materialId: d.materialId.trim(),
            quantity: Number(d.quantity),
            costPerUnitType: Number(d.costPerUnitType)
        }))
    };
};


export const createGoodsReceiptDtoForCorrection = (body = {}) => ({
    quantity: Number(body.quantity),
    costPerUnitType: Number(body.costPerUnitType)
});
