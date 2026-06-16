const buildWasteBaseDto = (body = {}) => ({
    supplierProductId: body.supplierProductId,
    base: Number(body.base),
    height: Number(body.height)
});

const buildWasteStockDto = (body = {}) => ({
    currentStock: Number(body.currentStock),
    ...Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations ? body.observations.trim() : null } : {},
    reasonId: body.reasonId
});

export const createWasteDto = (body = {}) => ({
    ...buildWasteBaseDto(body),
    ...buildWasteStockDto(body)
});

export const createWasteDataDto = (body = {}) => buildWasteBaseDto(body);

export const createWasteStockDto = (body = {}) => buildWasteStockDto(body);
