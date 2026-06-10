import { normalizeProductDimensions } from '../utils/formattersUtils.js';

export const createProductDtoForRegister = (body = {}) => ({
    name: body.name.trim(),
    supplierId: body.supplierId,
    presentationId: body.presentationId,
    unitMeasureId: body.unitMeasureId,
    minStock: Number(body.minStock),
    ...normalizeProductDimensions(body),
    ...(Object.prototype.hasOwnProperty.call(body, 'isActive') ? { isActive: Boolean(body.isActive) } : {})
});

export const createProductDtoForStockUpdate = (body = {}) => ({
    supplierId: body.supplierId,
    newStock: Number(body.newStock),
    ...Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations ? body.observations.trim() : null } : {},
    reasonId: body.reasonId
});
