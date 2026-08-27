import { toNumber } from '../utils/formattersUtils.js';

const buildWasteDataDto = (body = {}) => ({
    materialId: body.materialId,
    supplierId: body.supplierId,
    ...(Object.prototype.hasOwnProperty.call(body, 'maxUnitCost') ? { maxUnitCost: toNumber(body.maxUnitCost) } : {}),
    base: toNumber(body.base),
    height: toNumber(body.height)
});

const buildWasteSecondaryDataDto = (body = {}) => ({
    ...Object.prototype.hasOwnProperty.call(body, 'minStock') && body.minStock !== null ? { minStock: Number(body.minStock) } : {},
    ...(Object.prototype.hasOwnProperty.call(body, 'isActive') ? { isActive: Boolean(body.isActive) } : {}),
    ...(Object.prototype.hasOwnProperty.call(body, 'maxUnitCost') ? { maxUnitCost: toNumber(body.maxUnitCost) } : {})
});

const buildWasteStockDto = (body = {}, { includeReason = true } = {}) => ({
    newStock: Number(body.newStock),
    ...Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations ? body.observations.trim() : null } : {},
    ...includeReason && Object.prototype.hasOwnProperty.call(body, 'reasonId') ? { reasonId: body.reasonId } : {}
});

export const createWasteDtoForRegister = (body = {}) => ({
    ...buildWasteDataDto(body),
    ...buildWasteSecondaryDataDto(body),
    ...buildWasteStockDto(body, { includeReason: false })
});

export const createWasteDtoForEdit = (body = {}) => buildWasteSecondaryDataDto(body);

export const createWasteDtoForStockUpdate = (body = {}) => buildWasteStockDto(body);
