import { normalizeMaterialDimensions, toNumber } from '../utils/formattersUtils.js';

export const createMaterialDtoForRegister = (body = {}) => ({
    name: body.name.trim(),
    supplierId: body.supplierId,
    presentationId: body.presentationId,
    unitMeasureId: body.unitMeasureId,
    ...Object.prototype.hasOwnProperty.call(body, 'minStock') && body.minStock !== null ? { minStock: Number(body.minStock) } : {},
    maxUnitCost: toNumber(body.maxUnitCost),
    ...normalizeMaterialDimensions(body),
    ...(Object.prototype.hasOwnProperty.call(body, 'isActive') ? { isActive: Boolean(body.isActive) } : {})
});

export const updateMaterialDtoForEdit = (body = {}) => ({
    name: body.name.trim()
});

export const createMaterialDtoForStockUpdate = (body = {}) => ({
    supplierId: body.supplierId,
    newStock: Number(body.newStock),
    ...Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations ? body.observations.trim() : null } : {},
    reasonId: body.reasonId
});
